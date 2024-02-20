
import { authClient } from '@gateway/utils/authClient';
import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class AuthController {

  public async createUser(req: Request, res: Response): Promise<void> {
    console.log("create in AuthController.ts");
    const response: AxiosResponse = await authClient.signUp(req.body);
    req.session = { jwt: response.data.token };
    res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    console.log("loginUser in AuthController.ts");
    const response = await authClient.signIn(req.body);
    console.log("loginUser in AuthController.ts", response);
    req.session = { jwt: response.data.token };

    // Send only the response data without setting the status code
    res.json({
      message: response.data.message,
      user: response.data.user,
      token: response.data.token
    });
  }

  public async currentUser(req: Request, res: Response, authorizationHeader?: string): Promise<void> {
    // console.log("currentUser in AuthController.ts");
    const response: AxiosResponse = await authClient.getCurrentUser(authorizationHeader);
    res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
  }

  // public async test(req: Request, res: Response): Promise<void> {
  //   const response: AxiosResponse = await authClient.test(req.body);
  //   res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
  // }

}
