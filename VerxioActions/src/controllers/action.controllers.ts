import { Request, Response } from "express";
import Campaign from "../services/campaign.service";
import Submission from "../services/submission.service";
import Profile from "../services/profile.services";
import { ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, ActionPostResponse, createActionHeaders } from "@solana/actions";
import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import { prepareBurnTokensTransaction } from "./actions/burnToken";
import { convert } from 'html-to-text';
import { CompressedTokenProgram } from "@lightprotocol/compressed-token";

const CampaignService = new Campaign();
const SubmissionService = new Submission();
const ProfileService = new Profile();

const DEFAULT_SOL_ADDRESS: PublicKey = new PublicKey(process.env.TREASURY_WALLET!);
const headers = createActionHeaders({
  chainId: "devenet", // or chainId: "devnet"
  actionVersion: "2.2.3"
});

export default class ActionController {
  async getAction(req: Request, res: Response) {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;

      const baseHref = new URL(
        `${protocol}://${req.get('host')}${req.originalUrl}`
      ).toString();

      const campaignName = (req.params.name.replace(/-/g, ' '));
      const campaign = await CampaignService.findOne({
        "campaignInfo.title": campaignName
      });

      if (!campaign) {
        return res.status(404).json("Invalid campaign title")
      }

      let disabled = false;
      if ((campaign as any).status === "Active") disabled = true;

      let payload: ActionGetResponse;

      const description = convert(campaign.campaignInfo.description)
      if (campaign.action.actionType === "Sell-Product") {
        payload = {
          icon: campaign.campaignInfo.banner,
          label: `Buy Now (${campaign.action.fields.amount} SOL)`,
          description,
          title: `${campaign.campaignInfo.title}`,
          disabled: !disabled ? disabled : (campaign?.action.fields.quantity! <= 0) ? true : false
        }
      } else if (campaign.action.actionType === "Submit-Url") {
        payload = {
          icon: campaign.campaignInfo.banner,
          label: `Submit Url`,
          description,
          title: `${campaign.campaignInfo.title}`,
          disabled,
          links: {
            actions: [{
              type: "post",
              label: `Submit Url`,
              href: `${baseHref}?Url={Url}`,
              parameters: [
                {
                  name: "Url",
                  label: "Submit your Url",
                },
              ],
            }]
          }
        }
      } else if (campaign.action.actionType === "Poll") {
        const options: any = campaign.action.fields.options?.map(
          (option: string, index: number) => ({ label: option, value: index.toString() })
        );
        payload = {
          icon: campaign.campaignInfo.banner,
          label: `Poll`,
          description,
          title: `${campaign.campaignInfo.title}`,
          disabled,
          links: {
            actions: [
              {
                type: "post",
                label: "Submit",
                href: `${baseHref}?choice={choice}`,
                parameters: [
                  {
                    type: "radio",
                    name: "choice",
                    label: `${campaign.action.fields.title}`,
                    required: true,
                    options
                  }
                ]
              }
            ]
          }
        }
      } else if (campaign.action.actionType === "Compress-Token") {
        payload = {
          icon: campaign.campaignInfo.banner,
          description,
          label: "Compress Token",
          title: `${campaign.campaignInfo.title}`,
          error: { message: "This link is not implemented! " },
          disabled,
          links: {
            actions: [{
              type: "post",
              label: "Compress Token",
              href: `${baseHref}?amount={amount}`,
              parameters: [
                {
                  name: "amount",
                  label: "Input amount",
                },
              ],
            }]
          },
        }
      } else {
        payload = {
          icon: "campaign.action.icon",
          label: "campaign.action.label",
          description: "campaign.action.description",
          title: "campaign.action.title"
        }
      }

      res.set({
        ...ACTIONS_CORS_HEADERS,
        "X-Action-Version": "2.1.3",
        "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
      });
      res.set(headers);
      return res.json(payload);

    } catch (error: any) {
      return res.status(500)
        .send({
          success: false,
          message: `Error: ${error.message}`
        })
    }
  }

  async postAction(req: Request, res: Response) {
    try {
      const campaignName = (req.params.name.replace(/-/g, ' '));
      const campaign = await CampaignService.findOne({
        "campaignInfo.title": campaignName
      });

      if (!campaign) {
        return res.status(404).json("Invalid campaign title")
      }

      const body: ActionPostRequest = req.body;

      let account: PublicKey;
      try {
        account = new PublicKey(body.account);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid "account" provided',
        });
      }

      const RPC_URL = `${process.env.SOLANA_RPC_URL}/?api-key=${process.env.API_KEY}`;
      const connection = new Connection(RPC_URL);

      // Ensure the receiving account will be rent exempt
      const minimumBalance = await connection.getMinimumBalanceForRentExemption(
        0 // Note: simple accounts that just store native SOL have `0` bytes of data
      );

      const transaction = new Transaction();

      if (campaign.action.actionType === "Sell-Product") {
        const price = campaign.action.fields.amount;

        if (!price) {
          return res.status(404).json("No price specified")
        }

        if (price * LAMPORTS_PER_SOL < minimumBalance) {
          throw `account may not be rent exempt: ${DEFAULT_SOL_ADDRESS.toBase58()}`;
        }

        const sellerPubkey: PublicKey = new PublicKey(
          campaign.userId
        );

        // Transfer 90% of the funds to the seller's address
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: account,
            toPubkey: sellerPubkey,
            lamports: Math.floor(price * LAMPORTS_PER_SOL * 0.9),
          }),
        );

        // Transfer 10% of the funds to the default SOL address
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: account,
            toPubkey: DEFAULT_SOL_ADDRESS,
            lamports: Math.floor(price * LAMPORTS_PER_SOL * 0.1),
          }),
        );
      } else if (campaign.action.actionType === "Submit-Url") {

        const foundSubmission = await SubmissionService.findOne({ campaignId: campaign._id, userId: account.toString() });
        if (foundSubmission) {
          transaction.feePayer = account;
          transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

          const payload: ActionPostResponse = {
            type: "transaction",
            transaction: transaction.serialize({
              requireAllSignatures: false,
              verifySignatures: true,
            }).toString('base64'),
            message: `You've already participated in ${campaign.campaignInfo.title}`
          };
          console.log("Payload:", payload)
          console.log("Transaction:", transaction)

          res.set({
            ...ACTIONS_CORS_HEADERS,
            "X-Action-Version": "2.1.3",
            "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
          });
          res.set(headers);

          return res.status(200).json(payload);
        }
        console.log(req.query.Url)
        await SubmissionService.create({ campaignId: campaign._id, userId: account.toString(), submission: req.query.Url as string })
      } else if (campaign.action.actionType === "Poll") {
        const foundSubmission = await SubmissionService.findOne({ campaignId: campaign._id, userId: account.toString() });
        if (foundSubmission) {
          transaction.feePayer = account;
          transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

          const payload: ActionPostResponse = {
            type: "transaction",
            transaction: transaction.serialize({
              requireAllSignatures: false,
              verifySignatures: true,
            }).toString('base64'),
            message: `You've already participated in ${campaign.campaignInfo.title}`
          };
          console.log("Payload:", payload)
          console.log("Transaction:", transaction)

          res.set({
            ...ACTIONS_CORS_HEADERS,
            "X-Action-Version": "2.1.3",
            "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
          });
          res.set(headers);

          return res.status(200).json(payload);
        }
        console.log(req.query.choice)
        await SubmissionService.create({ campaignId: campaign._id, userId: account.toString(), submission: req.query.choice as string })

      } else if (campaign.action.actionType === "Compress-Token") {
        const compressIx = await CompressedTokenProgram.compress({
          payer: account,
          owner: account,
          source: account,
          toAddress: account,
          amount: req.query.amount,
          mint: account,
        });

        transaction.add(compressIx)
      }

      // Set the end user as the fee payer
      transaction.feePayer = account;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const payload: ActionPostResponse = {
        type: "transaction",
        transaction: transaction.serialize({
          requireAllSignatures: false,
          verifySignatures: true,
        }).toString('base64'),
        message: `You've successfully participated in ${campaign.campaignInfo.title}`
      };

      // finds user on the db
      let profile = await ProfileService.findOne({ _id: account });
      if (!profile) {
        //create a new user if not found
        profile = await ProfileService.create({ _id: account.toString() });
      }
      // reward the user with xp
      profile!.xp += 500;
      await profile?.save();

      console.log("Payload:", payload)
      console.log("Transaction:", transaction)

      res.set({
        ...ACTIONS_CORS_HEADERS,
        "X-Action-Version": "2.1.3",
        "X-Blockchain-Ids": "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
      });
      res.set(headers);

      return res.status(200).json(payload);

    } catch (error: any) {
      return res.status(500).send({
        success: false,
        message: `Error: ${error.message}`,
      });
    }
  }

  // async getBurnAction(req: Request, res: Response) {
  //   try {
  //     const campaignName = (req.params.title.replace(/-/g, ' '));
  //     const campaign = await CampaignService.findOne({
  //       "campaignInfo.title": campaignName
  //     });

  //     if (!campaign) {
  //       return res.status(404).json("Invalid campaign title")
  //     }

  //     const payload: ActionGetResponse = {
  //       icon: campaign?.campaignInfo.banner as unknown as string,
  //       label: `Burn Token`,
  //       description: `${campaign?.campaignInfo.description}`,
  //       title: `${campaign?.campaignInfo.title}`,
  //     };
  //     res.set(ACTIONS_CORS_HEADERS);

  //     return res.json(payload);

  //   } catch (error: any) {
  //     return res.status(500)
  //       .send({
  //         success: false,
  //         message: `Error: ${error.message}`
  //       })
  //   }
  // }

  // async postBurnAction(req: Request, res: Response) {
  //   try {
  //     const campaignName = (req.params.title.replace(/-/g, ' '));
  //     const campaign = await CampaignService.findOne({
  //       "campaignInfo.title": campaignName
  //     });

  //     if (!campaign) {
  //       return res.status(404).json("Invalid campaign title")
  //     }

  //     const body: ActionPostRequest = req.body;

  //     // Validate the client-provided input
  //     let account: PublicKey;
  //     try {
  //       account = new PublicKey(body.account);
  //     } catch (err) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid "account" provided',
  //       });
  //     }

  //     const transaction = await prepareBurnTokensTransaction(campaign.actions.action.url, campaign.actions.action.amount, account)

  //     const payload: ActionPostResponse = {
  //       transaction: transaction.serialize({
  //         requireAllSignatures: false,
  //         verifySignatures: true,
  //       }).toString('base64'),
  //       message: `You've successfully minted token`,
  //     };
  //     console.log("Payload:", payload)
  //     console.log("Transaction:", transaction)

  //     res.set(ACTIONS_CORS_HEADERS);
  //     return res.status(200).json(payload);

  //   } catch (error: any) {
  //     return res.status(500).send({
  //       success: false,
  //       message: `Error: ${error.message}`,
  //     });
  //   }
  // }

  // async getUrlAction(req: Request, res: Response) {
  //   try {
  //     const campaignName = (req.params.title.replace(/-/g, ' '));
  //     const campaign = await CampaignService.findOne({
  //       "campaignInfo.title": campaignName
  //     });

  //     if (!campaign) {
  //       return res.status(404).json("Invalid campaign title")
  //     }

  //     const payload: ActionGetResponse = {
  //       icon: campaign?.campaignInfo.banner as unknown as string,
  //       label: `Burn Token`,
  //       description: `${campaign?.campaignInfo.description}`,
  //       title: `${campaign?.campaignInfo.title}`,
  //     };
  //     res.set(ACTIONS_CORS_HEADERS);

  //     return res.json(payload);

  //   } catch (error: any) {
  //     return res.status(500)
  //       .send({
  //         success: false,
  //         message: `Error: ${error.message}`
  //       })
  //   }
  // }

  // async postUrlAction(req: Request, res: Response) {
  //   try {
  //     const campaignName = (req.params.title.replace(/-/g, ' '));
  //     const campaign = await CampaignService.findOne({
  //       "campaignInfo.title": campaignName
  //     });

  //     if (!campaign) {
  //       return res.status(404).json("Invalid campaign title")
  //     }

  //     const body: ActionPostRequest = req.body;

  //     // Validate the client-provided input
  //     let account: PublicKey;
  //     try {
  //       account = new PublicKey(body.account);
  //     } catch (err) {
  //       return res.status(400).json({
  //         success: false,
  //         message: 'Invalid "account" provided',
  //       });
  //     }

  //     const transaction = await prepareBurnTokensTransaction(campaign.actions.action.url, campaign.actions.action.amount, account)

  //     const payload: ActionPostResponse = {
  //       transaction: transaction.serialize({
  //         requireAllSignatures: false,
  //         verifySignatures: true,
  //       }).toString('base64'),
  //       message: `You've successfully minted token`,
  //     };
  //     console.log("Payload:", payload)
  //     console.log("Transaction:", transaction)

  //     res.set(ACTIONS_CORS_HEADERS);
  //     return res.status(200).json(payload);

  //   } catch (error: any) {
  //     return res.status(500).send({
  //       success: false,
  //       message: `Error: ${error.message}`,
  //     });
  //   }
  // }
}