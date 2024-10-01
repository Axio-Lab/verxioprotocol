import express from 'express';

import SubmissionController from '../controllers/submissions.controller';
import authenticate from '../middlewares/authenticate.middleware';
import validate from '../middlewares/validate.middleware';
import selectWinnersSchema from '../schemas/winners.schema';

const {
    selectWinners,
    fetchWinners
} = new SubmissionController();
const router = express.Router();


//select winners
router.get("/:campaignId", authenticate, validate(selectWinnersSchema), selectWinners);

//fetch winners
router.get("/:campaignId", fetchWinners);

export default router;