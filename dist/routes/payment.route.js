"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = __importDefault(require("../controllers/payment.controller"));
const authenticate_middleware_1 = __importDefault(require("../middlewares/authenticate.middleware"));
const router = (0, express_1.Router)();
const { createPayment, sendPaymentMail } = new payment_controller_1.default();
//create a payment
router.get("/:productId", authenticate_middleware_1.default, createPayment);
//send mail
router.post("/mail", sendPaymentMail);
exports.default = router;
