"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
exports.logger = (0, pino_1.default)({
    level: 'info',
});
exports.default = (error, req, res, next) => {
    exports.logger.error(error);
    return res.status(500).send({
        success: false,
        message: error.message
    });
};
