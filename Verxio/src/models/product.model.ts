import { model, Schema } from "mongoose";
import { DATABASES } from "../configs/constants.configs";
import IProduct from "../interfaces/product.interface";

const productSchema = new Schema<IProduct>({
    userId: {
        type: String,
        required: true,
        ref: DATABASES.PROFILE
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

const Product = model(DATABASES.PRODUCT, productSchema, DATABASES.PRODUCT);
export default Product;