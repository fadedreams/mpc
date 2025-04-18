import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';
import { ElasticSearchService } from '@msg/msg/services/elasticSearchService';
import MsgService from '@msg/msg/services/msgService';
import { itemUpdateSchema } from '@msg/msg/schemas/item';
import { BadRequestError, isDataURL, uploads } from '@fadedreams7org1/mpclib';
import SearchService from '@msg/msg/services/searchService';
import { ISellerDocument, ISellerItem, ISearchResult, IPaginateProps, IHitsTotal } from '@msg/dto/';
import { sortBy } from 'lodash';
import { ItemCache } from '@msg/broker/itemCache';

class MsgController {
  private msgService: MsgService;
  private elasticSearchService: ElasticSearchService;

  constructor() {
    this.msgService = new MsgService();
    this.elasticSearchService = new ElasticSearchService();
  }

  public async conversation(req: Request, res: Response): Promise<void> {
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
    const { conversationId } = req.params;
    const messages = await this.msgService.getUserMessages(conversationId);
    res.status(StatusCodes.OK).json({ message: 'Messaging messages', messages });
  }

  // public async itemCreate(req: Request, res: Response): Promise<void> {
  //   const count: number = await this.elasticSearchService.getDocumentCount('items');
  //   const item: ISellerItem = {
  //     sellerId: req.body.sellerId,
  //     username: req.body.username,
  //     email: req.body.email,
  //     // username: req.currentUser!.username,
  //     // email: req.currentUser!.email,
  //     // username: "a",
  //     // email: "a@a.com",
  //     title: req.body.title,
  //     description: req.body.description,
  //     categories: req.body.categories,
  //     subCategories: req.body.subCategories,
  //     tags: req.body.tags,
  //     price: req.body.price,
  //     expectedDelivery: req.body.expectedDelivery,
  //     Title: req.body.Title,
  //     Description: req.body.Description,
  //     sortId: count + 1
  //   };
  //   const createdItem: ISellerItem = await this.itemService.createItem(item);
  //   res.status(StatusCodes.CREATED).json({ message: 'Item created successfully.', item: createdItem });
  // };

}

export default MsgController;
