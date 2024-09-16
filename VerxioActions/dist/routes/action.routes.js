"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const action_controllers_1 = __importDefault(require("../controllers/action.controllers"));
const router = (0, express_1.Router)();
const { getProductAction, postProductAction, getBurnAction, postBurnAction } = new action_controllers_1.default();
//get product action
router.get("/p/:name", getProductAction);
router.options("/p/:name", getProductAction);
//post product action
router.post("/p/:name", postProductAction);
//get campaign action
router.get("/c/:title", getBurnAction);
router.options("/c/:title", getBurnAction);
//post campaign action
router.post("/c/:title", postBurnAction);
exports.default = router;
