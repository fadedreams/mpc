import { winstonLogger } from '@fadedreams7org1/mpclib';
import client, { Channel, Connection } from 'amqplib';
import { Logger } from 'winston';


export class QueueConnection {
  private readonly log: Logger;
  private readonly rabbitmqEndpoint: string;
  private connection!: Connection;
  private channel!: Channel;

  constructor(log: Logger, rabbitmqEndpoint: string) {
    this.log = log;
    this.rabbitmqEndpoint = rabbitmqEndpoint;
  }

  async createConnection(): Promise<void> {
    try {
      this.connection = await client.connect(this.rabbitmqEndpoint);
      this.channel = await this.connection.createChannel();
      this.log.info('review server connected to queue successfully... ', this.rabbitmqEndpoint);
    } catch (error) {
      this.log.log(`reviewService error createConnection() method: ${this.rabbitmqEndpoint}`, error);
    }
  }

  getChannel(): Channel {
    return this.channel;
  }

  async closeConnection(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      this.log.log('error', 'QueueConnection closeConnection() method error:', error);
    }
  }
}

// Dependency Injection
// const log: Logger = winstonLogger(`${ config.ELASTIC_SEARCH_URL }`, 'authQueueConnection', 'debug');
// const rabbitmqEndpoint: string = config.RABBITMQ_ENDPOINT;
//
// const authQueueConnection = new authQueueConnection(log, rabbitmqEndpoint);
//
// export { authQueueConnection };
