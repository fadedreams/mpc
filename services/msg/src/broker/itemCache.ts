import { winstonLogger } from '@fadedreams7org1/mpclib';
import { configInstance as config } from '@msg/config';
import { Logger } from 'winston';
import { keydbClient } from '@msg/broker/kdbConnection';

export class ItemCache {
    private log: Logger;

    constructor() {
        this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'itemCache', 'debug');
    }

    private async connectToKeyDB(): Promise<void> {
        if (!keydbClient.isOpen) {
            await keydbClient.connect();
        }
    }

    public async getUserSelectedItemCategory(key: string): Promise<string> {
        try {
            await this.connectToKeyDB();

            const response: string = (await keydbClient.GET(key)) as string;
            return response;
        } catch (error) {
            this.log.error('itemService ItemCache getUserSelectedItemCategory() method error:', error);
            return '';
        }
    }
}

const itemCacheInstance = new ItemCache();

export { itemCacheInstance as itemCache };
