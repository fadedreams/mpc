import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@users/config';
import { authServer } from './auth/authServer';
import { ElasticSearchService } from './auth/elasticSearchService';
import { EmailConsumer } from './broker/emailConsumer';

class authApp {
  private readonly config: Config;
  private readonly authServer: authServer;
  private readonly log: Logger;

  constructor(config: Config, elasticSearchService: ElasticSearchService) {
    this.config = config;
    this.authServer = new authServer(config, elasticSearchService);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authApp', 'debug');
  }

  initialize(): void {
    const app: Express = express();
    this.authServer.start(app);
    this.log.info('auth Service Initialized');
  }
}

const config = Config.getInstance();
const elasticSearchService = new ElasticSearchService();
const auth_app = new authApp(config, elasticSearchService);
auth_app.initialize();
