"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const profileSchema = joi_1.default.object({
    firstName: joi_1.default.string().optional().trim(),
    lastName: joi_1.default.string().optional().trim(),
    email: joi_1.default.string().email().optional().lowercase().trim(),
    imageUrl: joi_1.default.string().optional().trim(),
    bio: joi_1.default.string().optional().trim(),
});
exports.profileSchema = profileSchema;
