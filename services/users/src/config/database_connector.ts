import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { configInstance as config } from '@users/config';
import { Sequelize } from 'sequelize';

class DatabaseConnector {
  private sequelize: Sequelize;
  private log: Logger;

  constructor() {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authDatabaseServer', 'debug');
    this.sequelize = new Sequelize(process.env.MYSQL_DB!, {
      dialect: 'mysql',
      logging: true,
      dialectOptions: {
        multipleStatements: true
      }
    });
  }

  async connect(): Promise<void> {
    try {
      await this.sequelize.authenticate();
      // Check if database exists
      // const [results] = await this.sequelize.query(`SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${process.env.MYSQL_DB}'`);
      // if (results.length === 0) {
      //   // Database does not exist, create it
      //   await this.sequelize.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DB}`);
      // }

      this.log.info('Connected to MySQL database!');
    } catch (error) {
      this.log.error('Auth Service - Unable to connect to the database.');
      this.log.log('error', 'AuthService databaseConnection() method error:', error);
    }
  }

  // You can add more methods for handling other database-related operations

  closeConnection(): void {
    // Add logic to close database connection if needed
  }

  getSequelizeInstance(): Sequelize {
    return this.sequelize;
  }
}

const databaseConnector = new DatabaseConnector();
databaseConnector.connect()
  .then(() => {
    // Perform other operations after a successful connection
    // For example, start the server or execute queries
  })
  .catch((error) => {
    // Handle errors during the connection process
    console.error('Error connecting to the database:', error);
  });

export { databaseConnector };
