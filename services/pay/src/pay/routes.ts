import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import ItemController from '@pay/pay/routes/itemController';  // Adjust the import path based on your project structure
import { verifyGatewayRequest } from './middleware/gatewaymdl';

const router: Router = express.Router();

const BASE_PATH = '/api/v1/item';

export function initRoutes(app: Application) {
  const itemController = new ItemController();

  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('user service is healthy and OK.');
  });
  router.get('/test', (_req: Request, res: Response) => {
    const responseData = {
      message: 'test',
    };
    res.status(StatusCodes.OK).json(responseData);
  });

  router.get('/test2', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('test');
  });

  router.post('/create', async (req: Request, res: Response) => {
    await itemController.itemCreate(req, res);
  });

  router.put('/:itemId', async (req: Request, res: Response) => {
    await itemController.itemUpdate(req, res);
  });

  router.put('/active/:itemId', async (req: Request, res: Response) => {
    await itemController.itemUpdateActive(req, res);
  });

  router.delete('/:itemId/:sellerId', async (req: Request, res: Response) => {
    await itemController.itemDelete(req, res);
  });

  router.get('/seller/:sellerId', async (req: Request, res: Response) => {
    await itemController.sellerItems(req, res);
  });

  router.get('/seller/pause/:sellerId', async (req: Request, res: Response) => {
    await itemController.sellerInactiveItems(req, res);
  });

  router.get('/search/:from/:size/:type', async (req: Request, res: Response) => {
    await itemController.items(req, res);
  });

  router.get('/category/:username', async (req: Request, res: Response) => {
    // console.log("haya");
    await itemController.itemsByCategory(req, res);
  });

  router.get('/category/:username', async (req: Request, res: Response) => {
    await itemController.topRatedItemsByCategory(req, res);
  });

  // router.get('/notification/:userTo', notifications);
  // router.get('/:orderId', orderId);
  // router.get('/seller/:sellerId', sellerOrders);
  // router.get('/buyer/:buyerId', buyerOrders);
  // router.post('/', order);
  // router.post('/create-payment-intent', intent);
  // router.put('/cancel/:orderId', cancel);
  // router.put('/extension/:orderId', requestExtension);
  // router.put('/deliver-order/:orderId', deliverOrder);
  // router.put('/approve-order/:orderId', buyerApproveOrder);
  // router.put('/gig/:type/:orderId', deliveryDate);
  // router.put('/notification/mark-as-read', markNotificationAsRead);

  app.use(BASE_PATH, router);
}
