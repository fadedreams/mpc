import { Logger } from 'winston'
import { connect, Channel, Connection, ConsumeMessage, Replies } from 'amqplib';
import { IBuyerDocument, ISellerDocument } from '@msg/dto/';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import BuyerService from '@msg/msg/services/buyerService';
import SellerService from '@msg/msg/services/sellerService';
import ItemService from '@msg/msg/services/itemService';

export class RabbitMQManager {
  private readonly log: Logger;
  private readonly rabbitmqEndpoint: string;
  private connection!: Connection;
  private channel!: Channel;
  private buyerService: BuyerService;
  private sellerService: SellerService;
  private readonly itemService: ItemService;

  constructor(log: Logger, rabbitmqEndpoint: string) {
    this.log = log;
    this.rabbitmqEndpoint = rabbitmqEndpoint;
    this.buyerService = new BuyerService();
    this.sellerService = new SellerService(this.buyerService);
    this.itemService = new ItemService(this);
  }

  async initialize(): Promise<void> {
    try {
      this.connection = await connect(this.rabbitmqEndpoint);
      this.channel = await this.connection.createChannel();
      this.log.info('msg server connected to queue successfully... ', this.rabbitmqEndpoint);
    } catch (error) {
      this.log.log(`msgService error initialize() method: ${this.rabbitmqEndpoint}`, error);
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
      this.log.error('MsgService Provider publishDirectMessage() method error:', error);
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

  async consumeEmailMessages(channel: Channel, exchangeName: string, routingKey: string, queueName: string, template: string): Promise<void> {
    try {
      if (!channel) {
        await this.initialize();
        channel = this.getChannel();
      }

      await channel.assertExchange(exchangeName, 'direct');
      const mpcQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
      await channel.bindQueue(mpcQueue.queue, exchangeName, routingKey);

      channel.consume(mpcQueue.queue, async (msg: ConsumeMessage | null) => {
        console.log("consumed ", msg?.content.toString());
        const messageData = JSON.parse(msg!.content.toString());
        console.log(messageData.username);
        // this.log.info("Sending email to: " + messageData.username, "receiver: " + messageData.receiver);
        // this.mailTransportHelper.sendEmail(messageData.receiver);
        channel!.ack(msg!);
      });
    } catch (error) {
      this.log.log('error', `authService EmailConsumer consumeEmailMessages() method error: ${error}`);
    }
  }

  // async consumeAuthEmailMessages(channel: Channel): Promise<void> {
  //   await this.consumeEmailMessages(channel, 'mpc-email-auth', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
  // }
  //
  // async consumeOrderEmailMessages(channel: Channel): Promise<void> {
  //   await this.consumeEmailMessages(channel, 'mpc-order-auth', 'order-email', 'order-email-queue', 'orderPlaced');
  // }
  //
  // async consumeItemDirectMessage(channel: Channel): Promise<void> {
  //   try {
  //     if (!channel) {
  //       await this.initialize();
  //       channel = this.getChannel();
  //     }
  //     const exchangeName = 'mpc-update-item';
  //     const routingKey = 'update-item';
  //     const queueName = 'item-update-queue';
  //     await channel.assertExchange(exchangeName, 'direct');
  //     const mpcQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
  //     await channel.bindQueue(mpcQueue.queue, exchangeName, routingKey);
  //     channel.consume(mpcQueue.queue, async (msg: ConsumeMessage | null) => {
  //       const { itemReview } = JSON.parse(msg!.content.toString());
  //       // await this.itemService.updateItemReview(JSON.parse(itemReview));
  //       channel.ack(msg!);
  //     });
  //   } catch (error) {
  //     this.log.log('error', 'ItemService ItemConsumer consumeItemDirectMessage() method error:', error);
  //   }
  // };



}
