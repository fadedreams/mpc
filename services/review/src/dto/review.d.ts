
export interface IReviewMessageDetails {
  itemId?: string;
  reviewerId?: string;
  sellerId?: string;
  review?: string;
  rating?: number;
  orderId?: string;
  createdAt?: string;
  type: string;
}

export interface IRatingTypes {
  [key: string]: string;
}

export interface IReviewDocument {
  _id?: string;
  itemId: string;
  reviewerId: string;
  sellerId: string;
  review: string;
  rating: number;
  orderId: string;
  createdAt: Date | string;
  reviewerUsername: string;
  reviewType?: string;
}

export interface IRatingCategoryItem {
  value: number;
  count: number;
}

export interface IRatingCategories {
  five: IRatingCategoryItem;
  four: IRatingCategoryItem;
  three: IRatingCategoryItem;
  two: IRatingCategoryItem;
  one: IRatingCategoryItem;
}
