

import { authClient } from '@gateway/utils/authClientFetch';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class AuthController {

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      console.log("create in AuthController.ts");
      // const response: AxiosResponse = await authClient.signUp(req.body);
      const response = await authClient.signUp(req.body);
      console.log("create in AuthController.ts", response);
      // console.log("response ", response.token);
      req.session = { jwt: response.token };
      // res.status(StatusCodes.CREATED).json({ message: response.data.message, user: response.data.user });
      res.status(StatusCodes.CREATED).json({
        message: response.message,
        user: response.user,
        token: response.token
      });
    }
    catch (error) {
      // Handle any errors that might occur during signup
      console.error("Error during signup:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  public async loginUser(req: Request, res: Response): Promise<void> {
    try {
      console.log("loginUser in AuthController.ts");
      const response = await authClient.signIn(req.body);
      console.log("loginUser in AuthController.ts", response);
      req.session = { jwt: response.token };

      res.status(StatusCodes.OK).json({
        message: response.message,
        user: response.user,
        token: response.token
      });
    } catch (error) {
      // Handle any errors that might occur during login
      console.error("Error during login:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  public async currentUser(req: Request, res: Response, authorizationHeader?: string): Promise<void> {
    console.log("currentUser in AuthController.ts");
    const response = await authClient.getCurrentUser(authorizationHeader);
    res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
  }

  // public async test(req: Request, res: Response): Promise<void> {
  //   const response: AxiosResponse = await authClient.test(req.body);
  //   res.status(StatusCodes.OK).json({ message: response.data.message, user: response.data.user });
  // }

}
