"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const profile_routes_1 = __importDefault(require("./profile.routes"));
const apiKey_route_1 = __importDefault(require("./apiKey.route"));
const product_routes_1 = __importDefault(require("./product.routes"));
const campaign_route_1 = __importDefault(require("./campaign.route"));
const action_routes_1 = __importDefault(require("./action.routes"));
const payment_route_1 = __importDefault(require("./payment.route"));
const xp_route_1 = __importDefault(require("./xp.route"));
const participation_route_1 = __importDefault(require("./participation.route"));
const doc_routes_1 = __importDefault(require("./doc.routes"));
const constants_configs_1 = require("../configs/constants.configs");
exports.default = (app) => {
    app.use(`/`, action_routes_1.default);
    app.use(`${constants_configs_1.basePath}/profile`, profile_routes_1.default);
    app.use(`${constants_configs_1.basePath}/campaign`, campaign_route_1.default);
    app.use(`${constants_configs_1.basePath}/api-key`, apiKey_route_1.default);
    app.use(`${constants_configs_1.basePath}/product`, product_routes_1.default);
    app.use(`${constants_configs_1.basePath}/payment`, payment_route_1.default);
    app.use(`${constants_configs_1.basePath}/xp`, xp_route_1.default);
    app.use(`${constants_configs_1.basePath}/participate`, participation_route_1.default);
    app.use(`${constants_configs_1.basePath}/docs`, doc_routes_1.default);
    app.use(`${constants_configs_1.basePath}/`, (_req, res) => {
        res.send("Welcome to Verxio API");
    });
};
