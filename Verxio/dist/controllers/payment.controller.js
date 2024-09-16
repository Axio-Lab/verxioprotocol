"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_service_1 = __importDefault(require("../services/product.service"));
const payload_service_1 = __importDefault(require("../services/payload.service"));
// import sendEmail from "../utils/sendmail.util";
// import underdog from "../configs/underdog.config";
const { getProduct } = new product_service_1.default();
// const { createCandypaySession } = new PaymentService();
const { create, findOne, update } = new payload_service_1.default();
class PaymentController {
}
exports.default = PaymentController;
