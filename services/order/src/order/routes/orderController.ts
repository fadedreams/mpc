import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ElasticSearchService } from '@order/order/services/elasticSearchService';
import NotificationService from '@order/order/services/notificationService';
import OrderService from '@order/order/services/orderService';
import { IOrderNotification, IOrderDocument } from '@order/dto';
import { BadRequestError } from '@fadedreams7org1/mpclib';
import { orderSchema } from '@order/order/schemas/order';

class OrderController {
  private orderService: OrderService;
  private elasticSearchService: ElasticSearchService;

  constructor() {
    this.elasticSearchService = new ElasticSearchService();
    this.orderService = new OrderService();
  }

  public async notifications(req: Request, res: Response): Promise<void> {
    try {
      const notifications: IOrderNotification[] = await this.orderService.getNotificationsById(req.params.userTo);
      res.status(StatusCodes.OK).json({ message: 'Notifications', notifications });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }

  public async orderId(req: Request, res: Response): Promise<void> {
    //tested
    try {
      const order = await this.orderService.getOrderByOrderId(req.params.orderId);
      if (!order) {
        res.status(StatusCodes.NOT_FOUND).json({ error: `Order with orderId ${req.params.orderId} not found` });
        return;
      }
      res.status(StatusCodes.OK).json({ message: 'Order by order id', order });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }

  public async sellerOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders: IOrderDocument[] = await this.orderService.getOrdersBySellerId(req.params.sellerId);
      res.status(StatusCodes.OK).json({ message: 'Seller orders', orders });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }

  public async buyerOrders(req: Request, res: Response): Promise<void> {
    try {
      const orders: IOrderDocument[] = await this.orderService.getOrdersByBuyerId(req.params.buyerId);
      res.status(StatusCodes.OK).json({ message: 'Buyer orders', orders });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }

  public async order(req: Request, res: Response): Promise<void> {
    //rested
    try {
      const { error } = await Promise.resolve(orderSchema.validate(req.body));
      if (error?.details) {
        throw new BadRequestError(error.details[0].message, 'Create order() method');
      }

      // Assuming you have the order data in the request body
      const orderData: IOrderDocument = req.body;

      // Call the createOrder method from the OrderService
      const order = await this.orderService.order(req, res);

      res.status(StatusCodes.CREATED).json({ message: 'Order created successfully.', order });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }

  public async markNotificationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { notificationId } = req.params;

      // Call the markNotificationAsRead method from the OrderService
      const notification: IOrderNotification = await this.orderService.markNotificationAsRead(notificationId);
      res.status(StatusCodes.OK).json({ message: 'Notification marked as read successfully.', notification });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }
}

export default OrderController;
