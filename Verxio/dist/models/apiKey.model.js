"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_configs_1 = require("../configs/constants.configs");
const apiKeySchema = new mongoose_1.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true,
        ref: constants_configs_1.DATABASES.PROFILE
    },
    isValid: {
        type: Boolean,
        required: true
    }
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});
const ApiKey = (0, mongoose_1.model)(constants_configs_1.DATABASES.API_KEY, apiKeySchema, constants_configs_1.DATABASES.API_KEY);
exports.default = ApiKey;
