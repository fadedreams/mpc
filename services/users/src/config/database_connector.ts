import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { configInstance as config } from '@users/config';

import mongoose from 'mongoose';

class DatabaseConnector {
  private static instance: DatabaseConnector | null = null;
  private log: Logger;

  private constructor() {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersDatabaseServer', 'debug');
  }

  public static getInstance(): DatabaseConnector {
    if (!DatabaseConnector.instance) {
      DatabaseConnector.instance = new DatabaseConnector();
    }
    return DatabaseConnector.instance;
  }

  public async connect(): Promise<void> {
    try {
      await mongoose.connect(`${config.DATABASE_URL}`);
      this.log.info('Users service successfully connected to the database.');
      console.log('Users service successfully connected to the database.');
    } catch (error) {
      this.log.log('error', 'UsersService databaseConnection() method error:', error);
    }
  }
}

export { DatabaseConnector };
