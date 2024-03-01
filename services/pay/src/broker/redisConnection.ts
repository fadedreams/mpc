import { configInstance as config } from '@pay/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { createClient } from 'redis';
import { Logger } from 'winston';
type RedisClientType = ReturnType<typeof createClient>;

export class RedisConnection {
  private readonly client: RedisClientType;
  private readonly log: Logger;

  constructor() {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'payRedisConnection', 'debug');
    this.client = createClient({ url: `${config.REDIS_HOST}` });
    console.log(config.REDIS_HOST);
    // this.client = createClient({ url: `redis://localhost:6379` });
    this.cacheError();
    this.handleDisconnect();
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      this.log.error('payService redisConnect() method error:', error);
    });
  }

  private handleDisconnect(): void {
    this.client.on('end', () => {
      this.log.warn('Redis connection closed. Attempting to reconnect...');
      this.connect();
    });
  }
  public async connect(): Promise<void> {
    console.log(config.REDIS_HOST);
    try {
      await this.client.connect();
      this.log.info(`payService Redis Connection: ${await this.client.ping()}`);
    } catch (error) {
      this.log.error('payService redisConnect() method error:', error);
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }
}
const redisService = new RedisConnection();
export const redisConnect = async (): Promise<void> => {
  await redisService.connect();
};
export const redisClient: RedisClientType = redisService.getClient();
