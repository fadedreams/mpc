import { Config } from '../config';
export declare class ElasticSearchService {
    private readonly log;
    private readonly elasticSearchClient;
    private readonly _config;
    constructor(config: Config);
    checkConnection(): Promise<void>;
}
