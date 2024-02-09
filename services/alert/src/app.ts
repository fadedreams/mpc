import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@alert/config';
import { AlertServer } from './alert/alertServer';
import { ElasticSearchService } from './alert/elasticSearchService';
import { EmailConsumer } from './broker/emailConsumer';

class AlertApp {
  private readonly config: Config;
  private readonly alertServer: AlertServer;
  private readonly log: Logger;

  constructor(config: Config, elasticSearchService: ElasticSearchService, emailConsumer: EmailConsumer) {
    this.config = config;
    this.alertServer = new AlertServer(config, elasticSearchService, emailConsumer);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'alertApp', 'debug');
  }

  initialize(): void {
    const app: Express = express();
    this.alertServer.start(app);
    this.log.info('alert Service Initialized');
  }
}

const config = Config.getInstance();
const emailConsumer = new EmailConsumer(config);
const elasticSearchService = new ElasticSearchService(config);
const alertApp = new AlertApp(config, elasticSearchService, emailConsumer);
alertApp.initialize();
