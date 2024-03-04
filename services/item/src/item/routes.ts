import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import ItemController from '@item/item/routes/itemController';  // Adjust the import path based on your project structure
import { verifyGatewayRequest } from './middleware/gatewaymdl';

const router: Router = express.Router();

const BASE_PATH = '/api/v1/item';

export function initRoutes(app: Application) {
  const itemController = new ItemController();

  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('item service is healthy and OK.');
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

  app.use(BASE_PATH, router);
}
