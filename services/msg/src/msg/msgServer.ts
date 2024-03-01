import 'express-async-errors';
import http from 'http';
import { winstonLogger, IErrorResponse, CustomError } from '@fadedreams7org1/mpclib';
import { isAxiosError } from 'axios';
import { ElasticSearchService } from '@msg/msg/services/elasticSearchService';
import { RabbitMQManager } from '@msg/broker/rabbitMQManager';
import { RedisConnection } from '@msg/broker/redisConnection';
// import { RConsumer } from '@msg/broker/rConsumer';
import { Config } from '@msg/config';
import { Logger } from 'winston';
import client, { Channel, Connection } from 'amqplib';
import { Application, Request, Response, json, urlencoded, NextFunction } from 'express';
import cookieSession from 'cookie-session';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import { initRoutes } from './routes';
import { StatusCodes } from 'http-status-codes';
import { verify } from 'jsonwebtoken';
import { IAuthPayload } from '@msg/dto/auth.d';
import { DatabaseConnector } from '@msg/config';
import MsgService from '@msg/msg/services/msgService';
import { Server } from 'socket.io';
export let socketIOMsgObject: Server;

export class MsgServer {
  private readonly log: Logger;
  // private readonly elasticSearchService: ElasticSearchService;
  private readonly SERVER_PORT: number;
  private readonly rabbitMQManager: RabbitMQManager;
  private readonly redisConnection: RedisConnection;
  // private socketIOMsgObject: Server = {} as Server;

  constructor(
    private readonly config: Config,
    private readonly elasticSearchService: ElasticSearchService,
    private readonly databaseConnector: DatabaseConnector,
  ) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'msg', 'debug');
    this.SERVER_PORT = 3005;
    this.rabbitMQManager = new RabbitMQManager(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
    this.databaseConnector = databaseConnector;
    this.redisConnection = new RedisConnection();
  }

  start(app: Application): void {
    this.initMiddleware(app);
    this.routesMiddleware(app);
    this.errorHandler(app);
    this.startQueues();
    this.startElasticSearch();
    this.startDB();
    this.startRedis();
    this.startServer(app);
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
    initRoutes(app);
  }

  private errorHandler(app: Application): void {
    app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
      this.log.log('error', `MsgService ${error.comingFrom}:`, error);
      if (error instanceof CustomError) {
        res.status(error.statusCode).json(error.serializeErrors());
      }
      next();
    });
  }

  private async startQueues(): Promise<void> {
    await this.rabbitMQManager.initialize();
    const channel = this.rabbitMQManager.getChannel();
    // const emailChannel: Channel = await createConnection() as Channel;
    // await this.rabbitMQManager.consumeEmailMessages(channel, 'mpc-email-auth', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
    // await this.rabbitMQManager.consumePayEmailMessages(channel);
    // await this.rabbitMQManager.consumeItemDirectMessage(channel);


    const msg = JSON.stringify({ username: 'test' });
    channel.publish('mpc-email-auth', 'auth-email', Buffer.from(msg));
    channel.publish('mpc-pay-auth', 'pay-email', Buffer.from(msg));
    // await consumeAuthEmailMessages(emailChannel);
    // await consumePayEmailMessages(emailChannel);
  }

  private startElasticSearch(): void {
    this.elasticSearchService.checkConnection();
    this.elasticSearchService.createIndex('items');
  }

  private startRedis(): void {
    this.redisConnection.connect();
  }
  private startDB(): void {
    this.databaseConnector.connect();
  }

  private async startServer(app: Application): Promise<void> {
    try {
      const httpServer: http.Server = new http.Server(app);
      const socketIO: Server = await this.createSocketIO(httpServer);
      this.startHttpServer(httpServer);
      // this.socketIOMsgObject = socketIO;
      socketIOMsgObject = socketIO;
    } catch (error) {
      this.log.log('error', 'MsgService startServer() method error:', error);
    }
  }

  private async startHttpServer(httpServer: http.Server): Promise<void> {
    try {
      this.log.info(`Gateway server has initiated with process id ${process.pid}`);
      httpServer.listen(this.SERVER_PORT, () => {
        this.log.info(`Gateway server running on port ${this.SERVER_PORT}`);
      });
    } catch (error) {
      this.log.log('error', 'GatewayService startServer() error method:', error);
    }
  }

  private async createSocketIO(httpServer: http.Server): Promise<Server> {
    const io: Server = new Server(httpServer, {
      cors: {
        // origin: `${this.config.CLIENT_URL}`,
        origin: `*`,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      },
      // transports: ['websocket'], // explicitly set transports
    });
    return io;
  }

}

