import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '@fadedreams7org1/mpclib';
import { itemClient } from '@gateway/utils/itemClient'; // Import the ItemClient
import { IAuthPayload, CustomSession } from '@gateway/dto';

export class ItemController {

  private sendErrorResponse(res: Response, error: any): void {
    console.error("Error:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }

  public async createItem(req: Request, res: Response): Promise<void> {
    try {
      const customSession = req.session as CustomSession;

      if (!customSession || !customSession.user || !customSession.user.username || !customSession.user.email) {
        throw new Error('User information not found in the session.');
      }

      const { username, email } = customSession.user;
      const requestBody = {
        ...req.body,
        username,
        email,
      };

      console.log("ctl createItem: ", req.body);
      console.log("User information from session: ", { username, email });
      console.log("Transformed request body: ", requestBody);

      const response = await itemClient.createItem(requestBody);
      console.log("ctl createItem response: ", response);

      res.status(StatusCodes.CREATED).json({
        response: response,
      });
    } catch (error) {
      console.error("Error in createItem:", error);
      this.sendErrorResponse(res, error);
    }
  }

  public async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const response = await itemClient.updateItem(req.params.itemId, req.body);
      res.status(StatusCodes.OK).json({
        message: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async updateActiveItem(req: Request, res: Response): Promise<void> {
    try {
      const response = await itemClient.updateActiveItem(req.params.itemId, req.body.active);
      res.status(StatusCodes.OK).json({
        message: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      await itemClient.deleteItem(req.params.itemId, req.params.sellerId);
      res.status(StatusCodes.OK).json({ message: 'Item deleted successfully.' });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async getSellerItems(req: Request, res: Response): Promise<void> {
    try {
      const response = await itemClient.getSellerItems(req.params.sellerId);
      res.status(StatusCodes.OK).json({
        message: 'Seller items',
        items: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async getSellerInactiveItems(req: Request, res: Response): Promise<void> {
    try {
      const response = await itemClient.getSellerInactiveItems(req.params.sellerId);
      res.status(StatusCodes.OK).json({
        message: 'Seller Items',
        Items: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async searchItems(req: Request, res: Response): Promise<void> {
    try {
      const response = await itemClient.searchItems(
        String(req.params.from),
        String(req.params.size),
        String(req.params.type),
        String(req.query.query),
        String(req.query.delivery_time),
        String(req.query.minprice),
        String(req.query.maxprice)
      );
      res.status(StatusCodes.OK).json({
        message: 'Search items results',
        response: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async itemsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const response = await itemClient.itemsByCategory(req.params.username);
      res.status(StatusCodes.OK).json({
        message: 'Search Items category results',
        response: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async topRatedItemsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const response = await itemClient.topRatedItemsByCategory(req.params.username);
      res.status(StatusCodes.OK).json({
        message: 'Search top Items results',
        response: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }

  public async moreLikeThis(req: Request, res: Response): Promise<void> {
    try {
      const response = await itemClient.moreLikeThis(req.params.itemId);
      res.status(StatusCodes.OK).json({
        message: 'More items like this result',
        response: response
      });
    } catch (error) {
      this.sendErrorResponse(res, error);
    }
  }
}
