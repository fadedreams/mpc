
import { ObjectId } from "mongoose";
import { IRatingCategories } from "./review.d";

// By extending ISellerDocument with the Record<string, any> you allow an object to contain other
// string keys with any values along with those defined in the interface.
// The nice part is that you still have the autocompletion for the defined properties
export type SellerType =
  | string
  | string[]
  | number
  | IRatingCategories
  | Date
  | unknown
  | undefined;


export interface ISellerDocument extends Record<string, SellerType> {
  _id?: string | ObjectId;
  profilePublicId?: string;
  fullName: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  description: string;
  country?: string;
  ratingsCount?: number;
  ratingSum?: number;
  ratingCategories?: IRatingCategories;
  recentDelivery?: Date | string;
  socialLinks?: string[];
  totalEarnings?: number;
  totalItems?: number;
  paypal?: string; // not needed
  createdAt?: Date | string;
}
