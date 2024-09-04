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
const xp_service_1 = __importDefault(require("../services/xp.service"));
const profile_services_1 = __importDefault(require("../services/profile.services"));
const XPService = new xp_service_1.default();
const ProfileService = new profile_services_1.default();
class XPController {
    addXP(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const XP = yield XPService.create(req.body.point, req.body.userId);
                const profile = yield ProfileService.findOne({ _id: req.body.userId });
                if (profile) {
                    profile.xp += XP.point;
                    profile.save();
                }
                return res.status(201).send({
                    success: true,
                    message: "XP points transferred successfully",
                    data: XP
                });
            }
            catch (error) {
                return res.status(500).send({
                    success: false,
                    message: `Error transferring xp points: ${error.message}`
                });
            }
        });
    }
}
exports.default = XPController;
