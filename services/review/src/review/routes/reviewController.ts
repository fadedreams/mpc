import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ReviewService from '@review/review/services/reviewService'; // Import the ReviewService

class ReviewController {
  private reviewService: ReviewService;

  constructor() {
    this.reviewService = new ReviewService();
  }

  public async addReview(req: Request, res: Response): Promise<void> {
    try {
      const reviewData = req.body; // Make sure the request body contains the required review data
      const addedReview = await this.reviewService.addReview(reviewData);
      res.status(StatusCodes.CREATED).json({ message: 'Review added successfully.', review: addedReview });
    } catch (error) {
      // Handle errors appropriately
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to add review.', error });
    }
  }

  public async getReviewByItemId(req: Request, res: Response): Promise<void> {
    try {
      const itemId = req.params.itemId; // Extract the item ID from the request parameters
      const reviews = await this.reviewService.getReviewsByItemId(itemId);
      res.status(StatusCodes.OK).json({ message: 'Reviews for item', reviews });
    } catch (error) {
      // Handle errors appropriately
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get reviews for item.', error });
    }
  }

  public async getReviewBySellerId(req: Request, res: Response): Promise<void> {
    try {
      const sellerId = req.params.sellerId; // Extract the seller ID from the request parameters
      const reviews = await this.reviewService.getReviewsBySellerId(sellerId);
      res.status(StatusCodes.OK).json({ message: 'Reviews for seller', reviews });
    } catch (error) {
      // Handle errors appropriately
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to get reviews for seller.', error });
    }
  }
}

export default ReviewController;
