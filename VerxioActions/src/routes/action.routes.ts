import { Router, Request, Response } from "express";
import ActionController from '../controllers/action.controllers';
const router = Router();
const {
    getAction,
    postAction
} = new ActionController();

//get product action
router.get("/", (_req: Request, res: Response) => {
    const payload = {
        rules: [
            { pathPattern: '/*', apiPath: '/*' },
            { pathPattern: '/**', apiPath: '/**' },
        ],
    };
    res.json(payload);
});
router.get("/:name", getAction);
router.options("/:name", getAction);

//post product action
router.post("/:name", postAction);

export default router;