export interface IPayOffer {
  [key: string]: string | number | boolean | undefined;
  itemTitle: string;
  price: number;
  description: string;
  deliveryInDays: number;
  oldDeliveryDate: string;
  newDeliveryDate: string;
  accepted: boolean;
  cancelled: boolean;
  reason?: string;
}

export interface IExtendedDelivery {
  originalDate: string;
  newDate: string;
  days: number;
  reason: string;
  deliveryDateUpdate?: string;
}

export interface IDeliveredWork {
  message: string;
  file: string;
  fileType: string;
  fileSize: number;
  fileName: string;
}

export interface IPayEvents {
  placePay: string;
  requirements: string;
  payStarted: string;
  deliveryDateUpdate?: string;
  payDelivered?: string;
  buyerReview?: string;
  sellerReview?: string;
}

export interface IPayReview {
  rating: number;
  review: string;
  date?: string;
}

export interface IPayMessage {
  sellerId?: string;
  buyerId?: string;
  ongoingJobs?: number;
  completedJobs?: number;
  totalEarnings?: number;
  purchasedItems?: string;
  recentDelivery?: string;
  type?: string;
  receiverEmail?: string;
  username?: string;
  template?: string;
  sender?: string;
  offerLink?: string;
  amount?: string;
  buyerUsername?: string;
  sellerUsername?: string;
  title?: string;
  description?: string;
  deliveryDays?: string;
  payId?: string;
  invoiceId?: string;
  payDue?: string;
  requirements?: string;
  payUrl?: string;
  originalDate?: string;
  newDate?: string;
  reason?: string;
  subject?: string;
  header?: string;
  total?: string;
  message?: string;
  serviceFee?: string;
}

export interface IPayDocument {
  offer: IPayOffer;
  itemId: string;
  sellerId: string;
  sellerUsername: string;
  sellerEmail: string;
  itemMainTitle: string;
  itemTitle: string;
  itemDescription: string;
  buyerId: string;
  buyerUsername: string;
  buyerEmail: string;
  status: string;
  payId: string;
  invoiceId: string;
  quantity: number;
  price: number;
  requestExtension?: IExtendedDelivery;
  serviceFee?: number;
  requirements?: string;
  approved?: boolean;
  cancelled?: boolean;
  delivered?: boolean;
  approvedAt?: string;
  deliveredWork?: IDeliveredWork[];
  dateOrdered?: string;
  events: IPayEvents;
  buyerReview?: IPayReview;
  sellerReview?: IPayReview;
  paymentIntent?: string;
}

export interface IPayNotification {
  _id?: string;
  userTo: string;
  senderUsername: string;
  receiverUsername: string;
  isRead?: boolean;
  payId: string;
  type?: string;
  message: string;
  rating?: number;
  createdAt: Date;
}
