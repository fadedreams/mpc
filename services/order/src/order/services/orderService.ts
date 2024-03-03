// import { ElasticSearchService } from '@order/order/services/elasticSearchService';
import { RabbitMQManager } from '@order/broker/rabbitMQManager';
import { configInstance as config } from '@order/config';
import { winstonLogger, IErrorResponse, CustomError } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { IOrderDocument, IOrderMessage, IReviewMessageDetails, IOrderNotification } from '@order/dto';
import { OrderModel } from '@order/order/models/order.schema';
import { Request, Response } from 'express'; // Import Request and Response
import NotificationService from '@order/order/services/notificationService';
import { BadRequestError } from '@fadedreams7org1/mpclib';
import { StatusCodes } from 'http-status-codes'
import { orderSchema } from '@order/order/schemas/order';
import { NotificationModelSchema } from '@order/order/models/noti.schema';
import { socketIOOrderObject } from '@order/order/orderServer';


class OrderService {
  // private readonly elasticSearchService: ElasticSearchService;
  private readonly log: Logger;
  private readonly rabbitMQManager?: RabbitMQManager;

  constructor(rabbitMQManager?: RabbitMQManager) {
    // this.elasticSearchService = new ElasticSearchService();
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order', 'debug');
    if (rabbitMQManager) {
      this.rabbitMQManager = rabbitMQManager;
    }
  }

  async sendNotification(data: IOrderDocument, userToId: string, message: string): Promise<void> {
    const notification: IOrderNotification = {
      userTo: userToId,
      senderUsername: data.sellerUsername,
      receiverUsername: data.buyerUsername,
      message,
      orderId: data.orderId
    } as IOrderNotification;

    const orderNotification: IOrderNotification = await this.createNotification(notification);
    socketIOOrderObject.emit('order notification', data, orderNotification);
  }


  async createNotification(data: IOrderNotification): Promise<IOrderNotification> {
    const notification: IOrderNotification = await NotificationModelSchema.create(data);
    return notification;
  }

  async getNotificationsById(userToId: string): Promise<IOrderNotification[]> {
    const notifications: IOrderNotification[] = await NotificationModelSchema.aggregate([
      { $match: { userTo: userToId } }
    ]);
    return notifications;
  }

  async markNotificationAsRead(notificationId: string) {
    const notification: IOrderNotification = await NotificationModelSchema.findOneAndUpdate(
      { _id: notificationId },
      {
        $set: {
          isRead: true
        }
      },
      { new: true }
    ) as IOrderNotification;

    const order = await this.getOrderByOrderId(notification.orderId);
    socketIOOrderObject.emit('order notification', order, notification);

    return notification;
  }

  // public async getOrderByOrderId(orderId: string): Promise<IOrderDocument> {
  //   // const order: IOrderDocument[] = (await OrderModel.aggregate([{ $match: { orderId } }])) as IOrderDocument[];
  //   const order: IOrderDocument[] = (await OrderModel.aggregate([{ $match: { _id: orderId } }])) as IOrderDocument[];
  //   return order[0];
  // }

  // async getOrderByOrderId(orderId: string): Promise<IOrderDocument | null> {
  //   const result = await OrderModel.aggregate([
  //     { $match: { _id: orderId } }
  //   ]);
  //   console.log(result);
  //   return result.length > 0 ? result[0] : null;
  // }

  public async getOrderByOrderId(orderId: string): Promise<IOrderDocument | null> {
    const order = await OrderModel.findOne({ _id: orderId }).exec();
    return order;
  }

  public async getOrdersBySellerId(sellerId: string): Promise<IOrderDocument[]> {
    const orders: IOrderDocument[] = (await OrderModel.aggregate([{ $match: { sellerId } }])) as IOrderDocument[];
    return orders;
  }

  public async getOrdersByBuyerId(buyerId: string): Promise<IOrderDocument[]> {
    const orders: IOrderDocument[] = (await OrderModel.aggregate([{ $match: { buyerId } }])) as IOrderDocument[];
    return orders;
  }

  public async createOrder(data: IOrderDocument): Promise<IOrderDocument> {
    const order: IOrderDocument = await OrderModel.create(data);
    const messageDetails: IOrderMessage = {
      sellerId: data.sellerId,
      ongoingJobs: 1,
      type: 'create-order',
    };
    if (this.rabbitMQManager) {
      await this.rabbitMQManager.publishDirectMessage(
        'jobber-seller-update',
        'user-seller',
        JSON.stringify(messageDetails),
        'Details sent to users service'
      );
    }
    this.sendNotification(order, data.sellerUsername, 'placed an order for your gig.');
    return order;
  }

  public async order(req: Request, res: Response) {
    const { error } = await Promise.resolve(orderSchema.validate(req.body));
    // if (error?.details) {
    //   throw new BadRequestError(error.details[0].message, 'Create order() method');
    // }
    const serviceFee: number = req.body.price < 50 ? (5.5 / 100) * req.body.price + 2 : (5.5 / 100) * req.body.price;
    let orderData: IOrderDocument = req.body;
    orderData = { ...orderData, serviceFee };
    const order: IOrderDocument = await this.createOrder(orderData);
    return order;
    // res.status(StatusCodes.CREATED).json({ message: 'Order created successfully.', order });
    console.error(error);
    // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }

  async updateOrderReview(data: IReviewMessageDetails): Promise<IOrderDocument> {
    const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
      { payId: data.orderId },
      {
        $set:
          data.type === 'buyer-review'
            ? {
              buyerReview: {
                rating: data.rating,
                review: data.review,
                created: new Date(`${data.createdAt}`)
              },
              ['events.buyerReview']: new Date(`${data.createdAt}`)
            }
            : {
              sellerReview: {
                rating: data.rating,
                review: data.review,
                created: new Date(`${data.createdAt}`)
              },
              ['events.sellerReview']: new Date(`${data.createdAt}`)
            }
      },
      { new: true }
    ).exec()) as IOrderDocument;

    this.sendNotification(
      order,
      data.type === 'buyer-review' ? order.sellerUsername : order.buyerUsername,
      `left you a ${data.rating} star review`
    );
    return order;
  }
}

export default OrderService;
