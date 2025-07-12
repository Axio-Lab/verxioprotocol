import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import bs58 from 'bs58'
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters'
import { Keypair as Web3JsKeypair } from '@solana/web3.js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertSecretKeyToKeypair(secretKey: string) {
  try {
    const secretKeyBytes = bs58.decode(secretKey)
    const keypair = Web3JsKeypair.fromSecretKey(secretKeyBytes)
    return fromWeb3JsKeypair(keypair)
  } catch (error) {
    console.error('Error converting secret key:', error)
    throw new Error('Invalid secret key format')
  }
}
