import { configInstance as config } from '@gateway/config';
import { IAuth } from '@gateway/gateway/middleware/express.d';

export class AuthClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.AUTH_BASE_URL}/api/v1/auth`;
  }


  async getCurrentUser(authorizationHeader?: string) {
    if (!authorizationHeader) {
      throw new Error('No authorization header provided');
    }
    const [bearer, token] = authorizationHeader.split(' ');
    // console.log('token in getCurrentUser', token);
    const response = await fetch(`${this.baseUrl}/currentuser`, {
      headers: {
        'Authorization': `Bearer ${token}`
        // 'Authorization': `${token}`
      }
    });
    return response.json();
  }

  async signUp(body: IAuth) {
    const response = await fetch(`${this.baseUrl}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    return response.json();
  }

  async signIn(body: IAuth) {
    const response = await fetch(`${this.baseUrl}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    return response.json();
  }

  async getItem(itemId: string) {
    const response = await fetch(`${this.baseUrl}/search/item/${itemId}`);
    // const response = await fetch(`http://localhost:3002/api/v1/auth/search/item/1`);
    return response.json();
  }

  async getItems(query: string, from: string, size: string, type: string) {
    // const response = await fetch(`${this.baseUrl}/auth/search/item/items?${query}&from=${from}&size=${size}&type=${type}`);
    console.log(`${this.baseUrl}/search/item/${from}/${size}/${type}?${query}`);
    const response = await fetch(`${this.baseUrl}/search/item/${from}/${size}/${type}?${query}`);
    return response.json();
  }

}

const authClient = new AuthClient();
export { authClient };
