
import { StatusCodes } from 'http-status-codes';
import { AuthController } from '@gateway/gateway/controllers/authController';
import { authMiddleware } from '@gateway/gateway/middleware/authmdl';
import express, { Router, Request, Response, Application } from 'express';
const router: Router = express.Router();
const authController = new AuthController();
import axios, { AxiosResponse } from 'axios';

router.get('/auth-health', (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).send('auth service is healthy and OK.');
});

router.post('/signup', async (req: Request, res: Response) => {
  console.log('signup in auth_routes.ts');
  try {
    await authController.createUser(req, res);
  } catch (error) {
    console.error('Error during signup router:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

router.post('/signin', async (req: Request, res: Response) => {
  console.log('signin in auth_routes.ts');
  try {
    await authController.loginUser(req, res);
  } catch (error) {
    console.error('Error during login router:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal Server Error' });
  }
});

router.get('/currentuser_token', async (req: Request, res: Response) => {
  const authorizationHeader = req.headers.authorization;
  await authController.currentUser(req, res, authorizationHeader);
});

router.get('/currentuser', authMiddleware.verifyUser, async (req: Request, res: Response) => {
  console.log('currentuserv in auth_routes.ts', req.currentUser);
  if (req.currentUser) {
    res.status(StatusCodes.OK).json({ message: 'user', user: req.currentUser });
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'unauthorized' });
  }
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

export default router;
// router.post('/test3', async (req: Request, res: Response) => {
//   console.log("signup in routes.ts");
//   await authController.test(req, res);
// });

// router.get('/currentusers', async (req: Request, res: Response) => {
//   // console.log("currentuser in routes.ts");
//   await authController.currentUserS(req, res);
// });
