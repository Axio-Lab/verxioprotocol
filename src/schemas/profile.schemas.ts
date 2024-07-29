import Joi from "joi";

const profileSchema = Joi.object({
    firstName: Joi.string().optional().trim(),
    lastName: Joi.string().optional().trim(),
    email: Joi.string().email().optional().lowercase().trim(),
    imageUrl: Joi.string().optional().trim(),
    bio: Joi.string().optional().trim(),
});

export {
    profileSchema
}