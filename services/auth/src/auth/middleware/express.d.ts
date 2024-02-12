declare global {
  namespace Express {
    interface Request {
      currentUser?: IAuthPayload;
    }
  }
}

export interface IAuthPayload {
  id: number;
  username: string;
  email: string;
  iat?: number;
}

export interface IAuth {
  username?: string;
  password?: string;
  email?: string;
  country?: string;
  profilePicture?: string;
}

export interface IAuthDocument {
  id?: number;
  profilePublicId?: string;
  username?: string;
  email?: string;
  password?: string;
  country?: string;
  profilePicture?: string;
  emailVerified?: number;
  emailVerificationToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword(password: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export interface IAuthBuyerMessageDetails {
  username?: string;
  profilePicture?: string;
  email?: string;
  country?: string;
  createdAt?: Date;
  type?: string;
}
