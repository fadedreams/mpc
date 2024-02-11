
import { Config } from '@gateway/config';
import { BadRequestError, NotAuthorizedError } from '@fadedreams7org1/mpclib';
import { IAuthPayload } from './express.d';

import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

class AuthMiddleware {

  private readonly _config: Config;
  constructor(config: Config) {
    this._config = config;
  }

  public verifyUser(req: Request, _res: Response, next: NextFunction): void {
    if (!req.session?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again.', 'GatewayService verifyUser() method error');
    }

    try {
      const payload: IAuthPayload = verify(req.session?.jwt, `${this._config.JWT_TOKEN}`) as IAuthPayload;
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Token is not available. Please login again.', 'GatewayService verifyUser() method invalid session error');
    }
    next();
  }

  public checkAuthentication(req: Request, _res: Response, next: NextFunction): void {
    if (!req.currentUser) {
      throw new BadRequestError('Authentication is required to access this route.', 'GatewayService checkAuthentication() method error');
    }
    next();
  }
}

// export const authMiddleware: AuthMiddleware = new AuthMiddleware();
