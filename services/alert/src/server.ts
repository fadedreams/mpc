
import 'express-async-errors';
import http from 'http';
import { winstonLogger } from '@fadedreams7org1/mpclib';

import { Application } from 'express';
import { config } from '@alert/config';
import { healthRoutes } from '@alert/routes';
import { Logger } from 'winston';
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'alert', 'debug');

const SERVER_PORT = 4001;

export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoutes());
  startQueues();
  startElasticSearch();
}

async function startQueues(): Promise<void> {
}

function startElasticSearch(): void {
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Worker with process id of ${process.pid} on notification server has started`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`alert server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', 'Alert Service startServer() method:', error);
  }
}
