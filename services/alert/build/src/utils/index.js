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
exports.MailTransportHelper = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const mpclib_1 = require("@fadedreams7org1/mpclib");
class MailTransportHelper {
    constructor(config) {
        this.log = (0, mpclib_1.winstonLogger)(`${config.ELASTIC_SEARCH_URL}`, 'mailTransportHelper', 'debug');
        this.config = config;
    }
    createTransport() {
        return nodemailer_1.default.createTransport({
            host: this.config.EMAIL_HOST,
            auth: {
                user: this.config.SENDER_EMAIL,
                pass: this.config.SENDER_EMAIL_PASSWORD
            }
        });
    }
    sendEmail(receiver) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log.info("Sending email to: " + "receiver: " + receiver);
            // const transporter = this.createTransport();
            // const mailOptions = {
            //   from: this.config.SENDER_EMAIL,
            //   to: receiver,
            //   subject: `Your subject`,
            //   text: `Your text content`
            // };
            //
            // transporter.sendMail(mailOptions, (error, info) => {
            //   if (error) {
            //     console.log(error);
            //   } else {
            //     console.log('Email sent:', info.response);
            //   }
            // });
        });
    }
}
exports.MailTransportHelper = MailTransportHelper;
