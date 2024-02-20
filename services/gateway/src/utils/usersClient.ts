
import { configInstance as config } from '@gateway/config';

import { IOrderMessage, IRatingTypes, IReviewMessageDetails, ISellerDocument } from '@gateway/dto/';
import { IAuth } from '@gateway/dto';

export class UsersClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.USERS_BASE_URL}/api/v1/buyer`;
  }

  async getCurrentBuyerByUsername(authorizationHeader?: string): Promise<Response> {
    if (!authorizationHeader) {
      throw new Error('No authorization header provided');
    }
    const [bearer, token] = authorizationHeader.split(' ');
    // console.log('token in getCurrentUser', token);
    const response = await fetch(`${this.baseUrl}/username`, {
      headers: {
        'Authorization': `Bearer ${token}`
        // 'Authorization': `${ token }`
      }
    });
    return response.json();
  }

  async getBuyerByUsername(username: string): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/${username}`);
    return response.json();
  }

  async getBuyerByEmail(): Promise<Response> {
    const response = await fetch(`${this.baseUrl} / email`);
    return response.json();
  }

  async getSellerById(sellerId: string): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/id/${sellerId}`);
    return response.json();
  }

  async getSellerByUsername(username: string): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/username/${username}`);
    return response.json();
  }

  async getRandomSellers(size: string): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/random/${size}`);
    return response.json();
  }

  async createSeller(body: ISellerDocument): Promise<Response> {
    // const response = await fetch(`${this.baseUrl}/create`, {
    const response = await fetch(`http://localhost:3003/api/v1/users/create`, {
      method: 'POST', // Specify the HTTP method
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    // const data = await response.json();

    // Now data will contain the parsed JSON
    // const { message, seller } = data;

    return response.json();
  }

  async updateSeller(sellerId: string, body: ISellerDocument): Promise<Response> {
    const response = await fetch(`${this.baseUrl}/${sellerId}`, {
      method: 'POST', // Specify the HTTP method
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return response.json();
  }

  // async getCurrentUser(authorizationHeader?: string) {
  //   if (!authorizationHeader) {
  //     throw new Error('No authorization header provided');
  //   }
  //   const [bearer, token] = authorizationHeader.split(' ');
  //   // console.log('token in getCurrentUser', token);
  //   const response = await fetch(`${ this.baseUrl } / currentuser`, {
  //     headers: {
  //       'Authorization': `Bearer ${ token }`
  //       // 'Authorization': `${ token }`
  //     }
  //   });
  //   return response.json();
  // }


}

const usersClient = new UsersClient();
export { usersClient };
