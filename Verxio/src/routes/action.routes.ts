import { Router } from "express";
import ActionController from '../controllers/action.controllers';
const router = Router();
const {
    getAction,
    postAction,
    getOnchainAction,
    postOnchainAction
} = new ActionController();

//get action
router.get("/:name", getAction);
router.options("/:name", getAction);

//post action
router.post("/:name", postAction);

//get OnchainAction
router.get("/campaign/:name", getOnchainAction);
router.options("/campaign/:name", getOnchainAction);

//post OnchainAction
router.post("/campaign/:name", postOnchainAction);

export default router;