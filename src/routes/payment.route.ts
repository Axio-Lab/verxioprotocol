import { Router } from "express";
import PaymentController from '../controllers/payment.controller';
import authenticate from "../middlewares/authenticate.middleware";
const router = Router();
const {
    createPayment,
    sendPaymentMail
} = new PaymentController();

//create a payment
router.get("/:productId", authenticate, createPayment);

//send mail
router.post("/mail", sendPaymentMail);

export default router;