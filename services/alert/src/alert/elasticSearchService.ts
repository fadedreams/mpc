import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { Config } from '@alert/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import fs from 'fs/promises';

export class ElasticSearchService {
  private readonly log: Logger;
  private elasticSearchClient: Client | null = null;
  private readonly _config: Config;

  constructor(config: Config) {
    this._config = config;
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'alertElasticSearchServer', 'debug');

    // Initiate the connection asynchronously
    this.initElasticSearchClient();
  }

  private async initElasticSearchClient(): Promise<void> {
    try {
      this.elasticSearchClient = new Client({
        node: process.env.ELASTIC_SEARCH_URL, // Use 'http' instead of 'https' for non-SSL connection
        auth: {
          username: process.env.ELASTIC_SEARCH_USER || 'elastic',
          password: process.env.ELASTIC_SEARCH_PASSWORD || 'changeme',
        },
        // tls: {
        //   requestCert: true,
        //   ca: await fs.readFile('../../certs/ca/ca.crt', 'utf-8'),
        //   rejectUnauthorized: true,
        // },
      });
      // this.run();
      // After initializing the client, check the connection
      await this.checkConnection();
    } catch (error) {
      console.log(error);
      this.log.error('Error initializing ElasticSearch client:', error);
    }
  }

  // private async run() {
  //   try {
  //     if (this.elasticSearchClient) {
  //       await this.elasticSearchClient.indices.exists({
  //         index: 'events_index'
  //       });
  //       console.log('Connection to Elasticsearch successful!');
  //     }
  //   } catch (error) {
  //     console.error('Error connecting to Elasticsearch:', error);
  //   }
  // }

  private async checkConnection(): Promise<void> {
    if (!this.elasticSearchClient) {
      this.log.error('ElasticSearch client is not initialized.');
      return;
    }
    try {
      if (this.elasticSearchClient) {
        await this.elasticSearchClient.indices.exists({
          index: 'events_index'
        });
        const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({});
        this.log.info(`alertService Elasticsearch health status - ${health.status}`);
        console.log('checkConnection to Elasticsearch successful!');
      }
    } catch (error) {
      this.log.error('Connection to Elasticsearch failed. Retrying...');
      this.log.log('error', 'alertService checkConnection() method:', error);
    }
  }
}

// Usage
// const elasticSearchService = new ElasticSearchService();
