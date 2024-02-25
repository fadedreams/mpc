
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { configInstance as config } from '@item/config';
import { Logger } from 'winston';
import { redisClient } from '@item/broker/redisConnection';

class ItemCache {
  private log: Logger;

  constructor() {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'itemCache', 'debug');
  }

  private async connectToRedis(): Promise<void> {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  }

  public async getUserSelectedItemCategory(key: string): Promise<string> {
    try {
      await this.connectToRedis();

      const response: string = (await redisClient.GET(key)) as string;
      return response;
    } catch (error) {
      this.log.error('itemService ItemCache getUserSelectedItemCategory() method error:', error);
      return '';
    }
  }
}

const itemCacheInstance = new ItemCache();

export { itemCacheInstance as itemCache };
