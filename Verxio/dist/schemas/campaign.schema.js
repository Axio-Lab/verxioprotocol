"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCampaignSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const createCampaignSchema = joi_1.default.object({
    campaignInfo: joi_1.default.object({
        title: joi_1.default.string().required().trim(),
        start: joi_1.default.string().required().trim(),
        end: joi_1.default.string().required().trim(),
        // timeZone: Joi.string().required().trim(),
        description: joi_1.default.string().required().trim(),
        banner: joi_1.default.string().optional().trim()
    }).required(),
    // participantInfo: Joi.object({
    //     status: Joi.string().required().trim(),
    //     participants: Joi.array().items(Joi.string()).optional(),
    //     level: Joi.string().required().trim(),
    //     nationality: Joi.string().optional().trim(),
    //     ageRange: Joi.string().optional().trim()
    // }).required(),
    actions: joi_1.default.object({
        campaignType: joi_1.default.string().required().trim(),
        actionType: joi_1.default.string().required().trim(),
        action: joi_1.default.object({
            description: joi_1.default.string().required().trim(),
            url: joi_1.default.string().required().trim(),
            amount: joi_1.default.number().required()
        }).required()
    }).required(),
    rewardInfo: joi_1.default.object({
        // amount: Joi.number().optional(),
        noOfPeople: joi_1.default.number().required(),
        // method: Joi.string().optional().trim(),
        type: joi_1.default.string().required().trim()
    }).required(),
    metaData: joi_1.default.object().optional()
});
exports.createCampaignSchema = createCampaignSchema;
