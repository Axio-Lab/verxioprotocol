import { Request, Response } from "express";

import Participation from "../services/participation.service";
import Campaign from "../services/campaign.service";
import AuthRequest from "../interfaces/auth.interface";
import Profile from "../services/profile.services";

const ParticipationService = new Participation();
const CampaignService = new Campaign();
const ProfileService = new Profile();


export default class ParticipationController {

    async participate(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user._id;
            const campaign = await CampaignService.findOne({ _id: req.body.campaignId });
            if (!campaign) {
                return res.status(404).send({
                    success: false,
                    message: "Campaign not found"
                });
            }
            const profile = await ProfileService.findOne({ _id: req.body.userAddress });

            const date = new Date();
            let participation;
            participation = await ParticipationService.findOne({ campaignId: req.body.campaignId, userAddress: req.body.userAddress });
            if (participation) {
                if (participation.actions.some(action => action._id === req.body.actionId)) {
                    return res.status(400).send({
                        success: false,
                        message: "Action already performed and claimed by user"
                    });
                } else {
                    participation.actions.push({
                        _id: req.body.actionId,
                        xpClaimed: campaign.rewardInfo.xp
                    });
                    participation.save();
                }
            } else {
                participation = await ParticipationService.create({
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
            } else {
                await ProfileService.create({ _id: req.body.userAddress, xp: campaign.rewardInfo.xp });
            }

            return res.status(201).send({
                success: true,
                message: "Participation points claimed successfully",
                participation
            });

        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error claiming participation points: ${error.message}`
            });
        }
    }

    async getCampaignParticipation(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user._id;
            const campaign = await CampaignService.findOne({ userId, _id: req.query.campaignId });
            if(!campaign) {
                return res.status(404).send({
                    success: false,
                    message: "Campaign not found, invalid query parameters"
                });
            }
            const participation = await ParticipationService.find(req.query);

            return res.status(201).send({
                success: true,
                message: "Participation fetched successfully",
                participation
            });

        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error claiming participation points: ${error.message}`
            });
        }
    }
}