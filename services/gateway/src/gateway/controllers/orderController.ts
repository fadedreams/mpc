
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '@fadedreams7org1/mpclib';
import { orderClient } from '@gateway/utils/orderClient'; // Import the ItemClient
// import { IAuthPayload, CustomSession } from '@gateway/dto';

export class OrderController {

  private sendErrorResponse(res: Response, error: any): void {
    console.error("Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }

  public async createOrder(req: Request, res: Response): Promise<void> {
    try {
      // console.log("ctl createOrder: ", req.body);
      const response = await orderClient.createOrder(req.body);
      // console.log("ctl createOrder response: ", response);
      res.status(StatusCodes.CREATED).json({
        response: response,
      });
    } catch (error) {
      console.error("Error in createOrder:", error);
      this.sendErrorResponse(res, error);
    }
  }

  public async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const response = await orderClient.getOrder(req.params.iod);
      res.status(StatusCodes.OK).json({
        message: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async getSeller(req: Request, res: Response): Promise<void> {
    try {
      const response = await orderClient.getSeller(req.params.iod);
      res.status(StatusCodes.OK).json({
        message: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async getBuyer(req: Request, res: Response): Promise<void> {
    try {
      const response = await orderClient.getBuyer(req.params.iod);
      res.status(StatusCodes.OK).json({
        message: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      // console.log("ctl createOrder: ", req.body);
      const response = await orderClient.markAsRead(req.params.notificationId);
      // console.log("ctl createOrder response: ", response);
      res.status(StatusCodes.CREATED).json({
        response: response,
      });
    } catch (error) {
      console.error("Error in markAsRead:", error);
      this.sendErrorResponse(res, error);
    }
  }


}
