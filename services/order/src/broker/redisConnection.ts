// services/order/src/broker/redisConnection.ts

import { configInstance as config } from '@order/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { createClient, createClientPool } from 'redis';
import { Logger } from 'winston';

type RedisClientPoolType = ReturnType<typeof createClientPool>;
export type RedisClientType = RedisClientPoolType;

const MAX_RECONNECT_ATTEMPTS = 20;
const POOL_MIN_CONNECTIONS = 5;
const POOL_MAX_CONNECTIONS = 50;
const CONNECT_TIMEOUT_MS = 5000;
const COMMAND_QUEUE_MAX_LENGTH = 1000;

export class RedisConnection {
    private readonly client: RedisClientType;
    private readonly log: Logger;
    private isConnected = false;
    private connectingPromise: Promise<void> | null = null;

    constructor() {
        this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderRedisConnection', 'debug');

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
                                `orderService Redis: exceeded ${MAX_RECONNECT_ATTEMPTS} reconnect attempts, giving up`
                            );
                            return new Error('Redis reconnect attempts exhausted');
                        }
                        // capped exponential-ish backoff avoids rapid open/close cycles
                        // (which is what causes TIME_WAIT buildup on the client host)
                        const delay = Math.min(retries * 100, 3000);
                        this.log.warn(`orderService Redis: reconnect attempt ${retries}, retrying in ${delay}ms`);
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
            this.log.error('orderService redisConnect() method error:', error);
        });
    }

    private handleLifecycleEvents(): void {
        // Rely on the built-in reconnectStrategy above instead of manually calling
        // connect() again on 'end' — doing both causes duplicate concurrent
        // connection attempts and uncontrolled retry storms (original bug).
        this.client.on('reconnecting', () => {
            this.isConnected = false;
            this.log.warn('orderService Redis: connection lost, reconnecting via built-in strategy...');
        });

        this.client.on('ready', () => {
            this.isConnected = true;
            this.log.info('orderService Redis: connection ready');
        });

        this.client.on('end', () => {
            this.isConnected = false;
            this.log.warn('orderService Redis: connection ended');
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
                this.log.info(`orderService Redis Connection: ${pong}`);
            } catch (error) {
                this.log.error('orderService redisConnect() method error:', error);
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
}

const redisService = new RedisConnection();

export const redisConnect = async (): Promise<void> => {
    await redisService.connect();
};

export const redisClient: RedisClientType = redisService.getClient();
