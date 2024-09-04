"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaign_controllers_1 = __importDefault(require("../controllers/campaign.controllers"));
const validate_middleware_1 = __importDefault(require("../middlewares/validate.middleware"));
const campaign_schema_1 = require("../schemas/campaign.schema");
const authenticate_middleware_1 = __importDefault(require("../middlewares/authenticate.middleware"));
const router = (0, express_1.Router)();
const { createCampaign, viewDevCampaigns } = new campaign_controllers_1.default();
//create a campaign
router.post("/", authenticate_middleware_1.default, (0, validate_middleware_1.default)(campaign_schema_1.createCampaignSchema), createCampaign);
//view Developers Campaigns
router.get("/", authenticate_middleware_1.default, viewDevCampaigns);
exports.default = router;
