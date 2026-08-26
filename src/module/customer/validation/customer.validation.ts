import Joi from "joi";

export const createCustomerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),

  lastName: Joi.string().trim().min(2).max(50).required(),

  countryCode: Joi.string().trim().required(),
  
  mobileNumber: Joi.string().trim().min(6).max(15).required().pattern(/^[0-9]+$/),

  emailAddress: Joi.string().email().required()
});

export const updateCustomerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),

  lastName: Joi.string().trim().min(2).max(50).required(),

  countryCode: Joi.string().trim().required(),

  mobileNumber: Joi.string().trim().min(6).max(15).required().pattern(/^[0-9]+$/),

  emailAddress: Joi.string().email().optional(),
});