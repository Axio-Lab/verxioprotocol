import profileRouter from "./profile.routes";
import apiKeyRouter from "./apiKey.route";
import campaignRouter from "./campaign.route";
import xpRouter from "./xp.route";
import submissionRouter from "./submissions.route";
import winnerRouter from "./winners.route";
import docRouter from "./doc.routes";
import { basePath } from "../configs/constants.configs";
import { Request, Response } from "express";

export default (app: { use: (arg0: string, arg1: any) => void; }) => {
    app.use(`${basePath}/profile`, profileRouter);
    app.use(`${basePath}/campaign`, campaignRouter);
    app.use(`${basePath}/api-key`, apiKeyRouter);
    app.use(`${basePath}/xp`, xpRouter);
    app.use(`${basePath}/participation`, submissionRouter);
    app.use(`${basePath}/winner`, winnerRouter);
    app.use(`${basePath}/docs`, docRouter);
    app.use(`${basePath}/`, (_req: Request, res: Response) => {
        res.send("Welcome to Verxio API");
    });
};