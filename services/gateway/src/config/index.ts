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
  public AUTH_BASE_URL: string | undefined;
  public USERS_BASE_URL: string | undefined;
  public JOB_BASE_URL: string | undefined;
  public MSG_BASE_URL: string | undefined;
  public BUY_BASE_URL: string | undefined;
  public ANALYSIS_BASE_URL: string | undefined;
  public REDIS_HOST: string | undefined;

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
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || 'secret';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || 'secret';
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || 'secret';
    this.JWT_TOKEN = process.env.JWT_TOKEN || 'secret';
    this.AUTH_BASE_URL = process.env.AUTH_BASE_URL || '';
    this.USERS_BASE_URL = process.env.USERS_BASE_URL || '';
    this.JOB_BASE_URL = process.env.JOB_BASE_URL || '';
    this.MSG_BASE_URL = process.env.MSG_BASE_URL || '';
    this.BUY_BASE_URL = process.env.BUY_BASE_URL || '';
    this.ANALYSIS_BASE_URL = process.env.ANALYSYS_BASE_URL || '';
    this.REDIS_HOST = process.env.REDIS_HOST || 'redis://localhost:6379';
  }

  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}
