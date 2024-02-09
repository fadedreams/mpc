import path from 'path';
import nodemailer, { Transporter } from 'nodemailer';
import Email from 'email-templates';
import { IEmailLocals, winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { Config } from '@alert/config';

class MailTransportHelper {
  private log: Logger;
  private config: Config;

  constructor(config: Config) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransportHelper', 'debug');
    this.config = config;
  }

  private createTransport(): Transporter {
    return nodemailer.createTransport({
      host: this.config.EMAIL_HOST,
      auth: {
        user: this.config.SENDER_EMAIL,
        pass: this.config.SENDER_EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(receiver: string): Promise<void> {
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
  }
}

export { MailTransportHelper };
