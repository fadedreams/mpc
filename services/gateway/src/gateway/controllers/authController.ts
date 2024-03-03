import { authClient } from '@gateway/utils/authClient';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IAuthPayload, CustomSession } from '@gateway/dto';
// Define a custom interface that extends express.Session

export class AuthController {
  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      // console.log("create in AuthController.ts");
      const response = await authClient.signUp(req.body);
      console.log("create in AuthController.ts", response);

      // Cast req.session to CustomSession type
      const customSession = req.session as CustomSession;

      // Set properties on the session
      customSession.jwt = response.token;
      customSession.user = response.user;

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

      // Cast req.session to CustomSession type
      const customSession = req.session as CustomSession;

      // Set properties on the session
      customSession.jwt = response.token;
      customSession.user = response.user;
      customSession.email = response.email;

      // Can still set on the current request
      req.currentUser = response.user;

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
    console.log("currentUser in AuthController.ts", authorizationHeader);
    const response = await authClient.getCurrentUser(authorizationHeader);
    console.log("currentUser res in AuthController.ts", response);
    res.status(StatusCodes.OK).json({ message: response.message, user: response.user });
  }


  public async currentUserS(req: Request, res: Response): Promise<void> {
    const response = await authClient.getCurrentUserS(req, res);
    console.log("currentUser res in AuthController.ts", response);
    res.status(StatusCodes.OK);
    // res.status(StatusCodes.OK).json({ message: response.message, user: response.user });
  }
}
