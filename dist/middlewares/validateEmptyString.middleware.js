"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateEmptyString(req, res, next) {
    const data = req.body.nftSelection;
    if (data.address === "") {
        delete req.body["nftSelection"];
    }
    next();
}
exports.default = validateEmptyString;
