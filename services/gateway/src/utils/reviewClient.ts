
import { configInstance as config } from '@gateway/config';
import { ISellerItem, IPaginateProps, ISearchResult } from '@gateway/dto';
import { BadRequestError } from '@fadedreams7org1/mpclib';

// Convert ISellerItem to the desired format
export class ReviewClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.ITEM_BASE_URL}/api/v1/review`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new BadRequestError(`Request failed with status ${response.status}`, 'ReviewClient');
    }
    return response.json();
  }

  public async addReview(data: ISellerItem) {
    //tested
    // const response = await fetch(`http://localhost:3004/api/v1/item/create`, {
    const response = await fetch(`${this.baseUrl}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    console.log("reviewClient response.json(): ", responseData);
    return responseData;
    // return this.handleResponse<ISellerItem>(response);
  }

  public async getReviewByItemId(reviewId: string): Promise<ISellerItem[]> {
    const response = await fetch(`${this.baseUrl}/review/${reviewId}`);
    const responseData = await response.json();
    console.log("getSellerItems response.json(): ", responseData);
    // return this.handleResponse<ISellerItem[]>(response);
    return responseData;
  }

  public async getReviewBySellerId(sellerId: string): Promise<ISellerItem[]> {
    const response = await fetch(`${this.baseUrl}/seller/${sellerId}`);
    const responseData = await response.json();
    console.log("getSellerInactiveItems response.json(): ", responseData);
    // return this.handleResponse<ISellerItem[]>(response);
    return responseData;
  }


}

const reviewClient = new ReviewClient();
export { reviewClient };
