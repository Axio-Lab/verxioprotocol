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
        timeZone: joi_1.default.string().required().trim(),
        description: joi_1.default.string().required().trim(),
        banner: joi_1.default.string().required().trim()
    }).required(),
    participantInfo: joi_1.default.object({
        status: joi_1.default.string().required().trim(),
        participants: joi_1.default.array().items(joi_1.default.string()).optional(),
        level: joi_1.default.string().required().trim(),
        nationality: joi_1.default.string().optional().trim(),
        ageRange: joi_1.default.string().optional().trim()
    }).required(),
    actions: joi_1.default.array().items(joi_1.default.object({
        type: joi_1.default.string().required().trim(),
        options: joi_1.default.object({
            description: joi_1.default.string().required().trim(),
            url: joi_1.default.string().required().trim(),
            amount: joi_1.default.number().required()
        }).required()
    })).required(),
    rewardInfo: joi_1.default.object({
        amount: joi_1.default.number().required(),
        noOfPeople: joi_1.default.number().required(),
        method: joi_1.default.string().required().trim(),
        type: joi_1.default.string().required().trim()
    }).required(),
    metaData: joi_1.default.object().optional()
});
exports.createCampaignSchema = createCampaignSchema;
