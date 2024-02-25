import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import ItemController from '@item/item/routes/userController';  // Adjust the import path based on your project structure
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

  router.get('/create', async (req: Request, res: Response) => {
    await itemController.itemCreate(req, res);
  });

  router.get('/:itemId', async (req: Request, res: Response) => {
    await itemController.itemUpdate(req, res);
  });
  // router.get('/email', async (req: Request, res: Response) => {
  // });
  //
  // router.get('/username', async (req: Request, res: Response) => {
  //   await itemController.getBuyerCurrentUsername(req, res);
  // });
  //
  // router.post('/create', async (req: Request, res: Response) => {
  //   await itemController.createSeller(req, res);
  // });
  //
  // router.get('/:username', async (req: Request, res: Response) => {
  //   await itemController.getBuyerUsername(req, res);
  // });
  //
  //
  // router.put('/:sellerId', async (req: Request, res: Response) => {
  //   await itemController.updateSeller(req, res);
  // });
  //
  // router.get('/id/:sellerId', async (req: Request, res: Response) => {
  //   await itemController.getSellerId(req, res);
  // });
  //
  // router.get('/username/:username', async (req: Request, res: Response) => {
  //   await itemController.getSellerUsername(req, res);
  // });

  // router.post('/signin', verifyGatewayRequest, async (req: Request, res: Response) => {
  //   await authController.loginUser(req, res);
  // });
  app.use(BASE_PATH, router);
}
