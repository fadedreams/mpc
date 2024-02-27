import { configInstance as config } from '@gateway/config';
import { ISellerItem, IPaginateProps, ISearchResult } from '@gateway/dto';
import { BadRequestError } from '@fadedreams7org1/mpclib';

// Convert ISellerItem to the desired format
export class ItemClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.ITEM_BASE_URL}/api/v1/item`;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new BadRequestError(`Request failed with status ${response.status}`, 'ItemClient');
    }
    return response.json();
  }

  public async createItem(itemData: ISellerItem) {
    //tested
    // const response = await fetch(`http://localhost:3004/api/v1/item/create`, {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });

    const responseData = await response.json();
    console.log("itemClient response.json(): ", responseData);
    return responseData;
    // return this.handleResponse<ISellerItem>(response);
  }

  public async updateItem(itemId: string, itemData: ISellerItem): Promise<ISellerItem> {
    const response = await fetch(`${this.baseUrl}/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });

    const responseData = await response.json();
    console.log("updateItem response.json(): ", responseData);
    return responseData;
  }

  public async updateActiveItem(itemId: string, active: boolean): Promise<ISellerItem> {
    //tested
    const response = await fetch(`${this.baseUrl}/active/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active }),
    });

    const responseData = await response.json();
    console.log("updateActiveItem response.json(): ", responseData);
    return responseData;
    // return this.handleResponse<ISellerItem>(response);
  }

  public async deleteItem(itemId: string, sellerId: string): Promise<void> {
    //tested
    const response = await fetch(`${this.baseUrl}/${itemId}/${sellerId}`, {
      method: 'DELETE',
    });

    const responseData = await response.json();
    console.log("deleteItem response.json(): ", responseData);
  }

  public async getSellerItems(sellerId: string): Promise<ISellerItem[]> {
    const response = await fetch(`${this.baseUrl}/seller/${sellerId}`);
    const responseData = await response.json();
    console.log("getSellerItems response.json(): ", responseData);
    // return this.handleResponse<ISellerItem[]>(response);
    return responseData;
  }

  public async getSellerInactiveItems(sellerId: string): Promise<ISellerItem[]> {
    const response = await fetch(`${this.baseUrl}/seller/pause/${sellerId}`);
    const responseData = await response.json();
    console.log("getSellerInactiveItems response.json(): ", responseData);
    // return this.handleResponse<ISellerItem[]>(response);
    return responseData;
  }

  public async searchItems(from: string, size: string, type: string, query: string, deliveryTime: string, minPrice: string, maxPrice: string): Promise<ISearchResult> {
    const response = await fetch(`${this.baseUrl}/search/${from}/${size}/${type}?query=${query}&delivery_time=${deliveryTime}&minprice=${minPrice}&maxprice=${maxPrice}`);
    const responseData = await response.json();
    console.log("searchItems response.json(): ", responseData);
    // return this.handleResponse<ISearchResult>(response);
    return responseData;
  }

  public async itemsByCategory(username: string): Promise<ISearchResult> {
    const response = await fetch(`${this.baseUrl}/category/${username}`);
    const responseData = await response.json();
    console.log("itemsByCategory response.json(): ", responseData);
    // return this.handleResponse<ISearchResult>(response);
    return responseData;
  }

  public async topRatedItemsByCategory(username: string): Promise<ISearchResult> {
    const response = await fetch(`${this.baseUrl}/category/${username}`);
    const responseData = await response.json();
    console.log("topRatedItemsByCategory response.json(): ", responseData);
    // return this.handleResponse<ISearchResult>(response);
    return responseData;
  }

  public async moreLikeThis(itemId: string): Promise<ISearchResult> {
    const response = await fetch(`${this.baseUrl}/moreLikeThis/${itemId}`);
    const responseData = await response.json();
    console.log("moreLikeThis response.json(): ", responseData);
    // return this.handleResponse<ISearchResult>(response);
    return responseData;
  }
}

const itemClient = new ItemClient();
export { itemClient };
