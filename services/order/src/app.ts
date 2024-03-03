import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@order/config';
import { orderServer } from '@order/order/orderServer';
import { ElasticSearchService } from '@order/order/services/elasticSearchService';
import { DatabaseConnector } from '@order/config';

class orderApp {
  private readonly config: Config;
  private readonly orderServer: orderServer;
  private readonly log: Logger;
  private readonly databaseConnector: DatabaseConnector;

  constructor(config: Config, elasticSearchService: ElasticSearchService, databaseConnector: DatabaseConnector) {
    this.config = config;
    this.orderServer = new orderServer(config, elasticSearchService, databaseConnector);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderApp', 'debug');
    this.databaseConnector = databaseConnector;
  }

  initialize(): void {
    const app: Express = express();
    this.orderServer.start(app);
    this.log.info('order Service Initialized');
  }
}

const config = Config.getInstance();
const elasticSearchService = new ElasticSearchService();
const databaseConnector = DatabaseConnector.getInstance();
const item_app = new orderApp(config, elasticSearchService, databaseConnector);
item_app.initialize();
