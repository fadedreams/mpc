
import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
// import authRoutes from './auth_routes';
import { initAuthRoutes } from './auth_routes'; // Assuming the path to auth_routes is correct
import bsRoutes from './buyer_seller_routes';
import searchRoutes from './search_routes';
import itemRoutes from './item_routes';
import orderRoutes from './order_routes';

import { Server } from 'socket.io';
const router: Router = express.Router();
const BASE_PATH = '/api/v1/gateway';

export function initRoutes(app: Application, socketIO: Server) {
  // console.log(' in initRoutes ', socketIO);
  // router.use('', authRoutes);
  const authRoutes = initAuthRoutes(socketIO);
  router.use('/auth', authRoutes);
  router.use('/auth/search/item', searchRoutes);

  router.use('', bsRoutes);
  router.use('/item', itemRoutes);

  router.use('/order', orderRoutes);

  //testing events socket
  // router.get('/event', async (_req: Request, res: Response) => {
  //   // Assuming you have access to the socketIO instance
  //   console.log('Sending event from server to clients');
  //   const eventData = { message: 'Hello from the server!' };
  //   // Emit an event to all connected clients
  //   socketIO.emit('getLoggedInUsers', eventData);
  //   // Other route handling logic
  //   res.send('Response from the route');
  // });


  app.use(BASE_PATH, router);
}
