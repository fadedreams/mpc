import { configInstance as config } from '@gateway/config';
import axios, { AxiosResponse } from 'axios';
import { ApiClient } from './apiClient';
import { IAuth } from '@gateway/gateway/middleware/express.d';

export let authAxios: ReturnType<typeof axios.create>;

class AuthClient extends ApiClient {
  constructor() {
    super(`${config.AUTH_BASE_URL}/api/v1/auth`, 'auth');
    authAxios = this.axios;
  }

  async getCurrentUser(authorizationHeader?: string): Promise<AxiosResponse> {
    // authAxios.defaults.headers['Authorization'] = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiZW1haWwiOiJhQGEuY29tIiwidXNlcm5hbWUiOiJBIiwiaWF0IjoxNzA3OTg3MTQxfQ.YNRZ2NpkUJKfGhkyluP25cnTj2fCCaF71wTccOhhjRo`;
    if (!authorizationHeader) {
      throw new Error('Authorization header is missing');
    }
    const [bearer, token] = authorizationHeader.split(' ');
    // if (bearer !== 'Bearer' || !token) {
    //   throw new Error('Invalid Authorization header format');
    // }
    authAxios.defaults.headers['Authorization'] = `Bearer ${token}`;
    const response: AxiosResponse = await authAxios.get('/currentuser');
    return response;
  }

  async signUp(body: IAuth): Promise<AxiosResponse> {
    console.log("signUp in authClient.ts");
    const response: AxiosResponse = await authAxios.post('/signup', body);
    return response;
  }

  async signIn(body: IAuth): Promise<AxiosResponse> {
    const response: AxiosResponse = await authAxios.post('/signin', body);
    return response;
  }

  async getItems(query: string, from: string, size: string, type: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await authAxios.get(`/search/item/${from}/${size}/${type}?${query}`);
    return response;

  }

  async getItem(itemId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await authAxios.get(`/search/item/${itemId}`);
    return response;

  }

  // async getRefreshToken(username: string): Promise<AxiosResponse> {
  //   const response: AxiosResponse = await authAxios.get(`/refresh-token/${username}`);
  //   return response;
  // }

  // async changePassword(currentPassword: string, newPassword: string): Promise<AxiosResponse> {
  //   const response: AxiosResponse = await authAxios.put('/change-password', { currentPassword, newPassword });
  //   return response;
  // }

  // async verifyEmail(token: string): Promise<AxiosResponse> {
  //   const response: AxiosResponse = await authAxios.put('/verify-email', { token });
  //   return response;
  // }

  // async resendEmail(data: { userId: number, email: string }): Promise<AxiosResponse> {
  //   const response: AxiosResponse = await authAxios.post('/resend-email', data);
  //   return response;
  // }

  // async forgotPassword(email: string): Promise<AxiosResponse> {
  //   const response: AxiosResponse = await authAxios.put('/forgot-password', { email });
  //   return response;
  // }

  // async resetPassword(token: string, password: string, confirmPassword: string): Promise<AxiosResponse> {
  //   const response: AxiosResponse = await authAxios.put(`/reset-password/${token}`, { password, confirmPassword });
  //   return response;
  // }


  // async seed(count: string): Promise<AxiosResponse> {
  //   const response: AxiosResponse = await authAxios.put(`/seed/${count}`);
  //   return response;
  // }
}

export const authClient: AuthClient = new AuthClient();
