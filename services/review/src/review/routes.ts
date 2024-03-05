import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import ReviewController from '@review/review/routes/reviewController';  // Adjust the import path based on your project structure
import { verifyGatewayRequest } from './middleware/gatewaymdl';

const router: Router = express.Router();

const BASE_PATH = '/api/v1/review';

export function initRoutes(app: Application) {
  const reviewController = new ReviewController();

  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('user service is healthy and OK.');
  });
  router.get('/test', (_req: Request, res: Response) => {
    const responseData = {
      message: 'test',
    };
    res.status(StatusCodes.OK).json(responseData);
  });

  router.post('/', async (req: Request, res: Response) => {
    await reviewController.addReview(req, res);
  });

  router.get('/item/:itemId', async (req: Request, res: Response) => {
    await reviewController.getReviewByItemId(req, res);
  });

  router.get('/seller/:sellerId', async (req: Request, res: Response) => {
    await reviewController.getReviewBySellerId(req, res);
  });


  app.use(BASE_PATH, router);
}
