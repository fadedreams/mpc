
import Joi, { ObjectSchema } from 'joi';

const orderSchema: ObjectSchema = Joi.object().keys({
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
  orderId: Joi.string().required(),
  invoiceId: Joi.string().required(),
  quantity: Joi.number().required(),
  price: Joi.number().required(),
  serviceFee: Joi.number().optional(),
  requirements: Joi.string().optional().allow(null, ''),
  ordermentIntent: Joi.string().required(),
  delivered: Joi.boolean().optional(),
  cancelled: Joi.boolean().optional(),
  approvedAt: Joi.string().optional(),
  deliveredWork: Joi.array()
    .items(
      Joi.object({
        message: Joi.string(),
      })
    )
    .optional(),
  dateordered: Joi.string().optional(),

  events: Joi.object({
    placeorder: Joi.string().allow(''),  // Allow empty string
    requirements: Joi.string().allow(''),
    orderStarted: Joi.string().allow(''),
    deliveryDateUpdate: Joi.string().allow(''),
    orderDelivered: Joi.string().allow(''),
    buyerReview: Joi.string().allow(''),
    sellerReview: Joi.string().allow('')
  }).optional(),

  buyerReview: Joi.object({
    rating: Joi.number(),
    review: Joi.string().allow(''),
    created: Joi.date().optional()  // Include if it's part of your data model
  }).optional(),

  sellerReview: Joi.object({
    rating: Joi.number(),
    review: Joi.string().allow(''),
    created: Joi.date().optional()  // Include if it's part of your data model
  }).optional(),
});

const orderUpdateSchema: ObjectSchema = Joi.object().keys({
  originalDate: Joi.string().required(),
  newDate: Joi.string().required(),
  days: Joi.number().required(),
  reason: Joi.string().required(),
  deliveryDateUpdate: Joi.string().optional()
});

export { orderSchema, orderUpdateSchema };
