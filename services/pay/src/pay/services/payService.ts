
import { PayModel } from '@pay/pay/models/pay.schema'; // Update the path
import { IPayDocument, IPayMessage, IReviewMessageDetails } from '@pay/dto'; // Update the path
import { configInstance as config } from '@pay/config';
import { lowerCase } from 'lodash'; // Import lodash if not already done
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { RabbitMQManager } from '@pay/broker/rabbitMQManager';
import { NotificationService } from '@pay/pay/services/notificationService';
import { ElasticSearchService } from '@pay/pay/services/elasticSearchService';

class PayService {
  private readonly elasticSearchService: ElasticSearchService;
  private readonly log: Logger;
  private readonly rabbitMQManager?: RabbitMQManager;
  private readonly notificationService: NotificationService;

  constructor(rabbitMQManager?: RabbitMQManager) {
    this.elasticSearchService = new ElasticSearchService();
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'pay', 'debug');
    if (rabbitMQManager) {
      this.rabbitMQManager = rabbitMQManager;
    }

    this.notificationService = new NotificationService(); // Initialize NotificationService
  }


  async getPayByPayId(payId: string): Promise<IPayDocument> {
    const order: IPayDocument[] = (await PayModel.aggregate([{ $match: { payId } }])) as IPayDocument[];
    return order[0];
  }

  async getPaysBySellerId(sellerId: string): Promise<IPayDocument[]> {
    const orders: IPayDocument[] = (await PayModel.aggregate([{ $match: { sellerId } }])) as IPayDocument[];
    return orders;
  }

  async getPaysByBuyerId(buyerId: string): Promise<IPayDocument[]> {
    const orders: IPayDocument[] = (await PayModel.aggregate([{ $match: { buyerId } }])) as IPayDocument[];
    return orders;
  }

  async createPay(data: IPayDocument): Promise<IPayDocument> {
    const order: IPayDocument = await PayModel.create(data);
    const messageDetails: IPayMessage = {
      sellerId: data.sellerId,
      ongoingJobs: 1,
      type: 'create-order'
    };
    // ... (Rest of the method)
    this.notificationService.sendNotification(order, data.sellerUsername, 'placed an order for your gig.');
    return order;
  }

  // ... (Other methods)

  async updatePayReview(data: IReviewMessageDetails): Promise<IPayDocument> {
    const order: IPayDocument = (await PayModel.findOneAndUpdate(
      { payId: data.payId },
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
    ).exec()) as IPayDocument;

    this.notificationService.sendNotification(
      order,
      data.type === 'buyer-review' ? order.sellerUsername : order.buyerUsername,
      `left you a ${data.rating} star review`
    );
    return order;
  }
}

export default PayService;
