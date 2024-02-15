
import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthController } from './authController';

const router: Router = express.Router();
const BASE_PATH = '/api/gateway/v1';

export function initRoutes(app: Application) {
  const authController = new AuthController();

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
    console.log("signup in routes.ts");
    await authController.create(req, res);  // Call the create method
  });

  app.use(BASE_PATH, router);
}
