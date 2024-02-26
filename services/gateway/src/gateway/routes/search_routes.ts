

import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import { SearchController } from '@gateway/gateway/controllers/searchController';

const router: Router = express.Router();
const searchController = new SearchController();

router.get('/auth/search/item/:from/:size/:type', async (req: Request, res: Response) => {
  await searchController.items(req, res);
});

router.get('/auth/search/item/:itemId', async (req: Request, res: Response) => {
  await searchController.itemById(req, res);
});

export default router;
// router.get('/search', async (req: Request, res: Response) => {
//   console.log('route.ts /search');
//   await searchController.itemById(req, res);
// });
