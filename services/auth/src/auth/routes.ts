import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import AuthController from '@auth/auth/routes/authController';  // Adjust the import path based on your project structure
import { verifyGatewayRequest } from './middleware/gatewaymdl';

const router: Router = express.Router();

const BASE_PATH = '/api/v1/auth';

export function initRoutes(app: Application) {
  const authController = new AuthController();  // Create an instance of AuthController

  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('auth service is healthy and OK.');
  });
  router.get('/test', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('test');
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
