
import express, { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthController } from '@gateway/gateway/controllers/authController';
import { authMiddleware } from '@gateway/gateway/middleware/authmdl';
import { UsersController } from '@gateway/gateway/controllers/usersController';

const router: Router = express.Router();
const usersController = new UsersController();

//buyer routes
router.get('/buyer/email', async (req: Request, res: Response) => {
  await usersController.getUserByEmail(req, res);
});

router.get('/buyer/username', async (req: Request, res: Response) => {
  const authorizationHeader = req.headers.authorization;
  await usersController.getCurrentBuyerByUsername(req, res, authorizationHeader);
});

router.get('/buyer/:username', async (req: Request, res: Response) => {
  await usersController.getUserByUsername(req, res);
});

router.get('/seller/id/:sellerId', async (req: Request, res: Response) => {
  await usersController.getSellerById(req, res);
});
router.get('/seller/username/:username', async (req: Request, res: Response) => {
  await usersController.getSellerByUsername(req, res);
});
router.get('/seller/random/:size', async (req: Request, res: Response) => {
  await usersController.getSellerByUsername(req, res);
});
router.post('/seller/create', authMiddleware.verifyUser, async (req: Request, res: Response) => {
  console.log('/seller/create');
  await usersController.createSeller(req, res);
});
router.put('/seller/:sellerId', async (req: Request, res: Response) => {
  await usersController.updateSeller(req, res);
});

export default router;
