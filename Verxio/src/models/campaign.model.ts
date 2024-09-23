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
        description: {
            type: String,
            required: true,
            trim: true
        },
        banner: {
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
        }
    },
    action: {
        actionType: {
            type: String,
            required: true,
            enum: ['Burn-Token', 'Compress-Token', 'Decompress-Token', 'Poll', 'Submit-Url', 'Sell-Product'],
            trim: true
        },
        fields: {
            type: Schema.Types.Mixed,
            required: function (this: ICampaign) {
                return this.action.actionType !== 'Submit-Url';
            },
            validate: {
                validator: function (this: ICampaign, value: any) {
                    const actionType = this.action.actionType;

                    if ((actionType === 'Burn-Token') || (actionType === 'Compress-Token') || (actionType === 'Decompress-Token')) {
                        return typeof value.address === 'string' && value.address.trim() !== '' &&
                            typeof value.minAmount === 'number';
                    } else if (actionType === 'Poll') {
                        return Array.isArray(value.options) && value.options.length > 0;
                    } else if (actionType === 'Submit-Url') {
                        return true;
                    } else if (actionType === 'Sell-Product') {
                        return typeof value.product === 'string' && value.product.trim() !== '' &&
                            typeof value.amount === 'number' &&
                            typeof value.quantity === 'number';
                    }
                    return false;
                },
                message: "Invalid action structure for the given actionType"
            }
        }
    },
    rewardInfo: {
        type: {
            type: String,
            required: true,
            enum: ['Token', 'Verxio-XP', 'Whitelist-Spot', 'Airdrop', 'NFT-Drop', 'Merch-Drop'],
            trim: true
        },
        noOfPeople: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: function () {
                return this.rewardInfo.type === "Token" || "Verxio-XP";
            }
        },
        availableAmount: {
            type: Number,
            required: function () {
                return this.rewardInfo.type === "Token" || "Verxio-XP";
            }
        }
    },
    metaData: {}
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});

const Campaign = model(DATABASES.CAMPAIGN, campaignSchema, DATABASES.CAMPAIGN);
export default Campaign;