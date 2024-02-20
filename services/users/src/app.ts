import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@users/config';
import { UsersServer } from '@users/users/usersServer';
import { ElasticSearchService } from '@users/users/services/elasticSearchService';
import { DatabaseConnector } from '@users/config';

class UsersApp {
  private readonly config: Config;
  private readonly usersServer: UsersServer;
  private readonly log: Logger;
  private readonly databaseConnector: DatabaseConnector;

  constructor(config: Config, elasticSearchService: ElasticSearchService, databaseConnector: DatabaseConnector) {
    this.config = config;
    this.usersServer = new UsersServer(config, elasticSearchService, databaseConnector);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'UsersApp', 'debug');
    this.databaseConnector = databaseConnector;
  }

  initialize(): void {
    const app: Express = express();
    this.usersServer.start(app);
    this.log.info('user Service Initialized');
  }
}

const config = Config.getInstance();
const elasticSearchService = new ElasticSearchService();
const databaseConnector = DatabaseConnector.getInstance();
const users_app = new UsersApp(config, elasticSearchService, databaseConnector);
users_app.initialize();
