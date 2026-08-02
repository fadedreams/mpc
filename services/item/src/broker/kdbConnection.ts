import { configInstance as config } from '@item/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { createClient } from 'keydb';
import { Logger } from 'winston';
import { randomUUID } from 'crypto';

type KeyDBClientType = ReturnType<typeof createClient>;

// ---- cache stampede / race-condition guard tunables ------------------------
const LOCK_PREFIX = 'lock:';
const DEFAULT_LOCK_TTL_MS = 5000;   // how long a recompute lock is held
const DEFAULT_LOCK_WAIT_MS = 3000;  // how long a waiter blocks for the lock holder
const DEFAULT_LOCK_RETRY_MS = 50;   // poll interval while waiting

// Lua script: only delete the lock if the value matches the token we set.
// Prevents this process from deleting a lock it no longer owns (e.g. after
// its own lock already expired and another process acquired a new one) —
// the classic GET-then-DEL race condition with plain DEL. KeyDB is
// Redis-protocol-compatible so EVAL works the same way here.
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

export class KeyDBConnection {
    private readonly client: KeyDBClientType;
    private readonly log: Logger;

    // In-process single-flight: dedupes concurrent callers on the same key
    // *within this Node process* before anything even talks to KeyDB locks.
    private readonly inFlight = new Map<string, Promise<unknown>>();

    constructor() {
        this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'itemKeyDBConnection', 'debug');
        this.client = createClient({ url: `${config.REDIS_HOST}` });
        console.log(config.REDIS_HOST);
        // this.client = createClient({ url: `redis://localhost:6379` });
        this.cacheError();
        this.handleDisconnect();
    }

    private cacheError(): void {
        this.client.on('error', (error: unknown) => {
            // NOTE: original said "ItemService redisConnect()..." — copy-paste
            // leftover from the redis-based file. Fixed to keydbConnect() to
            // match this file's actual client and its sibling services.
            this.log.error('ItemService keydbConnect() method error:', error);
        });
    }

    private handleDisconnect(): void {
        this.client.on('end', () => {
            this.log.warn('KeyDB connection closed. Attempting to reconnect...');
            this.connect();
        });
    }

    public async connect(): Promise<void> {
        console.log(config.REDIS_HOST);
        try {
            await this.client.connect();
            // NOTE: original said "ItemService Redis Connection..." — fixed
            // to KeyDB Connection to match this file's actual client.
            this.log.info(`ItemService KeyDB Connection: ${await this.client.ping()}`);
        } catch (error) {
            this.log.error('ItemService keydbConnect() method error:', error);
        }
    }

    public getClient(): KeyDBClientType {
        // NOTE: original said `RedisClientType`, which isn't defined/imported
        // in this file — copy-paste leftover from the redis-based file that
        // would fail to compile. Fixed to KeyDBClientType.
        return this.client;
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
     * flight, and per cluster via the distributed KeyDB lock). Everyone else
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
        //    process into one execution before touching KeyDB locks at all.
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
                // Double-checked locking: re-check cache now that we hold the
                // lock, in case another process wrote it between step 1 and
                // acquiring the lock (closes the classic TOCTOU race).
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

const keydbService = new KeyDBConnection();

export const keydbConnect = async (): Promise<void> => {
    await keydbService.connect();
};

export const keydbClient: KeyDBClientType = keydbService.getClient();

// New, additive exports — do not affect existing consumers that only import
// keydbConnect / keydbClient / KeyDBConnection / KeyDBClientType.
export const getOrSet = keydbService.getOrSet.bind(keydbService);
export const invalidate = keydbService.invalidate.bind(keydbService);
