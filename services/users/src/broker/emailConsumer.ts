
import { Config } from '@users/config';
import { IEmailLocals, winstonLogger } from '@fadedreams7org1/mpclib';
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
// import { createConnection } from '@users/queues/connection';
// import { sendEmail } from '@users/queues/mail.transport';
import { RabbitMQManager } from '@users/broker/rabbitMQManager';
import { MailTransportHelper } from '@users/utils';


class EmailConsumer {
  private readonly log: Logger;
  private readonly rabbitMQManager: RabbitMQManager;
  private readonly mailTransportHelper: MailTransportHelper;

  constructor(private readonly config: Config) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug'),
      this.rabbitMQManager = new RabbitMQManager(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost'),
      this.mailTransportHelper = new MailTransportHelper(this.config);
  }

  async consumeEmailMessages(channel: Channel, exchangeName: string, routingKey: string, queueName: string, template: string): Promise<void> {
    try {
      let channel: Channel | undefined = undefined;

      if (!channel) {
        await this.rabbitMQManager.initialize();
        channel = this.rabbitMQManager.getChannel();
      }

      if (channel) {
        await channel.assertExchange(exchangeName, 'direct');
        const mpcQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
        await channel.bindQueue(mpcQueue.queue, exchangeName, routingKey);

        channel.consume(mpcQueue.queue, async (msg: ConsumeMessage | null) => {
          console.log("consumed ", msg?.content.toString());
          const messageData = JSON.parse(msg!.content.toString());
          console.log(messageData.username);
          // this.log.info("Sending email to: " + messageData.username, "receiver: " + messageData.receiver);
          // this.mailTransportHelper.sendEmail(messageData.receiver);
          channel!.ack(msg!);
        });
      } else {
        throw new Error('Channel is undefined.');
      }
    } catch (error) {
      this.log.log('error', `authService EmailConsumer consumeEmailMessages() method error: ${error}`);
    }
  }

  async consumeAuthEmailMessages(channel: Channel): Promise<void> {
    await this.consumeEmailMessages(channel, 'mpc-email-auth', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
  }

  async consumeOrderEmailMessages(channel: Channel): Promise<void> {
    await this.consumeEmailMessages(channel, 'mpc-order-auth', 'order-email', 'order-email-queue', 'orderPlaced');
  }

}

export { EmailConsumer };
