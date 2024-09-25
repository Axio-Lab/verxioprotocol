import { Request, Response } from "express";

import Submission from "../services/submission.service";

const SubmissionService = new Submission();


export default class SubmissionController {

    async fetchSubmission(req: Request, res: Response) {
        try {
            const submission = await SubmissionService.find({ campaignId: req.params.campaignId });

            return res.status(201).send({
                success: true,
                message: "Participants fetched succesfully.",
                data: submission
            });

        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error fetching participants: ${error.message}`
            });
        }
    }
}