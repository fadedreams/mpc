import { Config } from '../config';
declare class MailTransportHelper {
    private log;
    private config;
    constructor(config: Config);
    private createTransport;
    sendEmail(receiver: string): Promise<void>;
}
export { MailTransportHelper };
