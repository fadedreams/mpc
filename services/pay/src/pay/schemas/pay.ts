
import Joi, { ObjectSchema } from 'joi';

const paySchema: ObjectSchema = Joi.object().keys({
  offer: Joi.object({
    itemTitle: Joi.string().required(),
    price: Joi.number().required(),
    description: Joi.string().required(),
    deliveryInDays: Joi.number().required(),
    oldDeliveryDate: Joi.string().required(),
    newDeliveryDate: Joi.string().optional(),
    accepted: Joi.boolean().required(),
    cancelled: Joi.boolean().required()
  }).required(),
  itemId: Joi.string().required(),
  sellerId: Joi.string().required(),
  sellerUsername: Joi.string().required(),
  sellerEmail: Joi.string().required(),
  itemMainTitle: Joi.string().required(),
  itemTitle: Joi.string().required(),
  itemDescription: Joi.string().required(),
  buyerId: Joi.string().required(),
  buyerUsername: Joi.string().required(),
  buyerEmail: Joi.string().required(),
  status: Joi.string().required(),
  payId: Joi.string().required(),
  invoiceId: Joi.string().required(),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
  serviceFee: Joi.number().optional(),
  requirements: Joi.string().optional().allow(null, ''),
  paymentIntent: Joi.string().required(),
  requestExtension: Joi.object({
    originalDate: Joi.string().required(),
    newDate: Joi.string().required(),
    days: Joi.number().required(),
    reason: Joi.string().required()
  }).optional(),
  delivered: Joi.boolean().optional(),
  approvedAt: Joi.string().optional(),
  deliveredWork: Joi.array()
    .items(
      Joi.object({
        message: Joi.string(),
      })
    )
    .optional(),
  datePayed: Joi.string().optional(),
  events: Joi.object({
    placePay: Joi.string(),
    requirements: Joi.string(),
    payStarted: Joi.string(),
    deliverydateUpdate: Joi.string().optional(),
    payDelivered: Joi.string().optional(),
    buyerReview: Joi.string().optional(),
    sellerReview: Joi.string().optional()
  }).optional(),
  buyerReview: Joi.object({
    rating: Joi.number(),
    review: Joi.string()
  }).optional(),
  sellerReview: Joi.object({
    rating: Joi.number(),
    review: Joi.string()
  }).optional()
});

const payUpdateSchema: ObjectSchema = Joi.object().keys({
  originalDate: Joi.string().required(),
  newDate: Joi.string().required(),
  days: Joi.number().required(),
  reason: Joi.string().required(),
  deliveryDateUpdate: Joi.string().optional()
});

export { paySchema, payUpdateSchema };
