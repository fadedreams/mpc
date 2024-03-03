
import { IOrderNotification } from '@order/dto';
import { model, Model, Schema } from 'mongoose';

const notificationModelSchema: Schema = new Schema({
  userTo: { type: String, default: '', index: true },
  senderUsername: { type: String, default: '' },
  receiverUsername: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  message: { type: String, default: '' },
  orderId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const NotificationModelSchema: Model<IOrderNotification> = model<IOrderNotification>(
  'orderNotification',
  notificationModelSchema,
  'orderNotification'
);
export { NotificationModelSchema };
