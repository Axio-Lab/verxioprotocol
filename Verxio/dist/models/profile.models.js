"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_configs_1 = require("../configs/constants.configs");
const profileSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        required: true,
        trim: true
    },
    xp: {
        type: Number,
        required: true,
        default: 0
    },
    sol: {
        type: Number,
        required: true,
        default: 0
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    strict: false,
    timestamps: true
});
const Profile = (0, mongoose_1.model)(constants_configs_1.DATABASES.PROFILE, profileSchema, constants_configs_1.DATABASES.PROFILE);
exports.default = Profile;
