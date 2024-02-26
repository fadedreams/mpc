
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { configInstance as config } from '@gateway/config';
import { Logger } from 'winston';
import { redisClient } from '@gateway/broker/redisConnection';

export class GatewayCache {
  private log: Logger;

  constructor() {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewayCache', 'debug');
  }

  private async connectToRedis(): Promise<void> {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  }

  public async saveUserSelectedItemCategory(key: string, value: string): Promise<void> {
    try {
      await this.connectToRedis();
      await redisClient.SET(key, value);
    } catch (error) {
      this.log.error('gatewayService GatewayCache saveUserSelectedItemCategory() method error:', error);
    }
  }

  public async saveLoggedInUser2Cache(key: string, value: string): Promise<string[]> {
    try {
      await this.connectToRedis();
      const index: number | null = await redisClient.LPOS(key, value);
      if (index == null) {
        await redisClient.LPUSH(key, value);
        this.log.info('User+:', key, value);
      }
      const response: string[] = await redisClient.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      this.log.error('gatewayService GatewayCache saveLoggedInUser2Cache() method error:', error);
      return [];
    }
  }

  public async getLoggedInUserFromCache(key: string): Promise<string[]> {
    try {
      await this.connectToRedis();
      const response: string[] = await redisClient.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      this.log.error('gatewayService GatewayCache getLoggedInUserFromCache() method error:', error);
      return [];
    }
  }

  public async removeLoggedInUserFromCache(key: string, value: string): Promise<string[]> {
    try {
      await this.connectToRedis();
      await redisClient.LREM(key, 1, value);
      this.log.info('User-:', key, value);
      const response: string[] = await redisClient.LRANGE(key, 0, -1);
      return response;
    } catch (error) {
      this.log.error('gatewayService GatewayCache removeLoggedInUserFromCache() method error:', error);
      return [];
    }
  }

}

const gatewayCacheInstance = new GatewayCache();
export { gatewayCacheInstance as itemCache };
