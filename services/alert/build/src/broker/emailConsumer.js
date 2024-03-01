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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailConsumer = void 0;
const mpclib_1 = require("@fadedreams7org1/mpclib");
// import { createConnection } from '@alert/queues/connection';
// import { sendEmail } from '@alert/queues/mail.transport';
const alertQueueConnection_1 = require("../broker/alertQueueConnection");
const utils_1 = require("../utils");
class EmailConsumer {
    constructor(config) {
        var _a;
        this.config = config;
        this.log = (0, mpclib_1.winstonLogger)(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug'),
            this.alertQueueConnection = new alertQueueConnection_1.AlertQueueConnection(this.log, (_a = config.RABBITMQ_ENDPOINT) !== null && _a !== void 0 ? _a : 'amqp://localhost'),
            this.mailTransportHelper = new utils_1.MailTransportHelper(this.config);
    }
    consumeEmailMessages(channel, exchangeName, routingKey, queueName, template) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!channel) {
                    // channel = await createConnection() as Channel;
                    channel = (yield this.alertQueueConnection.createConnection());
                }
                yield channel.assertExchange(exchangeName, 'direct');
                const mpcQueue = yield channel.assertQueue(queueName, { durable: true, autoDelete: false });
                yield channel.bindQueue(mpcQueue.queue, exchangeName, routingKey);
                // await this.mailTransportHelper.sendEmail("t@t.com");
                channel.consume(mpcQueue.queue, (msg) => __awaiter(this, void 0, void 0, function* () {
                    console.log("consumed ", msg === null || msg === void 0 ? void 0 : msg.content.toString());
                    const messageData = JSON.parse(msg.content.toString());
                    console.log(messageData.username);
                    // this.log.info("Sending email to: " + messageData.username, "receiver: " + messageData.receiver);
                    // this.mailTransportHelper.sendEmail(messageData.receiver);
                    channel.ack(msg);
                }));
            }
            catch (error) {
                this.log.log('error', `alertService EmailConsumer consumeEmailMessages() method error: ${error}`);
            }
        });
    }
    consumeAuthEmailMessages(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.consumeEmailMessages(channel, 'mpc-email-alert', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
        });
    }
    consumePayEmailMessages(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.consumeEmailMessages(channel, 'mpc-pay-alert', 'pay-email', 'pay-email-queue', 'orderPlaced');
        });
    }
}
exports.EmailConsumer = EmailConsumer;
