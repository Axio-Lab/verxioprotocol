"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//function created using currying method
function validate(schema) {
    return function (req, res, next) {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false
        });
        if (error) {
            let errorMessage = [];
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
    };
}
exports.default = validate;
