
import { IMessageDocument } from '@msg/dto/';
import { Model, Schema, model } from 'mongoose';

const messageSchema: Schema = new Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderUsername: { type: String, required: true, index: true },
    receiverUsername: { type: String, required: true, index: true },
    body: { type: String, default: '' },
    file: { type: String, default: '' },
    fileType: { type: String, default: '' },
    fileSize: { type: String, default: '' },
    fileName: { type: String, default: '' },
    itemId: { type: String, default: '' },
    buyerId: { type: String, required: true },
    sellerId: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    hasOffer: { type: Boolean, default: false },
    offer: {
      itemTitle: { type: String, default: '' },
      price: { type: Number, default: 0 },
      description: { type: String, default: '' },
      deliveryInDays: { type: Number, default: 0 },
      oldDeliveryDate: { type: String, default: '' },
      newDeliveryDate: { type: String, default: '' },
      accepted: { type: Boolean, default: false },
      cancelled: { type: Boolean, default: false }
    },
    createdAt: { type: Date, default: Date.now }
  },
  {
    versionKey: false
  }
);

const MessageModel: Model<IMessageDocument> = model<IMessageDocument>('Message', messageSchema, 'Message');
export { MessageModel };
