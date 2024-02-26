
import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import authRoutes from './auth_routes';
import bsRoutes from './buyer_seller_routes';
import searchRoutes from './search_routes';

const router: Router = express.Router();
const BASE_PATH = '/api/v1/gateway';

export function initRoutes(app: Application) {

  router.use('', authRoutes);
  router.use('', searchRoutes);
  router.use('', bsRoutes);


  app.use(BASE_PATH, router);
}
