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
const participation_service_1 = __importDefault(require("../services/participation.service"));
const campaign_service_1 = __importDefault(require("../services/campaign.service"));
const profile_services_1 = __importDefault(require("../services/profile.services"));
const ParticipationService = new participation_service_1.default();
const CampaignService = new campaign_service_1.default();
const ProfileService = new profile_services_1.default();
class ParticipationController {
    participate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user._id;
                const campaign = yield CampaignService.findOne({ _id: req.body.campaignId });
                if (!campaign) {
                    return res.status(404).send({
                        success: false,
                        message: "Campaign not found"
                    });
                }
                const profile = yield ProfileService.findOne({ _id: req.body.userAddress });
                const date = new Date();
                let participation;
                participation = yield ParticipationService.findOne({ campaignId: req.body.campaignId, userAddress: req.body.userAddress });
                if (participation) {
                    if (participation.actions.some(action => action._id === req.body.actionId)) {
                        return res.status(400).send({
                            success: false,
                            message: "Action already performed and claimed by user"
                        });
                    }
                    else {
                        participation.actions.push({
                            _id: req.body.actionId,
                            xpClaimed: campaign.rewardInfo.xp
                        });
                        participation.save();
                    }
                }
                else {
                    participation = yield ParticipationService.create({
                        userAddress: req.body.userAddress,
                        campaignId: req.body.campaignId,
                        actions: [{
                                _id: req.body.actionId,
                                xpClaimed: campaign.rewardInfo.xp
                            }], date
                    });
                }
                if (profile) {
                    profile.xp += campaign.rewardInfo.xp;
                    profile.save();
                }
                else {
                    yield ProfileService.create({ _id: req.body.userAddress, xp: campaign.rewardInfo.xp });
                }
                return res.status(201).send({
                    success: true,
                    message: "Participation points claimed successfully",
                    participation
                });
            }
            catch (error) {
                return res.status(500).send({
                    success: false,
                    message: `Error claiming participation points: ${error.message}`
                });
            }
        });
    }
    getCampaignParticipation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user._id;
                const campaign = yield CampaignService.findOne({ userId, _id: req.query.campaignId });
                if (!campaign) {
                    return res.status(404).send({
                        success: false,
                        message: "Campaign not found, invalid query parameters"
                    });
                }
                const participation = yield ParticipationService.find(req.query);
                return res.status(201).send({
                    success: true,
                    message: "Participation fetched successfully",
                    participation
                });
            }
            catch (error) {
                return res.status(500).send({
                    success: false,
                    message: `Error claiming participation points: ${error.message}`
                });
            }
        });
    }
}
exports.default = ParticipationController;
