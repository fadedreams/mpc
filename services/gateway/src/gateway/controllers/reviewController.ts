import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '@fadedreams7org1/mpclib';
import { reviewClient } from '@gateway/utils/reviewClient'; // Import the ReviewClient
import { ISellerItem, IPaginateProps, ISearchResult } from '@gateway/dto';
import { IAuthPayload, CustomSession } from '@gateway/dto';

export class ReviewController {

  private sendErrorResponse(res: Response, error: any): void {
    console.error("Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }

  public async addReview(req: Request, res: Response): Promise<void> {
    try {
      const response = await reviewClient.addReview(req.body);
      res.status(StatusCodes.CREATED).json({
        message: response.message,
        item: response.item
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async getReviewByItemId(req: Request, res: Response): Promise<void> {
    try {
      const response = await reviewClient.getReviewByItemId(req.params.reviewId);
      res.status(StatusCodes.OK).json({
        message: 'Review by Item Id',
        reviews: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async getReviewBySellerId(req: Request, res: Response): Promise<void> {
    try {
      const response = await reviewClient.getReviewBySellerId(req.params.sellerId);
      res.status(StatusCodes.OK).json({
        message: 'Review by Seller Id',
        reviews: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }


}
