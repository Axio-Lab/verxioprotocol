"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const xp_controller_1 = __importDefault(require("../controllers/xp.controller"));
const { addXP } = new xp_controller_1.default();
const router = express_1.default.Router();
//transfer XP
router.post("/", addXP);
exports.default = router;
