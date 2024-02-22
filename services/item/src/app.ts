import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@item/config';
import { ItemServer } from '@item/item/itemServer';
import { ElasticSearchService } from '@item/item/services/elasticSearchService';
import { DatabaseConnector } from '@item/config';

class ItemApp {
  private readonly config: Config;
  private readonly itemServer: ItemServer;
  private readonly log: Logger;
  private readonly databaseConnector: DatabaseConnector;

  constructor(config: Config, elasticSearchService: ElasticSearchService, databaseConnector: DatabaseConnector) {
    this.config = config;
    this.itemServer = new ItemServer(config, elasticSearchService, databaseConnector);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'ItemApp', 'debug');
    this.databaseConnector = databaseConnector;
  }

  initialize(): void {
    const app: Express = express();
    this.itemServer.start(app);
    this.log.info('user Service Initialized');
  }
}

const config = Config.getInstance();
const elasticSearchService = new ElasticSearchService();
const databaseConnector = DatabaseConnector.getInstance();
const item_app = new ItemApp(config, elasticSearchService, databaseConnector);
item_app.initialize();
