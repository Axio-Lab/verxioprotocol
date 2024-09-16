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
        description: {
            type: String,
            required: true,
            trim: true
        },
        banner: {
            type: String,
            required: false,
            trim: true
        }
    },
    actions: {
        campaignType: {
            type: String,
            required: true,
            trim: true
        },
        actionType: {
            type: String,
            required: true,
            trim: true
        },
        action: {
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
    },
    rewardInfo: {
        noOfPeople: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            required: true,
            trim: true
        },
        xp: {
            type: Number,
            required: true,
            default: 0
        },
        availableXP: {
            type: Number,
            required: true,
            default: 0
        }
    },
    metaData: {},
    isPaused: {
        type: Boolean,
        required: false,
        default: false
    }
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});

campaignSchema.set('toObject', { virtuals: true });
campaignSchema.set('toJSON', { virtuals: true });

// Virtual field for status
campaignSchema.virtual('status').get(function () {
    const now = new Date();
    const startDate = new Date(this.campaignInfo.start);
    const endDate = new Date(this.campaignInfo.end);

    if (this.rewardInfo.xp === 0) {
        return 'Draft';
    } else {
        if (!startDate || !endDate) {
            return 'Upcoming';
        } else if (now < startDate) {
            return 'Upcoming';
        } else if (now >= startDate && now <= endDate) {
            return 'Active';
        } else if (now > endDate) {
            return 'Completed';
        }
    }
    return 'Draft';
});

const Campaign = model(DATABASES.CAMPAIGN, campaignSchema, DATABASES.CAMPAIGN);
export default Campaign;