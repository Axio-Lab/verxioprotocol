"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_configs_1 = require("../configs/constants.configs");
const productSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        ref: constants_configs_1.DATABASES.PROFILE
    },
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    payAnyPrice: {
        type: Boolean,
        required: false,
        default: false
    },
    price: {
        type: Number,
        required: false
    },
    quantity: {
        type: Number,
        required: true
    },
    unlimited: {
        type: Boolean,
        required: true
    },
    productFile: {
        type: String,
        required: true,
        trim: true
    },
    sales: {
        type: Number,
        required: true,
        default: 0
    },
    revenue: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    strict: true,
    timestamps: true,
    versionKey: false
});
const Product = (0, mongoose_1.model)(constants_configs_1.DATABASES.PRODUCT, productSchema, constants_configs_1.DATABASES.PRODUCT);
exports.default = Product;
