"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_configs_1 = require("../configs/constants.configs");
const XPSchema = new mongoose_1.Schema({
    point: {
        type: Number,
        required: true,
        unique: false
    },
    userId: {
        type: String,
        required: true,
        ref: constants_configs_1.DATABASES.PROFILE
    },
    time: {
        type: Date,
        required: true,
        unique: false
    }
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});
const XP = (0, mongoose_1.model)(constants_configs_1.DATABASES.XP, XPSchema, constants_configs_1.DATABASES.XP);
exports.default = XP;
