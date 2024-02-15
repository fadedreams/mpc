
import { authClient } from '@gateway/utils/authClient';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class AuthController {
  public async create(req: Request, res: Response): Promise<void> {
    console.log("create in AuthController.ts");
    const response: AxiosResponse = await authClient.signUp(req.body);
    req.session = { jwt: response.data.token };
    res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
  }
}
