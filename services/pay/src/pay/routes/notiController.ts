import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ElasticSearchService } from '@pay/pay/services/elasticSearchService';
import NotificationService from '@pay/pay/services/notificationService';
import { IOrderNotification } from 'path-to-your-order-notification-interface'; // Update the path

class NotificationController {
  private notificationService: NotificationService;
  private elasticSearchService: ElasticSearchService;

  constructor() {
    this.notificationService = new NotificationService();
    this.elasticSearchService = new ElasticSearchService();
  }

  public async notifications(req: Request, res: Response): Promise<void> {
    try {
      const notifications: IOrderNotification[] = await this.notificationService.getNotificationsById(req.params.userTo);
      res.status(StatusCodes.OK).json({ message: 'Notifications', notifications });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }
}

export default NotificationController;
