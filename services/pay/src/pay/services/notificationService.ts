

import { BuyerModel } from '@pay/pay/models/buyer.schema';
import { IBuyerDocument, ISellerDocument } from '@pay/dto/';
import { SellerModel } from '../models/seller.schema';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerItem, IReviewMessageDetails, IRatingTypes } from '@pay/dto/';
import { ElasticSearchService } from '@pay/pay/services/elasticSearchService';
import SearchService from '@pay/pay/services/searchService';
import { NotificationModelSchema } from '@pay/pay/models/noti.schema';
import { RabbitMQManager } from '@pay/broker/rabbitMQManager';
import { configInstance as config } from '@pay/config';
import { IPayNotification, IPayDocument } from '@pay/dto';

import { winstonLogger, IErrorResponse, CustomError } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { socketIOPayObject } from '@pay/pay/payServer';
import PayService from '@pay/pay/services/payService';

export class NotificationService {

  private readonly elasticSearchService: ElasticSearchService;
  private readonly payService: PayService;
  private readonly log: Logger;
  private readonly rabbitMQManager?: RabbitMQManager;

  constructor(rabbitMQManager?: RabbitMQManager) {
    this.elasticSearchService = new ElasticSearchService();
    this.payService = new PayService();
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'pay', 'debug');
    // this.rabbitMQManager = new RabbitMQManager(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
    if (rabbitMQManager) {
      this.rabbitMQManager = rabbitMQManager;
    }
  }

  async createNotification(data: IPayNotification): Promise<IPayNotification> {
    const notification: IPayNotification = await NotificationModelSchema.create(data);
    return notification;
  }

  async getNotificationsById(userToId: string): Promise<IPayNotification[]> {
    const notifications: IPayNotification[] = await NotificationModelSchema.aggregate([
      { $match: { userTo: userToId } }
    ]);
    return notifications;
  }

  async markNotificationAsRead(notificationId: string): Promise<IPayNotification> {
    const notification: IPayNotification = await NotificationModelSchema.findOneAndUpdate(
      { _id: notificationId },
      {
        $set: {
          isRead: true
        }
      },
      { new: true }
    ) as IPayNotification;

    const pay: IPayDocument = await this.payService.getPayByPayId(notification.payId);
    socketIOPayObject.emit('order notification', pay, notification);

    return notification;
  }

  async sendNotification(data: IPayDocument, userToId: string, message: string): Promise<void> {
    const notification: IPayNotification = {
      userTo: userToId,
      senderUsername: data.sellerUsername,
      receiverUsername: data.buyerUsername,
      message,
      payId: data.payId
    } as IPayNotification;

    const payNotification: IPayNotification = await this.createNotification(notification);
    socketIOPayObject.emit('pay notification', data, payNotification);
  }
  // async getItemById(itemId: string): Promise<ISellerItem> {
  //   const item: ISellerItem = await this.elasticSearchService.getIndexedData('items', itemId);
  //   return item;
  // }


}


export default NotificationService;
