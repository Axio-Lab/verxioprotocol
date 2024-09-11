import { Request, Response } from "express";
import CampaignService from "../services/campaign.service";
import AuthRequest from "../interfaces/auth.interface";
import Profile from "../services/profile.services";

const ProfileService = new Profile();
const {
    create,
    // createDistributorClient,
    find,
    findOne
} = new CampaignService();

export default class ProductController {
    async createCampaign(req: Request, res: Response) {
        try {

            const data = req.body;
            const userId = (req as AuthRequest).user._id;

            if (data.rewardInfo.type === "token") {
                // const signerWalletAdapter = data.signerWalletAdapter;
                // const res = await createDistributorClient((req as AuthRequest).user._id, String(data.rewardInfo.noOfPeople), String(data.rewardInfo.amount));
                // data.rewardInfo.res = res;
            }

            const campaign = await create({ ...data, userId });

            const requiredXp = 200 * campaign.actions.length * campaign.rewardInfo.noOfPeople;

            const profile = await ProfileService.findOne({ _id: userId });
            if (profile) {
                if (profile.xp >= requiredXp) {
                    profile.xp -= requiredXp;
                    profile.save();

                    campaign.rewardInfo.xp += requiredXp;
                    campaign.rewardInfo.availableXP += requiredXp;
                    campaign.save();
                } else {
                    return res.status(400)
                        .send({
                            success: false,
                            message: "Insufficient XP, Campaign saved to drafts",
                            campaign
                        })
                }
            }

            return res.status(200)
                .send({
                    success: true,
                    message: "Campaign created successfully",
                    campaign
                })
        } catch (error: any) {
            return res.status(500)
                .send({
                    success: false,
                    message: `Error occured while creating campaign: ${error.message}`
                })
        }
    }

    async viewDevCampaigns(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user._id;
            const campaigns = await find({ ...req.query, userId })

            return res.status(200)
                .send({
                    success: true,
                    message: "Info fetched successfully",
                    campaigns
                })
        } catch (error: any) {
            return res.status(500)
                .send({
                    success: false,
                    message: `Error occured while fetching campaigns info: ${error.message}`
                })
        }
    }

    async deleteCampaign(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user._id;
            const campaign = await findOne({ userId, campaignId: req.params.campaignId });

            if (!campaign) {
                return res.status(404).send({
                    success: false,
                    message: "Campaign not found"
                });
            }

            await campaign.deleteOne();

            return res.status(200)
                .send({
                    success: true,
                    message: "Campaign deleted successfully"
                })
        } catch (error: any) {
            return res.status(500)
                .send({
                    success: false,
                    message: `Error occured while deleting campaign: ${error.message}`
                })
        }
    }

    async pauseCampaign(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user._id;
            const campaign = await findOne({ userId, campaignId: req.params.campaignId });

            if (!campaign) {
                return res.status(404).send({
                    success: false,
                    message: "Campaign not found"
                });
            }

            campaign.isPaused = true;
            await campaign.save();

            return res.status(200)
                .send({
                    success: true,
                    message: "Campaign paused successfully"
                })
        } catch (error: any) {
            return res.status(500)
                .send({
                    success: false,
                    message: `Error occured while pausing campaign: ${error.message}`
                })
        }
    }

    async playCampaign(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user._id;
            const campaign = await findOne({ userId, campaignId: req.params.campaignId });

            if (!campaign) {
                return res.status(404).send({
                    success: false,
                    message: "Campaign not found"
                });
            }

            campaign.isPaused = false;
            await campaign.save();

            return res.status(200)
                .send({
                    success: true,
                    message: "Campaign resumed successfully"
                })
        } catch (error: any) {
            return res.status(500)
                .send({
                    success: false,
                    message: `Error occured while resuming campaign: ${error.message}`
                })
        }
    }
}