
import { Config } from '@auth/config';
import { IEmailLocals, winstonLogger } from '@fadedreams7org1/mpclib';
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
// import { createConnection } from '@auth/queues/connection';
// import { sendEmail } from '@auth/queues/mail.transport';
import { authQueueConnection } from '@auth/broker/authQueueConnection';
import { MailTransportHelper } from '@auth/utils';


class EmailConsumer {
  private readonly log: Logger;
  private readonly authQueueConnection: authQueueConnection;
  private readonly mailTransportHelper: MailTransportHelper;

  constructor(private readonly config: Config) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug'),
      this.authQueueConnection = new authQueueConnection(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost'),
      this.mailTransportHelper = new MailTransportHelper(this.config);
  }

  async consumeEmailMessages(channel: Channel, exchangeName: string, routingKey: string, queueName: string, template: string): Promise<void> {
    try {
      if (!channel) {
        // channel = await createConnection() as Channel;
        channel = await this.authQueueConnection.createConnection() as Channel;
      }

      await channel.assertExchange(exchangeName, 'direct');
      const mpcQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
      await channel.bindQueue(mpcQueue.queue, exchangeName, routingKey);

      // await this.mailTransportHelper.sendEmail("t@t.com");
      channel.consume(mpcQueue.queue, async (msg: ConsumeMessage | null) => {
        console.log("consumed ", msg?.content.toString());
        const messageData = JSON.parse(msg!.content.toString());
        console.log(messageData.username);
        // this.log.info("Sending email to: " + messageData.username, "receiver: " + messageData.receiver);
        // this.mailTransportHelper.sendEmail(messageData.receiver);
        channel.ack(msg!);
      });

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
