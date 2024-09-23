import { Request, Response, NextFunction } from "express";

export default async function parseActionType(req: Request, res: Response, next: NextFunction) {
    try {
        if(req.query.campaignType) {
            if(req.query.campaignType === "Submit-Url") {
                req.body.action = {};
            }
            req.body.action.actionType = req.query.campaignType;
            next();
        } else {
            return res.status(400).send({
                success: false,
                message: "Please provide campaignType in query parameters"
            });
        }
    } catch (error: any) {
        return res.status(500).send({
            success: false,
            message: `Unexpected Error: ${error.message}`
        });
    }
}