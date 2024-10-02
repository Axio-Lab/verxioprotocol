import dotenv from 'dotenv';
dotenv.config();

import { BN } from "bn.js";
import { StreamflowSolana, getBN, ICluster } from '@streamflow/stream';
import { Keypair, Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

// Constants for fee percentages
const TOTAL_FEE_PERCENTAGE = 0.01; // 1% total fee
const STREAMFLOW_FEE_PERCENTAGE = 0.0019; // 0.19% Streamflow fee
const TREASURY_FEE_PERCENTAGE = TOTAL_FEE_PERCENTAGE - STREAMFLOW_FEE_PERCENTAGE; // 0.8% treasury fee
const TREASURY_WALLET = new PublicKey(process.env.TREASURY_WALLET!);


const BUFFER_TIME = 60; // 1 minute buffer
const cluster = ICluster.Devnet;

async function payWinnersAndWithdraw(totalAmount: number, winnerAddresses: string[]) {
  const RPC_URL = `${process.env.SOLANA_RPC_URL}/?api-key=${process.env.API_KEY}`;
  const connection = new Connection(RPC_URL);

  function envToKeypair(envVarName: string) {
    const envVarValue = process.env[envVarName];
    const keyArray = envVarValue!.replace(/^\[|\]$/g, '').split(',').map(Number);
    const keyUint8Array = new Uint8Array(keyArray);
    const keypair = Keypair.fromSecretKey(keyUint8Array);
    return keypair;
  }

  const escrowPayout = envToKeypair("PRIVATE_KEY");

  // Calculate fee amounts
  const totalFeeAmount = totalAmount * TOTAL_FEE_PERCENTAGE;
  const treasuryFeeAmount = totalAmount * TREASURY_FEE_PERCENTAGE;

  // Calculate total amount including fees
  const totalAmountWithFees = totalAmount + totalFeeAmount;

  // Check balance
  const balance = await connection.getBalance(escrowPayout.publicKey);
  if (balance < totalAmountWithFees * 1e9) { // Convert to lamports
    throw new Error(`Insufficient balance. Required: ${totalAmountWithFees} SOL, Available: ${balance / 1e9} SOL`);
  }

  // Initialize Solana client
  const solanaClient = new StreamflowSolana.SolanaStreamClient(RPC_URL, cluster);
  const amountPerWinner = totalAmount / winnerAddresses.length;
  const recipients = winnerAddresses.map(address => ({
    recipient: address,
    amount: getBN(amountPerWinner, 9),
    name: "Title of the Campaign goes here!",
    cliffAmount: new BN(0),
    amountPerPeriod: getBN(amountPerWinner, 9),
  }));

  // Prepare stream parameters
  const createStreamParams: any = {
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

  const solanaParams = {
    sender: escrowPayout,
    isNative: true, // We're using native SOL
  };

  try {
    // Step 1: Create paymnt streams
    console.log("Creating streams for winners...");
    const { txs, errors } = await solanaClient.createMultiple(createStreamParams, solanaParams);
    console.log(errors, "errors")

    // Step 2: Send treasury fee
    const instruction = SystemProgram.transfer({
      fromPubkey: escrowPayout.publicKey,
      toPubkey: TREASURY_WALLET,
      lamports: getBN(treasuryFeeAmount, 9) as any
    });

    const latestBlockhash = await connection.getLatestBlockhash();

    const messageV0 = new TransactionMessage({
      payerKey: escrowPayout.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [instruction],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(messageV0);

    transaction.sign([escrowPayout]);

    const txid = await connection.sendTransaction(transaction);

    return {
      streamCreationTxs: txs,
      streamCreationErros: errors,
      treasuryFeeTxs: txid,
    };
  } catch (error) {
    console.error("Error in payWinnersAndWithdraw:", error);
    throw error;
  }
}

export default payWinnersAndWithdraw;

// Example usage
// const totalPrizePool = 1;
// const winners = [
//   "6WdSAAE49mp7bxKScXDNV41zX1Uk9bCTg6QeaV6YkToy",
//   "9qrxh23sGGFxgLTKRD4YzR1bsEzm6vE5vKfK7ngwgXZo",
//   "HwALRRu38hBrztNRZWdWZu33DyCskWmt5P6eXZ2cTfEi",
//   "FFvPUNGYsQa4vjLAcCJ4zx8vZ4BSqQoCbMMyG3VNuEnd"
// ];

// payWinnersAndWithdraw(totalPrizePool, winners)
//   .then(result => {
//     console.log("Prize distribution and withdrawal complete.");
//     console.log("Stream Creation Transactions:", result.streamCreationTxs);
//   })
//   .catch(error => console.error("Prize distribution and withdrawal failed:", error));