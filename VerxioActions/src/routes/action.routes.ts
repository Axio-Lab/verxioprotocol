import { Router } from "express";
import ActionController from '../controllers/action.controllers';
const router = Router();
const {
    getAction,
    postAction
} = new ActionController();

//get product action
router.get("/p/:name", getAction);
router.options("/p/:name", getAction);

//post product action
router.post("/p/:name", postAction);

export default router;