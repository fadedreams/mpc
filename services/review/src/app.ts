import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@review/config';
import { ReviewServer } from '@review/review/reviewServer';
import { ElasticSearchService } from '@review/review/services/elasticSearchService';
// import { DatabaseConnector } from '@review/config';

class ReviewApp {
  private readonly config: Config;
  private readonly reviewServer: ReviewServer;
  private readonly log: Logger;
  // private readonly databaseConnector: DatabaseConnector;

  // constructor(config: Config, elasticSearchService: ElasticSearchService, databaseConnector: DatabaseConnector) {
  constructor(config: Config, elasticSearchService: ElasticSearchService) {
    this.config = config;
    // this.reviewServer = new ReviewServer(config, elasticSearchService, databaseConnector);
    this.reviewServer = new ReviewServer(config, elasticSearchService);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'ReviewApp', 'debug');
    // this.databaseConnector = databaseConnector;
  }

  initialize(): void {
    const app: Express = express();
    this.reviewServer.start(app);
    this.log.info('review Service Initialized');
  }
}

const config = Config.getInstance();
const elasticSearchService = new ElasticSearchService();
// const databaseConnector = DatabaseConnector.getInstance();
// const review_app = new ReviewApp(config, elasticSearchService, databaseConnector);
const review_app = new ReviewApp(config, elasticSearchService);
review_app.initialize();
