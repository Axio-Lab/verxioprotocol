import express from 'express';

import XPController from '../controllers/xp.controller';

const {
    addXP
} = new XPController();
const router = express.Router();


//transfer XP
router.post("/", addXP);

export default router;