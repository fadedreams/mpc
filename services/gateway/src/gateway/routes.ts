
import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthController } from './authController';
import { SearchController } from './searchController';
import { UsersController } from './usersController';
import { authMiddleware } from './middleware/authmdl';

const router: Router = express.Router();
const BASE_PATH = '/api/v1/gateway';
import axios, { AxiosResponse } from 'axios';

export function initRoutes(app: Application) {
  const authController = new AuthController();
  const searchController = new SearchController();
  const usersController = new UsersController();

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

  // router.post('/test3', async (req: Request, res: Response) => {
  //   console.log("signup in routes.ts");
  //   await authController.test(req, res);
  // });

  router.post('/signup', async (req: Request, res: Response) => {
    console.log("signup in routes.ts");
    try {
      await authController.createUser(req, res);
    } catch (error) {
      console.error("Error during signup router:", error);
      // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  });

  router.post('/signin', async (req: Request, res: Response) => {
    console.log("signin in routes.ts");
    try {
      await authController.loginUser(req, res);
      // Set the status code in the route handler
    } catch (error) {
      // Handle any errors that might occur during login
      console.error("Error during login router:", error);
      // res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  });

  router.get('/currentuser_token', async (req: Request, res: Response) => {
    // console.log("currentuser in routes.ts");
    const authorizationHeader = req.headers.authorization;
    await authController.currentUser(req, res, authorizationHeader);
  });

  // router.get('/currentusers', async (req: Request, res: Response) => {
  //   // console.log("currentuser in routes.ts");
  //   await authController.currentUserS(req, res);
  // });

  router.get('/currentuser', authMiddleware.verifyUser, async (req: Request, res: Response) => {
    console.log("currentuserv in routes.ts", req.currentUser);
    if (req.currentUser) {
      res.status(StatusCodes.OK).json({ message: "user", user: req.currentUser });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "unauthorized" });
    }
  });

  router.get('/auth/search/item/:from/:size/:type', async (req: Request, res: Response) => {
    await searchController.items(req, res);
  });

  router.get('/auth/search/item/:itemId', async (req: Request, res: Response) => {
    await searchController.itemById(req, res);
  });

  //buyer routes
  router.get('/buyer/email', async (req: Request, res: Response) => {
    await usersController.getUserByEmail(req, res);
  });

  router.get('/buyer/username', async (req: Request, res: Response) => {
    const authorizationHeader = req.headers.authorization;
    await usersController.getCurrentBuyerByUsername(req, res, authorizationHeader);
  });

  router.get('/buyer/:username', async (req: Request, res: Response) => {
    await usersController.getUserByUsername(req, res);
  });

  router.get('/seller/id/:sellerId', async (req: Request, res: Response) => {
    await usersController.getSellerById(req, res);
  });
  router.get('/seller/username/:username', async (req: Request, res: Response) => {
    await usersController.getSellerByUsername(req, res);
  });
  router.get('/seller/random/:size', async (req: Request, res: Response) => {
    await usersController.getSellerByUsername(req, res);
  });
  router.post('/seller/create', authMiddleware.verifyUser, async (req: Request, res: Response) => {
    console.log('/seller/create');
    await usersController.createSeller(req, res);
  });
  router.put('/seller/:sellerId', async (req: Request, res: Response) => {
    await usersController.updateSeller(req, res);
  });

  // router.get('/search', async (req: Request, res: Response) => {
  //   console.log('route.ts /search');
  //   await searchController.itemById(req, res);
  // });

  app.use(BASE_PATH, router);
}
