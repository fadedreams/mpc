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
exports.AlertServer = void 0;
require("express-async-errors");
const http_1 = __importDefault(require("http"));
const mpclib_1 = require("@fadedreams7org1/mpclib");
const alertQueueConnection_1 = require("../broker/alertQueueConnection");
const emailConsumer_1 = require("../broker/emailConsumer");
const routes_1 = require("../alert/routes");
class AlertServer {
    // private readonly emailConsumer: EmailConsumer;
    constructor(config, elasticSearchService, emailConsumer) {
        var _a;
        this.config = config;
        this.elasticSearchService = elasticSearchService;
        this.emailConsumer = emailConsumer;
        this.log = (0, mpclib_1.winstonLogger)(`${config.ELASTIC_SEARCH_URL}`, 'alert', 'debug');
        this.SERVER_PORT = 3001;
        this.alertQueueConnection = new alertQueueConnection_1.AlertQueueConnection(this.log, (_a = config.RABBITMQ_ENDPOINT) !== null && _a !== void 0 ? _a : 'amqp://localhost');
        this.emailConsumer = new emailConsumer_1.EmailConsumer(this.config);
    }
    start(app) {
        this.startServer(app);
        app.use('', (0, routes_1.healthRoutes)());
        this.startQueues();
        this.startElasticSearch();
    }
    startQueues() {
        return __awaiter(this, void 0, void 0, function* () {
            const emailChannel = yield this.alertQueueConnection.createConnection();
            // const emailChannel: Channel = await createConnection() as Channel;
            yield this.emailConsumer.consumeEmailMessages(emailChannel, 'mpc-email-alert', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
            yield this.emailConsumer.consumePayEmailMessages(emailChannel);
            const msg = JSON.stringify({ username: 'test' });
            emailChannel.publish('mpc-email-alert', 'auth-email', Buffer.from(msg));
            emailChannel.publish('mpc-pay-alert', 'pay-email', Buffer.from(msg));
            // await consumeAuthEmailMessages(emailChannel);
            // await consumePayEmailMessages(emailChannel);
        });
    }
    startElasticSearch() {
        this.elasticSearchService.checkConnection();
    }
    startServer(app) {
        try {
            const httpServer = new http_1.default.Server(app);
            this.log.info(`Worker with process id of ${process.pid} on alert server has started`);
            httpServer.listen(this.SERVER_PORT, () => {
                this.log.info(`alert server running on port ${this.SERVER_PORT}`);
            });
        }
        catch (error) {
            this.log.log('error', 'Alert Service startServer() method:', error);
        }
    }
}
exports.AlertServer = AlertServer;
