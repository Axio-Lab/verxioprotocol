import Joi from 'joi';

const objectIdRegex = /^[a-fA-F0-9]{24}$/;

const selectWinnersSchema = Joi.object({
    winners: Joi.array().items(
        Joi.string().pattern(objectIdRegex).message('"{{#value}}" is not a valid ObjectId')
    ).min(1).required().messages({
        'array.base': 'Winners should be an array.',
        'array.min': 'At least one winner must be provided.',
        'any.required': 'Winners array is required.'
    })
});

export default selectWinnersSchema;