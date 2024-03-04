import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import ItemController from '@review/review/routes/itemController';  // Adjust the import path based on your project structure
import { verifyGatewayRequest } from './middleware/gatewaymdl';

const router: Router = express.Router();

const BASE_PATH = '/api/v1/review';

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


  app.use(BASE_PATH, router);
}
