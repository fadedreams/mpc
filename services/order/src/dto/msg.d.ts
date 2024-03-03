
import mongoose, { ObjectId } from 'mongoose';
import { IOffer } from './order.d';
import { ISellerItem } from './item.d';
import { ISellerDocument } from './seller.d';

export interface IConversationDocument extends Document {
  _id: mongoose.Types.ObjectId | string;
  conversationId: string;
  senderUsername: string;
  receiverUsername: string;
}

export interface IMessageDocument {
  _id?: string | ObjectId;
  conversationId?: string;
  body?: string;
  url?: string;
  MsgId?: string;
  itemId?: string;
  sellerId?: string;
  buyerId?: string;
  senderUsername?: string;
  receiverUsername?: string;
  isRead?: boolean;
  hasOffer?: boolean;
  offer?: IOffer;
  hasConversationId?: boolean;
  createdAt?: Date | string;
}

export interface IMessageDetails {
  sender?: string;
  offerLink?: string;
  amount?: string;
  buyerUsername?: string;
  sellerUsername?: string;
  title?: string;
  description?: string;
  deliveryDays?: string;
  template?: string;
}

export interface IMsgBoxProps {
  seller: IMsgSellerProps;
  buyer: IMsgBuyerProps
  MsgId: string;
  onClose: () => void;
}

export interface IMsgSellerProps {
  _id: string;
  username: string;
  responseTime: number;
}

export interface IMsgBuyerProps {
  _id: string;
  username: string;
}

export interface IMsgMessageProps {
  message: IMessageDocument;
  seller?: ISellerDocument;
  Msg?: ISellerItem;
}

