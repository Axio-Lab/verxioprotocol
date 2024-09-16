import { model, Schema } from "mongoose";
import { DATABASES } from "../configs/constants.configs";

const payloadSchema = new Schema({
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

const Payload = model(DATABASES.PAYLOAD, payloadSchema, DATABASES.PAYLOAD);
export default Payload;