
import express, { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError } from '@fadedreams7org1/mpclib';
import { OrderController } from '@gateway/gateway/controllers/orderController'; // Adjust the import statement

const router: Router = express.Router();
const orderController = new OrderController(); // Adjust the instance creation

router.post('/create', async (req: Request, res: Response) => {
  await orderController.createOrder(req, res);
});

router.get('/:iod', async (req: Request, res: Response) => {
  await orderController.getOrder(req, res);
});

router.get('/seller/:iod', async (req: Request, res: Response) => {
  await orderController.getSeller(req, res);
});

router.get('/buyer/:iod', async (req: Request, res: Response) => {
  await orderController.getBuyer(req, res);
});

router.post('/create', async (req: Request, res: Response) => {
  await orderController.createOrder(req, res);
});
export default router;
