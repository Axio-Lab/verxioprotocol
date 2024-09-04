"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_configs_1 = require("../configs/constants.configs");
const payloadSchema = new mongoose_1.Schema({
    paymentInfo: {
        type: {
            productId: String,
            session_id: String,
            order_id: String,
            payment_url: String
        },
        required: true
    },
    payload: {
        type: Object,
        required: false
    }
}, {
    versionKey: false
});
const Payload = (0, mongoose_1.model)(constants_configs_1.DATABASES.PAYLOAD, payloadSchema, constants_configs_1.DATABASES.PAYLOAD);
exports.default = Payload;
