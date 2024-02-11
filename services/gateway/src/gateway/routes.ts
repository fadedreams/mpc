
import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';

const router: Router = express.Router();

export function initializeGatewayRoutes(app: Application): Router {
  router.get('/gateway-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('gateway service is healthy and OK.');
  });
  return router;
}
