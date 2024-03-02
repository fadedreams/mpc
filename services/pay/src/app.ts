import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@pay/config';
import { PayServer } from '@pay/pay/payServer';
import { ElasticSearchService } from '@pay/pay/services/elasticSearchService';
import { DatabaseConnector } from '@pay/config';

class PayApp {
  private readonly config: Config;
  private readonly payServer: PayServer;
  private readonly log: Logger;
  private readonly databaseConnector: DatabaseConnector;

  constructor(config: Config, elasticSearchService: ElasticSearchService, databaseConnector: DatabaseConnector) {
    this.config = config;
    this.payServer = new PayServer(config, elasticSearchService, databaseConnector);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'payApp', 'debug');
    this.databaseConnector = databaseConnector;
  }

  initialize(): void {
    const app: Express = express();
    this.payServer.start(app);
    this.log.info('pay Service Initialized');
  }
}

const config = Config.getInstance();
const elasticSearchService = new ElasticSearchService();
const databaseConnector = DatabaseConnector.getInstance();
const item_app = new PayApp(config, elasticSearchService, databaseConnector);
item_app.initialize();
