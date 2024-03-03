
import Joi, { ObjectSchema } from 'joi';

const itemCreateSchema: ObjectSchema = Joi.object().keys({
  sellerId: Joi.string().required().messages({
    'string.base': 'Seller Id must be of type string',
    'string.empty': 'Seller Id is required',
    'any.required': 'Seller Id is required'
  }),
  title: Joi.string().required().messages({
    'string.base': 'Please add a item title',
    'string.empty': 'item title is required',
    'any.required': 'item title is required'
  }),
  description: Joi.string().required().messages({
    'string.base': 'Please add a item description',
    'string.empty': 'item description is required',
    'any.required': 'item description is required'
  }),
  categories: Joi.string().required().messages({
    'string.base': 'Please select a category',
    'string.empty': 'item category is required',
    'any.required': 'item category is required'
  }),
  subCategories: Joi.array().items(Joi.string()).required().min(1).messages({
    'string.base': 'Please add at least one subcategory',
    'string.empty': 'item subcategories are required',
    'any.required': 'item subcategories are required',
    'array.min': 'Please add at least one subcategory'
  }),
  tags: Joi.array().items(Joi.string()).required().min(1).messages({
    'string.base': 'Please add at least one tag',
    'string.empty': 'item tags are required',
    'any.required': 'item tags are required',
    'array.min': 'Please add at least one tag'
  }),
  price: Joi.number().required().greater(4.99).messages({
    'string.base': 'Please add a item price',
    'string.empty': 'item price is required',
    'any.required': 'item price is required',
    'number.greater': 'item price must be greater than $4.99'
  }),
  expectedDelivery: Joi.string().required().messages({
    'string.base': 'Please add expected delivery',
    'string.empty': 'item expected delivery is required',
    'any.required': 'item expected delivery is required',
    'array.min': 'Please add a expected delivery'
  }),
  Title: Joi.string().required().messages({
    'string.base': 'Please add basic title',
    'string.empty': 'item basic title is required',
    'any.required': 'item basic title is required',
    'array.min': 'Please add a basic title'
  }),
  Description: Joi.string().required().messages({
    'string.base': 'Please add basic description',
    'string.empty': 'item basic description is required',
    'any.required': 'item basic description is required',
    'array.min': 'Please add a basic description'
  })
});

const itemUpdateSchema: ObjectSchema = Joi.object().keys({
  title: Joi.string().required().messages({
    'string.base': 'Please add a item title',
    'string.empty': 'item title is required',
    'any.required': 'item title is required'
  }),
  description: Joi.string().required().messages({
    'string.base': 'Please add a item description',
    'string.empty': 'item description is required',
    'any.required': 'item description is required'
  }),
  categories: Joi.string().required().messages({
    'string.base': 'Please select a category',
    'string.empty': 'item category is required',
    'any.required': 'item category is required'
  }),
  subCategories: Joi.array().items(Joi.string()).required().min(1).messages({
    'string.base': 'Please add at least one subcategory',
    'string.empty': 'item subcategories are required',
    'any.required': 'item subcategories are required',
    'array.min': 'Please add at least one subcategory'
  }),
  tags: Joi.array().items(Joi.string()).required().min(1).messages({
    'string.base': 'Please add at least one tag',
    'string.empty': 'item tags are required',
    'any.required': 'item tags are required',
    'array.min': 'Please add at least one tag'
  }),
  price: Joi.number().required().greater(4.99).messages({
    'string.base': 'Please add a item price',
    'string.empty': 'item price is required',
    'any.required': 'item price is required',
    'number.greater': 'item price must be greater than $4.99'
  }),
  expectedDelivery: Joi.string().required().messages({
    'string.base': 'Please add expected delivery',
    'string.empty': 'item expected delivery is required',
    'any.required': 'item expected delivery is required',
    'array.min': 'Please add a expected delivery'
  }),
  Title: Joi.string().required().messages({
    'string.base': 'Please add basic title',
    'string.empty': 'item basic title is required',
    'any.required': 'item basic title is required',
    'array.min': 'Please add a basic title'
  }),
  Description: Joi.string().required().messages({
    'string.base': 'Please add basic description',
    'string.empty': 'item basic description is required',
    'any.required': 'item basic description is required',
    'array.min': 'Please add a basic description'
  })
});

export { itemCreateSchema, itemUpdateSchema };
