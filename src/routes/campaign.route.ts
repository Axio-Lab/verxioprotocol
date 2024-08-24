import { Router } from "express";
import CampaignController from '../controllers/campaign.controllers';
import validate from "../middlewares/validate.middleware";
import { createCampaignSchema } from "../schemas/campaign.schema";
import authenticate from "../middlewares/authenticate.middleware";
const router = Router();
const {
    createCampaign
} = new CampaignController();

//create a campaign
router.post("/", authenticate, validate(createCampaignSchema), createCampaign);

export default router;