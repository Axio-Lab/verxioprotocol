import { Router } from "express";
import ActionController from '../controllers/action.controllers';
const router = Router();
const {
    getProductAction,
    postProductAction,
    getBurnAction,
    postBurnAction
} = new ActionController();

//get product action
router.get("/p/:name", getProductAction);
router.options("/p/:name", getProductAction);

//post product action
router.post("/p/:name", postProductAction);

//get campaign action
router.get("/c/:title", getBurnAction);
router.options("/c/:title", getBurnAction);

//post campaign action
router.post("/c/:title", postBurnAction);

export default router;