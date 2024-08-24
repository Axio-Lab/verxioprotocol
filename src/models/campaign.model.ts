import { model, Schema } from "mongoose";
import { DATABASES } from "../configs/constants.configs";
import ICampaign from "../interfaces/campaign.interface";

const campaignSchema = new Schema<ICampaign>({
    userId: {
        type: String,
        required: true,
        ref: DATABASES.PROFILE
    },
    campaignInfo: {
        title: {
            type: String,
            required: true,
            trim: true
        },
        start: {
            type: String,
            required: true,
            trim: true
        },
        end: {
            type: String,
            required: true,
            trim: true
        },
        timeZone: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        banner: {
            type: String,
            required: true,
            trim: true
        }
    },
    participantInfo: {
        status: {
            type: String,
            required: true,
            trim: true
        },
        participants: {
            type: [{
                type: String
            }],
            required: false
        },
        level: {
            type: String,
            required: true,
            trim: true
        },
        nationality: {
            type: String,
            required: false,
            trim: true
        },
        ageRange: {
            type: String,
            required: false,
            trim: true
        }
    },
    actions: [{
        type: {
            type: String,
            required: true,
            trim: true
        },
        options: {
            description: {
                type: String,
                required: true,
                trim: true
            },
            url: {
                type: String,
                required: true,
                trim: true
            },
            amount: {
                type: Number,
                required: true,
                trim: true
            }
        }
    }],
    rewardInfo: {
        amount: {
            type: Number,
            required: true
        },
        noOfPeople: {
            type: Number,
            required: true
        },
        method: {
            type: String,
            required: true,
            trim: true
        },
        type: {
            type: String,
            required: true,
            trim: true
        },
        res: {
            type: Object,
            required: function () { return this.rewardInfo.type === "token"},
            trim: true
        }
    }
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});

const Campaign = model(DATABASES.CAMPAIGN, campaignSchema, DATABASES.CAMPAIGN);
export default Campaign;