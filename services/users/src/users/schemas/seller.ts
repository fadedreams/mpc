
import Joi, { ObjectSchema } from 'joi';

const sellerSchema: ObjectSchema = Joi.object().keys({
  fullName: Joi.string().required().messages({
    'string.base': 'Fullname must be of type string',
    'string.empty': 'Fullname is required',
    'any.required': 'Fullname is required'
  }),
  _id: Joi.string().optional(),
  id: Joi.string().optional(),
  username: Joi.string().optional(),
  profilePublicId: Joi.string().optional().allow(null, ''),
  email: Joi.string().optional(),
  profilePicture: Joi.string().required().messages({
    'string.base': 'Please add a profile picture',
    'string.empty': 'Profile picture is required',
    'any.required': 'Profile picture is required'
  }),
  description: Joi.string().required().messages({
    'string.base': 'Please add a seller description',
    'string.empty': 'Seller description is required',
    'any.required': 'Seller description is required'
  }),
  oneliner: Joi.string().required().messages({
    'string.base': 'Please add your oneliner',
    'string.empty': 'Oneliner field is required',
    'any.required': 'Oneliner field is required'
  }),
  responseTime: Joi.number().required().greater(0).messages({
    'string.base': 'Please add a response time',
    'string.empty': 'Response time is required',
    'any.required': 'Response time is required',
    'number.greater': 'Response time must be greater than zero'
  }),
  ratingsCount: Joi.number().optional(),
  ratingCategories: Joi.object({
    five: { value: Joi.number(), count: Joi.number() },
    four: { value: Joi.number(), count: Joi.number() },
    three: { value: Joi.number(), count: Joi.number() },
    two: { value: Joi.number(), count: Joi.number() },
    one: { value: Joi.number(), count: Joi.number() }
  }).optional(),
  ratingSum: Joi.number().optional(),
  recentDelivery: Joi.string().optional().allow(null, ''),
  ongoingJobs: Joi.number().optional(),
  completedJobs: Joi.number().optional(),
  cancelledJobs: Joi.number().optional(),
  totalEarnings: Joi.number().optional(),
  totalItems: Joi.number().optional(),
  createdAt: Joi.string().optional()
});

export { sellerSchema };
