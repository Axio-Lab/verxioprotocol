import Joi from "joi";

const createCampaignSchema = Joi.object({
    signedTransaction: Joi.any(),
    campaignData: Joi.object({
        campaignInfo: Joi.object({
            title: Joi.string().required().trim(),
            start: Joi.string().required().trim(),
            end: Joi.string().required().trim(),
            description: Joi.string().required().trim(),
            banner: Joi.string().required().trim()
        }).required(),
        action: Joi.object({
            actionType: Joi.string().valid('Burn-Token', 'Compress-Token', 'Decompress-Token', 'Poll', 'Submit-Url', 'Sell-Product').required().trim(),
            fields: Joi.object().custom((value, helpers) => {
                const { actionType } = helpers.state.ancestors[0];

                if (actionType === 'Burn-Token' || actionType === 'Compress-Token' || actionType === 'Decompress-Token') {
                    const { address, minAmount } = value;
                    if (!address || typeof address !== 'string' || !address.trim()) {
                        return helpers.error('any.invalid');
                    }
                    if (!minAmount || typeof minAmount !== 'number') {
                        return helpers.error('any.invalid');
                    }
                } else if (actionType === 'Poll') {
                    const { options, title } = value;
                    if (!Array.isArray(options) || options.length === 0) {
                        return helpers.error('any.invalid');
                    }
                    if (!title || typeof title !== 'string' || !title.trim()) {
                        return helpers.error('any.invalid');
                    }
                } else if (actionType === 'Submit-Url') {
                    if (value !== undefined && !(typeof value === 'object' && Object.keys(value).length === 0)) {
                        return helpers.error('any.invalid', { message: 'fields must be omitted or an empty object for "Submit-Url".' });
                    }
                } else if (actionType === 'Sell-Product') {
                    const { amount, quantity, product } = value;
                    if (typeof amount !== 'number' || typeof quantity !== 'number' || typeof product !== 'string') {
                        return helpers.error('any.invalid');
                    }
                } else {
                    return helpers.error('any.invalid');
                }
                return value;
            })
        }).required(),
        rewardInfo: Joi.object({
            noOfPeople: Joi.number().required(),
            type: Joi.string().valid('Token', 'Verxio-XP', 'Whitelist-Spot', 'Airdrop', 'NFT-Drop', 'Merch-Drop').required().trim(),
            amount: Joi.number().when('type', {
                is: Joi.string().valid('Token', 'Verxio-XP'),
                then: Joi.required(),
                otherwise: Joi.optional()
            })
        }).required(),
        metaData: Joi.object().optional()
    })
});

export {
    createCampaignSchema
}