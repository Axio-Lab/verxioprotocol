"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const createProductSchema = joi_1.default.object({
    type: joi_1.default.string().required().trim(),
    name: joi_1.default.string().required().trim(),
    image: joi_1.default.string().required().trim(),
    description: joi_1.default.string().required().trim(),
    payAnyPrice: joi_1.default.boolean().optional().default(false),
    price: joi_1.default.number().optional(),
    category: joi_1.default.string().required().trim(),
    quantity: joi_1.default.number().required(),
    productFile: joi_1.default.string().required().trim()
});
exports.createProductSchema = createProductSchema;
