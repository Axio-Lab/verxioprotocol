import { Request, Response } from "express";
import CampaignService from "../services/campaign.service";
import AuthRequest from "../interfaces/auth.interface";
import Profile from "../services/profile.services";

const ProfileService = new Profile();
const {
    create,
    // createDistributorClient,
    find
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
}