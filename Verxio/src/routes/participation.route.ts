import express from 'express';

import ParticipationController from '../controllers/participation.controller';
import authenticate from '../middlewares/authenticate.middleware';

const {
    participate,
    getCampaignParticipation
} = new ParticipationController();
const router = express.Router();


//participate
router.post("/", authenticate, participate);

//participate
router.get("/", authenticate, getCampaignParticipation);

export default router;