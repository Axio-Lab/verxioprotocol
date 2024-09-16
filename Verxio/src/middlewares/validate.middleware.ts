import { NextFunction, Request, RequestHandler, Response } from "express";
import Joi from "joi";

//function created using currying method
function validate(schema: Joi.ObjectSchema<any>): RequestHandler {
    return function(req: Request, res: Response, next: NextFunction) {
        const {error, value} = schema.validate(req.body, {
            abortEarly: false
        });
        if(error) {
            let errorMessage: string[] = [];
            error.details.forEach(detail => {
                errorMessage.push(detail.message);
            });
            return res.status(403)
                .send({
                    message: errorMessage,
                    success: false
                });
        }
        //re-assign req.body to the validated sanitized value
        req.body = value;
        next();
    }
}
export default validate;