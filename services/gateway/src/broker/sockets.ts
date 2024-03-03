import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { configInstance as config } from '@gateway/config';
import { GatewayCache } from '@gateway/broker/gatewayCache';
import { io as ioClient, Socket as SocketClient } from 'socket.io-client';
import { IMessageDocument } from '@gateway/dto';

export class SocketIOAppHandler {
  private io: Server;
  private gatewayCache: GatewayCache;
  private log: Logger;
  private msgSocketClient: SocketClient = {} as SocketClient;
  private orderSocketClient: SocketClient = {} as SocketClient;

  constructor(io: Server) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway', 'debug');
    // console.log('in constructor() SocketIOAppHandler sockets.ts ', io);
    this.io = io;
    this.gatewayCache = new GatewayCache();
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewaySocket', 'debug');
    this.msgSocketServiceIOConnections();
    this.orderSocketServiceIOConnections();
  }

  //behave as a server for frontend
  public listen(): void {
    console.log('in listen() sockets.ts');
    // console.log('in listen() sockets.ts', this.io);
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);
      socket.on('getLoggedInUsers', async () => {
        console.log('Received getLoggedInUsers event from client');
        const response: string[] = await this.gatewayCache.getLoggedInUserFromCache('loggedInUsers');
        this.io.emit('online', response);
      });

      socket.on('loggedInUsers', async (username: string) => {
        console.log('in loggedInUsers listen sockets.ts');
        const response: string[] = await this.gatewayCache.saveLoggedInUser2Cache('loggedInUsers', username);
        this.io.emit('online', response);
      });

      socket.on('removeLoggedInUser', async (username: string) => {
        const response: string[] = await this.gatewayCache.removeLoggedInUserFromCache('loggedInUsers', username);
        this.io.emit('online', response);
      });

      socket.on('category', async (category: string, username: string) => {
        await this.gatewayCache.saveUserSelectedItemCategory(`selectedCategories:${username}`, category);
      });

    });
  }

  //behave as a client for msg micro
  private msgSocketServiceIOConnections(): void {
    this.msgSocketClient = ioClient(`${config.MSG_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true
    });

    this.msgSocketClient.on('connect', () => {
      this.log.info('MsgService socket connected');
    });


    // this.msgSocketClient.on('connect_error', (error: Error) => {
    //   this.log.log('error', 'MsgService socket connection error:', error);
    //   this.msgSocketClient.connect();
    // });

    this.msgSocketClient.on('message received', (data: IMessageDocument) => {
      this.io.emit('message received', data);
    });

    this.msgSocketClient.on('message updated', (data: IMessageDocument) => {
      this.io.emit('message updated', data);
    });

  }

  //behave as a client for order micro
  private orderSocketServiceIOConnections(): void {
    this.orderSocketClient = ioClient(`${config.order_BASE_URL}`, {
      transports: ['websocket', 'polling'],
      secure: true
    });

    this.orderSocketClient.on('connect', () => {
      this.log.info('orderService socket connected');
    });

    this.orderSocketClient.on('disconnect', (reason: SocketClient.DisconnectReason) => {
      this.log.log('error', 'orderSocket disconnect reason:', reason);
      this.msgSocketClient.connect();
    });

    // this.orderSocketClient.on('connect_error', (error: Error) => {
    //   this.log.log('error', 'orderService socket connection error:', error);
    //   this.msgSocketClient.connect();
    // });

  }

}
