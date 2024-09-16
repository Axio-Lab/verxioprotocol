"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const action_routes_1 = __importDefault(require("./action.routes"));
const constants_configs_1 = require("../configs/constants.configs");
exports.default = (app) => {
    app.use(`/`, action_routes_1.default);
    app.use(`${constants_configs_1.basePath}/`, (_req, res) => {
        res.send("Welcome to Verxio API");
    });
};
