import { Config } from '@users/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Channel, connect } from 'amqplib';
import { Logger } from 'winston';
import { AuthQueueConnection } from './authQueueConnection'; // Import authQueueConnection

class AuthProducer {
  private channel!: Channel;
  private readonly authQueueConnection: AuthQueueConnection; // Add reference to authQueueConnection
  private log: Logger;

  constructor(private readonly config: Config) {
    this.authQueueConnection = new AuthQueueConnection(winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceProducer', 'debug'), config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceProducer', 'debug');
  }

  async createChannel(): Promise<void> {
    try {
      await this.authQueueConnection.createConnection(); // Use authQueueConnection to create the connection
      this.channel = this.authQueueConnection.getChannel(); // Get the channel from authQueueConnection
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
      await this.channel.assertExchange(exchangeName, 'direct');
      this.channel.publish(exchangeName, routingKey, Buffer.from(message));
      this.log.info(logMessage);
    } catch (error) {
      this.log.log('error', 'AuthService Provider publishDirectMessage() method error:', error);
    }
  }

  async closeChannel(): Promise<void> {
    try {
      await this.authQueueConnection.closeConnection(); // Use authQueueConnection to close the connection
    } catch (error) {
      this.log.log('error', 'AuthProducer closeChannel() method error:', error);
    }
  }
}

export { AuthProducer };
