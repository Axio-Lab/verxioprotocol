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
const campaign_service_1 = __importDefault(require("../services/campaign.service"));
const profile_services_1 = __importDefault(require("../services/profile.services"));
const ProfileService = new profile_services_1.default();
const { create, createDistributorClient, find } = new campaign_service_1.default();
class ProductController {
    createCampaign(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const userId = req.user._id;
                if (data.rewardInfo.type === "token") {
                    // const signerWalletAdapter = data.signerWalletAdapter;
                    // const res = await createDistributorClient((req as AuthRequest).user._id, String(data.rewardInfo.noOfPeople), String(data.rewardInfo.amount));
                    // data.rewardInfo.res = res;
                }
                const campaign = yield create(Object.assign(Object.assign({}, data), { userId }));
                const requiredXp = 200 * campaign.actions.length * campaign.rewardInfo.noOfPeople;
                const profile = yield ProfileService.findOne({ _id: userId });
                if (profile) {
                    if (profile.xp >= requiredXp) {
                        profile.xp -= requiredXp;
                        profile.save();
                        campaign.rewardInfo.xp += requiredXp;
                        campaign.rewardInfo.availableXP += requiredXp;
                        campaign.save();
                    }
                    else {
                        return res.status(400)
                            .send({
                            success: false,
                            message: "Insufficient XP, Campaign saved to drafts",
                            campaign
                        });
                    }
                }
                return res.status(200)
                    .send({
                    success: true,
                    message: "Campaign created successfully",
                    campaign
                });
            }
            catch (error) {
                return res.status(500)
                    .send({
                    success: false,
                    message: `Error occured while creating campaign: ${error.message}`
                });
            }
        });
    }
    viewDevCampaigns(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user._id;
                const campaigns = yield find(Object.assign(Object.assign({}, req.query), { userId }));
                return res.status(200)
                    .send({
                    success: true,
                    message: "Info fetched successfully",
                    campaigns
                });
            }
            catch (error) {
                return res.status(500)
                    .send({
                    success: false,
                    message: `Error occured while fetching campaigns info: ${error.message}`
                });
            }
        });
    }
}
exports.default = ProductController;
