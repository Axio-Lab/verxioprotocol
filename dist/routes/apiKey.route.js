"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const apiKey_controller_1 = __importDefault(require("../controllers/apiKey.controller"));
const { generateApiKey, invalidateApiKey } = new apiKey_controller_1.default();
const router = express_1.default.Router();
//generate apiKey
router.post("/:userId", generateApiKey);
//invalidate apiKey
router.patch("/:userId", invalidateApiKey);
exports.default = router;
