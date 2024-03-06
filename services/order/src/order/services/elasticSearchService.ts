import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse, CountResponse, GetResponse } from '@elastic/elasticsearch/lib/api/types';
import { configInstance as config } from '@order/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { ISellerDocument } from "@order/dto/seller.d";
import { ISellerItem } from "@order/dto/item.d";

export class ElasticSearchService {
  private readonly log: Logger;
  private elasticSearchClient: Client | null = null;

  constructor() {
    // console.log('config.ELASTIC_SEARCH_URL: ', config.ELASTIC_SEARCH_URL);

    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderElasticSearchServer', 'debug');
    this.initElasticSearchClient();
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

  public getElasticSearchClient(): Client {
    if (!this.elasticSearchClient) {
      throw new Error('ElasticSearch client not initialized');
    }
    return this.elasticSearchClient;
  }

  async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      try {
        const health: ClusterHealthResponse = await this.elasticSearchClient!.cluster.health({});
        this.log.info(`msgService Elasticsearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        this.log.error(`Connection to Elasticsearch failed. Retrying... ${config.ELASTIC_SEARCH_URL}`);
        this.log.log('error', 'msgService checkConnection() method:', error);
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
      this.log.log('error', 'ItemService createIndex() method error:', error);
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
      this.log.log('error', 'ItemService elastcisearch getDocumentById() method error:', error);
      return {} as ISellerItem;
    }
  }

  async getIndexedData(index: string, itemId: string): Promise<ISellerItem> {
    try {
      const result: GetResponse = await this.elasticSearchClient!.get({ index, id: itemId });
      return result._source as ISellerItem;
    } catch (error) {
      this.log.log('error', 'ElasticSearchService getIndexedData() method error:', error);
      return {} as ISellerItem;
    }
  }

  async addDataToIndex(index: string, itemId: string, itemDocument: unknown): Promise<void> {
    // console.log("tested");
    try {
      await this.elasticSearchClient!.index({
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
      await this.elasticSearchClient!.update({
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
      await this.elasticSearchClient!.delete({
        index,
        id: itemId
      });
    } catch (error) {
      this.log.log('error', 'ElasticSearchService deleteIndexedData() method error:', error);
    }
  }

  async getDocumentCount(index: string): Promise<number> {
    try {
      const result: CountResponse = await this.elasticSearchClient!.count({ index });
      return result.count;
    } catch (error) {
      this.log.log('error', 'orderService elasticsearch getDocumentCount() method error:', error);
      return 0;
    }
  };

}

// Usage
// const elasticSearchService = new ElasticSearchService();
// elasticSearchService.checkConnection();
