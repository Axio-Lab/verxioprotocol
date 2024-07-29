import { model, Schema } from "mongoose";
import { DATABASES } from "../configs/constants.configs";
import ITransaction from "../interfaces/transaction.interface";

const transactionSchema = new Schema<ITransaction>({
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

const Transaction = model(DATABASES.TRANSACTION, transactionSchema, DATABASES.TRANSACTION);
export default Transaction;