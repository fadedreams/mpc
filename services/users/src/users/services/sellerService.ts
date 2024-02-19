
import { StatusCodes } from 'http-status-codes';
import { SellerModel } from '@users/users/models/seller.schema';
import { IOrderMessage, IRatingTypes, IReviewMessageDetails, ISellerDocument } from '@users/dto/';

import { BadRequestError } from '@fadedreams7org1/mpclib';

import mongoose from 'mongoose';
import BuyerService from '@users/users/services/buyerService';
import { sellerSchema } from '@users/users/schemas/seller';

class SellerService {
  private buyerService: BuyerService;

  constructor(buyerService: BuyerService) {
    this.buyerService = buyerService;
  }

  async getSellerById(sellerId: string): Promise<ISellerDocument | null> {
    const seller: ISellerDocument | null = await SellerModel.findOne({ _id: new mongoose.Types.ObjectId(sellerId) }).exec() as ISellerDocument;
    return seller;
  }

  async getSellerByUsername(username: string): Promise<ISellerDocument | null> {
    const seller: ISellerDocument | null = await SellerModel.findOne({ username }).exec() as ISellerDocument;
    return seller;
  }

  async getSellerByEmail(email: string): Promise<ISellerDocument | null> {
    const seller: ISellerDocument | null = await SellerModel.findOne({ email }).exec() as ISellerDocument;
    return seller;
  }

  async getRandomSellers(size: number): Promise<ISellerDocument[]> {
    const sellers: ISellerDocument[] = await SellerModel.aggregate([{ $sample: { size } }]);
    return sellers;
  }

  async createSellerModel(sellerData: ISellerDocument): Promise<ISellerDocument> {
    const createdSeller: ISellerDocument = await SellerModel.create(sellerData) as ISellerDocument;
    await this.buyerService.updateBuyerIsSellerProp(`${createdSeller.email}`);
    return createdSeller;
  }

  async updateSeller(sellerId: string, sellerData: ISellerDocument): Promise<ISellerDocument> {
    const updatedSeller: ISellerDocument = await SellerModel.findOneAndUpdate(
      { _id: sellerId },
      {
        $set: {
          profilePublicId: sellerData.profilePublicId,
          fullName: sellerData.fullName,
          description: sellerData.description,
          oneliner: sellerData.oneliner,
          responseTime: sellerData.responseTime,
        }
      },
      { new: true }
    ).exec() as ISellerDocument;
    return updatedSeller;
  }

  async updateTotalGigsCount(sellerId: string, count: number): Promise<void> {
    await SellerModel.updateOne({ _id: sellerId }, { $inc: { totalGigs: count } }).exec();
  }

  async updateSellerOngoingJobsProp(sellerId: string, ongoingJobs: number): Promise<void> {
    await SellerModel.updateOne({ _id: sellerId }, { $inc: { ongoingJobs } }).exec();
  }

  async updateSellerCancelledJobsProp(sellerId: string): Promise<void> {
    await SellerModel.updateOne({ _id: sellerId }, { $inc: { ongoingJobs: -1, cancelledJobs: 1 } }).exec();
  }

  async updateSellerCompletedJobsProp(data: IOrderMessage): Promise<void> {
    const { sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery } = data;
    await SellerModel.updateOne(
      { _id: sellerId },
      {
        $inc: {
          ongoingJobs,
          completedJobs,
          totalEarnings
        },
        $set: { recentDelivery: new Date(recentDelivery!) }
      }
    ).exec();
  }

  async updateSellerReview(data: IReviewMessageDetails): Promise<void> {
    const ratingTypes: IRatingTypes = {
      '1': 'one',
      '2': 'two',
      '3': 'three',
      '4': 'four',
      '5': 'five',
    };
    const ratingKey: string = ratingTypes[`${data.rating}`];
    await SellerModel.updateOne(
      { _id: data.sellerId },
      {
        $inc: {
          ratingsCount: 1,
          ratingSum: data.rating,
          [`ratingCategories.${ratingKey}.value`]: data.rating,
          [`ratingCategories.${ratingKey}.count`]: 1,
        }
      }
    ).exec();
  }


  async createSeller(data: ISellerDocument) {
    const { error } = await Promise.resolve(sellerSchema.validate(data || {}));
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'Create seller() method error');
    }

    // Extract relevant properties from data
    const { email, username, profilePublicId, fullName, description, oneliner, responseTime } = data || {};

    // Check if email property exists in data
    if (!email) {
      throw new BadRequestError('Email is required.', 'Create seller() method error');
    }

    const checkIfSellerExist: ISellerDocument | null = await this.getSellerByEmail(email);
    if (checkIfSellerExist) {
      throw new BadRequestError('Seller already exists. Go to your account page to update.', 'Create seller() method error');
    }

    // Create an object with the gathered properties
    const seller: ISellerDocument = {
      profilePublicId: profilePublicId,
      fullName: fullName,
      username: username!,
      email,
      description: description,
      oneliner: oneliner,
      responseTime: responseTime,
    };

    const createdSellerInner: ISellerDocument = await this.createSellerModel(seller);
    return { 'message': 'Seller created successfully.', 'seller': createdSellerInner };
  }

}

export default SellerService;
