

import { BuyerModel } from '@pay/pay/models/buyer.schema';
import { IBuyerDocument, ISellerDocument } from '@pay/dto/';
import { SellerModel } from '../models/seller.schema';

class BuyerService {
  async getBuyerByEmail(email: string): Promise<IBuyerDocument | null> {
    const buyer: IBuyerDocument | null = await BuyerModel.findOne({ email }).exec() as IBuyerDocument;
    return buyer;
  }

  async getBuyerByUsername(username: string): Promise<IBuyerDocument | null> {
    const buyer: IBuyerDocument | null = await BuyerModel.findOne({ username }).exec() as IBuyerDocument;
    console.log("buyer", buyer)
    return buyer;
  }

  async getRandomBuyers(count: number): Promise<IBuyerDocument[]> {
    const buyers: IBuyerDocument[] = await BuyerModel.aggregate([{ $sample: { size: count } }]);
    return buyers;
  }

  async createBuyer(buyerData: IBuyerDocument): Promise<void> {
    const checkIfBuyerExist: IBuyerDocument | null = await this.getBuyerByEmail(`${buyerData.email}`);
    if (!checkIfBuyerExist) {
      await BuyerModel.create(buyerData);
    }
  }



  async updateBuyerIsSellerProp(email: string): Promise<void> {
    await BuyerModel.updateOne(
      { email },
      {
        $set: {
          isSeller: true
        }
      }
    ).exec();
  }

  async updateBuyerPurchasedItemsProp(buyerId: string, purchasedItemId: string, type: string): Promise<void> {
    await BuyerModel.updateOne(
      { _id: buyerId },
      type === 'purchased-items' ?
        {
          $push: {
            purchasedItems: purchasedItemId
          }
        } : {
          $pull: {
            purchasedItems: purchasedItemId
          }
        }
    ).exec();
  }
}

export default BuyerService;
