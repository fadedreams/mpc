import { IAuthPayload } from './auth.d';

import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      currentUser;
    }
  }
}

