"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../config");
const dotenv_1 = __importDefault(require("dotenv"));
jest.mock('dotenv');
describe('Config', () => {
    beforeEach(() => {
        jest.resetModules(); // Reset modules before each test
    });
    it('should initialize with default values when environment variables are not set', () => {
        const config = new config_1.Config();
        expect(config).toBeInstanceOf(config_1.Config);
        expect(config.NODE_ENV).toBe('test'); // Adjust the expected value accordingly
        // ... other assertions ...
        expect(dotenv_1.default.config).toHaveBeenCalled();
    });
    it('should initialize with provided environment variables', () => {
        process.env.NODE_ENV = 'test';
        process.env.CLIENT_URL = 'http://test-client-url';
        // ... set other environment variables ...
        const config = new config_1.Config();
        expect(config).toBeInstanceOf(config_1.Config);
        expect(config.NODE_ENV).toBe('test');
        expect(config.CLIENT_URL).toBe('http://test-client-url');
        // ... other assertions ...
        expect(dotenv_1.default.config).toHaveBeenCalled();
    });
});
