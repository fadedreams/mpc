
import { BuyerModel } from '@msg/msg/models/buyer.schema';
import { IBuyerDocument, ISellerDocument } from '@msg/dto/';
import { SellerModel } from '../models/seller.schema';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerItem, IReviewMessageDetails, IRatingTypes } from '@msg/dto/';
import { ElasticSearchService } from '@msg/msg/services/elasticSearchService';
import SearchService from '@msg/msg/services/searchService';
import { ItemModel } from '@msg/msg/models/item.schema';
import { RabbitMQManager } from '@msg/broker/rabbitMQManager';
import { configInstance as config } from '@msg/config';
import { winstonLogger, IErrorResponse, CustomError } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';

class ItemService {

  private readonly elasticSearchService: ElasticSearchService;
  private readonly searchService: SearchService;
  private readonly log: Logger;
  private readonly rabbitMQManager?: RabbitMQManager;

  constructor(rabbitMQManager?: RabbitMQManager) {
    this.elasticSearchService = new ElasticSearchService();
    this.searchService = new SearchService();
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'items', 'debug');
    // this.rabbitMQManager = new RabbitMQManager(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
    if (rabbitMQManager) {
      this.rabbitMQManager = rabbitMQManager;
    }
  }

  async getItemById(itemId: string): Promise<ISellerItem> {
    const item: ISellerItem = await this.elasticSearchService.getIndexedData('items', itemId);
    return item;
  }


  async getSellerItems(sellerId: string): Promise<ISellerItem[]> {
    const resultsHits: ISellerItem[] = [];
    const items = await this.searchService.itemsSearchBySellerId(sellerId, true);
    for (const item of items.hits) {
      resultsHits.push(item._source as ISellerItem);
    }
    return resultsHits;
  }


  async createItem(item: ISellerItem): Promise<ISellerItem> {
    // console.log("tested");
    const createdItem: ISellerItem = await ItemModel.create(item);
    if (createdItem) {
      const data: ISellerItem = createdItem.toJSON?.() as ISellerItem;
      if (this.rabbitMQManager) {
        await this.rabbitMQManager.publishDirectMessage(
          'mpc-seller-update',
          'user-seller',
          JSON.stringify({ type: 'update-item-count', itemSellerId: `${data.sellerId}`, count: 1 }),
          'Details sent to items service.'
        );
      }
      // console.log('createdItemid: ', createdItem._id);
      await this.elasticSearchService.addDataToIndex('items', `${createdItem._id}`, createdItem);
    }
    return createdItem;
  };

  async deleteItem(itemId: string, sellerId: string): Promise<void> {
    await ItemModel.deleteOne({ _id: itemId }).exec();
    if (this.rabbitMQManager) {
      await this.rabbitMQManager.publishDirectMessage(
        'mpc-seller-update',
        'user-seller',
        JSON.stringify({ type: 'update-item-count', itemSellerId: sellerId, count: -1 }),
        'Details sent to items service.'
      );
    }
    await this.elasticSearchService.deleteIndexedData('items', `${itemId}`);
  }

  async updateItem(itemId: string, itemData: ISellerItem): Promise<ISellerItem> {
    const document: ISellerItem = await ItemModel.findOneAndUpdate(
      { _id: itemId },
      {
        $set: {
          title: itemData.title,
          description: itemData.description,
          categories: itemData.categories,
          subCategories: itemData.subCategories,
          tags: itemData.tags,
          price: itemData.price,
          expectedDelivery: itemData.expectedDelivery,
          Title: itemData.Title,
          Description: itemData.Description
        }
      },
      { new: true }
    ).exec() as ISellerItem;
    if (document) {
      const data: ISellerItem = document.toJSON?.() as ISellerItem;
      await this.elasticSearchService.updateIndexedData('items', `${document._id}`, data);
    }
    return document;
  }


  async updateItemReview(data: IReviewMessageDetails): Promise<void> {
    const ratingTypes: IRatingTypes = {
      '1': 'one',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      '5': 'five',
    };
    const ratingKey: string = ratingTypes[`${data.rating}`];
    const item = await ItemModel.findOneAndUpdate(
      { _id: data.itemId },
      {
        $inc: {
          ratingsCount: 1,
          ratingSum: data.rating,
          [`ratingCategories.${ratingKey}.value`]: data.rating,
          [`ratingCategories.${ratingKey}.count`]: 1,
        }
      },
      { new: true, upsert: true }
    ).exec();
    if (item) {
      const data: ISellerItem = item.toJSON?.() as ISellerItem;
      await this.elasticSearchService.updateIndexedData('items', `${item._id}`, data);
    }
  };

  async updateActiveItemProp(itemId: string, itemActive: boolean): Promise<ISellerItem> {
    const document: ISellerItem = await ItemModel.findOneAndUpdate(
      { _id: itemId },
      {
        $set: {
          active: itemActive
        }
      },
      { new: true }
    ).exec() as ISellerItem;
    if (document) {
      const data: ISellerItem = document.toJSON?.() as ISellerItem;
      await this.elasticSearchService.updateIndexedData('items', `${document._id}`, data);
    }
    return document;
  };

  async getSellerPausedItems(sellerId: string): Promise<ISellerItem[]> {
    const resultsHits: ISellerItem[] = [];
    const items = await this.searchService.itemsSearchBySellerId(sellerId, false);
    for (const item of items.hits) {
      resultsHits.push(item._source as ISellerItem);
    }
    return resultsHits;
  };

}


export default ItemService;
