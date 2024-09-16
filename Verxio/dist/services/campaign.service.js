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
const campaign_model_1 = __importDefault(require("../models/campaign.model"));
// import { BN } from "bn.js";
// import client from "../configs/solanaDistributor.config";
// import { ICreateSolanaExt } from "@streamflow/distributor/solana";
// import { Keypair } from "@solana/web3.js"
// import bs58 from 'bs58';
class CampaignService {
    create(campaign) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield campaign_model_1.default.create(campaign);
        });
    }
    findOne(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield campaign_model_1.default.findOne(params);
        });
    }
    find(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield campaign_model_1.default.find(params);
        });
    }
}
exports.default = CampaignService;
