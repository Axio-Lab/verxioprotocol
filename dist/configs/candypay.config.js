"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkout_sdk_1 = require("@candypay/checkout-sdk");
const candypay = new checkout_sdk_1.CandyPay({
    api_keys: {
        private_api_key: process.env.CANDYPAY_PRIVATE_API_KEY,
        public_api_key: process.env.CANDYPAY_PUBLIC_API_KEY,
    },
    network: "mainnet",
    config: {
        collect_shipping_address: false
    }
});
exports.default = candypay;
