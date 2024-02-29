
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ElasticSearchService } from '@msg/msg/services/elasticSearchService';
import MsgService from '@msg/msg/services/msgService';
import { itemUpdateSchema } from '@msg/msg/schemas/item';
import { BadRequestError, isDataURL, uploads } from '@fadedreams7org1/mpclib';
import { sortBy } from 'lodash';
import { ItemCache } from '@msg/broker/itemCache';
import { messageSchema } from '@msg/msg/schemas/message';
import { IBuyerDocument, ISellerDocument, IMessageDocument, IConversationDocument, IMessageDetails } from '@msg/dto/';

class MsgController {
  private msgService: MsgService;
  private elasticSearchService: ElasticSearchService;

  constructor() {
    this.msgService = new MsgService();
    this.elasticSearchService = new ElasticSearchService();
  }


  public async conversation(req: Request, res: Response): Promise<void> {
    //tested
    const { senderUsername, receiverUsername } = req.params;
    const conversations = await this.msgService.getConversation(senderUsername, receiverUsername);
    res.status(StatusCodes.OK).json({ message: 'Messaging conversation', conversations });
  }

  public async messages(req: Request, res: Response): Promise<void> {
    const { senderUsername, receiverUsername } = req.params;
    const messages = await this.msgService.getMessages(senderUsername, receiverUsername);
    res.status(StatusCodes.OK).json({ message: 'Messaging messages', messages });
  }

  public async conversationList(req: Request, res: Response): Promise<void> {
    const { username } = req.params;
    const conversations = await this.msgService.getUserConversationList(username);
    res.status(StatusCodes.OK).json({ message: 'Conversation list', conversations });
  }

  public async userMessages(req: Request, res: Response): Promise<void> {
    //tested
    // console.log('userMessages', req.params);
    const { conversationId } = req.params;
    const messages = await this.msgService.getUserMessages(conversationId);
    res.status(StatusCodes.OK).json({ message: 'Messaging messages', messages });
  }

  public async offer(req: Request, res: Response): Promise<void> {
    const { messageId, type } = req.body;
    const message = await this.msgService.updateOffer(messageId, type);
    res.status(StatusCodes.OK).json({ message: 'Message updated', singleMessage: message });
  }

  public async markMultipleMessages(req: Request, res: Response): Promise<void> {
    const { messageId, senderUsername, receiverUsername } = req.body;
    await this.msgService.markManyMessagesAsRead(receiverUsername, senderUsername, messageId);
    res.status(StatusCodes.OK).json({ message: 'Messages marked as read' });
  }

  public async markSingleMessage(req: Request, res: Response): Promise<void> {
    //tested
    const { messageId } = req.body;
    const message = await this.msgService.markMessageAsRead(messageId);
    res.status(StatusCodes.OK).json({ message: 'Message marked as read', singleMessage: message });
  }

  public async createMessage(req: Request, res: Response): Promise<void> {
    //tested
    try {
      const body = req.body;
      const message = await this.msgService.createMessage(body);
      res.status(StatusCodes.OK).json({ message: 'Message added', conversationId: body.conversationId, messageData: message });
    } catch (error) {
      if (error instanceof BadRequestError) {
        res.status(StatusCodes.BAD_REQUEST).json({ error: error.serializeErrors() });
      } else {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
      }
    }
  }


}

export default MsgController;
