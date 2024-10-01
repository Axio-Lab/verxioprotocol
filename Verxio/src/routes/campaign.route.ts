import { Router } from "express";
import CampaignController from '../controllers/campaign.controllers';
import validate from "../middlewares/validate.middleware";
import { createCampaignSchema, createCampaignSchema1, prepareCampaignSchema, prepareCampaignSchema1 } from "../schemas/campaign.schema";
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
router.post("/prepare", validate(prepareCampaignSchema1), parseActionType, validate(prepareCampaignSchema), prepareCampaignCreation);

//create a campaign
router.post("/", authenticate, validate(createCampaignSchema1), parseActionType, validate(createCampaignSchema), createCampaign);

//view all Campaigns
router.get("/all", viewAllCampaigns);

//view Developers Campaigns
router.get("/", authenticate, viewDevCampaigns);

//view a Campaigns
router.get("/:campaignId", viewACampaign);

//Delete Campaign
router.delete("/:campaignId", authenticate, deleteCampaign);

export default router;