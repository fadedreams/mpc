
import { configInstance as config } from '@gateway/config';
import { ISellerItem, IPaginateProps, ISearchResult } from '@gateway/dto';
import { BadRequestError } from '@fadedreams7org1/mpclib';

// Convert ISellerItem to the desired format
export class OrderClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.ORDER_BASE_URL}/api/v1/order`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new BadRequestError(`Request failed with status ${response.status}`, 'OrderClient');
    }
    return response.json();
  }

  public async getOrder(oid: string) {
    const response = await fetch(`${this.baseUrl}/${oid}`);
    const responseData = await response.json();
    // console.log("getSellerItems response.json(): ", responseData);
    // return this.handleResponse<ISellerItem[]>(response);
    return responseData;
  }

  public async createOrder(order: any) {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    const responseData = await response.json();
    console.log("order response.json(): ", responseData);
    return responseData;
  }

  public async getSeller(sid: string) {
    const response = await fetch(`${this.baseUrl}/seller/${sid}`);
    const responseData = await response.json();
    // console.log("getSellerItems response.json(): ", responseData);
    return responseData;
  }

  public async getBuyer(bid: string) {
    const response = await fetch(`${this.baseUrl}/buyer/${bid}`);
    const responseData = await response.json();
    return responseData;
  }

  public async markAsRead(notificationId: any) {
    const response = await fetch(`${this.baseUrl}/notification/mark-as-read/${notificationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify(order),
    });
    const responseData = await response.json();
    // console.log(" response.json(): ", responseData);
    return responseData;
  }
}

const orderClient = new OrderClient();
export { orderClient };
