import { ConversationModel, MessageModel } from '@msg/msg/models';
import { IBuyerDocument, ISellerDocument, IMessageDocument, IConversationDocument, IMessageDetails } from '@msg/dto/';
import { ElasticSearchService } from '@msg/msg/services/elasticSearchService';
import { RabbitMQManager } from '@msg/broker/rabbitMQManager';
import { configInstance as config } from '@msg/config';
import { winstonLogger, IErrorResponse, CustomError, BadRequestError } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { lowerCase } from 'lodash'; // Assuming you are using lodash for lowerCase
import { socketIOMsgObject } from '@msg/msg/msgServer';
import { messageSchema } from '@msg/msg/schemas/message';
import crypto from 'crypto';

class MsgService {
  private readonly elasticSearchService: ElasticSearchService;
  private readonly log: Logger;
  private readonly rabbitMQManager?: RabbitMQManager;

  constructor(rabbitMQManager?: RabbitMQManager) {
    this.elasticSearchService = new ElasticSearchService();
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'items', 'debug');
    this.rabbitMQManager = rabbitMQManager;
  }


  // Create a new conversation
  public async createConversation(conversationId: string, sender: string, receiver: string): Promise<void> {
    await ConversationModel.create({
      conversationId,
      senderUsername: sender,
      receiverUsername: receiver
    });
  }

  // Add a new message
  public async addMessage(data: IMessageDocument): Promise<IMessageDocument> {
    const message: IMessageDocument = await MessageModel.create(data) as IMessageDocument;
    if (data.hasOffer) {
      const emailMessageDetails: IMessageDetails = {
        sender: data.senderUsername,
        amount: `${data.offer?.price}`,
        buyerUsername: lowerCase(`${data.receiverUsername}`),
        sellerUsername: lowerCase(`${data.senderUsername}`),
        title: data.offer?.itemTitle,
        description: data.offer?.description,
        deliveryDays: `${data.offer?.deliveryInDays}`,
        template: 'offer'
      };
      // Send email
      if (this.rabbitMQManager) {
        await this.rabbitMQManager.publishDirectMessage(
          // await publishDirectMessage(
          'mpc-order-alert',
          'order-email',
          JSON.stringify(emailMessageDetails),
          'Order email sent to alert service.'
        );
      }
    }
    socketIOMsgObject.emit('message received', message);
    return message;
  }

  // Get conversation between sender and receiver
  public async getConversation(sender: string, receiver: string): Promise<IConversationDocument[]> {
    const query = {
      $or: [
        { senderUsername: sender, receiverUsername: receiver },
        { senderUsername: receiver, receiverUsername: sender },
      ]
    };
    const conversation: IConversationDocument[] = await ConversationModel.aggregate([{ $match: query }]);
    return conversation;
  }

  // Get list of conversations for a user
  public async getUserConversationList(username: string): Promise<IMessageDocument[]> {
    const query = {
      $or: [
        { senderUsername: username },
        { receiverUsername: username },
      ]
    };
    const messages: IMessageDocument[] = await MessageModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$conversationId',
          result: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: {
          newRoot: '$result'
        }
      }
    ]);
    return messages;
  }

  // Get all messages between sender and receiver
  public async getMessages(sender: string, receiver: string): Promise<IMessageDocument[]> {
    const query = {
      $or: [
        { senderUsername: sender, receiverUsername: receiver },
        { senderUsername: receiver, receiverUsername: sender },
      ]
    };
    const messages: IMessageDocument[] = await MessageModel.aggregate([
      { $match: query },
      { $sort: { createdAt: 1 } }
    ]);
    return messages;
  }

  // Get messages for a specific conversation
  public async getUserMessages(messageConversationId: string): Promise<IMessageDocument[]> {
    const messages: IMessageDocument[] = await MessageModel.aggregate([
      { $match: { conversationId: messageConversationId } },
      { $sort: { createdAt: 1 } }
    ]);
    return messages;
  }

  // Update offer status in a message
  public async updateOffer(messageId: string, type: string): Promise<IMessageDocument> {
    const message: IMessageDocument = await MessageModel.findOneAndUpdate(
      { _id: messageId },
      {
        $set: {
          [`offer.${type}`]: true
        }
      },
      { new: true }
    ) as IMessageDocument;
    return message;
  }

  // Mark a message as read
  public async markMessageAsRead(messageId: string): Promise<IMessageDocument> {
    const message: IMessageDocument = await MessageModel.findOneAndUpdate(
      { _id: messageId },
      {
        $set: {
          isRead: true
        }
      },
      { new: true }
    ) as IMessageDocument;
    // Emit a socket.io event
    socketIOMsgObject.emit('message updated', message);
    return message;
  }

  // Mark many messages as read
  public async markManyMessagesAsRead(receiver: string, sender: string, messageId: string): Promise<IMessageDocument> {
    await MessageModel.updateMany(
      { senderUsername: sender, receiverUsername: receiver, isRead: false },
      {
        $set: {
          isRead: true
        }
      },
    ) as IMessageDocument;
    const message: IMessageDocument = await MessageModel.findOne({ _id: messageId }).exec() as IMessageDocument;
    // Emit a socket.io event
    socketIOMsgObject.emit('message updated', message);
    return message;
  }

  public async createMessage(body: any): Promise<IMessageDocument> {
    const { error } = await Promise.resolve(messageSchema.validate(body));
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'messageSchema unvalidated Create message() method');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    let result;

    const messageData: IMessageDocument = {
      conversationId: body.conversationId,
      body: body.body,
      itemId: body.itemId,
      buyerId: body.buyerId,
      sellerId: body.sellerId,
      senderUsername: body.senderUsername,
      receiverUsername: body.receiverUsername,
      isRead: body.isRead,
      hasOffer: body.hasOffer,
      offer: body.offer
    };

    if (!body.hasConversationId) {
      await this.createConversation(`${messageData.conversationId}`, `${messageData.senderUsername}`, `${messageData.receiverUsername}`);
    }

    const createdMessage: IMessageDocument = await this.addMessage(messageData);
    socketIOMsgObject.emit('message received', createdMessage);

    return createdMessage;
  }
}

export default MsgService;
