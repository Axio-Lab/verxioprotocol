import { Router, Request, Response } from "express";
import ActionController from '../controllers/action.controllers';
const router = Router();
const {
    getAction,
    postAction
} = new ActionController();

//get product action
router.get("/actions.json", (_req: Request, res: Response) => {
    const payload = {
        rules: [
            { pathPattern: '/*', apiPath: '/api/actions/*' },
            { pathPattern: '/api/actions/**', apiPath: '/api/actions/**' },
        ],
    };
    res.json(payload);
});
router.get("/api/actions/:name", getAction);
router.options("/api/actions/:name", getAction);

//post product action
router.post("/api/actions/:name", postAction);

export default router;