export declare class Config {
    private static instance;
    NODE_ENV: string | undefined;
    CLIENT_URL: string | undefined;
    SENDER_EMAIL: string | undefined;
    SENDER_EMAIL_PASSWORD: string | undefined;
    RABBITMQ_ENDPOINT: string | undefined;
    ELASTIC_SEARCH_URL: string | undefined;
    EMAIL_HOST: string | undefined;
    constructor();
    static getInstance(): Config;
}
