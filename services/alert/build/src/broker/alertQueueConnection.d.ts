import { Channel } from 'amqplib';
import { Logger } from 'winston';
export declare class AlertQueueConnection {
    private readonly log;
    private readonly rabbitmqEndpoint;
    constructor(log: Logger, rabbitmqEndpoint: string);
    createConnection(): Promise<Channel | undefined>;
    private closeConnection;
}
