import { Request, Response } from "express";

import Submission from "../services/submission.service";
import AuthRequest from "../interfaces/auth.interface";
import Campaign from "../services/campaign.service";

const CampaignService = new Campaign();
const SubmissionService = new Submission();


export default class SubmissionController {

    async fetchSubmission(req: Request, res: Response) {
        try {
            const submissions = await SubmissionService.find({ campaignId: req.params.campaignId });

            return res.status(201).send({
                success: true,
                message: "Participants fetched succesfully.",
                data: { count: submissions.length, submissions }
            });

        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error fetching participants: ${error.message}`
            });
        }
    }

    async selectWinners(req: Request, res: Response) {
        try {
            const winnersIds = req.body.winners;
            const campaignId = req.params.campaignId;
            const userId = (req as AuthRequest).user._id;

            const campaign = await CampaignService.findOne({ _id: campaignId });

            if (!campaign) {
                return res.status(404).send({
                    success: false,
                    message: "Campaign not found."
                });
            }

            if (campaign.userId.toString() !== userId) {
                return res.status(403).send({
                    success: false,
                    message: "You are not authorized to select winners for this campaign."
                });
            }

            await SubmissionService.updateMany(
                { userId: { $in: winnersIds }, campaignId: campaignId },
                { $set: { isWinner: true } }
            );

            const winners = await SubmissionService.find({
                _id: { $in: winnersIds },
                campaignId: campaignId,
                isWinner: true
            });

            return res.status(201).send({
                success: true,
                message: "Winners selected succesfully.",
                data: winners
            });

        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error selecting winners: ${error.message}`
            });
        }
    }

    async fetchWinners(req: Request, res: Response) {
        try {
            const winners = await SubmissionService.find({ campaignId: req.params.campaignId, isWinner: true });

            return res.status(201).send({
                success: true,
                message: "Winners fetched succesfully.",
                data: { count: winners.length, ...winners }
            });

        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error fetching winners: ${error.message}`
            });
        }
    }
}