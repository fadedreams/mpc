import { configInstance as config } from '@gateway/config';
import { IAuth } from '@gateway/dto';
import { IAuthPayload, CustomSession } from '@gateway/dto';
import { BadRequestError, NotAuthorizedError } from '@fadedreams7org1/mpclib';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

export class AuthClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.AUTH_BASE_URL}/api/v1/auth`;
  }

  async getCurrentUser(authorizationHeader?: string) {
    if (!authorizationHeader) {
      throw new Error('No authorization header provided');
    }
    const [bearer, token] = authorizationHeader.split(' ');
    // console.log('token in getCurrentUser', token);
    const response = await fetch(`${this.baseUrl}/currentuser`, {
      headers: {
        'Authorization': `Bearer ${token}`
        // 'Authorization': `${token}`
      }
    });
    return response.json();
  }

  async getCurrentUserS(req: Request, res: Response) {
    const customSession = req.session as CustomSession;
    if (!customSession?.jwt) {
      throw new NotAuthorizedError('Token is not available. Please login again.', 'GatewayService verifyUser() method error');
    }
    try {
      const payload: IAuthPayload = verify(customSession.jwt, `${config.JWT_TOKEN}`) as IAuthPayload;
      console.log('payload', payload);
      req.currentUser = payload;
    } catch (error) {
      throw new NotAuthorizedError('Token is not available. Please login again.', 'GatewayService verifyUser() method invalid session error');
    }

    console.log('currentUser in getCurrentUserS', req.currentUser);
    // const response = await fetch(`${this.baseUrl}/currentuser`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`
    //     // 'Authorization': `${token}`
    //   }
    // });
    return res.json();
  }

  async signUp(body: IAuth) {
    const response = await fetch(`${this.baseUrl}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    return response.json();
  }

  async signIn(body: IAuth) {
    const response = await fetch(`${this.baseUrl}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    return response.json();
  }

  async getItem(itemId: string) {
    const response = await fetch(`${this.baseUrl}/search/item/${itemId}`);
    // const response = await fetch(`http://localhost:3002/api/v1/auth/search/item/1`);
    return response.json();
  }

  async getItems(query: string, from: string, size: string, type: string) {
    // const response = await fetch(`${this.baseUrl}/auth/search/item/items?${query}&from=${from}&size=${size}&type=${type}`);
    console.log(`${this.baseUrl}/search/item/${from}/${size}/${type}?${query}`);
    const response = await fetch(`${this.baseUrl}/search/item/${from}/${size}/${type}?${query}`);
    return response.json();
  }

}

const authClient = new AuthClient();
export { authClient };
