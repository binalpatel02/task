import Joi from "joi";

export const roleSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  permission: Joi.object({
    customer: Joi.object({
        view: Joi.boolean().required(),
        manage: Joi.boolean().required(),
    }).required(),
  }).required(),
});
