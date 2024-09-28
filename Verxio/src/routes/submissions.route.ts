import express from 'express';

import SubmissionController from '../controllers/submissions.controller';
import authenticate from '../middlewares/authenticate.middleware';

const {
    fetchSubmission
} = new SubmissionController();
const router = express.Router();


//transfer Submission
router.get("/:campaignId", fetchSubmission);

export default router;