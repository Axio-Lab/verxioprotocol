import Joi from "joi";

const createProductSchema = Joi.object({
    type: Joi.string().required().trim(),
    name: Joi.string().required().trim(),
    image: Joi.string().required().trim(),
    description: Joi.string().required().trim(),
    payAnyPrice: Joi.boolean().optional().default(false),
    price: Joi.number().optional(),
    category: Joi.string().required().trim(),
    quantity: Joi.number().required(),
    productFile: Joi.string().required().trim()
});

export {
    createProductSchema
}