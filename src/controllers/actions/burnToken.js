import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { PublicKey, Transaction } from '@solana/web3.js';
import { createBurnInstruction, getAssociatedTokenAddress } from '@solana/spl-token';

export async function prepareBurnTokensTransaction(mint, amount) {

  const RPC_ENDPOINT = 'https://devnet.helius-rpc.com/?api-key=d7aa98e6-4f1e-420d-be26-231d5a586b93';
  const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;
  const connection = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT);
  account = new PublicKey("");
  
  // Get the associated token account for the owner
  const associatedTokenAddress = await getAssociatedTokenAddress(
    new PublicKey(mint),
    account
  );

  // Create the burn instruction
  const burnInstruction = createBurnInstruction(
    associatedTokenAddress,
    new PublicKey(mint),
    account,
    amount
  );

  // Create a new transaction and add the burn instruction
  const transaction = new Transaction().add(burnInstruction);

  // Get the latest blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = account;

  return transaction;
}