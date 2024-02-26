import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, CountResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { configInstance as config } from '@item/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { ISellerDocument } from "@item/dto/seller.d";
import { ISellerItem } from "@item/dto/item.d";

export class ElasticSearchService {
  private readonly log: Logger;
  private readonly elasticSearchClient: Client;

  constructor() {
    // console.log('config.ELASTIC_SEARCH_URL: ', config.ELASTIC_SEARCH_URL);

    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'itemElasticSearchServer', 'debug');
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
        this.log.info(`itemService Elasticsearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        this.log.error(`Connection to Elasticsearch failed. Retrying... ${config.ELASTIC_SEARCH_URL}`);
        this.log.log('error', 'itemService checkConnection() method:', error);
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
      this.log.log('error', 'ItemService createIndex() method error:', error);
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
      this.log.log('error', 'ItemService elastcisearch getDocumentById() method error:', error);
      return {} as ISellerItem;
    }
  }

  async getIndexedData(index: string, itemId: string): Promise<ISellerItem> {
    try {
      const result: GetResponse = await this.elasticSearchClient.get({ index, id: itemId });
      return result._source as ISellerItem;
    } catch (error) {
      this.log.log('error', 'ElasticSearchService getIndexedData() method error:', error);
      return {} as ISellerItem;
    }
  }

  async addDataToIndex(index: string, itemId: string, itemDocument: unknown): Promise<void> {
    try {
      await this.elasticSearchClient.index({
        index,
        id: itemId,
        body: itemDocument  // Use 'body' instead of 'document' for the request payload
      });
    } catch (error) {
      this.log.log('error', 'ElasticSearchService addDataToIndex() method error:', error);
    }
  }

  async updateIndexedData(index: string, itemId: string, itemDocument: unknown): Promise<void> {
    try {
      await this.elasticSearchClient.update({
        index,
        id: itemId,
        body: {
          doc: itemDocument
        }
      });
    } catch (error) {
      this.log.log('error', 'ElasticSearchService updateIndexedData() method error:', error);
    }
  }

  async deleteIndexedData(index: string, itemId: string): Promise<void> {
    try {
      await this.elasticSearchClient.delete({
        index,
        id: itemId
      });
    } catch (error) {
      this.log.log('error', 'ElasticSearchService deleteIndexedData() method error:', error);
    }
  }

  async getDocumentCount(index: string): Promise<number> {
    try {
      const result: CountResponse = await this.elasticSearchClient.count({ index });
      return result.count;
    } catch (error) {
      this.log.log('error', 'itemService elasticsearch getDocumentCount() method error:', error);
      return 0;
    }
  };

}

// Usage
// const elasticSearchService = new ElasticSearchService();
// elasticSearchService.checkConnection();
