import { Config } from '@alert/config';
import { IEmailLocals, winstonLogger } from '@fadedreams7org1/mpclib';
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
import { AlertQueueConnection } from '@alert/broker/alertQueueConnection';
import { MailTransportHelper } from '@alert/utils';

const MAX_RETRIES = 5;
const RETRY_TTL_MS = 30000; // 30s backoff between retries

class EmailConsumer {
  private readonly log: Logger;
  private readonly alertQueueConnection: AlertQueueConnection;
  private readonly mailTransportHelper: MailTransportHelper;

  constructor(private readonly config: Config) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug'),
      this.alertQueueConnection = new AlertQueueConnection(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost'),
      this.mailTransportHelper = new MailTransportHelper(this.config);
  }

  async consumeEmailMessages(channel: Channel, exchangeName: string, routingKey: string, queueName: string, template: string): Promise<void> {
    try {
      if (!channel) {
        channel = await this.alertQueueConnection.createConnection() as Channel;
      }

      const dlxName = `${exchangeName}.dlx`;
      const retryQueueName = `${queueName}.retry`;
      const deadQueueName = `${queueName}.dead`;

      // Main exchange + queue, wired to dead-letter into the retry flow on nack
      await channel.assertExchange(exchangeName, 'direct');
      await channel.assertExchange(dlxName, 'direct');

      const mpcQueue = await channel.assertQueue(queueName, {
        durable: true,
        autoDelete: false,
        arguments: {
          'x-dead-letter-exchange': dlxName,
          'x-dead-letter-routing-key': `${routingKey}.retry`,
        },
      });
      await channel.bindQueue(mpcQueue.queue, exchangeName, routingKey);

      // Retry queue: holds message for RETRY_TTL_MS, then dead-letters back to the main exchange/queue
      const retryQueue = await channel.assertQueue(retryQueueName, {
        durable: true,
        autoDelete: false,
        arguments: {
          'x-message-ttl': RETRY_TTL_MS,
          'x-dead-letter-exchange': exchangeName,
          'x-dead-letter-routing-key': routingKey,
        },
      });
      await channel.bindQueue(retryQueue.queue, dlxName, `${routingKey}.retry`);

      // Terminal dead queue: no further DLX, this is where poison messages land for good
      const deadQueue = await channel.assertQueue(deadQueueName, {
        durable: true,
        autoDelete: false,
      });
      await channel.bindQueue(deadQueue.queue, dlxName, `${routingKey}.dead`);

      channel.consume(mpcQueue.queue, async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const messageData = JSON.parse(msg.content.toString());
          this.log.info(`Sending email to: ${messageData.username}, receiver: ${messageData.receiver}`);

          // await this.mailTransportHelper.sendEmail(messageData.receiver);

          channel.ack(msg);
        } catch (error) {
          const deathCount = this.getDeathCount(msg, queueName);

          this.log.log('error', `emailConsumer failed processing message (attempt ${deathCount + 1}): ${error}`);

          if (deathCount >= MAX_RETRIES) {
            // Exceeded retry budget -> route straight to the terminal dead queue, not back through retry
            channel.publish(dlxName, `${routingKey}.dead`, msg.content, { headers: msg.properties.headers });
            channel.ack(msg); // ack the original so it isn't redelivered from the main queue
          } else {
            // requeue=false -> goes to DLX -> retry queue -> back to main queue after TTL
            channel.nack(msg, false, false);
          }
        }
      });

    } catch (error) {
      this.log.log('error', `alertService EmailConsumer consumeEmailMessages() method error: ${error}`);
    }
  }

  // Reads RabbitMQ's x-death header to count how many times this message
  // has already been dead-lettered from the given queue.
  private getDeathCount(msg: ConsumeMessage, queueName: string): number {
    const xDeath = msg.properties?.headers?.['x-death'] as Array<{ queue: string; count: number }> | undefined;
    if (!xDeath) return 0;
    const entry = xDeath.find((d) => d.queue === queueName);
    return entry?.count ?? 0;
  }

  async consumeAuthEmailMessages(channel: Channel): Promise<void> {
    await this.consumeEmailMessages(channel, 'mpc-email-alert', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
  }

  async consumeorderEmailMessages(channel: Channel): Promise<void> {
    await this.consumeEmailMessages(channel, 'mpc-order-alert', 'order-email', 'order-email-queue', 'orderPlaced');
  }

}

export { EmailConsumer };
