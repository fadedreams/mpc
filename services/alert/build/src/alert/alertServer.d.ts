import 'express-async-errors';
import { ElasticSearchService } from './elasticSearchService';
import { EmailConsumer } from '../broker/emailConsumer';
import { Application } from 'express';
import { Config } from '../config';
export declare class AlertServer {
    private readonly config;
    private readonly elasticSearchService;
    private readonly emailConsumer;
    private readonly log;
    private readonly SERVER_PORT;
    private readonly alertQueueConnection;
    constructor(config: Config, elasticSearchService: ElasticSearchService, emailConsumer: EmailConsumer);
    start(app: Application): void;
    private startQueues;
    private startElasticSearch;
    private startServer;
}
