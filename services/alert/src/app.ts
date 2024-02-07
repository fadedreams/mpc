import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import express, { Express } from 'express';
import { Config } from '@alert/config';
import { AlertServer } from './alertServer';

class AlertApp {
  private readonly config: Config;
  private readonly alertServer: AlertServer;
  private readonly log: Logger;

  constructor(config: Config) {
    this.config = config;
    this.alertServer = new AlertServer(config);
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'alertApp', 'debug');
  }

  initialize(): void {
    const app: Express = express();
    this.alertServer.start(app);
    this.log.info('alert Service Initialized');
  }
}

const config = Config.getInstance();
const alertApp = new AlertApp(config);
alertApp.initialize();
