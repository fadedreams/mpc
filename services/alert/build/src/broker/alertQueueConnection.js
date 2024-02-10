"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertQueueConnection = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
class AlertQueueConnection {
    constructor(log, rabbitmqEndpoint) {
        this.log = log;
        this.rabbitmqEndpoint = rabbitmqEndpoint;
    }
    createConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const connection = yield amqplib_1.default.connect(this.rabbitmqEndpoint);
                const channel = yield connection.createChannel();
                this.log.info('alert server connected to queue successfully...');
                this.closeConnection(channel, connection);
                return channel;
            }
            catch (error) {
                this.log.log('error', 'alertService error createConnection() method:', error);
                return undefined;
            }
        });
    }
    closeConnection(channel, connection) {
        process.once('SIGINT', () => __awaiter(this, void 0, void 0, function* () {
            yield channel.close();
            yield connection.close();
        }));
    }
}
exports.AlertQueueConnection = AlertQueueConnection;
// Dependency Injection
// const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'alertQueueConnection', 'debug');
// const rabbitmqEndpoint: string = config.RABBITMQ_ENDPOINT;
//
// const alertQueueConnection = new AlertQueueConnection(log, rabbitmqEndpoint);
//
// export { alertQueueConnection };
