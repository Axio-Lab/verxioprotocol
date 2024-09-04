"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@streamflow/common");
const solana_1 = require("@streamflow/distributor/solana");
const client = new solana_1.SolanaDistributorClient({
    clusterUrl: "https://api.mainnet-beta.solana.com",
    cluster: common_1.ICluster.Mainnet
});
exports.default = client;
