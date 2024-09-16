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
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareBurnTokensTransaction = prepareBurnTokensTransaction;
const stateless_js_1 = require("@lightprotocol/stateless.js");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
function prepareBurnTokensTransaction(mint, amount, pubKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const RPC_ENDPOINT = 'https://devnet.helius-rpc.com/?api-key=d7aa98e6-4f1e-420d-be26-231d5a586b93';
        const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;
        const connection = (0, stateless_js_1.createRpc)(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT);
        const account = new web3_js_1.PublicKey(pubKey);
        // Get the associated token account for the owner
        const associatedTokenAddress = yield (0, spl_token_1.getAssociatedTokenAddress)(new web3_js_1.PublicKey(mint), account);
        // Create the burn instruction
        const burnInstruction = (0, spl_token_1.createBurnInstruction)(associatedTokenAddress, new web3_js_1.PublicKey(mint), account, amount);
        // Create a new transaction and add the burn instruction
        const transaction = new web3_js_1.Transaction().add(burnInstruction);
        // Get the latest blockhash
        const { blockhash } = yield connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = account;
        return transaction;
    });
}
