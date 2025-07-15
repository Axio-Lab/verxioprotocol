import { publicKey, sol } from '@metaplex-foundation/umi'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { transferSol } from '@metaplex-foundation/mpl-toolbox'

// Fee structure in SOL
export const FEES = {
  CREATE_LOYALTY_PROGRAM: 0.002, // 0.002 SOL
  CREATE_VOUCHER_COLLECTION: 0.002, // 0.002 SOL (same as loyalty program)
  LOYALTY_OPERATIONS: 0.001, // 0.001 SOL
  VERXIO_INTERACTION: 0.0004, // 0.0004 SOL
} as const

// Convert SOL to lamports
const toLamports = (solAmount: number): number => Math.floor(solAmount * LAMPORTS_PER_SOL)

// Fee recipient address
export const FEE_RECIPIENT = publicKey('3DdcJkvjW7KLtMeko3Zr57jEJWhqRHuPsEBFm1XJYh7W')

// Helper to get fee in lamports
export function getFeeInLamports(feeType: keyof typeof FEES): number {
  return toLamports(FEES[feeType])
}

export function createFeeInstruction(umi: any, source: any, feeType: keyof typeof FEES) {
  return transferSol(umi, {
    source,
    destination: FEE_RECIPIENT,
    amount: sol(FEES[feeType]),
  })
}
