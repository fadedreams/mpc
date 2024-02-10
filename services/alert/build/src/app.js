"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mpclib_1 = require("@fadedreams7org1/mpclib");
const express_1 = __importDefault(require("express"));
const config_1 = require("./config");
const alertServer_1 = require("./alert/alertServer");
const elasticSearchService_1 = require("./alert/elasticSearchService");
const emailConsumer_1 = require("./broker/emailConsumer");
class AlertApp {
    constructor(config, elasticSearchService, emailConsumer) {
        this.config = config;
        this.alertServer = new alertServer_1.AlertServer(config, elasticSearchService, emailConsumer);
        this.log = (0, mpclib_1.winstonLogger)(`${config.ELASTIC_SEARCH_URL}`, 'alertApp', 'debug');
    }
    initialize() {
        const app = (0, express_1.default)();
        this.alertServer.start(app);
        this.log.info('alert Service Initialized');
    }
}
const config = config_1.Config.getInstance();
const emailConsumer = new emailConsumer_1.EmailConsumer(config);
const elasticSearchService = new elasticSearchService_1.ElasticSearchService(config);
const alertApp = new AlertApp(config, elasticSearchService, emailConsumer);
alertApp.initialize();
