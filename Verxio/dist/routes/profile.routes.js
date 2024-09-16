"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const profile_controllers_1 = __importDefault(require("../controllers/profile.controllers"));
// import validate from "../middlewares/validate.middleware";
// import { profileSchema } from "../schemas/profile.schemas";
const multer_configs_1 = __importDefault(require("../configs/multer.configs"));
const router = (0, express_1.Router)();
const { createProfile, uploadImage, getProfile, verifyUser } = new profile_controllers_1.default();
//verify user
router.post("/verify-user", verifyUser);
//create or fetches a profile
router.post("/:id", createProfile);
//upload profile image
router.post("/image", multer_configs_1.default.single("image"), uploadImage);
//get a profile
router.get("/:id", getProfile);
exports.default = router;
