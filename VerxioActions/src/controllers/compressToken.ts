import {
    createPostResponse,
    ActionPostRequest,
    createActionHeaders,
    InlineNextActionLink,
    ActionGetResponse,
    LinkedAction,
} from '@solana/actions';
import { PublicKey } from '@solana/web3.js';
import { getCompressedTokens, buildCompressSplTokenTx, buildDecompressSplTokenTx, buildTransferCompressedTokenTx } from '../services/compression.service';
import { ParsedTokenAccount } from '@lightprotocol/stateless.js';

const SOLANA_MAINNET_USDC_PUBKEY = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const SOLANA_MAINNET_USDC_DECIMALS = 6;

const headers = createActionHeaders({
    chainId: 'mainnet',
    actionVersion: '2.2.1',
});

async function getUSDCActionLinks(baseHref: string): Promise<LinkedAction[]> {
    return [
        // {
        //     type: 'transaction',
        //     label: 'Compress USDC',
        //     href: `${baseHref}?action=compress&amount={amount}`,
        //     parameters: [
        //         {
        //             type: 'select',
        //             name: 'amount', // parameter name in the `href` above
        //             label: 'Amount of USDC to compress', // placeholder of the text input
        //             required: true,
        //             options: [
        //                 { label: '0.0001', value: '0.0001' },
        //                 { label: '0.001', value: '0.001' },
        //                 { label: '0.1', value: '0.1' },
        //             ],
        //         },
        //     ],
        // },
        {
            type: 'transaction',
            label: 'Compress', // button text
            href: `${baseHref}?action=compress&amount={amount}`,
            parameters: [
                {
                    name: 'amount', // field name
                    label: 'Enter a custom USDC amount', // text input placeholder
                },
            ],
        },
        {
            type: 'post',
            label: `Decompress USDC`, // button text
            href: `${baseHref}?action=decompress`,
            error: {
                message: `No compressed USDC found!`,
            },
        } as LinkedAction,
        {
            type: 'transaction',
            href: `${baseHref}?to={toPubkey}&action=transfer`,
            label: `Send compressed USDC`, // button text
            parameters: [
                {
                    name: 'toPubkey', // field name
                    label: 'Enter wallet address to send compressed USDC', // text input placeholder
                },
            ],
        }
    ];
}

async function getDecompressUSDCActionLinks(baseHref: string, toDefaultPubkey: string, maxCompressedAmount: number): Promise<LinkedAction[]> {
    const actions: LinkedAction[] = [];

    if (maxCompressedAmount > 0) {
        actions.push(
            {
                type: 'post',
                label: `Decompress ${maxCompressedAmount} USDC`, // button text
                href: `${baseHref}?to=${toDefaultPubkey}&action=decompress`,
            },
            {
                type: 'transaction',
                href: `${baseHref}?to={toPubkey}&action=transfer`,
                label: `Send ${maxCompressedAmount} compressed USDC`, // button text
                parameters: [
                    {
                        name: 'toPubkey', // field name
                        label: 'Enter the wallet address to send compressed USDC', // text input placeholder
                    },
                ],
            }
        );
    }

    return actions;
}

// Find the maximum compressed token amount
async function getMaxCompressedAmount(account: PublicKey, mintAddress: PublicKey, validTokenAccounts?: ParsedTokenAccount[]): Promise<number> {
    let maxCompressedAmount = 0;

    try {
        // Use provided validTokenAccounts if available, otherwise fetch them
        if (!validTokenAccounts || validTokenAccounts.length === 0) {
            // Fetch valid compressed USDC token accounts
            validTokenAccounts = await getValidCompressedTokenAccounts(account, mintAddress);
        }

        // Find the token amount that can be decompressed
        for (const tokenAccount of validTokenAccounts) {
            const amount = tokenAccount.parsed.amount.toNumber();
            if (amount > maxCompressedAmount) {
                maxCompressedAmount = amount;
            }
        }
    } catch (error) {
        console.log(`Error fetching compressed token accounts: ${error}`);
        maxCompressedAmount = 0; // Return 0 if no valid accounts are found
    }

    return maxCompressedAmount;
}

// Fetch and filter valid compressed token accounts for any SPL token
async function getValidCompressedTokenAccounts(account: PublicKey, mintAddress: PublicKey) {
    // Fetch and display compressed tokens
    const compressedTokenAccounts = await getCompressedTokens(account.toBase58(), mintAddress.toBase58());

    // Check if there are any token accounts for the specified mint
    if (compressedTokenAccounts.length === 0) {
        throw new Error(`No compressed token accounts found for mint ${mintAddress.toBase58()}.`);
    }

    // Filter out accounts with amounts > 0
    const validTokenAccounts = compressedTokenAccounts.filter(token => token.parsed.amount.toNumber() > 0);

    // Check if we have any valid accounts
    if (validTokenAccounts.length === 0) {
        throw new Error('No valid accounts with amounts > 0 found.');
    }

    // Log the filtered token accounts
    console.log("Filtered Token Accounts:", validTokenAccounts.map(token => ({
        mint: token.parsed.mint.toBase58(),
        owner: token.parsed.owner.toBase58(),
        amount: token.parsed.amount.toNumber(),
    })));

    return validTokenAccounts;
}

// GET handler to provide the actions for compressing and decompressing Spl Token
export const GET = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);

        const baseHref = new URL(
            `/api/actions/compress-spl-token/usdc`,
            requestUrl.origin,
        ).toString();

        const payload: ActionGetResponse = {
            type: 'action',
            title: 'USDC ZK Compression',
            icon: 'https://i.ibb.co/Gp235BN/zk-compression.jpg/880x864',
            description: 'Compress, decompress & send your USDC in a blink! 👀',
            label: 'Compress & Decompress USDC',
            links: {
                actions: await getUSDCActionLinks(baseHref)
            },
        };

        return Response.json(payload, { headers });
    } catch (err) {
        console.error(err);
        const message = typeof err === 'string' ? err : 'An unknown error occurred';
        return new Response(message, { status: 400, headers });
    }
};

// POST handler to handle compressing and decompressing Spl Token
export const POST = async (req: Request) => {
    try {
        const requestUrl = new URL(req.url);
        const { amount, toPubkey, action } = validatedQueryParams(requestUrl); // Get the action (compress or decompress)

        const body: ActionPostRequest = await req.json();

        // Validate the client-provided input
        let account: PublicKey;
        try {
            account = new PublicKey(body.account);
        } catch (err) {
            return new Response('Invalid "account" provided', {
                status: 400,
                headers,
            });
        }

        console.log(`amount, toPubkey, action: ${amount}, ${toPubkey}, ${action}`)

        const normalizedAmount = Math.round(amount * Math.pow(10, SOLANA_MAINNET_USDC_DECIMALS));

        if (action === 'compress') {
            const baseHref = new URL(
                `/api/actions/compress-spl-token/usdc`,
                requestUrl.origin,
            ).toString();

            // Build the Compress USDC transaction
            const transaction = await buildCompressSplTokenTx(account.toBase58(), normalizedAmount, SOLANA_MAINNET_USDC_PUBKEY);

            // Return the response including the transaction and a message
            const payload = await createPostResponse({
                fields: {
                    type: 'transaction',
                    transaction,
                    message: `Compressed ${amount} USDC for ${account.toBase58()}`,
                    links: {
                        next: {
                            type: 'inline', // Inline action chaining
                            action: {
                                type: 'action',
                                icon: 'https://i.ibb.co/Gp235BN/zk-compression.jpg/880x864',
                                label: 'Done!',
                                title: 'Decompress & Send Compressed USDC',
                                disabled: false,
                                description: 'Your USDC has been successfully compressed! Now you can decompress or send it.',
                                links: {
                                    actions: await getDecompressUSDCActionLinks(baseHref, account.toBase58(), amount)
                                }
                            },
                        } as InlineNextActionLink,
                    },
                },
            });

            return Response.json(payload, {
                headers,
            });
        } else if (action === 'decompress') {
            // Fetch valid compressed USDC token accounts
            const validTokenAccounts = await getValidCompressedTokenAccounts(account, new PublicKey(SOLANA_MAINNET_USDC_PUBKEY));

            // Find the token amount that can be decompressed
            const maxCompressedAmount = await getMaxCompressedAmount(account, new PublicKey(SOLANA_MAINNET_USDC_PUBKEY), validTokenAccounts);

            // Build the Decompress USDC transaction
            const transaction = await buildDecompressSplTokenTx(account.toBase58(), SOLANA_MAINNET_USDC_PUBKEY, maxCompressedAmount);

            // Prepare the next action to decompress the Spl tokens
            const payload = await createPostResponse({
                fields: {
                    type: 'transaction',
                    transaction,
                    message: `Decompressed ${maxCompressedAmount / Math.pow(10, SOLANA_MAINNET_USDC_DECIMALS)} USDC to ${account.toBase58()}`,
                    links: {
                        next: {
                            type: 'inline', // Inline action chaining
                            action: {
                                type: 'action',
                                icon: 'https://i.ibb.co/Gp235BN/zk-compression.jpg/880x864',
                                label: 'Completed!',
                                title: 'Decompress USDC',
                                disabled: true,
                                description: 'Your USDC has been successfully decompressed!',
                            },
                            error: {
                                message: `No compressed USDC found!`,
                            }
                        } as InlineNextActionLink,
                    },
                },
            });

            return Response.json(payload, {
                headers,
            });
        } else if (action === 'transfer') {
            // Fetch valid compressed USDC token accounts
            const validTokenAccounts = await getValidCompressedTokenAccounts(account, new PublicKey(SOLANA_MAINNET_USDC_PUBKEY));
            // Build the Transfer Compressed USDC transaction
            const transaction = await buildTransferCompressedTokenTx(account.toBase58(), toPubkey.toBase58(), validTokenAccounts);

            // Prepare the next action to compress the Spl tokens
            const payload = await createPostResponse({
                fields: {
                    type: 'transaction',
                    transaction,
                    message: `Sent ${amount} compressed USDC to ${toPubkey.toBase58()}`,
                    links: {
                        next: {
                            type: 'inline', // Inline action chaining
                            action: {
                                type: 'action',
                                icon: 'https://i.ibb.co/Gp235BN/zk-compression.jpg/880x864',
                                label: 'Completed!',
                                title: 'Send Compressed USDC',
                                disabled: true,
                                description: 'Your compressed USDC has been successfully sent!',
                            },
                        } as InlineNextActionLink,
                    },
                },
            });

            return Response.json(payload, {
                headers,
            });
        } else {
            return new Response('Invalid action specified', {
                status: 400,
                headers,
            });
        }
    } catch (err) {
        console.error(err);
        const message = typeof err === 'string' ? err : 'An unknown error occurred';
        return new Response(message, {
            status: 400,
            headers,
        });
    }
};

// Helper function to validate query parameters
function validatedQueryParams(requestUrl: URL) {
    let toPubkey: PublicKey = new PublicKey("3rh9uw7wnUAJNFijUVPuxLjyEaTd984mZeWFKYVa6LgY"); // Default wallet address
    let amount: number = 0.001; // Default amount
    let action: string = 'compress'; // Default action is compress

    try {
        if (requestUrl.searchParams.get('to')) {
            toPubkey = new PublicKey(requestUrl.searchParams.get('to')!);
        }
    } catch (err) {
        throw 'Invalid input query parameter: to';
    }

    try {
        if (requestUrl.searchParams.get('amount')) {
            amount = parseFloat(requestUrl.searchParams.get('amount')!);
        }
        if (amount <= 0) throw 'amount is too small';
    } catch (err) {
        throw 'Invalid input query parameter: amount';
    }

    try {
        if (requestUrl.searchParams.get('action')) {
            action = requestUrl.searchParams.get('action')!;
        }
    } catch (err) {
        throw 'Invalid input query parameter: action';
    }

    return {
        amount,
        toPubkey,
        action,
    };
}

// Handle OPTIONS for CORS
export const OPTIONS = async (req: Request) => {
    return new Response(null, { headers });
};
