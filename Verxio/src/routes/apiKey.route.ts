import express from 'express';

import ApiKeyController from '../controllers/apiKey.controller';

const {
    generateApiKey,
    invalidateApiKey
} = new ApiKeyController();
const router = express.Router();


//generate apiKey
router.post("/:userId", generateApiKey);

//invalidate apiKey
router.patch("/:userId", invalidateApiKey);

export default router;