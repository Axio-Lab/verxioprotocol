import { Rpc, bn, createRpc } from '@lightprotocol/stateless.js';
import { CompressedTokenProgram, selectMinCompressedTokenAccountsForTransfer } from '@lightprotocol/compressed-token';
import { Transaction, PublicKey } from '@solana/web3.js';
import { createAssociatedTokenAccount, getAssociatedTokenAddress } from '@solana/spl-token';

export async function prepareDecompressTokensTransaction( mint, amount) {
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

    // Fetch the latest compressed token account state
    const compressedTokenAccounts = await connection.getCompressedTokenAccountsByOwner(account, { mint });

    // Select accounts to transfer from based on the transfer amount
    const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
        compressedTokenAccounts,
        amount
    );

    // Fetch recent validity proof
    const proof = await connection.getValidityProof(
        inputAccounts.map(account => bn(account.compressedAccount.hash))
    );

    // Create the decompress instruction
    const decompressIx = await CompressedTokenProgram.decompress({
        payer: account,
        inputCompressedTokenAccounts: inputAccounts,
        toAddress: ata,
        amount,
        recentInputStateRootIndices: proof.rootIndices,
        recentValidityProof: proof.compressedProof,
    });

    transaction.add(decompressIx);

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = account;

    return transaction;
}