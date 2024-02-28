import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@msg/config';
import { MsgServer } from '@msg/msg/msgServer';
import { ElasticSearchService } from '@msg/msg/services/elasticSearchService';
import { DatabaseConnector } from '@msg/config';

class MsgApp {
  private readonly config: Config;
  private readonly msgServer: MsgServer;
  private readonly log: Logger;
  private readonly databaseConnector: DatabaseConnector;

  constructor(config: Config, elasticSearchService: ElasticSearchService, databaseConnector: DatabaseConnector) {
    this.config = config;
    this.msgServer = new MsgServer(config, elasticSearchService, databaseConnector);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'ItemApp', 'debug');
    this.databaseConnector = databaseConnector;
  }

  initialize(): void {
    const app: Express = express();
    this.msgServer.start(app);
    this.log.info('user Service Initialized');
  }
}

const config = Config.getInstance();
const elasticSearchService = new ElasticSearchService();
const databaseConnector = DatabaseConnector.getInstance();
const msg_app = new MsgApp(config, elasticSearchService, databaseConnector);
msg_app.initialize();
