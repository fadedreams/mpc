
import { BuyerModel } from '@item/item/models/buyer.schema';
import { IBuyerDocument, ISellerDocument } from '@item/dto/';
import { SellerModel } from '../models/seller.schema';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerItem } from '@item/dto/';
import { ElasticSearchService } from '@item/item/services/elasticSearchService';
import SearchService from '@item/item/services/searchService';
import { ItemModel } from '@item/item/models/item.schema';
import { RabbitMQManager } from '@item/broker/rabbitMQManager';
import { configInstance as config } from '@item/config';
import { winstonLogger, IErrorResponse, CustomError } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';

class ItemService {

  private readonly elasticSearchService: ElasticSearchService;
  private readonly searchService: SearchService;
  private readonly log: Logger;
  private readonly rabbitMQManager: RabbitMQManager;

  constructor() {
    this.elasticSearchService = new ElasticSearchService();
    this.searchService = new SearchService();
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'users', 'debug');
    this.rabbitMQManager = new RabbitMQManager(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
  }

  async getItemById(itemId: string): Promise<ISellerItem> {
    const item: ISellerItem = await this.elasticSearchService.getIndexedData('items', itemId);
    return item;
  }


  async getSellerItems(sellerId: string): Promise<ISellerItem[]> {
    const resultsHits: ISellerItem[] = [];
    const gigs = await this.searchService.itemsSearchBySellerId(sellerId, true);
    for (const item of gigs.hits) {
      resultsHits.push(item._source as ISellerItem);
    }
    return resultsHits;
  }


  async createItem(item: ISellerItem): Promise<ISellerItem> {
    const createdItem: ISellerItem = await ItemModel.create(item);
    if (createdItem) {
      const data: ISellerItem = createdItem.toJSON?.() as ISellerItem;
      await this.rabbitMQManager.publishDirectMessage(
        'mpc-seller-update',
        'user-seller',
        JSON.stringify({ type: 'update-item-count', itemSellerId: `${data.sellerId}`, count: 1 }),
        'Details sent to users service.'
      );
      await this.elasticSearchService.addDataToIndex('items', `${createdItem._id}`, createdItem);
    }
    return createdItem;
  };

}


export default ItemService;
