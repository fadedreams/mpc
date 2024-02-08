
import { Config } from '@alert/config';
import { IEmailLocals, winstonLogger } from '@fadedreams7org1/mpclib';
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
// import { createConnection } from '@alert/queues/connection';
// import { sendEmail } from '@alert/queues/mail.transport';
import { AlertQueueConnection } from '@alert/broker/alertQueueConnection';


class EmailConsumer {
  private readonly log: Logger;
  private readonly alertQueueConnection: AlertQueueConnection;

  constructor(private readonly config: Config) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');
    this.alertQueueConnection = new AlertQueueConnection(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
  }

  async consumeEmailMessages(channel: Channel, exchangeName: string, routingKey: string, queueName: string, template: string): Promise<void> {
    try {
      if (!channel) {
        // channel = await createConnection() as Channel;
        channel = await this.alertQueueConnection.createConnection() as Channel;
      }

      await channel.assertExchange(exchangeName, 'direct');
      const mpcQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
      await channel.bindQueue(mpcQueue.queue, exchangeName, routingKey);

      channel.consume(mpcQueue.queue, async (msg: ConsumeMessage | null) => {
        console.log("consumed ", msg?.content.toString());
        channel.ack(msg!);
      });
      // channel.consume(mpcQueue.queue, async (msg: ConsumeMessage | null) => {
      //   const messageData = JSON.parse(msg!.content.toString());
      //   const locals: IEmailLocals = {
      //     appLink: `${this.config.CLIENT_URL}`,
      //     appIcon: 'https://placehold.co/600x400/000000/FFFFFF.png',
      //     username: messageData.username,
      //     // add other properties based on the specific email type
      //   };

      // await sendEmail

      // channel.ack(msg!);
      // });
    } catch (error) {
      this.log.log('error', `alertService EmailConsumer consumeEmailMessages() method error: ${error}`);
    }
  }

  async consumeAuthEmailMessages(channel: Channel): Promise<void> {
    await this.consumeEmailMessages(channel, 'mpc-email-alert', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
  }

  async consumeOrderEmailMessages(channel: Channel): Promise<void> {
    await this.consumeEmailMessages(channel, 'mpc-order-alert', 'order-email', 'order-email-queue', 'orderPlaced');
  }

}

export { EmailConsumer };
