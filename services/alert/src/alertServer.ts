import 'express-async-errors';
import http from 'http';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { ElasticSearchService } from './elasticSearchService';
import { Application } from 'express';
import { Config } from '@alert/config';
import { healthRoutes } from '@alert/routes';
import { Logger } from 'winston';

export class AlertServer {
  private readonly log: Logger;
  private readonly elasticSearchService: ElasticSearchService;
  private readonly SERVER_PORT: number;

  constructor(private readonly config: Config) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'alert', 'debug');
    this.elasticSearchService = new ElasticSearchService(config);
    this.SERVER_PORT = 4001;
  }

  start(app: Application): void {
    this.startServer(app);
    app.use('', healthRoutes());
    this.startQueues();
    this.startElasticSearch();
  }

  private async startQueues(): Promise<void> {
    // Add your queue startup logic here
  }

  private startElasticSearch(): void {
    this.elasticSearchService.checkConnection();
  }

  private startServer(app: Application): void {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.log.info(`Worker with process id of ${process.pid} on alert server has started`);
      httpServer.listen(this.SERVER_PORT, () => {
        this.log.info(`alert server running on port ${this.SERVER_PORT}`);
      });
    } catch (error) {
      this.log.log('error', 'Alert Service startServer() method:', error);
    }
  }
}

