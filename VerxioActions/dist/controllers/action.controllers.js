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
const product_service_1 = __importDefault(require("../services/product.service"));
const campaign_service_1 = __importDefault(require("../services/campaign.service"));
const actions_1 = require("@solana/actions");
const web3_js_1 = require("@solana/web3.js");
const burnToken_1 = require("./actions/burnToken");
const { getProductByQuery } = new product_service_1.default();
const CampaignService = new campaign_service_1.default();
const DEFAULT_SOL_ADDRESS = new web3_js_1.PublicKey("F6XAa9hcAp9D9soZAk4ea4wdkmX4CmrMEwGg33xD1Bs9");
class ActionController {
    getProductAction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const baseHref = new URL(`${req.protocol}://${req.get('host')}${req.originalUrl}`).toString();
                const productName = (req.params.name.replace(/-/g, ' '));
                const product = yield getProductByQuery({
                    name: productName
                });
                if (!product) {
                    return res.status(404).json("Invalid product name");
                }
                const disabled = ((product === null || product === void 0 ? void 0 : product.quantity) <= 0) ? true : false;
                let payload;
                if (product === null || product === void 0 ? void 0 : product.payAnyPrice) {
                    payload = {
                        title: `${product === null || product === void 0 ? void 0 : product.name}`,
                        icon: product === null || product === void 0 ? void 0 : product.image,
                        description: `${product === null || product === void 0 ? void 0 : product.description}`,
                        label: `Buy Now`,
                        disabled,
                        links: {
                            actions: [
                                {
                                    label: `Buy Now`,
                                    href: `${baseHref}?amount={amount}`,
                                    parameters: [
                                        {
                                            name: "amount",
                                            label: "Enter a custom USD amount"
                                        }
                                    ]
                                }
                            ]
                        }
                    };
                }
                else {
                    payload = {
                        icon: product === null || product === void 0 ? void 0 : product.image,
                        label: `Buy Now (${product === null || product === void 0 ? void 0 : product.price} SOL)`,
                        description: `${product === null || product === void 0 ? void 0 : product.description}`,
                        title: `${product === null || product === void 0 ? void 0 : product.name}`,
                        disabled
                    };
                }
                res.set(actions_1.ACTIONS_CORS_HEADERS);
                return res.json(payload);
            }
            catch (error) {
                return res.status(500)
                    .send({
                    success: false,
                    message: `Error: ${error.message}`
                });
            }
        });
    }
    postProductAction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const productName = (req.params.name.replace(/-/g, ' '));
                const product = yield getProductByQuery({
                    name: productName
                });
                if (!product) {
                    return res.status(404).json("Invalid product name");
                }
                const body = req.body;
                // Validate the client-provided input
                let account;
                try {
                    account = new web3_js_1.PublicKey(body.account);
                }
                catch (err) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid "account" provided',
                    });
                }
                const connection = new web3_js_1.Connection(process.env.SOLANA_RPC || (0, web3_js_1.clusterApiUrl)("devnet"));
                // Ensure the receiving account will be rent exempt
                const minimumBalance = yield connection.getMinimumBalanceForRentExemption(0 // Note: simple accounts that just store native SOL have `0` bytes of data
                );
                let price;
                if (product === null || product === void 0 ? void 0 : product.payAnyPrice) {
                    price = parseFloat(req.query.amount);
                    if (price <= 0)
                        throw new Error("amount is too small");
                }
                else {
                    price = product === null || product === void 0 ? void 0 : product.price;
                }
                if (price * web3_js_1.LAMPORTS_PER_SOL < minimumBalance) {
                    throw `account may not be rent exempt: ${DEFAULT_SOL_ADDRESS.toBase58()}`;
                }
                const sellerPubkey = new web3_js_1.PublicKey(product === null || product === void 0 ? void 0 : product.userId);
                const transaction = new web3_js_1.Transaction();
                // Transfer 90% of the funds to the seller's address
                transaction.add(web3_js_1.SystemProgram.transfer({
                    fromPubkey: account,
                    toPubkey: sellerPubkey,
                    lamports: Math.floor(price * web3_js_1.LAMPORTS_PER_SOL * 0.9),
                }));
                // Transfer 10% of the funds to the default SOL address
                transaction.add(web3_js_1.SystemProgram.transfer({
                    fromPubkey: account,
                    toPubkey: DEFAULT_SOL_ADDRESS,
                    lamports: Math.floor(price * web3_js_1.LAMPORTS_PER_SOL * 0.1),
                }));
                // Set the end user as the fee payer
                transaction.feePayer = account;
                transaction.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
                const payload = {
                    transaction: transaction.serialize({
                        requireAllSignatures: false,
                        verifySignatures: true,
                    }).toString('base64'),
                    message: `You've successfully purchased ${product === null || product === void 0 ? void 0 : product.name} for ${price} SOL 🎊`,
                };
                console.log("Payload:", payload);
                console.log("Transaction:", transaction);
                res.set(actions_1.ACTIONS_CORS_HEADERS);
                return res.status(200).json(payload);
            }
            catch (error) {
                return res.status(500).send({
                    success: false,
                    message: `Error: ${error.message}`,
                });
            }
        });
    }
    getBurnAction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const campaignName = (req.params.title.replace(/-/g, ' '));
                const campaign = yield CampaignService.findOne({
                    "campaignInfo.title": campaignName
                });
                if (!campaign) {
                    return res.status(404).json("Invalid campaign title");
                }
                const payload = {
                    icon: campaign === null || campaign === void 0 ? void 0 : campaign.campaignInfo.banner,
                    label: `Burn Token`,
                    description: `${campaign === null || campaign === void 0 ? void 0 : campaign.campaignInfo.description}`,
                    title: `${campaign === null || campaign === void 0 ? void 0 : campaign.campaignInfo.title}`,
                };
                res.set(actions_1.ACTIONS_CORS_HEADERS);
                return res.json(payload);
            }
            catch (error) {
                return res.status(500)
                    .send({
                    success: false,
                    message: `Error: ${error.message}`
                });
            }
        });
    }
    postBurnAction(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const campaignName = (req.params.title.replace(/-/g, ' '));
                const campaign = yield CampaignService.findOne({
                    "campaignInfo.title": campaignName
                });
                if (!campaign) {
                    return res.status(404).json("Invalid campaign title");
                }
                const body = req.body;
                // Validate the client-provided input
                let account;
                try {
                    account = new web3_js_1.PublicKey(body.account);
                }
                catch (err) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid "account" provided',
                    });
                }
                const transaction = yield (0, burnToken_1.prepareBurnTokensTransaction)(campaign.actions.action.url, campaign.actions.action.amount, account);
                const payload = {
                    transaction: transaction.serialize({
                        requireAllSignatures: false,
                        verifySignatures: true,
                    }).toString('base64'),
                    message: `You've successfully minted token`,
                };
                console.log("Payload:", payload);
                console.log("Transaction:", transaction);
                res.set(actions_1.ACTIONS_CORS_HEADERS);
                return res.status(200).json(payload);
            }
            catch (error) {
                return res.status(500).send({
                    success: false,
                    message: `Error: ${error.message}`,
                });
            }
        });
    }
}
exports.default = ActionController;
