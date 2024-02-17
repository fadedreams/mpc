
import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthController } from './authController';
import { SearchController } from './searchController';

const router: Router = express.Router();
const BASE_PATH = '/api/v1/gateway';
import axios, { AxiosResponse } from 'axios';

export function initRoutes(app: Application) {
  const authController = new AuthController();
  const searchController = new SearchController();

  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('auth service is healthy and OK.');
  });

  router.get('/test', async (_req: Request, res: Response) => {
    try {
      const url = 'http://localhost:3002/api/v1/auth/test';
      const response: AxiosResponse = await axios.get(url);

      console.log('Response:', response.data);
      console.log('Response:', response);
      console.log('test');

      res.status(StatusCodes.OK).json(response.data);
    } catch (error) {
      console.error('Error in /test2 route:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    }
  });

  router.get('/test2', async (_req: Request, res: Response) => {
    try {
      const url = 'http://localhost:3002/api/v1/auth/test';
      const response = await fetch(url);

      if (response.ok) {
        const responseData = await response.json();
        console.log('Response:', responseData);
        console.log('Response:', response);
        console.log("test");

        // res.status(StatusCodes.OK).json(responseData);
        res.status(StatusCodes.OK).json(responseData);
      } else {
        console.error('Error in /test route:', response.statusText);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
      }
    } catch (error) {
      console.error('Error in /test route:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Internal Server Error');
    }
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

  // router.get('/auth/search/item/:itemId', async (req: Request, res: Response) => {
  //   await searchController.itemById(req, res);
  // });

  router.get('/search', async (req: Request, res: Response) => {
    console.log('route.ts /search');
    await searchController.itemById(req, res);
  });

  app.use(BASE_PATH, router);
}
