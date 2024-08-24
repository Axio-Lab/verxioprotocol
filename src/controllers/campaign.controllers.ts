import { Request, Response } from "express";
import CampaignService from "../services/campaign.service";
import AuthRequest from "../interfaces/auth.interface";
import ICampaign from "../interfaces/campaign.interface";
const {
    create,
    createDistributorClient
} = new CampaignService();

export default class ProductController {
    async createCampaign(req: Request, res: Response) {
        try {

            const data = req.body;
            const signerWalletAdapter = data.signerWalletAdapter;

            if (data.rewardInfo.type === "token") {
                const res = await createDistributorClient((req as AuthRequest).user._id, String(data.rewardInfo.noOfPeople), String(data.rewardInfo.amount));
                data.rewardInfo.res = res;
            }

            const campaign = await create({ ...data, userId: (req as AuthRequest).user._id });

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
}