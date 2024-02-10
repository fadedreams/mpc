"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config2_1 = require("./config2");
const app = (0, express_1.default)();
const port = 3000;
(0, config2_1.logConfigMessage)();
app.get('/', (req, res) => {
    res.send('Hello, this is a simple Express app!');
});
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
