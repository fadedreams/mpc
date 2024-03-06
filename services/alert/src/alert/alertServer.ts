import 'express-async-errors';
import http from 'http';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { ElasticSearchService } from './elasticSearchService';
import { AlertQueueConnection } from '@alert/broker/alertQueueConnection';
import { EmailConsumer } from '@alert/broker/emailConsumer';
import { Application } from 'express';
import { Config } from '@alert/config';
import { healthRoutes } from '@alert/alert/routes';
import { Logger } from 'winston';
import client, { Channel, Connection } from 'amqplib';

export class AlertServer {
  private readonly log: Logger;
  // private readonly elasticSearchService: ElasticSearchService;
  private readonly SERVER_PORT: number;
  private readonly alertQueueConnection: AlertQueueConnection;
  // private readonly emailConsumer: EmailConsumer;

  constructor(
    private readonly config: Config,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly emailConsumer: EmailConsumer
  ) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'alert', 'debug');
    this.SERVER_PORT = 3001;
    this.alertQueueConnection = new AlertQueueConnection(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
    this.emailConsumer = new EmailConsumer(this.config);
  }

  start(app: Application): void {
    app.use('', healthRoutes());
    this.startQueues();
    this.startElasticSearch();
    this.startServer(app);
  }

  private async startQueues(): Promise<void> {
    const emailChannel: Channel = await this.alertQueueConnection.createConnection() as Channel;
    // const emailChannel: Channel = await createConnection() as Channel;
    await this.emailConsumer.consumeEmailMessages(emailChannel, 'mpc-email-alert', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
    await this.emailConsumer.consumeorderEmailMessages(emailChannel);
    const msg = JSON.stringify({ username: 'test' });
    emailChannel.publish('mpc-email-alert', 'auth-email', Buffer.from(msg));
    emailChannel.publish('mpc-order-alert', 'order-email', Buffer.from(msg));
    // await consumeAuthEmailMessages(emailChannel);
    // await consumeorderEmailMessages(emailChannel);
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

