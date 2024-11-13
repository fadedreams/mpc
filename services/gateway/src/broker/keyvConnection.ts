import { configInstance as config } from '@gateway/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';
import { Logger } from 'winston';

export class KeyvConnection {
    private readonly client: Keyv;
    private readonly log: Logger;

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
}

const keyvService = new KeyvConnection();
export const keyvConnect = async (): Promise<void> => {
    await keyvService.connect();
};
export const keyvClient: Keyv = keyvService.getClient();
