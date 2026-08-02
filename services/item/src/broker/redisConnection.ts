// services/item/src/broker/redisConnection.ts

import { configInstance as config } from '@item/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { createClient, createClientPool } from 'redis';
import { Logger } from 'winston';
import { randomUUID } from 'crypto';

type RedisClientPoolType = ReturnType<typeof createClientPool>;
export type RedisClientType = RedisClientPoolType;

const MAX_RECONNECT_ATTEMPTS = 20;
const POOL_MIN_CONNECTIONS = 5;
const POOL_MAX_CONNECTIONS = 50;
const CONNECT_TIMEOUT_MS = 5000;
const COMMAND_QUEUE_MAX_LENGTH = 1000;

// ---- cache stampede / race-condition guard tunables ------------------------
const LOCK_PREFIX = 'lock:';
const DEFAULT_LOCK_TTL_MS = 5000;   // how long a recompute lock is held
const DEFAULT_LOCK_WAIT_MS = 3000;  // how long a waiter blocks for the lock holder
const DEFAULT_LOCK_RETRY_MS = 50;   // poll interval while waiting

// Lua script: only delete the lock if the value matches the token we set.
// Prevents this process from deleting a lock it no longer owns (e.g. after
// its own lock already expired and another process acquired a new one) —
// the classic GET-then-DEL race condition with plain DEL.
const RELEASE_LOCK_SCRIPT = `
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
else
  return 0
end
`;

interface GetOrSetOptions {
  /** TTL for the cached value, in seconds */
  ttlSeconds: number;
  /** How long the recompute lock is held, in ms (default 5000) */
  lockTtlMs?: number;
  /** How long a waiter blocks for the lock holder to finish, in ms (default 3000) */
  lockWaitMs?: number;
}

export class RedisConnection {
  private readonly client: RedisClientType;
  private readonly log: Logger;
  private isConnected = false;
  private connectingPromise: Promise<void> | null = null;

  // In-process single-flight: dedupes concurrent callers on the same key
  // *within this Node process* before anything even talks to Redis locks.
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor() {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'itemRedisConnection', 'debug');

    // createClientPool: API-compatible with createClient (.get/.set/.hGetAll/etc
    // all work the same), but now backed by a real pool instead of one socket,
    // so a single slow command no longer blocks every other command in the app.
    this.client = createClientPool(
      {
        url: `${config.REDIS_HOST}`,
        socket: {
          connectTimeout: CONNECT_TIMEOUT_MS,
          keepAlive: 5000, // avoid idle connection resets that trigger reconnect churn
          reconnectStrategy: (retries) => {
            if (retries > MAX_RECONNECT_ATTEMPTS) {
              this.log.error(
                `ItemService Redis: exceeded ${MAX_RECONNECT_ATTEMPTS} reconnect attempts, giving up`
              );
              return new Error('Redis reconnect attempts exhausted');
            }
            // capped exponential-ish backoff avoids rapid open/close cycles
            // (which is what causes TIME_WAIT buildup on the client host)
            const delay = Math.min(retries * 100, 3000);
            this.log.warn(`ItemService Redis: reconnect attempt ${retries}, retrying in ${delay}ms`);
            return delay;
          },
        },
        commandsQueueMaxLength: COMMAND_QUEUE_MAX_LENGTH, // fail fast instead of unbounded queueing
      },
      {
        minimum: POOL_MIN_CONNECTIONS,
        maximum: POOL_MAX_CONNECTIONS,
      }
    );

    console.log(config.REDIS_HOST);

    this.cacheError();
    this.handleLifecycleEvents();
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      this.log.error('ItemService redisConnect() method error:', error);
    });
  }

  private handleLifecycleEvents(): void {
    // Rely on the built-in reconnectStrategy above instead of manually calling
    // connect() again on 'end' — doing both causes duplicate concurrent
    // connection attempts and uncontrolled retry storms (original bug).
    this.client.on('reconnecting', () => {
      this.isConnected = false;
      this.log.warn('ItemService Redis: connection lost, reconnecting via built-in strategy...');
    });

    this.client.on('ready', () => {
      this.isConnected = true;
      this.log.info('ItemService Redis: connection ready');
    });

    this.client.on('end', () => {
      this.isConnected = false;
      this.log.warn('ItemService Redis: connection ended');
    });
  }

  public async connect(): Promise<void> {
    // Guards against duplicate concurrent connect() calls if multiple
    // modules await redisConnect() during startup.
    if (this.isConnected) {
      return;
    }
    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    this.connectingPromise = (async () => {
      console.log(config.REDIS_HOST);
      try {
        await this.client.connect();
        const pong = await this.client.ping();
        this.isConnected = true;
        this.log.info(`ItemService Redis Connection: ${pong}`);
      } catch (error) {
        this.log.error('ItemService redisConnect() method error:', error);
        // Swallowed here (same as original behavior) so existing callers
        // that don't wrap redisConnect() in try/catch don't start throwing
        // unhandled rejections that didn't happen before.
      } finally {
        this.connectingPromise = null;
      }
    })();

    return this.connectingPromise;
  }

  public getClient(): RedisClientType {
    return this.client;
  }

  // New, additive only — safe to ignore if unused.
  public isReady(): boolean {
    return this.isConnected;
  }

  // ---- cache stampede / race-condition guard (new, additive) --------------

  private async acquireLock(
    lockKey: string,
    token: string,
    lockTtlMs: number,
    waitMs: number,
    retryMs: number
  ): Promise<boolean> {
    const deadline = Date.now() + waitMs;

    while (Date.now() < deadline) {
      // SET NX PX — atomic acquire, no separate EXISTS+SET race window.
      const res = await this.client.set(lockKey, token, { NX: true, PX: lockTtlMs });
      if (res === 'OK') return true;
      await new Promise((r) => setTimeout(r, retryMs));
    }
    return false;
  }

  private async releaseLock(lockKey: string, token: string): Promise<void> {
    try {
      await this.client.eval(RELEASE_LOCK_SCRIPT, {
        keys: [lockKey],
        arguments: [token],
      });
    } catch {
      // Non-fatal: lock will simply expire via its own TTL.
    }
  }

  /**
   * getOrSet — cache-stampede-safe read-through cache.
   *
   * Many concurrent callers requesting the same missing/expired key result
   * in exactly ONE call to `fetchFn` (per process via in-process single-
   * flight, and per cluster via the distributed Redis lock). Everyone else
   * waits briefly for the winner's result and reads it from cache, instead
   * of all stampeding the origin (DB, upstream API, etc.) at once.
   */
  public async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: GetOrSetOptions
  ): Promise<T> {
    const { ttlSeconds, lockTtlMs = DEFAULT_LOCK_TTL_MS, lockWaitMs = DEFAULT_LOCK_WAIT_MS } = options;

    // 1. Fast path — already cached.
    const cached = await this.client.get(key);
    if (cached !== null && cached !== undefined) {
      return JSON.parse(cached as string) as T;
    }

    // 2. In-process single-flight: collapse concurrent callers in this
    //    process into one execution before touching Redis locks at all.
    const existing = this.inFlight.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const runner = (async (): Promise<T> => {
      const lockKey = `${LOCK_PREFIX}${key}`;
      const token = randomUUID();

      const acquired = await this.acquireLock(
        lockKey,
        token,
        lockTtlMs,
        lockWaitMs,
        DEFAULT_LOCK_RETRY_MS
      );

      if (!acquired) {
        // Someone else is recomputing and we timed out waiting — check
        // cache one more time (they likely just finished), else fall back
        // to computing ourselves rather than serving nothing.
        const retryCached = await this.client.get(key);
        if (retryCached !== null && retryCached !== undefined) {
          return JSON.parse(retryCached as string) as T;
        }
        return fetchFn();
      }

      try {
        // Double-checked locking: re-check cache now that we hold the lock,
        // in case another process wrote it between step 1 and acquiring the
        // lock (closes the classic TOCTOU race).
        const doubleCheck = await this.client.get(key);
        if (doubleCheck !== null && doubleCheck !== undefined) {
          return JSON.parse(doubleCheck as string) as T;
        }

        const fresh = await fetchFn();
        await this.client.set(key, JSON.stringify(fresh), { EX: ttlSeconds });
        return fresh;
      } finally {
        await this.releaseLock(lockKey, token);
      }
    })();

    this.inFlight.set(key, runner);
    try {
      return await runner;
    } finally {
      this.inFlight.delete(key);
    }
  }

  /**
   * invalidate — safe cache-bust for a key (e.g. after a write), so stale
   * reads aren't served after a mutation.
   */
  public async invalidate(key: string): Promise<void> {
    await this.client.del(key);
  }
}

const redisService = new RedisConnection();

export const redisConnect = async (): Promise<void> => {
  await redisService.connect();
};

export const redisClient: RedisClientType = redisService.getClient();

// New, additive exports — do not affect existing consumers that only import
// redisConnect / redisClient / RedisConnection / RedisClientType.
export const getOrSet = redisService.getOrSet.bind(redisService);
export const invalidate = redisService.invalidate.bind(redisService);
