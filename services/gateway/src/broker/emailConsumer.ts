
import { Config } from '@gateway/config';
import { IEmailLocals, winstonLogger } from '@fadedreams7org1/mpclib';
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
// import { createConnection } from '@gateway/queues/connection';
// import { sendEmail } from '@gateway/queues/mail.transport';
import { gatewayQueueConnection } from '@gateway/broker/gatewayQueueConnection';
import { MailTransportHelper } from '@gateway/utils';


class EmailConsumer {
  private readonly log: Logger;
  private readonly gatewayQueueConnection: gatewayQueueConnection;
  private readonly mailTransportHelper: MailTransportHelper;

  constructor(private readonly config: Config) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug'),
      this.gatewayQueueConnection = new gatewayQueueConnection(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost'),
      this.mailTransportHelper = new MailTransportHelper(this.config);
  }

  async consumeEmailMessages(channel: Channel, exchangeName: string, routingKey: string, queueName: string, template: string): Promise<void> {
    try {
      if (!channel) {
        // channel = await createConnection() as Channel;
        channel = await this.gatewayQueueConnection.createConnection() as Channel;
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
      this.log.log('error', `gatewayService EmailConsumer consumeEmailMessages() method error: ${error}`);
    }
  }

  async consumeAuthEmailMessages(channel: Channel): Promise<void> {
    await this.consumeEmailMessages(channel, 'mpc-email-gateway', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
  }

  async consumePayEmailMessages(channel: Channel): Promise<void> {
    await this.consumeEmailMessages(channel, 'mpc-pay-gateway', 'pay-email', 'pay-email-queue', 'orderPlaced');
  }

}

export { EmailConsumer };
