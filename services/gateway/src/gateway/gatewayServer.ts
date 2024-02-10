import 'express-async-errors';
import http from 'http';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { ElasticSearchService } from './elasticSearchService';
import { gatewayQueueConnection } from '@gateway/broker/gatewayQueueConnection';
import { EmailConsumer } from '@gateway/broker/emailConsumer';
import { Application } from 'express';
import { Config } from '@gateway/config';
import { healthRoutes } from '@gateway/gateway/routes';
import { Logger } from 'winston';
import client, { Channel, Connection } from 'amqplib';

export class gatewayServer {
  private readonly log: Logger;
  // private readonly elasticSearchService: ElasticSearchService;
  private readonly SERVER_PORT: number;
  private readonly gatewayQueueConnection: gatewayQueueConnection;
  // private readonly emailConsumer: EmailConsumer;

  constructor(
    private readonly config: Config,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly emailConsumer: EmailConsumer
  ) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway', 'debug');
    this.SERVER_PORT = 3001;
    this.gatewayQueueConnection = new gatewayQueueConnection(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
    this.emailConsumer = new EmailConsumer(this.config);
  }

  start(app: Application): void {
    this.startServer(app);
    app.use('', healthRoutes());
    this.startQueues();
    this.startElasticSearch();
  }

  private async startQueues(): Promise<void> {
    const emailChannel: Channel = await this.gatewayQueueConnection.createConnection() as Channel;
    // const emailChannel: Channel = await createConnection() as Channel;
    await this.emailConsumer.consumeEmailMessages(emailChannel, 'mpc-email-gateway', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
    await this.emailConsumer.consumeOrderEmailMessages(emailChannel);
    const msg = JSON.stringify({ username: 'test' });
    emailChannel.publish('mpc-email-gateway', 'auth-email', Buffer.from(msg));
    emailChannel.publish('mpc-order-gateway', 'order-email', Buffer.from(msg));
    // await consumeAuthEmailMessages(emailChannel);
    // await consumeOrderEmailMessages(emailChannel);
  }

  private startElasticSearch(): void {
    this.elasticSearchService.checkConnection();
  }

  private startServer(app: Application): void {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.log.info(`Worker with process id of ${process.pid} on gateway server has started`);
      httpServer.listen(this.SERVER_PORT, () => {
        this.log.info(`gateway server running on port ${this.SERVER_PORT}`);
      });
    } catch (error) {
      this.log.log('error', 'gateway Service startServer() method:', error);
    }
  }

}

