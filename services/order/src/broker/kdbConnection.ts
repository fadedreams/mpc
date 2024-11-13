import { createClient } from 'keydb';
import { Logger } from 'winston';

type KeyDBClientType = ReturnType<typeof createClient>;

export class KeyDBConnection {
    private readonly client: KeyDBClientType;
    private readonly log: Logger;

    constructor() {
        this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderKeyDBConnection', 'debug');
        this.client = createClient({ url: `${config.REDIS_HOST}` });
        console.log(config.REDIS_HOST);
        this.cacheError();
        this.handleDisconnect();
    }

    private cacheError(): void {
        this.client.on('error', (error: unknown) => {
            this.log.error('orderService keydbConnect() method error:', error);
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
            this.log.info(`orderService KeyDB Connection: ${await this.client.ping()}`);
        } catch (error) {
            this.log.error('orderService keydbConnect() method error:', error);
        }
    }

    public getClient(): KeyDBClientType {
        return this.client;
    }
}

const keydbService = new KeyDBConnection();

export const keydbConnect = async (): Promise<void> => {
    await keydbService.connect();
};

export const keydbClient: KeyDBClientType = keydbService.getClient();
