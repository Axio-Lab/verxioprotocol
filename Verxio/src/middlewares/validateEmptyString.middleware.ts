import { NextFunction, Request, Response } from "express";

function validateEmptyString(req: Request, res: Response, next: NextFunction) {
    const data = req.body.nftSelection;
    if (data.address === "") {
        delete req.body["nftSelection"];
    }
    next();
}

export default validateEmptyString;