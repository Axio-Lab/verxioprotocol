import { Router } from "express";
import CampaignController from '../controllers/campaign.controllers';
import validate from "../middlewares/validate.middleware";
import { createCampaignSchema } from "../schemas/campaign.schema";
import authenticate from "../middlewares/authenticate.middleware";
import parseActionType from "../middlewares/parseActionType.middleware";
const router = Router();
const {
    prepareCampaignCreation,
    createCampaign,
    viewDevCampaigns,
    viewAllCampaigns,
    viewACampaign,
    deleteCampaign,
} = new CampaignController();

//prepare a campaign
router.post("/prepare", authenticate, validate(createCampaignSchema), parseActionType, prepareCampaignCreation);

//create a campaign
router.post("/", authenticate, parseActionType, validate(createCampaignSchema), createCampaign);

//view all Campaigns
router.get("/all", viewAllCampaigns);

//view Developers Campaigns
router.get("/", authenticate, viewDevCampaigns);

//view a Campaigns
router.get("/:campaignId", viewACampaign);

//Delete Campaign
router.delete("/:campaignId", authenticate, deleteCampaign);

export default router;