import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { configInstance as config } from '@auth/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { ISellerDocument } from "@auth/dto/seller.d";
import { ISellerItem } from "@auth/dto/item.d";
import fs from 'fs/promises';

export class ElasticSearchService {
  private readonly log: Logger;
  private elasticSearchClient: Client | null = null;

  constructor() {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authElasticSearchServer', 'debug');
    this.initElasticSearchClient();
  }

  public getElasticSearchClient(): Client | null {
    return this.elasticSearchClient;
  }

  private async initElasticSearchClient(): Promise<void> {
    try {
      this.elasticSearchClient = new Client({
        // node: 'https://localhost:9200/', // Use 'http' instead of 'https' for non-SSL connection
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200/',
        auth: {
          username: process.env.ELASTICSEARCH_USERNAME || 'elastic',
          password: process.env.ELASTICSEARCH_PWD || 'changeme',
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

  async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      try {
        const health: ClusterHealthResponse = await this.elasticSearchClient!.cluster.health({});
        this.log.info(`authService Elasticsearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        this.log.error(`Connection to Elasticsearch failed. Retrying... ${config.ELASTIC_SEARCH_URL}`);
        this.log.log('error', 'authService checkConnection() method:', error);
      }
    }
  }

  async checkIfIndexExist(indexName: string): Promise<boolean> {
    const result: boolean = await this.elasticSearchClient!.indices.exists({ index: indexName });
    return result;
  }

  async createIndex(indexName: string): Promise<void> {
    try {
      const result: boolean = await this.checkIfIndexExist(indexName);
      if (result) {
        this.log.info(`Index "${indexName}" already exist.`);
      } else {
        await this.elasticSearchClient!.indices.create({ index: indexName });
        await this.elasticSearchClient!.indices.refresh({ index: indexName });
        this.log.info(`Created index ${indexName}`);
      }
    } catch (error) {
      this.log.error(`An error occurred while creating the index ${indexName}`);
      this.log.log('error', 'AuthService createIndex() method error:', error);
    }
  }

  async getDocumentById(index: string, itemId: string): Promise<ISellerItem> {
    try {
      const result: GetResponse = await this.elasticSearchClient!.get({
        index,
        id: itemId
      });
      return result._source as ISellerItem;
    } catch (error) {
      this.log.log('error', 'AuthService elastcisearch getDocumentById() method error:', error);
      return {} as ISellerItem;
    }
  }

}

// Usage
// const elasticSearchService = new ElasticSearchService();
// elasticSearchService.checkConnection();
