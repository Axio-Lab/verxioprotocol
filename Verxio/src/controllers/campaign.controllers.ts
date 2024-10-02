import { Request, Response } from "express";
import CampaignService from "../services/campaign.service";
import AuthRequest from "../interfaces/auth.interface";
import Profile from "../services/profile.services";
import Submission from "../services/submission.service";
import ICampaign from "../interfaces/campaign.interface";
import { Connection, PublicKey, SystemProgram, TransactionMessage, TransactionConfirmationStrategy, VersionedTransaction } from '@solana/web3.js';
import payWinnersAndWithdraw from "../services/payWinners";

const SubmissionService = new Submission();
const ProfileService = new Profile();
const {
    create,
    // createDistributorClient,
    find,
    findOne
} = new CampaignService();
const deployedLink = "https://action.verxio.xyz/api/actions";

export default class ProductController {
    async prepareCampaignCreation(req: Request, res: Response) {
        try {

            const data = req.body.campaignData;
            const userId = (req as AuthRequest).user._id;
            const RPC_URL = `${process.env.SOLANA_RPC_URL}/?api-key=${process.env.API_KEY}`;
            const connection = new Connection(RPC_URL);

            if (data.rewardInfo.type === "token") {
                const { amount } = data.rewardInfo;
                const escrowAddress = process.env.ESCROW_WALLET_ADDRESS;

                // Create a transaction
                const instruction = SystemProgram.transfer({
                    fromPubkey: new PublicKey(userId!),
                    toPubkey: new PublicKey(escrowAddress!),
                    lamports: amount * 1e9 // Convert SOL to lamports
                });

                const latestBlockhash = await connection.getLatestBlockhash();

                const messageV0 = new TransactionMessage({
                    payerKey: new PublicKey(userId!),
                    recentBlockhash: latestBlockhash.blockhash,
                    instructions: [instruction]
                }).compileToV0Message();

                const transaction = new VersionedTransaction(messageV0);

                // Serialize the transaction and send it to the frontend for signing
                const serializedTransaction = Buffer.from(transaction.serialize()).toString('base64');

                // Instead of creating the campaign here, send the transaction to the frontend
                return res.status(200).send({
                    success: true,
                    message: "Transaction created. Please sign and submit.",
                    transaction: serializedTransaction
                });
            }

        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error occurred while preparing transaction: ${error.message}`
            });
        }
    }

    // New method to handle the signed transaction and create the campaign
    async createCampaign(req: Request, res: Response) {
        try {
            const { signedTransaction, campaignData } = req.body;

            if (campaignData.rewardInfo.type === "token") {
                const connection = new Connection(process.env.SOLANA_RPC_URL!);
                // Deserialize and send the transaction
                const transaction = VersionedTransaction.deserialize(Buffer.from(signedTransaction, 'base64'));
                const signature = await connection.sendTransaction(transaction);

                // Wait for confirmation using the new method
                const latestBlockhash = await connection.getLatestBlockhash();
                const confirmationStrategy: TransactionConfirmationStrategy = {
                    signature,
                    blockhash: latestBlockhash.blockhash,
                    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
                };

                const confirmation = await connection.confirmTransaction(confirmationStrategy);

                if (confirmation.value.err) {
                    throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
                }
            }

            campaignData.rewardInfo.availableAmount = campaignData.rewardInfo.amount;
            // Create the campaign
            const campaign = await create({ ...campaignData, userId: (req as AuthRequest).user._id });

            const encodedCampaignName = campaign.campaignInfo.title.replace(/\s+/g, '-');

            return res.status(200).send({
                success: true,
                message: "Campaign created successfully",
                campaign: {
                    ...campaign.toObject(),
                    blink: `${deployedLink}/${encodedCampaignName}`
                }
            });
        } catch (error: any) {
            return res.status(500).send({
                success: false,
                message: `Error occurred while creating campaign: ${error.message}`
            });
        }
    }


    async viewAllCampaigns(req: Request, res: Response) {
        try {
            const { rewards, actions, status } = req.query;

            const query: any = {};
            if (rewards) query["rewardInfo.type"] = rewards;
            if (actions) query["action.actionType"] = actions;

            let campaigns: any = await find(query);

            if (status) {
                campaigns = campaigns.filter((campaign: any) => campaign.status === status);
            }

            campaigns = await Promise.all(
                campaigns.map(async (campaign: any) => {
                    const encodedCampaignName = campaign!.campaignInfo.title.replace(/\s+/g, '-');
                    const submission = await SubmissionService.count({ campaignId: campaign._id });
                    return {
                        ...campaign.toObject(),
                        submission,
                        blink: `${deployedLink}/${encodedCampaignName}`
                    };
                })
            );

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

    async viewDevCampaigns(req: Request, res: Response) {
        try {
            const userId = (req as AuthRequest).user._id;
            const { rewards, actions, status } = req.query;

            const query: any = {};
            if (rewards) query["rewardInfo.type"] = rewards;
            if (actions) query["action.actionType"] = actions;

            let campaigns: any = await find({ ...query, userId })

            if (status) {
                campaigns = campaigns.filter((campaign: any) => campaign.status === status);
            }

            campaigns = await Promise.all(
                campaigns.map(async (campaign: any) => {
                    const encodedCampaignName = campaign!.campaignInfo.title.replace(/\s+/g, '-');
                    const submission = await SubmissionService.count({ campaignId: campaign._id });
                    return {
                        ...campaign.toObject(),
                        submission,
                        blink: `${deployedLink}/${encodedCampaignName}`
                    };
                })
            );

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

    async viewACampaign(req: Request, res: Response) {
        try {
            const campaign = await findOne({ _id: req.params.campaignId })
            const submission = await SubmissionService.count({ campaignId: req.params.campaignId });
            const encodedCampaignName = campaign!.campaignInfo.title.replace(/\s+/g, '-');

            return res.status(200)
                .send({
                    success: true,
                    message: "Info fetched successfully",
                    data: {
                        ...campaign?.toObject(), submission, blink: `${deployedLink}/${encodedCampaignName}`
                    }
                })
        } catch (error: any) {
            return res.status(500)
                .send({
                    success: false,
                    message: `Error occured while fetching campaign info: ${error.message}`
                })
        }
    }

    async payWinners(req: Request, res: Response) {
        try {
            const campaign = await findOne({ _id: req.params.campaignId })
            if (campaign?.rewardInfo.type === "Token") {
                const winners = await SubmissionService.find({ campaignId: req.params.campaignId, isWinner: true });
                const winnersAddress = winners.reduce<string[]>((acc, win) => {
                    acc.push(win.userId);
                    return acc;
                }, []);
                const paidWinners = await payWinnersAndWithdraw(campaign?.rewardInfo.amount, winnersAddress);

                return res.status(200)
                    .send({
                        success: true,
                        message: "Users paid successfully",
                        data: paidWinners
                    })
            }

            return res.status(409)
                .send({
                    success: false,
                    message: "Not a token campaign"
                })
        } catch (error: any) {
            return res.status(500)
                .send({
                    success: false,
                    message: `Error occured while while paying users: ${error.message}`
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

    // async pauseCampaign(req: Request, res: Response) {
    //     try {
    //         const userId = (req as AuthRequest).user._id;
    //         const campaign = await findOne({ userId, campaignId: req.params.campaignId });

    //         if (!campaign) {
    //             return res.status(404).send({
    //                 success: false,
    //                 message: "Campaign not found"
    //             });
    //         }

    //         campaign.isPaused = true;
    //         await campaign.save();

    //         return res.status(200)
    //             .send({
    //                 success: true,
    //                 message: "Campaign paused successfully"
    //             })
    //     } catch (error: any) {
    //         return res.status(500)
    //             .send({
    //                 success: false,
    //                 message: `Error occured while pausing campaign: ${error.message}`
    //             })
    //     }
    // }

    // async playCampaign(req: Request, res: Response) {
    //     try {
    //         const userId = (req as AuthRequest).user._id;
    //         const campaign = await findOne({ userId, campaignId: req.params.campaignId });

    //         if (!campaign) {
    //             return res.status(404).send({
    //                 success: false,
    //                 message: "Campaign not found"
    //             });
    //         }

    //         campaign.isPaused = false;
    //         await campaign.save();

    //         return res.status(200)
    //             .send({
    //                 success: true,
    //                 message: "Campaign resumed successfully"
    //             })
    //     } catch (error: any) {
    //         return res.status(500)
    //             .send({
    //                 success: false,
    //                 message: `Error occured while resuming campaign: ${error.message}`
    //             })
    //     }
    // }
}