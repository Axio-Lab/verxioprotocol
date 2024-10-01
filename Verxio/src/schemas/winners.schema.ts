import Joi from 'joi';

const selectWinnersSchema = Joi.object({
    winners: Joi.array().items(
        Joi.string()
    ).min(1).required().messages({
        'array.base': 'Winners should be an array.',
        'array.min': 'At least one winner must be provided.',
        'any.required': 'Winners array is required.'
    })
});

export default selectWinnersSchema;