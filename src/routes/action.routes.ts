import { Router } from "express";
import ActionController from '../controllers/action.controllers';
const router = Router();
const {
    getAction,
    postAction,
} = new ActionController();

//get action
router.get("/:name", getAction);
router.options("/:name", getAction);

//post action
router.post("/:name", postAction);

export default router;