import { IAuthPayload } from './auth.d';

import { Session } from 'express-session';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      currentUser;
    }
  }
}

interface CustomSession extends Session {
  jwt?: string;
  user?: any; // Replace 'any' with the actual type of user
  email?: any; // Replace 'any' with the actual type of user
}
