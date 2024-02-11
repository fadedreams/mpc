
import axios from 'axios';
import { sign } from 'jsonwebtoken';
import { Config } from '@gateway/config';

export class AxiosService {
  public axios: ReturnType<typeof axios.create>;
  private config: Config;

  constructor(config: Config, baseUrl: string, serviceName: string) {
    this.config = config;
    this.axios = this.axiosCreateInstance(baseUrl, serviceName);
  }

  public axiosCreateInstance(baseUrl: string, serviceName?: string): ReturnType<typeof axios.create> {
    let requestGatewayToken = '';
    if (serviceName) {
      requestGatewayToken = sign({ id: serviceName }, `${this.config.GATEWAY_JWT_TOKEN}`);
    }
    const instance: ReturnType<typeof axios.create> = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        gatewayToken: requestGatewayToken
      },
      withCredentials: true
    });
    return instance;
  }
}
