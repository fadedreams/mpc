import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { configInstance as config } from '@auth/config';
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
      this.log.info('AuthService MySQL database connection has been established successfully.');
    } catch (error) {
      this.log.error('Auth Service - Unable to connect to database.');
      this.log.log('error', 'AuthService databaseConnection() method error:', error);
    }
  }

  // You can add more methods for handling other database-related operations

  closeConnection(): void {
    // Add logic to close database connection if needed
  }
}

// const databaseConnector = new DatabaseConnector();
// databaseConnector.connect()
//   .then(() => {
//     // Perform other operations after successful connection
//     // For example, start the server or execute queries
//   })
//   .catch((error) => {
//     // Handle errors during the connection process
//     console.error('Error connecting to the database:', error);
//   });
