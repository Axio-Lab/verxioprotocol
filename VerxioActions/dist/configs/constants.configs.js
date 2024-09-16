"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASES = exports.MESSAGES = exports.basePath = exports.PORT = void 0;
const PORT = process.env.PORT || 9871;
exports.PORT = PORT;
const basePath = "/api/v1";
exports.basePath = basePath;
const DATABASES = {
    CAMPAIGN: "Campaign",
    PRODUCT: "Product",
    PROFILE: "Profile"
};
exports.DATABASES = DATABASES;
const MESSAGES = {
    DATABASE: {
        CONNECTED: "Connection to database has been established successfully",
        ERROR: "Unable to connect to database:"
    },
    PROFILE: {
        CREATED: "Profile created successfully.",
        FETCHED: "Profile fetched successfully.",
        INVALID_ID: "UserId doesn't exist.",
        DUPLICATE_EMAIL: "Email already exist.",
        UPDATED: "Profile details updated successfully.",
        NOT_FOUND: "Profile not found."
    },
    UNEXPECTED_ERROR: "An unexpected error occured."
};
exports.MESSAGES = MESSAGES;
