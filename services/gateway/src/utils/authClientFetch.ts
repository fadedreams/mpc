import { configInstance as config } from '@gateway/config';
import { IAuth } from '@gateway/gateway/middleware/express.d';

export class AuthClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${config.AUTH_BASE_URL}/api/v1/auth`;
  }


  async getCurrentUser(token?: string) {
    const response = await fetch(`${this.baseUrl}/currentuser`, {
      headers: {
        'Authorization': `Bearer ${token}`
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

}

const authClient = new AuthClient();
export { authClient };
