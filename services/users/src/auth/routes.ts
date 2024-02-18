import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import AuthController from '@users/auth/routes/authController';  // Adjust the import path based on your project structure
import ItemController from '@users/auth/routes/itemController';  // Adjust the import path based on your project structure
import { verifyGatewayRequest } from './middleware/gatewaymdl';

const router: Router = express.Router();

const BASE_PATH = '/api/v1/auth';

export function initRoutes(app: Application) {
  const authController = new AuthController();
  const itemController = new ItemController();

  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('auth service is healthy and OK.');
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


  router.get('/currentuser', async (req: Request, res: Response) => {
    await authController.currentUser(req, res);
  });

  router.post('/signup', async (req: Request, res: Response) => {
    await authController.createUser(req, res);
  });

  router.post('/signin', async (req: Request, res: Response) => {
    await authController.loginUser(req, res);
  });

  router.get('/search/item/:from/:size/:type', async (req: Request, res: Response) => {
    await itemController.items(req, res);
  });

  router.get('/search/item/:itemId', async (req: Request, res: Response) => {
    await itemController.singleItemById(req, res);
  });

  //gatewaymdl
  // router.post('/signup', verifyGatewayRequest, async (req: Request, res: Response) => {
  //   await authController.createUser(req, res);
  // });
  //
  // router.post('/signin', verifyGatewayRequest, async (req: Request, res: Response) => {
  //   await authController.loginUser(req, res);
  // });
  app.use(BASE_PATH, router);
}
