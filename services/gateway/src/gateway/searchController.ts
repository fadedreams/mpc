

import { authClient } from '@gateway/utils/authClient';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class SearchController {

  public async createUser(req: Request, res: Response): Promise<void> {
    console.log("create in searchController.ts");
    const response: AxiosResponse = await authClient.signUp(req.body);
    req.session = { jwt: response.data.token };
    res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
  }

  public async itemById(req: Request, res: Response): Promise<void> {
    console.log('searchController.ts itemById');
    const response: AxiosResponse = await authClient.getItem(req.params.itemId);
    res.status(StatusCodes.OK).json({ message: response.data.message, item: response.data.item });
  }

  public async items(req: Request, res: Response): Promise<void> {
    const { from, size, type } = req.params;
    let query = '';
    const objList = Object.entries(req.query);
    const lastItemIndex = objList.length - 1;
    objList.forEach(([key, value], index) => {
      query += `${key}=${value}${index !== lastItemIndex ? '&' : ''}`;
    });
    const response: AxiosResponse = await authClient.getItems(`${query}`, from, size, type);
    res.status(StatusCodes.OK).json({ message: response.data.message, total: response.data.total, items: response.data.items });
  }

}
