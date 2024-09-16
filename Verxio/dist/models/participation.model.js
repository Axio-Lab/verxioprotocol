"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_configs_1 = require("../configs/constants.configs");
const ParticipationSchema = new mongoose_1.Schema({
    userAddress: {
        type: String,
        required: true
    },
    campaignId: {
        type: String,
        required: true,
        ref: constants_configs_1.DATABASES.CAMPAIGN
    },
    actions: [{
            _id: {
                type: String,
                required: true,
                trim: true
            },
            xpClaimed: {
                type: Number,
                required: true
            },
        }],
    date: {
        type: Date,
        required: true,
        unique: false
    }
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});
const Participation = (0, mongoose_1.model)(constants_configs_1.DATABASES.PARTICIPATION, ParticipationSchema, constants_configs_1.DATABASES.PARTICIPATION);
exports.default = Participation;
