import Joi from "joi";

export const userSchema = Joi.object({
  avatar: Joi.string()
    .trim()
    .allow("")
    .optional(),

  first_name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  last_name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  country_code: Joi.string()
    .trim()
    .required(),

  mobile_number: Joi.string()
    .trim()
    .min(6)
    .max(15)
    .pattern(/^[0-9]+$/)
    .required(),

  email_address: Joi.string()
    .trim()
    .email()
    .required(),

  password: Joi.string()
    .trim()
    .required()
    .min(6),

  user_type: Joi.string()
    .trim()
    .required()

});
