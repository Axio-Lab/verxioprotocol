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
const campaign_model_1 = __importDefault(require("../models/campaign.model"));
const bn_js_1 = require("bn.js");
const solanaDistributor_config_1 = __importDefault(require("../configs/solanaDistributor.config"));
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
class CampaignService {
    create(campaign) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield campaign_model_1.default.create(campaign);
        });
    }
    findOne(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield campaign_model_1.default.findOne(params);
        });
    }
    find(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield campaign_model_1.default.find(params);
        });
    }
    createDistributorClient(wallet, numberOfReceipts, totalAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = Math.floor(Date.now() / 1000);
                // Decode the base58 encoded private key
                const privateKey = bs58_1.default.decode("4YmLtbexfNC6zBmLj17DRbFq1XQTsdR7wRuJhCQHvLpQeokew6csQn1DACCMjSzqV5Yk9cFzjTFCfezo7Nrbxzvu");
                // Create a Uint8Array from the decoded private key
                const privateKeyUint8Array = new Uint8Array(privateKey);
                // Create a Keypair from the Uint8Array
                const keypair = web3_js_1.Keypair.fromSecretKey(privateKeyUint8Array);
                const solanaParams = {
                    invoker: keypair, // SignerWalletAdapter or Keypair of Sender account
                    isNative: true // [optional] [WILL CREATE A wSOL Airdrop] Needed only if you need to Airdrop Solana native token
                };
                const res = yield solanaDistributor_config_1.default.create({
                    mint: "So11111111111111111111111111111111111111112", // mint
                    version: now, // version of the Airdrop, version will be used to generate unique address of the Distributor Account
                    root: [
                        54, 218, 49, 68, 131, 214, 250, 113, 37, 143, 167, 73, 17, 54, 233, 26, 141, 93, 28, 186, 137, 211, 251, 205,
                        240, 192, 134, 208, 108, 246, 0, 191,
                    ], // Merkle root
                    maxNumNodes: new bn_js_1.BN(numberOfReceipts), // Number of recipients
                    maxTotalClaim: new bn_js_1.BN(totalAmount), // Total amount to distribute
                    unlockPeriod: 1, // Unlock period in seconds
                    startVestingTs: 0, // Timestamp when Airdrop starts
                    endVestingTs: now + 3600 * 24 * 7, // Timestamp when Airdrop ends
                    clawbackStartTs: now + 5, // Timestamp after which Airdrop can be clawed back to the Sender address
                    claimsClosable: false, // Whether individual Claims can be closed by the Sender
                }, solanaParams);
                return res;
            }
            catch (error) {
                throw new Error(error);
            }
        });
    }
}
exports.default = CampaignService;
