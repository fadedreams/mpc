
import { ObjectId } from "mongoose";

export interface IBuyerDocument {
  _id?: string | ObjectId;
  username?: string;
  email?: string;
  isSeller?: boolean;
  purchasedItems: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IReduxBuyer {
  type?: string;
  payload: IBuyerDocument;
}
