
import express, { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '@fadedreams7org1/mpclib';
import { ItemController } from '@gateway/gateway/controllers/itemController';

const router: Router = express.Router();
const itemController = new ItemController(); // Adjust the instance creation

router.post('/create', async (req: Request, res: Response) => {
  await itemController.createItem(req, res);
});

router.put('/:itemId', async (req: Request, res: Response) => {
  await itemController.updateItem(req, res);
});

router.put('/active/:itemId', async (req: Request, res: Response) => {
  await itemController.updateActiveItem(req, res);
});

router.delete('/:itemId/:sellerId', async (req: Request, res: Response) => {
  await itemController.deleteItem(req, res);
});

router.get('/seller/:sellerId', async (req: Request, res: Response) => {
  await itemController.getSellerItems(req, res);
});

router.get('/seller/pause/:sellerId', async (req: Request, res: Response) => {
  await itemController.getSellerInactiveItems(req, res);
});

router.get('/search/:from/:size/:type', async (req: Request, res: Response) => {
  await itemController.searchItems(req, res);
});

router.get('/category/:username', async (req: Request, res: Response) => {
  await itemController.itemsByCategory(req, res);
});

router.get('/top-rated/:username', async (req: Request, res: Response) => {
  await itemController.topRatedItemsByCategory(req, res);
});

router.get('/more-like-this/:itemId', async (req: Request, res: Response) => {
  await itemController.moreLikeThis(req, res);
});

export default router;
