
import axios from 'axios';
import { sign } from 'jsonwebtoken';
import { Config } from '@msg/config';

export class AxiosService {
  public axios: ReturnType<typeof axios.create>;
  private config: Config;

  constructor(config: Config, baseUrl: string, serviceName: string) {
    this.config = config;
    this.axios = this.axiosCreateInstance(baseUrl, serviceName);
  }

  public axiosCreateInstance(baseUrl: string, serviceName?: string): ReturnType<typeof axios.create> {
    let requestauthToken = '';
    if (serviceName) {
      requestauthToken = sign({ id: serviceName }, `${this.config.AUTH_JWT_TOKEN}`);
    }
    const instance: ReturnType<typeof axios.create> = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        authToken: requestauthToken
      },
      withCredentials: true
    });
    return instance;
  }
}
