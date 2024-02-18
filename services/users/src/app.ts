import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@users/config';
import { UsersServer } from './users/usersServer';
import { ElasticSearchService } from './users/elasticSearchService';
import { EmailConsumer } from './broker/emailConsumer';

class UsersApp {
  private readonly config: Config;
  private readonly usersServer: UsersServer;
  private readonly log: Logger;

  constructor(config: Config, elasticSearchService: ElasticSearchService) {
    this.config = config;
    this.usersServer = new UsersServer(config, elasticSearchService);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'UsersApp', 'debug');
  }

  initialize(): void {
    const app: Express = express();
    this.usersServer.start(app);
    this.log.info('auth Service Initialized');
  }
}

const config = Config.getInstance();
const elasticSearchService = new ElasticSearchService();
const users_app = new UsersApp(config, elasticSearchService);
users_app.initialize();
