"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = connectToMongo;
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.set("strictQuery", true);
const constants_configs_1 = require("./constants.configs");
function connectToMongo() {
    mongoose_1.default.connect(process.env.DB_URI)
        .then(() => {
        console.log(constants_configs_1.MESSAGES.DATABASE.CONNECTED);
    })
        .catch((err) => {
        console.log(constants_configs_1.MESSAGES.DATABASE.ERROR, err);
    });
}
