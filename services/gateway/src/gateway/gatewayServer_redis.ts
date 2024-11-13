import 'express-async-errors';
import http from 'http';
import { winstonLogger, IErrorResponse, CustomError } from '@fadedreams7org1/mpclib';
import { isAxiosError } from 'axios';
// import { ElasticSearchService } from '@gateway/gateway/services/elasticSearchService';
import { gatewayQueueConnection } from '@gateway/broker/gatewayQueueConnection';
import { EmailConsumer } from '@gateway/broker/emailConsumer';
import { Config } from '@gateway/config';
import { Logger } from 'winston';
import client, { Channel, Connection } from 'amqplib';
import { Application, Request, Response, json, urlencoded, NextFunction } from 'express';
import cookieSession from 'cookie-session';
import cors from 'cors';
import hpp from 'hpp';
import helmet from 'helmet';
import compression from 'compression';
import { initRoutes } from '@gateway/gateway/routes/routes';
import { StatusCodes } from 'http-status-codes';
import { RedisConnection } from '@gateway/broker/redisConnection';

import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { SocketIOAppHandler } from '@gateway/broker/sockets';
import { Server } from 'socket.io';
import session from 'express-session';
// import { authClient, authAxios } from '@gateway/utils/authClient';


export class gatewayServer {
    private readonly log: Logger;
    // private readonly elasticSearchService: ElasticSearchService;
    private readonly SERVER_PORT: number;
    private readonly gatewayQueueConnection: gatewayQueueConnection;
    private readonly redisConnection: RedisConnection
    public socketIO: Server = {} as Server //will be init in createSocketIO
    // private readonly emailConsumer: EmailConsumer;

    constructor(
        private readonly config: Config,
        // private readonly elasticSearchService: ElasticSearchService,
        private readonly emailConsumer: EmailConsumer,

    ) {
        this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway', 'debug');
        this.SERVER_PORT = 3000;
        this.gatewayQueueConnection = new gatewayQueueConnection(this.log, config.RABBITMQ_ENDPOINT ?? 'amqp://localhost');
        this.emailConsumer = new EmailConsumer(this.config);
        this.redisConnection = new RedisConnection();

    }

    start(app: Application): void {
        this.startQueues();
        // this.startElasticSearch();
        this.startRedis();
        // this.routesMiddleware(app);
        // this.initMiddleware(app);
        // this.errorHandler(app);
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

            res.setHeader('Access-Control-Allow-Credentials', 'true');
            // Call the next middleware in the stack
            next();
        });

        app.use(compression());
        app.use(json({ limit: '200mb' }));
        app.use(urlencoded({ extended: true, limit: '200mb' }));

        // app.use((req: Request, _res: Response, next: NextFunction) => {
        //   if (req.session?.jwt) {
        //     console.log("req.session.jwt", req.session?.jwt);
        //     authAxios.defaults.headers['Authorization'] = `Bearer ${req.session?.jwt}`;
        //   }
        //   next();
        // });

    }

    private routesMiddleware(app: Application): void {
        // console.log(' in routesMiddleware ', this.socketIO);
        initRoutes(app, this.socketIO);
    }

    private errorHandler(app: Application): void {
        app.use('*', (req: Request, res: Response, next: NextFunction) => {
            const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
            this.log.log('error', `${fullUrl} Endpoint is not present.`, '');
            res.status(StatusCodes.NOT_FOUND).json({ message: 'The requested endpoint is not available' });
            next();
        });

        app.use((error: IErrorResponse, _req: Request, res: Response, next: NextFunction) => {
            if (error instanceof CustomError) {
                this.log.log('error', `GatewayService ${error.comingFrom}:`, error);
                res.status(error.statusCode).json(error.serializeErrors());
            }

            if (isAxiosError(error)) {
                this.log.log('error', ` Error from Axios in the GatewayService. - ${error?.response?.data?.comingFrom}:`, error);
                res.status(error?.response?.data?.statusCode ?? 500).json({ message: error?.response?.data?.message ?? 'Error occurred.' });
            }

            next();
        });
    }

    private async startQueues(): Promise<void> {
        const emailChannel: Channel = await this.gatewayQueueConnection.createConnection() as Channel;
        // const emailChannel: Channel = await createConnection() as Channel;
        await this.emailConsumer.consumeEmailMessages(emailChannel, 'mpc-email-gateway', 'auth-email', 'auth-email-queue', 'authEmailTemplate');
        await this.emailConsumer.consumeorderEmailMessages(emailChannel);
        const msg = JSON.stringify({ username: 'test' });
        emailChannel.publish('mpc-email-gateway', 'auth-email', Buffer.from(msg));
        emailChannel.publish('mpc-order-gateway', 'order-email', Buffer.from(msg));
        // await consumeAuthEmailMessages(emailChannel);
        // await consumeorderEmailMessages(emailChannel);
    }

    // private startElasticSearch(): void {
    // this.elasticSearchService.checkConnection();
    // }

    private startRedis(): void {
        this.redisConnection.connect();
    }


    private async startServerOld(app: Application) {
        try {
            const httpServer: http.Server = new http.Server(app);
            this.log.info(`Gateway server has initiated with process id ${process.pid}`);
            const socketIO: Server = new Server(httpServer, {
                cors: {
                    // origin: `${this.config.CLIENT_URL}`,
                    origin: '*',
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
                }
            });
            const pubClient = createClient({ url: this.config.REDIS_HOST });
            const subClient = pubClient.duplicate();
            await Promise.all([pubClient.connect(), subClient.connect()]);
            //todo
            socketIO.adapter(createAdapter(pubClient, subClient));
            this.socketIO = socketIO;
            // console.log(' in startServer ', this.socketIO);
            this.listenForConnections();
            const socketIoApp = new SocketIOAppHandler(this.socketIO);
            // socketIoApp.listen();

            this.initMiddleware(app);
            initRoutes(app, this.socketIO);
            this.errorHandler(app);

            httpServer.listen(this.SERVER_PORT, () => {
                this.log.info(`gateway server running on port ${this.SERVER_PORT}`);
            });

        } catch (error) {
            this.log.log('error', 'gateway Service startServer() method:', error);
        }
    }

    private async startServer(app: Application): Promise<void> {
        try {
            const httpServer: http.Server = new http.Server(app);
            const socketIO: Server = await this.createSocketIO(httpServer);
            app.get('/', (req, res) => res.sendFile(__dirname + '/socket_test.html'));
            this.initMiddleware(app);
            initRoutes(app, this.socketIO);
            this.errorHandler(app);
            // console.log(__dirname);
            this.startHttpServer(httpServer);
            this.socketIOConnections(socketIO);
        } catch (error) {
            this.log.log('error', 'Error in the startServer() method of the GatewayService.', error);
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
        const pubClient = createClient({ url: this.config.REDIS_HOST });
        const subClient = pubClient.duplicate();
        await Promise.all([pubClient.connect(), subClient.connect()]);
        io.adapter(createAdapter(pubClient, subClient));
        this.socketIO = io;

        return io;
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

    private socketIOConnections(io: Server): void {
        const socketIoApp = new SocketIOAppHandler(io);
        socketIoApp.listen();
        // this.listenForConnections();
    }

    private listenForConnections(): void {
        console.log('in listenForConnections()');
        this.socketIO.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            socket.on('getLoggedInUsers', (msg) => {
                // Log any messages received from the client
                console.log('Message received: ' + msg);
            });

            // Add your socket event handlers here
        });
    }

}

