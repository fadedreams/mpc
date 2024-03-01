

import dotenv from 'dotenv';

dotenv.config();

export class Config {
  private static instance: Config;

  public ENABLE_APM: string | undefined;
  public NODE_ENV: string | undefined;
  public CLIENT_URL: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public RABBITMQ_ENDPOINT: string | undefined;
  public ELASTIC_SEARCH_URL: string | undefined;
  public EMAIL_HOST: string | undefined;
  public ELASTIC_APM_SERVER_URL: string | undefined;
  public ELASTIC_APM_SECRET_TOKEN: string | undefined;
  public SECRET_KEY_ONE: string | undefined;
  public SECRET_KEY_TWO: string | undefined;
  public GATEWAY_JWT_TOKEN: string | undefined;
  public JWT_TOKEN: string | undefined;
  public AUTH_JWT_TOKEN: string | undefined;
  public REDIS_HOST: string | undefined;
  public PAY_BASE_URL: string | undefined;


  public API_GATEWAY_URL: string | undefined;
  public MYSQL_DB: string | undefined;
  public DATABASE_URL: string | undefined;

  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;

  constructor() {
    this.ENABLE_APM = process.env.ENABLE_APM || '0';
    this.NODE_ENV = process.env.NODE_ENV || 'dev';
    this.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || 'amqp://mpc:mpc@localhost:5672';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || 'http://localhost:9200';
    this.EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.ethereal.email';
    this.ELASTIC_APM_SERVER_URL = process.env.ELASTIC_APM_SERVER_URL || 'http://localhost:8200';
    this.ELASTIC_APM_SECRET_TOKEN = process.env.ELASTIC_APM_SECRET_TOKEN || '';
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || 'secret';
    this.JWT_TOKEN = process.env.JWT_TOKEN || 'http://localhost:6379';
    this.AUTH_JWT_TOKEN = process.env.AUTH_JWT_TOKEN || 'secret';
    this.REDIS_HOST = process.env.REDIS_HOST || 'redis://localhost:6379';
    this.PAY_BASE_URL = process.env.PAY_BASE_URL || 'http://localhost:3006';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:3000';
    this.MYSQL_DB = process.env.MYSQL_DB || '';
    this.DATABASE_URL = process.env.DATABASE_URL || '';
    this.CLOUD_NAME = process.env.CLOUD_NAME || '';
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || '';
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || '';
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}
export const configInstance = Config.getInstance();
