"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_configs_1 = require("../configs/constants.configs");
const transactionSchema = new mongoose_1.Schema({
    buyerId: {
        type: String,
        required: true,
        ref: "profile"
    },
    productId: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: false
    }
}, {
    strict: true,
    timestamps: false,
    versionKey: false
});
const Transaction = (0, mongoose_1.model)(constants_configs_1.DATABASES.TRANSACTION, transactionSchema, constants_configs_1.DATABASES.TRANSACTION);
exports.default = Transaction;
