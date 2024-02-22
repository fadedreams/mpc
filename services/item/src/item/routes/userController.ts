import { Request, Response } from 'express';
import BuyerService from '@item/item/services/buyerService';
import SellerService from '@item/item/services/sellerService';
import { IAuthDocument, IEmailMessageDetails } from '@item/dto/auth.d';
import { BadRequestError, firstLetterUppercase, lowerCase, isEmail } from '@fadedreams7org1/mpclib';
import { configInstance as config } from '@item/config';
import { sign } from 'jsonwebtoken';
import crypto from 'crypto';
import { signupSchema } from '@item/item/schemas/signup';
import { loginSchema } from '@item/item/schemas/signin';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';
import { IBuyerDocument, ISellerDocument } from '@item/dto/';

class ItemController {
  private buyerService: BuyerService;
  private sellerService: SellerService;

  constructor() {
    this.buyerService = new BuyerService();
    this.sellerService = new SellerService(this.buyerService);
  }

  public async getBuyerEmail(req: Request, res: Response): Promise<void> {
    const buyer: IBuyerDocument | null = await this.buyerService.getBuyerByEmail(req.currentUser!.email);
    res.status(StatusCodes.OK).json({ message: 'Buyer profile', buyer });
  };

  public async getBuyerCurrentUsername(req: Request, res: Response): Promise<void> {
    const buyer: IBuyerDocument | null = await this.buyerService.getBuyerByUsername(req.currentUser!.username);
    res.status(StatusCodes.OK).json({ message: 'Buyer profile', buyer });
  };

  public async getBuyerUsername(req: Request, res: Response): Promise<void> {
    const buyer: IBuyerDocument | null = await this.buyerService.getBuyerByUsername(req.params.username);
    res.status(StatusCodes.OK).json({ message: 'Buyer profile', buyer });
  };

  public async getSellerId(req: Request, res: Response): Promise<void> {
    const seller: ISellerDocument | null = await this.sellerService.getSellerById(req.params.sellerId);
    res.status(StatusCodes.OK).json({ message: 'Seller profile', seller });
  };

  public async getSellerUsername(req: Request, res: Response): Promise<void> {
    const seller: ISellerDocument | null = await this.sellerService.getSellerByUsername(req.params.username);
    res.status(StatusCodes.OK).json({ message: 'Seller profile', seller });
  };

  public async getSellerRandom(req: Request, res: Response): Promise<void> {
    const sellers: ISellerDocument[] = await this.sellerService.getRandomSellers(parseInt(req.params.size, 10));
    res.status(StatusCodes.OK).json({ message: 'Random sellers profile', sellers });
  };

  public async createSeller(req: Request, res: Response): Promise<void> {
    const { email, fullName, description, profilePublicId, oneliner, responseTime } = req.body;
    // let username = req.currentUser!.username;
    let username = "atest";
    // Create an object with the gathered properties
    const sellerData = {
      email,
      fullName,
      username,
      description,
      profilePublicId,
      oneliner,
      responseTime
    };
    const seller = await this.sellerService.createSeller(sellerData);

    res.status(StatusCodes.OK).json({ message: 'Random sellers profile', seller });
  }

  public async updateSeller(req: Request, res: Response): Promise<void> {
    const seller: ISellerDocument = {
      profilePublicId: req.body.profilePublicId,
      fullName: req.body.fullName,
      description: req.body.description,
      oneliner: req.body.oneliner,
      responseTime: req.body.responseTime,
    };
    const updatedSeller: ISellerDocument = await this.sellerService.updateSeller(req.params.sellerId, seller);
    res.status(StatusCodes.OK).json({ message: 'Seller created successfully.', seller: updatedSeller });
  };



}

export default ItemController;
