"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const app_1 = __importDefault(require("./app"));
const errors_middlewares_1 = require("./middlewares/errors.middlewares");
const constants_configs_1 = require("./configs/constants.configs");
const database_configs_1 = __importDefault(require("./configs/database.configs"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    errors_middlewares_1.logger.info(`Attempting to run server on port ${constants_configs_1.PORT}`);
    yield (0, database_configs_1.default)();
    app_1.default.listen(constants_configs_1.PORT, () => {
        errors_middlewares_1.logger.info(`Listening on port ${constants_configs_1.PORT}`);
    });
}))();
