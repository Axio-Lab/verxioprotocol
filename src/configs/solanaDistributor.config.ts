import { ICluster } from "@streamflow/common";
import { SolanaDistributorClient } from "@streamflow/distributor/solana";

const client = new SolanaDistributorClient({
    clusterUrl: "https://api.mainnet-beta.solana.com",
    cluster: ICluster.Mainnet
});

export default client;