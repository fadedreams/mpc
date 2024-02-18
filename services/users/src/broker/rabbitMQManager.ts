import { Logger } from 'winston';
import { connect, Channel, Connection } from 'amqplib';
import { winstonLogger } from '@fadedreams7org1/mpclib';

export class RabbitMQManager {
  private readonly log: Logger;
  private readonly rabbitmqEndpoint: string;
  private connection!: Connection;
  private channel!: Channel;

  constructor(log: Logger, rabbitmqEndpoint: string) {
    this.log = log;
    this.rabbitmqEndpoint = rabbitmqEndpoint;
  }

  async initialize(): Promise<void> {
    try {
      this.connection = await connect(this.rabbitmqEndpoint);
      this.channel = await this.connection.createChannel();
      this.log.info('auth server connected to queue successfully... ', this.rabbitmqEndpoint);
    } catch (error) {
      this.log.log(`authService error initialize() method: ${this.rabbitmqEndpoint}`, error);
    }
  }

  getChannel(): Channel {
    return this.channel;
  }

  async publishDirectMessage(
    exchangeName: string,
    routingKey: string,
    message: string,
    logMessage: string
  ): Promise<void> {
    try {
      if (!this.channel) {
        this.connection = await connect(this.rabbitmqEndpoint);
        this.channel = await this.connection.createChannel();
      }
      await this.channel.assertExchange(exchangeName, 'direct');
      this.channel.publish(exchangeName, routingKey, Buffer.from(message));
      this.log.info(logMessage);
    } catch (error) {
      this.log.error('AuthService Provider publishDirectMessage() method error:', error);
    }
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
      this.log.error('AuthQueueConnection closeConnection() method error:', error);
    }
  }
}

// Dependency Injection
// const log: Logger = winstonLogger(`${ config.ELASTIC_SEARCH_URL }`, 'authQueueConnection', 'debug');
// const rabbitmqEndpoint: string = config.RABBITMQ_ENDPOINT;
//
// const authQueueConnection = new RabbitMQManager(log, rabbitmqEndpoint);
//
// export { authQueueConnection };
