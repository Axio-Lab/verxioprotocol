import { BN } from "bn.js";
import { StreamflowSolana, getBN, ICluster } from '@streamflow/stream';
import { Keypair, Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";
import bs58 from 'bs58';

  // Constants for fee percentages
  const TOTAL_FEE_PERCENTAGE = 0.01; // 1% total fee
  const STREAMFLOW_FEE_PERCENTAGE = 0.0019; // 0.19% Streamflow fee
  const TREASURY_FEE_PERCENTAGE = TOTAL_FEE_PERCENTAGE - STREAMFLOW_FEE_PERCENTAGE; // 0.8% treasury fee

  const BUFFER_TIME = 60; // 1 minute buffer
  const cluster = ICluster.Devnet;

async function payWinnersAndWithdraw(totalAmount, winnerAddresses) {
  const RPC_URL = "https://devnet.helius-rpc.com/?api-key=d7aa98e6-4f1e-420d-be26-231d5a586b93";
  const connection = new Connection(RPC_URL);
  const privateKey = "5GT8TtBWKqpLu11TszNBGudoJvxzyBgWGk7KGi2Bp7eMrxAk4bSn2UzY8NE4iKctRXnghV16XzWAn681qHhzvo4V";
  const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));

  // Calculate fee amounts
  const totalFeeAmount = totalAmount * TOTAL_FEE_PERCENTAGE;
  const treasuryFeeAmount = totalAmount * TREASURY_FEE_PERCENTAGE;

  // Calculate total amount including fees
  const totalAmountWithFees = totalAmount + totalFeeAmount;

  // Check balance
  const balance = await connection.getBalance(keypair.publicKey);
  if (balance < totalAmountWithFees * 1e9) { // Convert to lamports
    throw new Error(`Insufficient balance. Required: ${totalAmountWithFees} SOL, Available: ${balance / 1e9} SOL`);
  }

  // Initialize Solana client
  const solanaClient = new StreamflowSolana.SolanaStreamClient(RPC_URL, cluster);

  // Calculate amount per winner 
  const amountPerWinner = totalAmount / winnerAddresses.length;

  // Prepare recipients array
  const recipients = winnerAddresses.map(address => ({
    recipient: address,
    amount: getBN(amountPerWinner, 9),
    name: "Title of the Campaign goes here!",
    cliffAmount: new BN(0),
    amountPerPeriod: getBN(amountPerWinner, 9),
  }));

  // Prepare stream parameters
  const createStreamParams = {
    recipients: recipients,
    tokenId: "So11111111111111111111111111111111111111112", 
    start: Math.floor(Date.now() / 1000) + BUFFER_TIME, 
    period: 1,
    cliff: Math.floor(Date.now() / 1000) + BUFFER_TIME, 
    canTopup: false,
    cancelableBySender: false,
    cancelableByRecipient: false,
    transferableBySender: false,
    transferableByRecipient: true,
    automaticWithdrawal: false,
    withdrawalFrequency: 0, 
    partner: null,
  };
    // Prepare Solana-specific parameters
    const solanaParams = {
      sender: keypair, 
      isNative: true, // We're using native SOL
    };

  try {
    // Step 1: Create payemnt streams
    console.log("Creating streams for winners...");
    const { txs, metadatas, errors } = await solanaClient.createMultiple(createStreamParams, solanaParams);
    console.log("Streams created successfully. Transaction Idx:", metadatas);
    console.log("Streams created successfully. Transaction Error:", errors);
       
       // Step 2: Send treasury fee
    const treasuryWallet = new PublicKey("F6XAa9hcAp9D9soZAk4ea4wdkmX4CmrMEwGg33xD1Bs9");
    
    const instruction = SystemProgram.transfer({
         fromPubkey: keypair.publicKey,
         toPubkey: treasuryWallet,
         lamports: getBN(treasuryFeeAmount, 9),
       });
   
    const latestBlockhash = await connection.getLatestBlockhash();
   
    const messageV0 = new TransactionMessage({
         payerKey: keypair.publicKey,
         recentBlockhash: latestBlockhash.blockhash,
         instructions: [instruction],
       }).compileToV0Message();
   
    const transaction = new VersionedTransaction(messageV0);
   
       transaction.sign([keypair]);
   
    const txid = await connection.sendTransaction(transaction);
    console.log(`Treasury fee transfer transaction sent: ${txid}`);

    return {
      streamCreationTxs: txs,
    };
  } catch (error) {
    console.error("Error in payWinnersAndWithdraw:", error);
    throw error;
  }
}

// Example usage
const totalPrizePool = 0.4;
const winners = [
  "6WdSAAE49mp7bxKScXDNV41zX1Uk9bCTg6QeaV6YkToy",
  "9qrxh23sGGFxgLTKRD4YzR1bsEzm6vE5vKfK7ngwgXZo",
  "HwALRRu38hBrztNRZWdWZu33DyCskWmt5P6eXZ2cTfEi",
  "FFvPUNGYsQa4vjLAcCJ4zx8vZ4BSqQoCbMMyG3VNuEnd"
];

payWinnersAndWithdraw(totalPrizePool, winners)
  .then(result => {
    console.log("Prize distribution and withdrawal complete.");
    console.log("Stream Creation Transactions:", result.streamCreationTxs);
  })
  .catch(error => console.error("Prize distribution and withdrawal failed:", error));