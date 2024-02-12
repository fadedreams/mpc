import 'express-async-errors';
import http from 'http';
import { winstonLogger, IErrorResponse, CustomError } from '@fadedreams7org1/mpclib';
import { isAxiosError } from 'axios';
import { ElasticSearchService } from './elasticSearchService';
import { authQueueConnection } from '@auth/broker/authQueueConnection';
import { EmailConsumer } from '@auth/broker/emailConsumer';
import { Config } from '@auth/config';
import { Logger } from 'winston';
import client, { Channel, Connection } from 'amqplib';
import { Application, Request, Response, json, urlencoded, NextFunction } from 'express';
import cookieSession from 'cookie-session';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import { initializeauthRoutes } from './routes';
import { StatusCodes } from 'http-status-codes';
import { verify } from 'jsonwebtoken';
import { IAuthPayload } from './middleware/express.d';

export class authServer {
  private readonly log: Logger;
  // private readonly elasticSearchService: ElasticSearchService;
  private readonly SERVER_PORT: number;
  private readonly authQueueConnection: authQueueConnection;
  // private readonly emailConsumer: EmailConsumer;

  constructor(
    private readonly config: Config,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly emailConsumer: EmailConsumer
  ) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'auth', 'debug');
    this.SERVER_PORT = 3000;
    this.authQueueConnection = new authQueueConnection(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
    this.emailConsumer = new EmailConsumer(this.config);
  }

  start(app: Application): void {
    this.startServer(app);
    this.initMiddleware(app);
    this.routesMiddleware(app);
    this.errorHandler(app);
    this.startQueues();
    this.startElasticSearch();
  }

  private initMiddleware(app: Application): void {
    app.set('trust proxy', 1);
    app.use(
      cookieSession({
        name: 'session',
        keys: [`${this.config.SECRET_KEY_ONE}`, `${this.config.SECRET_KEY_TWO}`],
        maxAge: 24 * 7 * 3600000,
        secure: false,
        sameSite: 'lax'
        // secure: this.config.NODE_ENV !== 'development',
        // ...(this.config.NODE_ENV !== 'development' && {
        //   sameSite: 'none'
        // })
      })
    );
    app.use(hpp());
    // app.use(helmet());
    app.use(cors({
      // origin: this.config.CLIENT_URL,
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    }));

    // Middleware to set security headers manually
    app.use((req, res, next) => {
      // Set Strict-Transport-Security header
      res.setHeader('Strict-Transport-Security', 'max-age=31536000');
      // Set X-Content-Type-Options header
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // Set X-Frame-Options header
      res.setHeader('X-Frame-Options', 'DENY');
      // Set X-XSS-Protection header
      res.setHeader('X-XSS-Protection', '1; mode=block');
      // Call the next middleware in the stack
      next();
    });

    app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        const payload: IAuthPayload = verify(token, this.config.JWT_TOKEN!) as IAuthPayload;
        req.currentUser = payload;
      }
      next();
    });

    app.use(compression());
    app.use(json({ limit: '200mb' }));
    app.use(urlencoded({ extended: true, limit: '200mb' }));
  }

  private routesMiddleware(app: Application): void {
    initializeauthRoutes(app);
  }

  private errorHandler(app: Application): void {
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      this.log.log('error', `AuthService ${error.comingFrom}:`, error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  private async startQueues(): Promise<void> {
    const emailChannel: Channel = await this.authQueueConnection.createConnection() as Channel;
    // const emailChannel: Channel = await createConnection() as Channel;
    await this.emailConsumer.consumeEmailMessages(emailChannel, 'mpc-email-auth', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
    await this.emailConsumer.consumeOrderEmailMessages(emailChannel);
    const msg = JSON.stringify({ username: 'test' });
    emailChannel.publish('mpc-email-auth', 'auth-email', Buffer.from(msg));
    emailChannel.publish('mpc-order-auth', 'order-email', Buffer.from(msg));
    // await consumeAuthEmailMessages(emailChannel);
    // await consumeOrderEmailMessages(emailChannel);
  }

  private startElasticSearch(): void {
    this.elasticSearchService.checkConnection();
  }

  private startServer(app: Application): void {
    try {
      const httpServer: http.Server = new http.Server(app);
      this.log.info(`auth server has initiated with process id ${process.pid}`);
      httpServer.listen(this.SERVER_PORT, () => {
        this.log.info(`auth server running on port ${this.SERVER_PORT}`);
      });
    } catch (error) {
      this.log.log('error', 'auth Service startServer() method:', error);
    }
  }

}

