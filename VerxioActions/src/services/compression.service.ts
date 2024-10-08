import { clusterApiUrl, PublicKey, Transaction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from "@solana/web3.js";
import { LightSystemProgram, createRpc, defaultTestStateTreeAccounts, Rpc, bn, ParsedTokenAccount } from "@lightprotocol/stateless.js";
import { CompressedTokenProgram, selectMinCompressedTokenAccountsForTransfer } from "@lightprotocol/compressed-token";
import { createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { computeUnitLimit, computeUnitPrice } from "./constants.service";

const RPC_URL = `${process.env.SOLANA_RPC_URL}/?api-key=${process.env.API_KEY}`;
const rpcUrl = RPC_URL|| clusterApiUrl('devnet');
const connection: Rpc = createRpc(rpcUrl, rpcUrl);

// Fetch compressed tokens by owner
export const getCompressedTokens = async (owner: string, mintAddress: string) => {
    try {
        console.log("Using RPC URL:", rpcUrl);
        const accounts = await connection.getCompressedTokenAccountsByOwner(new PublicKey(owner), {
            mint: new PublicKey(mintAddress)
        });

        // Deduplicate tokens with the same mint address and add the amounts
        const deduplicatedAccounts = accounts.items.reduce((acc, current) => {
            const existingAccount = acc.find(item => item.parsed.mint.equals(current.parsed.mint));
            if (existingAccount) {
                existingAccount.parsed.amount = existingAccount.parsed.amount.add(current.parsed.amount);
            } else {
                acc.push(current);
            }
            return acc;
        }, [] as typeof accounts.items);

        return deduplicatedAccounts;
    } catch (error) {
        console.error("Error fetching compressed tokens:", error);
        throw new Error("Error fetching compressed tokens!");
    }
};

// Build transaction to compress SOL
export const buildCompressSolTx = async (payer: string, solAmount: number): Promise<Transaction> => {
    try {
        const { blockhash } = await connection.getLatestBlockhash();

        const compressSolIx = await LightSystemProgram.compress({
            payer: new PublicKey(payer),
            toAddress: new PublicKey(payer),
            lamports: solAmount * LAMPORTS_PER_SOL,
            outputStateTree: defaultTestStateTreeAccounts().merkleTree,
        });

        const transaction = new Transaction();

        transaction.add(
            ComputeBudgetProgram.setComputeUnitLimit({
                units: computeUnitLimit
            }),
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: computeUnitPrice,
            }),
            compressSolIx
        );

        transaction.feePayer = new PublicKey(payer);
        transaction.recentBlockhash = blockhash;

        return transaction;
    } catch (error) {
        console.error("Error creating SOL compress transaction:", error);
        throw new Error("Transaction creation failed");
    }
};

// Build transaction to compress SPL tokens
export const buildCompressSplTokenTx = async (payer: string, amount: number, mintAddress: string): Promise<Transaction> => {
    try {
        const { blockhash } = await connection.getLatestBlockhash();
        const sourceTokenAccount = await getAssociatedTokenAddress(new PublicKey(mintAddress), new PublicKey(payer));

        const compressIx = await CompressedTokenProgram.compress({
            payer: new PublicKey(payer),
            owner: new PublicKey(payer),
            source: sourceTokenAccount,
            toAddress: new PublicKey(payer),
            amount: Number(amount),
            mint: new PublicKey(mintAddress),
        });

        const transaction = new Transaction();

        transaction.add(
            ComputeBudgetProgram.setComputeUnitLimit({
                units: computeUnitLimit
            }),
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: computeUnitPrice,
            }),
            compressIx
        );

        transaction.feePayer = new PublicKey(payer);
        transaction.recentBlockhash = blockhash;

        return transaction;
    } catch (error) {
        console.error("Error creating SPL token compress transaction:", error);
        throw new Error("Compress Transaction creation failed");
    }
};

// Build transaction to decompress SPL tokens
export const buildDecompressSplTokenTx = async (payer: string, mintAddress: string, maxAmount: number): Promise<Transaction> => {
    try {
        const { blockhash } = await connection.getLatestBlockhash();
        const transaction = new Transaction();

        if (maxAmount > 0) {
            // Calculate ATA
            const ata = await getAssociatedTokenAddress(
                new PublicKey(mintAddress),
                new PublicKey(payer),
            );

            // Check if the ATA exists
            const ataInfo = await connection.getAccountInfo(ata);
            const ataExists = ataInfo !== null;

            if (!ataExists) {
                // Create an associated token account if it doesn't exist
                const createAtaIx = await createAssociatedTokenAccountInstruction(
                    new PublicKey(payer),
                    ata,
                    new PublicKey(payer),
                    new PublicKey(mintAddress),
                );

                transaction.add(createAtaIx);
            }

            // Fetch the latest compressed token account state
            const compressedTokenAccounts =
                await connection.getCompressedTokenAccountsByOwner(new PublicKey(payer), {
                    mint: new PublicKey(mintAddress)
                });

            // Select accounts to transfer from based on the transfer amount
            const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
                compressedTokenAccounts.items,
                bn(maxAmount),
            );

            // Fetch recent validity proof
            const proof = await connection.getValidityProof(
                inputAccounts.map(account => bn(account.compressedAccount.hash)),
            );

            const decompressIx = await CompressedTokenProgram.decompress({
                payer: new PublicKey(payer),
                inputCompressedTokenAccounts: inputAccounts,
                toAddress: await getAssociatedTokenAddress(new PublicKey(mintAddress), new PublicKey(payer)),
                amount: maxAmount,
                recentInputStateRootIndices: proof.rootIndices,
                recentValidityProof: proof.compressedProof,
            });

            transaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({
                    units: computeUnitLimit
                }),
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: computeUnitPrice,
                }),
                decompressIx
            );
        }

        transaction.feePayer = new PublicKey(payer);
        transaction.recentBlockhash = blockhash;

        return transaction;
    } catch (error) {
        console.error("Error creating decompress transaction:", error);
        throw new Error("Decompress Transaction creation failed");
    }
};

export const buildTransferCompressedTokenTx = async (payer: string, recipient: string, compressedTokenAccounts: ParsedTokenAccount[]) => {
    try {
        const { blockhash } = await connection.getLatestBlockhash();
        const transaction = new Transaction();
        let maxAmount: number = 0;

        for (const account of compressedTokenAccounts) {
            const amount = account.parsed.amount.toNumber();
            if (amount > maxAmount) {
                maxAmount = amount;
            }
        }

        if (maxAmount > 0) {
            const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(compressedTokenAccounts, bn(maxAmount));
            const proof = await connection.getValidityProof(inputAccounts.map(account => bn(account.compressedAccount.hash)));

            const transferCompressedTokenTx = await CompressedTokenProgram.transfer({
                payer: new PublicKey(payer),
                inputCompressedTokenAccounts: inputAccounts,
                toAddress: new PublicKey(recipient),
                amount: maxAmount,
                recentInputStateRootIndices: proof.rootIndices,
                recentValidityProof: proof.compressedProof,
            });

            transaction.add(
                ComputeBudgetProgram.setComputeUnitLimit({
                    units: computeUnitLimit
                }),
                ComputeBudgetProgram.setComputeUnitPrice({
                    microLamports: computeUnitPrice,
                }),
                transferCompressedTokenTx
            );
        }

        transaction.feePayer = new PublicKey(payer);
        transaction.recentBlockhash = blockhash;

        return transaction;
    } catch (error) {
        console.error("Error creating transfer compressed tokens transaction:", error);
        throw new Error("Transfer compressed tokens transaction creation failed");
    }
}