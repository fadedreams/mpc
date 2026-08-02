import { configInstance as config } from '@gateway/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { Logger } from 'winston';
import { randomUUID } from 'crypto';

// ---- cache stampede guard tunables -----------------------------------------
const LOCK_PREFIX = 'lock:';
const DEFAULT_LOCK_TTL_MS = 5000;   // how long a recompute lock is held
const DEFAULT_LOCK_WAIT_MS = 3000;  // how long a waiter blocks for the lock holder
const DEFAULT_LOCK_RETRY_MS = 50;   // poll interval while waiting

interface GetOrSetOptions {
    /** TTL for the cached value, in ms */
    ttlMs: number;
    /** How long the recompute lock is held, in ms (default 5000) */
    lockTtlMs?: number;
    /** How long a waiter blocks for the lock holder to finish, in ms (default 3000) */
    lockWaitMs?: number;
}

export class KeyvConnection {
    private readonly client: Keyv;
    private readonly log: Logger;

    // In-process single-flight: dedupes concurrent callers on the same key
    // *within this Node process*. This part IS fully race-free, since it
    // never leaves the process.
    private readonly inFlight = new Map<string, Promise<unknown>>();

    constructor() {
        this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'itemKeyvConnection', 'debug');
        const redis = new KeyvRedis(`${config.REDIS_HOST}`);
        this.client = new Keyv({ store: redis });
        this.cacheError();
    }

    private cacheError(): void {
        this.client.on('error', (error: unknown) => {
            this.log.error('gatewayService keyvConnect() method error:', error);
        });
    }

    public async connect(): Promise<void> {
        try {
            await this.client.set('test', 'ok');
            this.log.info(`gatewayService Keyv Connection: ${await this.client.get('test')}`);
        } catch (error) {
            this.log.error('gatewayService keyvConnect() method error:', error);
        }
    }

    public getClient(): Keyv {
        return this.client;
    }

    // ---- cache stampede guard (new, additive) --------------------------------
    //
    // CAVEAT (please read before relying on this for correctness-critical
    // locking): Keyv has no atomic "SET if not exists" primitive exposed
    // through its public API, so the lock below is a best-effort, NOT a
    // hard guarantee like the SET NX PX lock in services/gateway/src/broker/
    // redisConnection.ts. Two processes can still both believe they got the
    // lock in a narrow race window (get-then-set is not atomic here).
    //
    // What this DOES fully solve: same-process stampedes (the in-process
    // single-flight above is race-free) and greatly reduces cross-process
    // stampedes (the lock + double-check narrows the window to a single
    // get/set round trip instead of every caller hitting the origin).
    //
    // If you need hard atomic cross-process locking for this cache, prefer
    // calling getOrSet()/invalidate() from redisConnection.ts in this same
    // service instead — that one uses the raw redis client's SET NX PX and
    // a Lua compare-and-delete, which Keyv can't do without dropping down
    // to the underlying client directly.

    private async acquireLock(
        lockKey: string,
        token: string,
        lockTtlMs: number,
        waitMs: number,
        retryMs: number
    ): Promise<boolean> {
        const deadline = Date.now() + waitMs;

        while (Date.now() < deadline) {
            const existing = await this.client.get(lockKey);
            if (existing === undefined) {
                // Not atomic — narrow race window between this get and the
                // set below. Acceptable for reducing (not eliminating)
                // cross-process stampede; see caveat above.
                await this.client.set(lockKey, token, lockTtlMs);
                const confirm = await this.client.get(lockKey);
                if (confirm === token) return true;
            }
            await new Promise((r) => setTimeout(r, retryMs));
        }
        return false;
    }

    private async releaseLock(lockKey: string, token: string): Promise<void> {
        try {
            const current = await this.client.get(lockKey);
            // Only delete if we still own it — avoids deleting a lock that
            // another process has since acquired after ours expired.
            if (current === token) {
                await this.client.delete(lockKey);
            }
        } catch {
            // Non-fatal: lock will simply expire via its own TTL.
        }
    }

    /**
     * getOrSet — cache-stampede-reducing read-through cache built on Keyv.
     *
     * Concurrent callers within this process are fully deduped via
     * in-process single-flight. Across processes, a best-effort lock
     * narrows (but does not fully eliminate) the stampede window — see
     * the caveat above.
     */
    public async getOrSet<T>(
        key: string,
        fetchFn: () => Promise<T>,
        options: GetOrSetOptions
    ): Promise<T> {
        const { ttlMs, lockTtlMs = DEFAULT_LOCK_TTL_MS, lockWaitMs = DEFAULT_LOCK_WAIT_MS } = options;

        // 1. Fast path — already cached.
        const cached = await this.client.get(key);
        if (cached !== undefined) {
            return cached as T;
        }

        // 2. In-process single-flight.
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
                const retryCached = await this.client.get(key);
                if (retryCached !== undefined) {
                    return retryCached as T;
                }
                return fetchFn();
            }

            try {
                const doubleCheck = await this.client.get(key);
                if (doubleCheck !== undefined) {
                    return doubleCheck as T;
                }

                const fresh = await fetchFn();
                await this.client.set(key, fresh, ttlMs);
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
     * invalidate — cache-bust for a key (e.g. after a write), so stale
     * reads aren't served after a mutation.
     */
    public async invalidate(key: string): Promise<void> {
        await this.client.delete(key);
    }
}

const keyvService = new KeyvConnection();

export const keyvConnect = async (): Promise<void> => {
    await keyvService.connect();
};

export const keyvClient: Keyv = keyvService.getClient();

// New, additive exports — do not affect existing consumers that only import
// keyvConnect / keyvClient / KeyvConnection.
export const getOrSet = keyvService.getOrSet.bind(keyvService);
export const invalidate = keyvService.invalidate.bind(keyvService);
