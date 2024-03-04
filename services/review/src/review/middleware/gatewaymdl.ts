
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '@fadedreams7org1/mpclib';
import JWT from 'jsonwebtoken';
// const tokens: string[] = ['auth', 'seller', 'item', 'search', 'buyer', 'message', 'order', 'review'];
export function verifyGatewayRequest(req: Request, _res: Response, next: NextFunction): void {
  console.log('verifyGatewayRequest');
  if (!req.headers?.gatewaytoken) {
    throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request not coming from api gateway');
  }
  const token: string = req.headers?.gatewaytoken as string;
  if (!token) {
    throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request not coming from api gateway');
  }
  console.log(token);

  // try {
  //   const payload: { id: string; iat: number } = JWT.verify(token, 'secret') as { id: string; iat: number };
  //   if (!tokens.includes(payload.id)) {
  //     throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request payload is invalid');
  //   }
  // } catch (error) {
  //   throw new NotAuthorizedError('Invalid request', 'verifyGatewayRequest() method: Request not coming from api gateway');
  // }
  next();
}
