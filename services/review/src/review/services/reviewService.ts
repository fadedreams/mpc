
import { BuyerModel } from '@review/review/models/buyer.schema';
import { IBuyerDocument, ISellerDocument } from '@review/dto/';
import { SellerModel } from '../models/seller.schema';
import { ElasticSearchService } from '@review/review/services/elasticSearchService';
import SearchService from '@review/review/services/searchService';
import { ItemModel } from '@review/review/models/item.schema';
import { RabbitMQManager } from '@review/broker/rabbitMQManager';
import { configInstance as config, pool } from '@review/config';
import { winstonLogger, IErrorResponse, CustomError } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { IReviewDocument, IReviewMessageDetails } from '@review/dto';
import { QueryResult } from 'pg';
import { map } from 'lodash';

interface IReviewerObjectKeys {
  review: string;
  rating: string;
  itemid: string;
  reviewerid: string;
  createdat: string;
  orderid: string;
  sellerid: string;
  reviewerusername: string;
  reviewtype: string;
  [key: string]: string | undefined;
}

class ReviewService {

  private readonly elasticSearchService: ElasticSearchService;
  private readonly searchService: SearchService;
  private readonly log: Logger;
  private readonly rabbitMQManager?: RabbitMQManager;
  private objKeys: IReviewerObjectKeys = {
    review: 'review',
    rating: 'rating',
    itemid: 'itemId',
    reviewerid: 'reviewerId',
    createdat: 'createdAt',
    orderid: 'orderId',
    sellerid: 'sellerId',
    reviewerusername: 'reviewerUsername',
    reviewtype: 'reviewType'
  };

  constructor(rabbitMQManager?: RabbitMQManager) {
    this.elasticSearchService = new ElasticSearchService();
    this.searchService = new SearchService();
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'items', 'debug');
    // this.rabbitMQManager = new RabbitMQManager(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
    if (rabbitMQManager) {
      this.rabbitMQManager = rabbitMQManager;
    }
  }

  public async addReview(data: IReviewDocument) {
    const {
      itemId,
      reviewerId,
      sellerId,
      review,
      rating,
      orderId,
      reviewType,
      reviewerUsername,
    } = data;
    const createdAtDate = new Date();
    const { rows } = await pool.query(
      `INSERT INTO reviews(itemId, reviewerId, sellerId, review, rating, orderId, reviewType, reviewerUsername, createdAt)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `,
      [itemId, reviewerId, sellerId, review, rating, orderId, reviewType, reviewerUsername, createdAtDate]
    );
    const result = Object.fromEntries(
      Object.entries(rows[0]).map(([key, value]) => [this.objKeys[key] || key, value])
    );
    return result;
  }

  // Function to get reviews by itemId
  public async getReviewsByItemId(itemId: string) {
    const reviews: QueryResult = await pool.query('SELECT * FROM reviews WHERE reviews.itemId = $1', [itemId]);
    const mappedResult = map(reviews.rows, (key) => {
      return Object.fromEntries(
        Object.entries(key).map(([key, value]) => [this.objKeys[key] || key, value])
      );
    });
    return mappedResult;
  }

  // Function to get reviews by sellerId
  public async getReviewsBySellerId(sellerId: string) {
    const reviews: QueryResult = await pool.query('SELECT * FROM reviews WHERE reviews.sellerId = $1 AND reviews.reviewType = $2', [
      sellerId,
      'seller-review'
    ]);
    const mappedResult = map(reviews.rows, (key) => {
      return Object.fromEntries(
        Object.entries(key).map(([key, value]) => [this.objKeys[key] || key, value])
      );
    });
    return mappedResult;
  }

  // async getItemById(itemId: string): Promise<ISellerItem> {
  //   const item: ISellerItem = await this.elasticSearchService.getIndexedData('items', itemId);
  //   return item;
  // }

}


export default ReviewService;
