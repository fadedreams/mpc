import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@gateway/config';
import { gatewayServer } from './gateway/gatewayServer';
import { ElasticSearchService } from './gateway/elasticSearchService';
import { EmailConsumer } from './broker/emailConsumer';

class gatewayApp {
  private readonly config: Config;
  private readonly gatewayServer: gatewayServer;
  private readonly log: Logger;

  constructor(config: Config, elasticSearchService: ElasticSearchService, emailConsumer: EmailConsumer) {
    this.config = config;
    this.gatewayServer = new gatewayServer(config, elasticSearchService, emailConsumer);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewayApp', 'debug');
  }

  initialize(): void {
    const app: Express = express();
    this.gatewayServer.start(app);
    this.log.info('gateway Service Initialized');
  }
}

const config = Config.getInstance();
const emailConsumer = new EmailConsumer(config);
const elasticSearchService = new ElasticSearchService(config);
const gateway_app = new gatewayApp(config, elasticSearchService, emailConsumer);
gateway_app.initialize();
