

import { authClient } from '@gateway/utils/authClientFetch';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class SearchController {

  public async itemById(req: Request, res: Response): Promise<void> {
    try {
      console.log('searchController.ts itemById');
      const response = await authClient.getItem(req.params.itemId);
      console.log('searchController.ts itemById', response);

      // Assuming response.data contains the expected properties
      res.status(StatusCodes.OK).json({ message: response.message, item: response.item });
    } catch (error) {
      // Handle any errors that might occur during the item retrieval
      console.error("Error during item retrieval:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  public async items(req: Request, res: Response): Promise<void> {
    const { from, size, type } = req.params;
    let query = '';
    const objList = Object.entries(req.query);
    const lastItemIndex = objList.length - 1;
    objList.forEach(([key, value], index) => {
      query += `${key}=${value}${index !== lastItemIndex ? '&' : ''}`;
    });
    const response = await authClient.getItems(`${query}`, from, size, type);
    res.status(StatusCodes.OK).json({ message: response.message, total: response.total, items: response.items });
  }

}
