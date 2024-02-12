import { winstonLogger } from '@fadedreams7org1/mpclib';
import client, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';

export class authQueueConnection {
  private readonly log: Logger;
  private readonly rabbitmqEndpoint: string;

  constructor(log: Logger, rabbitmqEndpoint: string) {
    this.log = log;
    this.rabbitmqEndpoint = rabbitmqEndpoint;
  }

  async createConnection(): Promise<Channel | undefined> {
    try {
      const connection: Connection = await client.connect(this.rabbitmqEndpoint);
      const channel: Channel = await connection.createChannel();
      this.log.info('auth server connected to queue successfully... ', this.rabbitmqEndpoint);
      this.closeConnection(channel, connection);
      return channel;
    } catch (error) {
      this.log.log(`authService error createConnection() method: ${this.rabbitmqEndpoint}`, error);
      return undefined;
    }
  }

  private closeConnection(channel: Channel, connection: Connection): void {
    process.once('SIGINT', async () => {
      await channel.close();
      await connection.close();
    });
  }
}

// Dependency Injection
// const log: Logger = winstonLogger(`${ config.ELASTIC_SEARCH_URL }`, 'authQueueConnection', 'debug');
// const rabbitmqEndpoint: string = config.RABBITMQ_ENDPOINT;
//
// const authQueueConnection = new authQueueConnection(log, rabbitmqEndpoint);
//
// export { authQueueConnection };
