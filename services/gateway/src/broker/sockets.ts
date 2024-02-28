import { Server, Socket } from 'socket.io';
import { Logger } from 'winston';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { configInstance as config } from '@gateway/config';
import { GatewayCache } from '@gateway/broker/gatewayCache';
import { io, Socket as SocketClient } from 'socket.io-client';

export class SocketIOAppHandler {
  private io: Server;
  private gatewayCache: GatewayCache;
  private log: Logger;

  constructor(io: Server) {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gateway', 'debug');
    // console.log('in constructor() SocketIOAppHandler sockets.ts ', io);
    this.io = io;
    this.gatewayCache = new GatewayCache();
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewaySocket', 'debug');
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
}
