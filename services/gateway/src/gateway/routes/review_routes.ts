import express, { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '@fadedreams7org1/mpclib';
import { ReviewController } from '@gateway/gateway/controllers/reviewController';

const router: Router = express.Router();
const reviewController = new ReviewController();

router.post('/addReview', async (req: Request, res: Response) => {
  await reviewController.addReview(req, res);
});

router.get('/getReviewByItemId/:reviewId', async (req: Request, res: Response) => {
  await reviewController.getReviewByItemId(req, res);
});

router.get('/getReviewBySellerId/:sellerId', async (req: Request, res: Response) => {
  await reviewController.getReviewBySellerId(req, res);
});

export default router;
