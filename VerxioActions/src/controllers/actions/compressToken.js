import { Rpc, createRpc } from '@lightprotocol/stateless.js';
import { CompressedTokenProgram } from '@lightprotocol/compressed-token';
import { Transaction, PublicKey } from '@solana/web3.js';
import { createAssociatedTokenAccount, getAssociatedTokenAddress } from '@solana/spl-token';

export async function prepareCompressTokensTransaction(mint, amount) {
    
    const RPC_ENDPOINT = 'https://devnet.helius-rpc.com/?api-key=d7aa98e6-4f1e-420d-be26-231d5a586b93';
    const COMPRESSION_RPC_ENDPOINT = RPC_ENDPOINT;
    const connection = createRpc(RPC_ENDPOINT, COMPRESSION_RPC_ENDPOINT);
    account = new PublicKey("");

    // Get the associated token account address
    const ata = await getAssociatedTokenAddress(mint, account);

    // Check if the ATA exists
    const ataInfo = await connection.getAccountInfo(ata);
    
    const transaction = new Transaction();

    // If ATA doesn't exist, add create instruction
    if (!ataInfo) {
        const createAtaIx = await createAssociatedTokenAccount(
        connection,
        account,
        mint,
        account
        );
        transaction.add(createAtaIx);
    }

    // Create the compress instruction
    const compressIx = await CompressedTokenProgram.compress({
        payer: account,
        owner: account,
        source: ata,
        toAddress: account,
        amount,
        mint,
    });

    transaction.add(compressIx);

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = account;

    return transaction;
}