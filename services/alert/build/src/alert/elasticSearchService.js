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
exports.ElasticSearchService = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const mpclib_1 = require("@fadedreams7org1/mpclib");
class ElasticSearchService {
    constructor(config) {
        this._config = config;
        this.log = (0, mpclib_1.winstonLogger)(`${config.ELASTIC_SEARCH_URL}`, 'alertElasticSearchServer', 'debug');
        this.elasticSearchClient = new elasticsearch_1.Client({
            node: `${config.ELASTIC_SEARCH_URL}`
        });
    }
    checkConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            let isConnected = false;
            while (!isConnected) {
                try {
                    const health = yield this.elasticSearchClient.cluster.health({});
                    this.log.info(`alertService Elasticsearch health status - ${health.status}`);
                    isConnected = true;
                }
                catch (error) {
                    this.log.error('Connection to Elasticsearch failed. Retrying...');
                    this.log.log('error', 'alertService checkConnection() method:', error);
                }
            }
        });
    }
}
exports.ElasticSearchService = ElasticSearchService;
// Usage
// const elasticSearchService = new ElasticSearchService();
// elasticSearchService.checkConnection();
