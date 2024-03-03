import { Request, Response, NextFunction } from 'express';

export interface IAuthPayload {
  id: number;
  username: string;
  email: string;
  iat?: number;
}


declare global {
  namespace Express {
    interface Request {
      currentUser;
    }
  }
}

export interface IAuth {
  username?: string;
  password?: string;
  email?: string;
}

export interface IAuthDocument {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  emailVerified?: number;
  emailVerificationToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword?(password: string): Promise<boolean>;
  hashPassword?(password: string): Promise<string>;
}

export interface IAuthBuyerMessageDetails {
  username?: string;
  email?: string;
  createdAt?: Date;
  type?: string;
}

export interface IEmailMessageDetails {
  receiverEmail?: string;
  template?: string;
  verifyLink?: string;
  resetLink?: string;
  username?: string;
}

export interface ISignUporderload {
  [key: string]: string;
  username: string;
  password: string;
  email: string;
}

export interface ISignInorderload {
  [key: string]: string;
  username: string;
  password: string;
}

export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  [key: string]: string;
  password: string;
  confirmPassword: string;
}

