import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { usersClient } from '@gateway/utils/usersClient';
import { IAuth, ISellerDocument } from '@gateway/dto';

export class UsersController {

  public async getUserByUsername(req: Request, res: Response): Promise<void> {
    const username = req.params.username;
    try {
      const response = await usersClient.getBuyerByUsername(username);
      res.status(StatusCodes.OK).json({ user: response });
    } catch (error) {
      console.error("Error getting user by username:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  public async getCurrentBuyerByUsername(req: Request, res: Response, authorizationHeader?: string): Promise<void> {
    try {
      const response = await usersClient.getCurrentBuyerByUsername();
      res.status(StatusCodes.OK).json({ user: response });
    } catch (error) {
      console.error("Error getting user by username:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  public async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const response = await usersClient.getBuyerByEmail();
      res.status(StatusCodes.OK).json({ user: response });
    } catch (error) {
      console.error("Error getting user by email:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  public async getSellerById(req: Request, res: Response): Promise<void> {
    const sellerId = req.params.sellerId;
    try {
      const response = await usersClient.getSellerById(sellerId);
      res.status(StatusCodes.OK).json({ seller: response });
    } catch (error) {
      console.error("Error getting seller by ID:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  public async getSellerByUsername(req: Request, res: Response): Promise<void> {
    const username = req.params.username;
    try {
      const response = await usersClient.getSellerByUsername(username);
      res.status(StatusCodes.OK).json({ seller: response });
    } catch (error) {
      console.error("Error getting seller by username:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  public async getRandomSellers(req: Request, res: Response): Promise<void> {
    const size = req.params.size;
    try {
      const response = await usersClient.getRandomSellers(size);
      res.status(StatusCodes.OK).json({ sellers: response });
    } catch (error) {
      console.error("Error getting random sellers:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  public async createSeller(req: Request, res: Response): Promise<void> {
    const sellerData: ISellerDocument = req.body;
    try {
      const response = await usersClient.createSeller(sellerData);
      res.status(StatusCodes.CREATED).json({ seller: response });
    } catch (error) {
      console.error("Error creating seller:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  public async updateSeller(req: Request, res: Response): Promise<void> {
    const sellerId = req.params.sellerId;
    const sellerData: ISellerDocument = req.body;
    try {
      const response = await usersClient.updateSeller(sellerId, sellerData);
      res.status(StatusCodes.OK).json({ seller: response });
    } catch (error) {
      console.error("Error updating seller:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

}
