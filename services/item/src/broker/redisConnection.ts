
import { configInstance as config } from '@item/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { createClient } from 'redis';
import { Logger } from 'winston';
type RedisClientType = ReturnType<typeof createClient>;

export class RedisConnection {
  private readonly client: RedisClientType;
  private readonly log: Logger;

  constructor() {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'itemRedisConnection', 'debug');
    this.client = createClient({ url: `${config.REDIS_HOST}` });
    this.cacheError();
  }

  private cacheError(): void {
    this.client.on('error', (error: unknown) => {
      this.log.error(error);
    });
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.log.info(`ItemService Redis Connection: ${await this.client.ping()}`);
    } catch (error) {
      this.log.error('ItemService redisConnect() method error:', error);
    }
  }

  public getClient(): RedisClientType {
    return this.client;
  }
}
// const redisService = new RedisConnection();
// export const redisConnect = async (): Promise<void> => {
//   await redisService.connect();
// };
// export const client: RedisClientType = redisService.getClient();
