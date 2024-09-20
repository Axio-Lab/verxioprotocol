import { BN } from "bn.js";
import { StreamflowSolana, Types, getBN } from "@streamflow/stream";

async function payWinnersAndWithdraw(totalAmount, winnerAddresses) {
  // Initialize Solana client
  const solanaClient = new StreamflowSolana.SolanaStreamClient(
    "https://api.mainnet-beta.solana.com"
  );

  // Calculate amount per winner
  const amountPerWinner = totalAmount / winnerAddresses.length;

  // Prepare recipients array
  const recipients = winnerAddresses.map(address => ({
    recipient: address,
    amount: getBN(amountPerWinner, 9), // Assuming SOL has 9 decimals
    name: "Contest Prize",
    cliffAmount: new BN(0),
    amountPerPeriod: getBN(amountPerWinner, 9),
  }));

  // Prepare stream parameters
  const createStreamParams = {
    recipients: recipients,
    tokenId: "So11111111111111111111111111111111111111112", // SOL mint address
    start: Math.floor(Date.now() / 1000), // Current timestamp
    period: 1, // Instant unlock
    cliff: Math.floor(Date.now() / 1000), // No cliff
    canTopup: false,
    cancelableBySender: false,
    cancelableByRecipient: false,
    transferableBySender: false,
    transferableByRecipient: true,
    automaticWithdrawal: true,
    withdrawalFrequency: 0, // Allow immediate withdrawal
    partner: null,
  };

  // Prepare Solana-specific parameters
  const solanaParams = {
    sender: senderWallet, // Replace with your sender wallet instance
    isNative: true, // We're using native SOL
  };

  try {
    // Step 1: Create streams
    console.log("Creating streams for winners...");
    const { txs, metadata } = await solanaClient.createMultiple(createStreamParams, solanaParams);
    console.log("Streams created successfully. Transaction IDs:", txs);

    // Step 2: Withdraw funds for each winner
    console.log("Initiating withdrawals for winners...");
    const withdrawalTxs = await Promise.all(
      metadata.map(async (streamMetadata, index) => {
        const withdrawStreamParams = {
          id: streamMetadata.id,
          amount: getBN(amountPerWinner, 9), // Withdraw full amount
        };

        const withdrawSolanaParams = {
          invoker: senderWallet, // Using sender wallet to automate withdrawal
        };

        try {
          const { tx } = await solanaClient.withdraw(withdrawStreamParams, withdrawSolanaParams);
          console.log(`Withdrawal successful for winner ${index + 1}. Transaction ID:`, tx);
          return tx;
        } catch (withdrawError) {
          console.error(`Withdrawal failed for winner ${index + 1}:`, withdrawError);
          return null;
        }
      })
    );

    return {
      streamCreationTxs: txs,
      withdrawalTxs: withdrawalTxs.filter(tx => tx !== null),
    };
  } catch (error) {
    console.error("Error in payWinnersAndWithdraw:", error);
    throw error;
  }
}

// Example usage
const totalPrizePool = 5; // 5 SOL
const winners = [
  "4ih00075bKjVg000000tLdk4w42NyG3Mv0000dc0M00",
  // ... add more winner addresses here
];

payWinnersAndWithdraw(totalPrizePool, winners)
  .then(result => {
    console.log("Prize distribution and withdrawal complete.");
    console.log("Stream Creation Transactions:", result.streamCreationTxs);
    console.log("Withdrawal Transactions:", result.withdrawalTxs);
  })
  .catch(error => console.error("Prize distribution and withdrawal failed:", error));