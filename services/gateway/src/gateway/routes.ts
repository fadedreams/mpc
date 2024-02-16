
import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthController } from './authController';
import { SearchController } from './searchController';

const router: Router = express.Router();
const BASE_PATH = '/api/gateway/v1';

export function initRoutes(app: Application) {
  const authController = new AuthController();
  const searchController = new SearchController();

  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('auth service is healthy and OK.');
  });
  router.get('/test', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('test');
  });

  router.post('/signup', async (req: Request, res: Response) => {
    console.log("signup in routes.ts");
    await authController.createUser(req, res);
  });

  router.post('/signin', async (req: Request, res: Response) => {
    console.log("signin in routes.ts");
    await authController.loginUser(req, res);
  });

  router.get('/currentuser', async (req: Request, res: Response) => {
    console.log("currentuser in routes.ts");
    const authorizationHeader = req.headers.authorization;
    await authController.currentUser(req, res, authorizationHeader);
  });

  router.get('/auth/search/item/:from/:size/:type', async (req: Request, res: Response) => {
    await searchController.items(req, res);
  });

  router.get('/auth/search/item/:itemId', async (req: Request, res: Response) => {
    await searchController.itemById(req, res);
  });

  app.use(BASE_PATH, router);
}
