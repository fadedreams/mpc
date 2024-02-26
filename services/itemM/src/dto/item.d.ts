import { ObjectId } from "mongoose";
import { IRatingCategories, IReviewDocument } from "./review.interface";
import { ISellerDocument } from "./seller.d";

export type ItemType =
  | string
  | string[]
  | number
  | unknown
  | undefined;

export interface ICreateItem extends Record<string, ItemType> {
  sellerId?: string;
  title: string;
  categories: string;
  description: string;
  subCategories: string[];
  tags: string[];
  price: number;
  expectedDelivery: string;
  Title: string;
  Description: string;
}

export interface ISellerItem {
  _id?: string | ObjectId;
  id?: string | ObjectId; // Updated from itemId to itemId
  sellerId?: string | ObjectId;
  title: string;
  username?: string;
  email?: string;
  description: string;
  active?: boolean;
  categories: string;
  subCategories: string[];
  tags: string[];
  ratingsCount?: number; // make sure to add this to elasticsearch as a double
  ratingSum?: number; // make sure to add this to elasticsearch as a double
  ratingCategories?: IRatingCategories;
  expectedDelivery?: string;
  Title: string;
  Description: string;
  price: number;
  createdAt?: Date | string;
  sortId?: number;
  // this is added here because we will use the json format of the document
  // at some point instead of the Mongoose document
  // the json object which will contain the virtual field "id" without the field "_id" will be added to elasticsearch
  // because "_id" is a reserved field name in elasticsearch.
  toJSON?: () => unknown;
}

export interface IItemContext {
  item: ISellerItem;
  seller: ISellerDocument;
  isSuccess?: boolean;
  isLoading?: boolean;
}

export interface IItemsProps {
  type?: string;
  item?: ISellerItem;
}

export interface IItemCardItems {
  item: ISellerItem;
  linkTarget: boolean;
  showEditIcon: boolean;
}

export interface ISelectedBudget {
  minPrice: string;
  maxPrice: string;
}

export interface IItemViewReviewsProps {
  showRatings: boolean;
  reviews?: IReviewDocument[];
}

export interface IItemInfo {
  total: number | string;
  title: string;
  bgColor: string;
}

export interface IItemTopProps {
  items: ISellerItem[];
  title?: string;
  subTitle?: string;
  category?: string;
  width?: string;
  type?: string;
}
