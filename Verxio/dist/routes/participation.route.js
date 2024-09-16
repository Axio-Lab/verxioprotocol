"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const participation_controller_1 = __importDefault(require("../controllers/participation.controller"));
const authenticate_middleware_1 = __importDefault(require("../middlewares/authenticate.middleware"));
const { participate, getCampaignParticipation } = new participation_controller_1.default();
const router = express_1.default.Router();
//participate
router.post("/", authenticate_middleware_1.default, participate);
//participate
router.get("/", authenticate_middleware_1.default, getCampaignParticipation);
exports.default = router;
