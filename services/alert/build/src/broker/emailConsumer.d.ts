import { Config } from '../config';
import { Channel } from 'amqplib';
declare class EmailConsumer {
    private readonly config;
    private readonly log;
    private readonly alertQueueConnection;
    private readonly mailTransportHelper;
    constructor(config: Config);
    consumeEmailMessages(channel: Channel, exchangeName: string, routingKey: string, queueName: string, template: string): Promise<void>;
    consumeAuthEmailMessages(channel: Channel): Promise<void>;
    consumeorderEmailMessages(channel: Channel): Promise<void>;
}
export { EmailConsumer };
