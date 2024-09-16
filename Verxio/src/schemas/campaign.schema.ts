import Joi from "joi";

const createCampaignSchema = Joi.object({
    campaignInfo: Joi.object({
        title: Joi.string().required().trim(),
        start: Joi.string().required().trim(),
        end: Joi.string().required().trim(),
        // timeZone: Joi.string().required().trim(),
        description: Joi.string().required().trim(),
        banner: Joi.string().optional().trim()
    }).required(),
    // participantInfo: Joi.object({
    //     status: Joi.string().required().trim(),
    //     participants: Joi.array().items(Joi.string()).optional(),
    //     level: Joi.string().required().trim(),
    //     nationality: Joi.string().optional().trim(),
    //     ageRange: Joi.string().optional().trim()
    // }).required(),
    actions: Joi.object({
        campaignType: Joi.string().required().trim(),
        actionType: Joi.string().required().trim(),
        action: Joi.object({
            description: Joi.string().required().trim(),
            url: Joi.string().required().trim(),
            amount: Joi.number().required()
        }).required()
    }).required(),
    rewardInfo: Joi.object({
        // amount: Joi.number().optional(),
        noOfPeople: Joi.number().required(),
        // method: Joi.string().optional().trim(),
        type: Joi.string().required().trim()
    }).required(),
    metaData: Joi.object().optional()
});

export {
    createCampaignSchema
}