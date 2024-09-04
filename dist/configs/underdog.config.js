"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const underdog = axios_1.default.create({
    baseURL: "https://devnet.underdogprotocol.com",
    headers: {
        Authorization: `Bearer ${process.env.UNDERDOG_API_KEY}`,
    },
});
exports.default = underdog;
