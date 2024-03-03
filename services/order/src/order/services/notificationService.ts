

import { BuyerModel } from '@order/order/models/buyer.schema';
import { IBuyerDocument, ISellerDocument } from '@order/dto/';
import { SellerModel } from '../models/seller.schema';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerItem, IReviewMessageDetails, IRatingTypes } from '@order/dto/';
// import { ElasticSearchService } from '@order/order/services/elasticSearchService';
import SearchService from '@order/order/services/searchService';
import { RabbitMQManager } from '@order/broker/rabbitMQManager';
import { configInstance as config } from '@order/config';
import { IOrderNotification, IOrderDocument } from '@order/dto';

import { winstonLogger, IErrorResponse, CustomError } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import OrderService from '@order/order/services/orderService';

export class NotificationService {

  // private readonly elasticSearchService: ElasticSearchService;
  private readonly orderService: OrderService;
  private readonly log: Logger;
  private readonly rabbitMQManager?: RabbitMQManager;

  constructor(rabbitMQManager?: RabbitMQManager) {
    // this.elasticSearchService = new ElasticSearchService();
    this.orderService = new OrderService();
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'order', 'debug');
    // this.rabbitMQManager = new RabbitMQManager(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
    if (rabbitMQManager) {
      this.rabbitMQManager = rabbitMQManager;
    }
  }

  // async getItemById(itemId: string): Promise<ISellerItem> {
  //   const item: ISellerItem = await this.elasticSearchService.getIndexedData('items', itemId);
  //   return item;
  // }


}


export default NotificationService;
