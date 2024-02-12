
import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';

const router: Router = express.Router();

export function initializeauthRoutes(app: Application): Router {
  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('auth service is healthy and OK.');
  });
  return router;
}
