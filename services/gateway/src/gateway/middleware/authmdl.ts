import { configInstance as config } from '@gateway/config';
import { BadRequestError, NotAuthorizedError } from '@fadedreams7org1/mpclib';
import { IAuthPayload‌, CustomSession } from '@gateway/dto';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';


class AuthMiddleware {
  // private readonly config;

  constructor() {
    // this.config = config;
  }

  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    const customSession = req.session as CustomSession;
    console.log('verifyUser customSession ', customSession.jwt);
    if (!customSession?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again.', 'GatewayService verifyUser() method error');
    }
    // console.log("JWT_TOKEN", config.JWT_TOKEN);
    try {
      const payload: IAuthPayload = verify(customSession.jwt, `secret`) as IAuthPayload;
      // console.log('verifyUser payload ', payload);
      // req.currentUser = payload.username;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Token is not available. Please login again.', 'GatewayService verifyUser() method invalid session error');
    }
    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    const customSession = req.session as CustomSession;
    if (!customSession?.user) {
      throw new BadRequestError('Authentication is required to access this route.', 'GatewayService checkAuthentication() method error');
    }
    // Set currentUser based on the 'user' property
    req.currentUser = customSession.user;
    next();
  }
}

export const authMiddleware: AuthMiddleware = new AuthMiddleware();
