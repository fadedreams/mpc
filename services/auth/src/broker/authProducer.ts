import { Config } from '@auth/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Channel, connect } from 'amqplib';
import { Logger } from 'winston';

class AuthProducer {
  private channel!: Channel;  // Using definite assignment assertion

  private log: Logger;

  constructor(private readonly config: Config) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceProducer', 'debug');
  }

  async createChannel(): Promise<void> {
    try {
      const connection = await connect(this.config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
      this.channel = await connection.createChannel();
    } catch (error) {
      this.log.log('error', 'AuthProducer createChannel() method error:', error);
    }
  }

  async publishDirectMessage(
    exchangeName: string,
    routingKey: string,
    message: string,
    logMessage: string
  ): Promise<void> {
    try {
      if (!this.channel) {
        await this.createChannel();
      }

      // Null check before using this.channel
      if (this.channel) {
        await this.channel.assertExchange(exchangeName, 'direct');
        this.channel.publish(exchangeName, routingKey, Buffer.from(message));
        this.log.info(logMessage);
      }
    } catch (error) {
      this.log.log('error', 'AuthService Producer publishDirectMessage() method error:', error);
    }
  }

  async closeChannel(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
    } catch (error) {
      this.log.log('error', 'AuthProducer closeChannel() method error:', error);
    }
  }
}

export { AuthProducer };
