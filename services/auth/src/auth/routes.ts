import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import AuthController from '@auth/auth/routes/authController';  // Adjust the import path based on your project structure

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

  router.post('/signup', async (req: Request, res: Response) => {
    await authController.create(req, res);  // Call the create method
  });

  app.use(BASE_PATH, router);
}
