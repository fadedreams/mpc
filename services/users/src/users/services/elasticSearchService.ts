import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { configInstance as config } from '@users/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { ISellerDocument } from "@users/dto/seller.d";
import { ISellerItem } from "@users/dto/item.d";

export class ElasticSearchService {
  private readonly log: Logger;
  private readonly elasticSearchClient: Client;

  constructor() {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersElasticSearchServer', 'debug');
    this.elasticSearchClient = new Client({
      // node: `${config.ELASTIC_SEARCH_URL}`
      node: 'http://localhost:9200'
    });
  }

  public getElasticSearchClient(): Client {
    return this.elasticSearchClient;
  }

  async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      try {
        const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({});
        this.log.info(`usersService Elasticsearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        this.log.error(`Connection to Elasticsearch failed. Retrying... ${config.ELASTIC_SEARCH_URL}`);
        this.log.log('error', 'usersService checkConnection() method:', error);
      }
    }
  }

  async checkIfIndexExist(indexName: string): Promise<boolean> {
    const result: boolean = await this.elasticSearchClient.indices.exists({ index: indexName });
    return result;
  }

  async createIndex(indexName: string): Promise<void> {
    try {
      const result: boolean = await this.checkIfIndexExist(indexName);
      if (result) {
        this.log.info(`Index "${indexName}" already exist.`);
      } else {
        await this.elasticSearchClient.indices.create({ index: indexName });
        await this.elasticSearchClient.indices.refresh({ index: indexName });
        this.log.info(`Created index ${indexName}`);
      }
    } catch (error) {
      this.log.error(`An error occurred while creating the index ${indexName}`);
      this.log.log('error', 'UsersService createIndex() method error:', error);
    }
  }

  async getDocumentById(index: string, itemId: string): Promise<ISellerItem> {
    try {
      const result: GetResponse = await this.elasticSearchClient.get({
        index,
        id: itemId
      });
      return result._source as ISellerItem;
    } catch (error) {
      this.log.log('error', 'UsersService elastcisearch getDocumentById() method error:', error);
      return {} as ISellerItem;
    }
  }

}

// Usage
// const elasticSearchService = new ElasticSearchService();
// elasticSearchService.checkConnection();
