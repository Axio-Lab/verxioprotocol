import profileRouter from "./profile.routes";
import apiKeyRouter from "./apiKey.route";
import productRouter from "./product.routes";
import actionRouter from "./action.routes";
import paymentRouter from "./payment.route";
import docRouter from "./doc.routes";
import { basePath } from "../configs/constants.configs";
import { Request, Response } from "express";

export default (app: { use: (arg0: string, arg1: any) => void; }) => {
    app.use(`/`, actionRouter);
    app.use(`${basePath}/profile`, profileRouter);
    app.use(`${basePath}/api-key`, apiKeyRouter);
    app.use(`${basePath}/product`, productRouter);
    app.use(`${basePath}/payment`, paymentRouter);
    app.use(`${basePath}/docs`, docRouter);
    app.use(`${basePath}/`, (_req: Request, res: Response) => {
        res.send("Welcome to Verxio API");
    });
};