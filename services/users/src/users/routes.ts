import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import UsersController from '@users/users/routes/userController';  // Adjust the import path based on your project structure
import { verifyGatewayRequest } from './middleware/gatewaymdl';

const router: Router = express.Router();

const BASE_PATH = '/api/v1/users';

export function initRoutes(app: Application) {
  const usersController = new UsersController();

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

  router.get('/email', async (req: Request, res: Response) => {
    await usersController.getBuyerEmail(req, res);
  });

  router.get('/username', async (req: Request, res: Response) => {
    await usersController.getBuyerCurrentUsername(req, res);
  });

  router.post('/create', async (req: Request, res: Response) => {
    await usersController.createSeller(req, res);
  });

  router.get('/:username', async (req: Request, res: Response) => {
    await usersController.getBuyerUsername(req, res);
  });


  router.put('/:sellerId', async (req: Request, res: Response) => {
    await usersController.updateSeller(req, res);
  });

  router.get('/id/:sellerId', async (req: Request, res: Response) => {
    await usersController.getSellerId(req, res);
  });

  router.get('/username/:username', async (req: Request, res: Response) => {
    await usersController.getSellerUsername(req, res);
  });

  // router.post('/signin', verifyGatewayRequest, async (req: Request, res: Response) => {
  //   await authController.loginUser(req, res);
  // });
  app.use(BASE_PATH, router);
}
