import express, { Router, Request, Response, Application } from 'express';
import { StatusCodes } from 'http-status-codes';
import MsgController from '@msg/msg/routes/msgController';  // Adjust the import path based on your project structure
import { verifyGatewayRequest } from './middleware/gatewaymdl';

const router: Router = express.Router();

const BASE_PATH = '/api/v1/msg';

export function initRoutes(app: Application) {
  const msgController = new MsgController();

  router.get('/auth-health', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('msg service is healthy and OK.');
  });
  router.get('/test', (_req: Request, res: Response) => {
    const responseData = {
      message: 'test',
    };
    res.status(StatusCodes.OK).json(responseData);
  });

  router.get('/test2', (_req: Request, res: Response) => {
    res.status(StatusCodes.OK).send('test');
  });

  router.get('/conversation/:senderUsername/:receiverUsername', async (req: Request, res: Response) => {
    await msgController.conversation(req, res);
  });

  router.get('/conversations/:username', async (req: Request, res: Response) => {
    await msgController.conversationList(req, res);
  });
  router.get('/:senderUsername/:receiverUsername', async (req: Request, res: Response) => {
    await msgController.messages(req, res);
  });
  router.get('/:conversationId', async (req: Request, res: Response) => {
    await msgController.userMessages(req, res);
  });
  router.post('/', async (req: Request, res: Response) => {
    await msgController.createMessage(req, res);
  });
  router.put('/offer', async (req: Request, res: Response) => {
    await msgController.offer(req, res);
  });
  router.put('/mark-as-read', async (req: Request, res: Response) => {
    await msgController.markSingleMessage(req, res);
  });
  router.put('/mark-multiple-as-read', async (req: Request, res: Response) => {
  });

  app.use(BASE_PATH, router);

}
