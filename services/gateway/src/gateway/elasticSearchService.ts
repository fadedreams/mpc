import { Client } from '@elastic/elasticsearch';
import { ClusterHealthResponse } from '@elastic/elasticsearch/lib/api/types';
import { Config } from '@gateway/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';

export class ElasticSearchService {
  private readonly log: Logger;
  private readonly elasticSearchClient: Client;
  private readonly _config: Config;

  constructor(config: Config) {
    this._config = config;
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewayElasticSearchServer', 'debug');
    this.elasticSearchClient = new Client({
      node: `${config.ELASTIC_SEARCH_URL}`
    });
  }

  async checkConnection(): Promise<void> {
    let isConnected = false;
    while (!isConnected) {
      try {
        const health: ClusterHealthResponse = await this.elasticSearchClient.cluster.health({});
        this.log.info(`gatewayService Elasticsearch health status - ${health.status}`);
        isConnected = true;
      } catch (error) {
        this.log.error('Connection to Elasticsearch failed. Retrying...');
        this.log.log('error', 'gatewayService checkConnection() method:', error);
      }
    }
  }

}

// Usage
// const elasticSearchService = new ElasticSearchService();
// elasticSearchService.checkConnection();
