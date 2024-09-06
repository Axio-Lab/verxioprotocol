import { Router } from "express";
import CampaignController from '../controllers/campaign.controllers';
import validate from "../middlewares/validate.middleware";
import { createCampaignSchema } from "../schemas/campaign.schema";
import authenticate from "../middlewares/authenticate.middleware";
const router = Router();
const {
    createCampaign,
    viewDevCampaigns,
    deleteCampaign,
    pauseCampaign,
    playCampaign
} = new CampaignController();

//create a campaign
router.post("/", authenticate, validate(createCampaignSchema), createCampaign);

//view Developers Campaigns
router.get("/", authenticate, viewDevCampaigns);

//pause Campaign
router.patch("/:campaignId", authenticate, pauseCampaign);

//play Campaign
router.patch("/:campaignId", authenticate, playCampaign);

//Delete Campaign
router.delete("/:campaignId", authenticate, deleteCampaign);

export default router;