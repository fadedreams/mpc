import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import OrderController from '@order/order/routes/orderController';  // Adjust the import path based on your project structure
import { verifyGatewayRequest } from './middleware/gatewaymdl';

const router: Router = express.Router();
const BASE_PATH = '/api/v1/order';

export function initRoutes(app: Application) {
  const orderController = new OrderController();

  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('user service is healthy and OK.');
  });
  router.get('/test', (_req: Request, res: Response) => {
    const responseData = {
      message: 'test',
    };
    res.status(StatusCodes.OK).json(responseData);
  });
  router.post('/', async (req: Request, res: Response) => {
    await orderController.order(req, res);
  });
  router.get('/notification/:userTo', async (req: Request, res: Response) => {
    await orderController.notifications(req, res);
  });
  router.get('/:orderId', async (req: Request, res: Response) => {
    await orderController.orderId(req, res);
  });
  router.get('/seller/:sellerId', async (req: Request, res: Response) => {
    await orderController.sellerOrders(req, res);
  });
  router.get('/buyer/:buyerId', async (req: Request, res: Response) => {
    await orderController.buyerOrders(req, res);
  });
  router.post('/notification/mark-as-read/:notificationId', async (req: Request, res: Response) => {
    await orderController.markNotificationAsRead(req, res);
  });

  app.use(BASE_PATH, router);
}
