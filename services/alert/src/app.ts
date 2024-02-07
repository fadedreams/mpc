// console.log("testing")
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { config } from '@alert/config';
import express, { Express } from 'express';
import { start } from '@alert/server';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'alertApp', 'debug');

function initialize(): void {
  const app: Express = express();
  start(app);
  log.info('alert Service Initialized');
}
initialize();
