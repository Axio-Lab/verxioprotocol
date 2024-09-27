import ICampaign from "../interfaces/campaign.interface";
import Campaign from "../models/campaign.model";

// import { BN } from "bn.js";
// import client from "../configs/solanaDistributor.config";
// import { ICreateSolanaExt } from "@streamflow/distributor/solana";
// import { Keypair } from "@solana/web3.js"
// import bs58 from 'bs58';


export default class CampaignService {
    async create(campaign: Partial<ICampaign>) {
        return await Campaign.create(campaign);
    }

    async findOne(params: {}) {
        return await Campaign.findOne(params);
    }

    async find(params: {}) {
        return await Campaign.find(params);
    }

    async count(params: {}) {
        return await Campaign.countDocuments(params);
    }
    
    // async createDistributorClient(wallet: any, numberOfReceipts: string, totalAmount: string) {
    //     try {
    //         const now = Math.floor(Date.now() / 1000);

    //         // Decode the base58 encoded private key
    //         const privateKey = bs58.decode("4YmLtbexfNC6zBmLj17DRbFq1XQTsdR7wRuJhCQHvLpQeokew6csQn1DACCMjSzqV5Yk9cFzjTFCfezo7Nrbxzvu");

    //         // Create a Uint8Array from the decoded private key
    //         const privateKeyUint8Array = new Uint8Array(privateKey);

    //         // Create a Keypair from the Uint8Array
    //         const keypair = Keypair.fromSecretKey(privateKeyUint8Array);

    //         const solanaParams: ICreateSolanaExt = {
    //             invoker: keypair, // SignerWalletAdapter or Keypair of Sender account
    //             isNative: true // [optional] [WILL CREATE A wSOL Airdrop] Needed only if you need to Airdrop Solana native token
    //         };

    //         const res = await client.create(
    //             {
    //                 mint: "So11111111111111111111111111111111111111112", // mint
    //                 version: now, // version of the Airdrop, version will be used to generate unique address of the Distributor Account
    //                 root: [
    //                     54, 218, 49, 68, 131, 214, 250, 113, 37, 143, 167, 73, 17, 54, 233, 26, 141, 93, 28, 186, 137, 211, 251, 205,
    //                     240, 192, 134, 208, 108, 246, 0, 191,
    //                 ], // Merkle root
    //                 maxNumNodes: new BN(numberOfReceipts), // Number of recipients
    //                 maxTotalClaim: new BN(totalAmount), // Total amount to distribute
    //                 unlockPeriod: 1, // Unlock period in seconds
    //                 startVestingTs: 0, // Timestamp when Airdrop starts
    //                 endVestingTs: now + 3600 * 24 * 7, // Timestamp when Airdrop ends
    //                 clawbackStartTs: now + 5, // Timestamp after which Airdrop can be clawed back to the Sender address
    //                 claimsClosable: false, // Whether individual Claims can be closed by the Sender
    //             },
    //             solanaParams,
    //         );

    //         return res;
    //     }
    //     catch (error: any) {
    //         throw new Error(error);
    //     }
    // }

}