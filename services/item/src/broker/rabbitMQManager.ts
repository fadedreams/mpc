import { Logger } from 'winston';
import { connect, Channel, Connection, ConsumeMessage, Replies } from 'amqplib';
import { IBuyerDocument, ISellerDocument } from '@item/dto/';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import BuyerService from '@item/item/services/buyerService';
import SellerService from '@item/item/services/sellerService';

export class RabbitMQManager {
  private readonly log: Logger;
  private readonly rabbitmqEndpoint: string;
  private connection!: Connection;
  private channel!: Channel;
  private buyerService: BuyerService;
  private sellerService: SellerService;

  constructor(log: Logger, rabbitmqEndpoint: string) {
    this.log = log;
    this.rabbitmqEndpoint = rabbitmqEndpoint;
    this.buyerService = new BuyerService();
    this.sellerService = new SellerService(this.buyerService);
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

  async consumeAuthEmailMessages(channel: Channel): Promise<void> {
    await this.consumeEmailMessages(channel, 'mpc-email-auth', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
  }

  async consumeOrderEmailMessages(channel: Channel): Promise<void> {
    await this.consumeEmailMessages(channel, 'mpc-order-auth', 'order-email', 'order-email-queue', 'orderPlaced');
  }

  // consuming messages from auth microservice, authUserService.ts in auth microservice
  async consumeBuyerDirectMessage(channel: Channel): Promise<void> {
    try {
      if (!this.channel) {
        this.connection = await connect(this.rabbitmqEndpoint);
        this.channel = await this.connection.createChannel();
      }
      const exchangeName = 'mpc-buyer-update';
      const routingKey = 'user-buyer';
      const queueName = 'user-buyer-queue';
      await channel.assertExchange(exchangeName, 'direct');
      const mpcQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
      await channel.bindQueue(mpcQueue.queue, exchangeName, routingKey);
      channel.consume(mpcQueue.queue, async (msg: ConsumeMessage | null) => {
        const { type } = JSON.parse(msg!.content.toString());
        if (type === 'auth') {
          const { username, email, createdAt } = JSON.parse(msg!.content.toString());
          const buyer: IBuyerDocument = {
            username,
            email,
            purchasedItems: [],
            createdAt
          };
          await this.buyerService.createBuyer(buyer);
        } else {
          const { buyerId, purchasedItems } = JSON.parse(msg!.content.toString());
          await this.buyerService.updateBuyerPurchasedItemsProp(buyerId, purchasedItems, type);
        }
        channel.ack(msg!);
      });
    } catch (error) {
      this.log.log('error', 'ItemService UserConsumer consumeBuyerDirectMessage() method error:', error);
    }
  }

  //consuming messages from order microservice
  async consumeSellerDirectMessage(channel: Channel): Promise<void> {
    try {
      if (!this.channel) {
        this.connection = await connect(this.rabbitmqEndpoint);
        this.channel = await this.connection.createChannel();
      }
      const exchangeName = 'mpc-seller-update';
      const routingKey = 'user-seller';
      const queueName = 'user-seller-queue';
      await channel.assertExchange(exchangeName, 'direct');
      const mpcQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
      await channel.bindQueue(mpcQueue.queue, exchangeName, routingKey);
      /** [TODO:description] */
      channel.consume(mpcQueue.queue, async (msg: ConsumeMessage | null) => {
        const { type, sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery, itemSellerId, count } = JSON.parse(
          msg!.content.toString()
        );
        if (type === 'create-order') {
          await this.sellerService.updateSellerOngoingJobsProp(sellerId, ongoingJobs);
        } else if (type === 'approve-order') {
          await this.sellerService.updateSellerCompletedJobsProp({
            sellerId,
            ongoingJobs,
            completedJobs,
            totalEarnings,
            recentDelivery
          });
        } else if (type === 'update-item-count') {
          await this.sellerService.updateTotalItemCount(`${itemSellerId}`, count);
        } else if (type === 'cancel-order') {
          await this.sellerService.updateSellerCancelledJobsProp(sellerId);
        }
        channel.ack(msg!);
      });
    } catch (error) {
      this.log.log('error', 'ItemService UserConsumer consumeSellerDirectMessage() method error:', error);
    }
  }

  //consuming messages from review microservice
  async consumeReviewFanoutMessages(channel: Channel): Promise<void> {
    try {
      if (!this.channel) {
        this.connection = await connect(this.rabbitmqEndpoint);
        this.channel = await this.connection.createChannel();
      }
      const exchangeName = 'mpc-review';
      const queueName = 'seller-review-queue';
      await channel.assertExchange(exchangeName, 'fanout');
      const mpcQueue: Replies.AssertQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
      await channel.bindQueue(mpcQueue.queue, exchangeName, '');
      channel.consume(mpcQueue.queue, async (msg: ConsumeMessage | null) => {
        const { type } = JSON.parse(msg!.content.toString());
        if (type === 'buyer-review') {
          await this.sellerService.updateSellerReview(JSON.parse(msg!.content.toString()));
          await this.publishDirectMessage(
            'mpc-update-item',
            'update-item',
            JSON.stringify({ type: 'updateItem', itemReview: msg!.content.toString() }),
            'Message sent to item service.'
          );
        }
        channel.ack(msg!);
      });
    } catch (error) {
      this.log.log('error', 'ItemService UserConsumer consumeReviewFanoutMessages() method error:', error);
    }
  };
}
