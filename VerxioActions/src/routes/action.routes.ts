import { Router } from "express";
import ActionController from '../controllers/action.controllers';
const router = Router();
const {
    getAction,
    postAction
} = new ActionController();

//get product action
router.get("/:name", getAction);
router.options("/:name", getAction);

//post product action
router.post("/:name", postAction);

export default router;