import { winstonLogger } from '@fadedreams7org1/mpclib';
import { configInstance as config } from '@gateway/config';
import { Logger } from 'winston';
import { keyvClient } from '@gateway/broker/keyvConnection';

export class GatewayCache {
    private log: Logger;

    constructor() {
        this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewayCache', 'debug');
    }

    public async saveUserSelectedItemCategory(key: string, value: string): Promise<void> {
        try {
            await keyvClient.set(key, value);
        } catch (error) {
            this.log.error('gatewayService GatewayCache saveUserSelectedItemCategory() method error:', error);
        }
    }

    public async saveLoggedInUser2Cache(key: string, value: string): Promise<string[]> {
        try {
            const users = await keyvClient.get(key) as string[] | undefined;
            if (!users || !users.includes(value)) {
                await keyvClient.set(key, [...(users || []), value]);
                this.log.info('User+:', key, value);
            }
            return (await keyvClient.get(key)) as string[];
        } catch (error) {
            this.log.error('gatewayService GatewayCache saveLoggedInUser2Cache() method error:', error);
            return [];
        }
    }

    public async getLoggedInUserFromCache(key: string): Promise<string[]> {
        try {
            return (await keyvClient.get(key)) as string[] || [];
        } catch (error) {
            this.log.error('gatewayService GatewayCache getLoggedInUserFromCache() method error:', error);
            return [];
        }
    }

    public async removeLoggedInUserFromCache(key: string, value: string): Promise<string[]> {
        try {
            const users = await keyvClient.get(key) as string[] | undefined;
            if (users && users.includes(value)) {
                await keyvClient.set(
                    key,
                    users.filter((user) => user !== value)
                );
                this.log.info('User-:', key, value);
            }
            return (await keyvClient.get(key)) as string[];
        } catch (error) {
            this.log.error('gatewayService GatewayCache removeLoggedInUserFromCache() method error:', error);
            return [];
        }
    }
}

const gatewayCacheInstance = new GatewayCache();
export { gatewayCacheInstance };
