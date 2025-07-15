'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useEffect, useState } from 'react'
import {
  VerxioContext,
  initializeVerxio,
  getProgramDetails,
  getProgramTiers,
  getPointsPerAction,
  issueLoyaltyPass,
} from '@verxioprotocol/core'
import { useParams } from 'next/navigation'
import { Providers } from '../../providers'
import Link from 'next/link'
import { generateSigner, KeypairSigner, signerIdentity } from '@metaplex-foundation/umi'
import { createSignerFromWalletAdapter } from '@metaplex-foundation/umi-signer-wallet-adapters'
import { ActionPanel } from '../../components/ActionPanel'
import { toast } from 'react-toastify'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { publicKey as createUmiPublicKey } from '@metaplex-foundation/umi'
import { PublicKey as UmiPublicKey } from '@metaplex-foundation/umi'
import { RPC_URLS } from '../../components/LoyaltyProgram'

interface ProgramDetails {
  name: string
  uri: string
  collectionAddress: string
  updateAuthority: string
  numMinted: number
  transferAuthority: string
  creator: string
  tiers: Array<{
    name: string
    xpRequired: number
    rewards: string[]
  }>
  pointsPerAction: Record<string, number>
  metadata: {
    organizationName: string
  }
}

interface MintedPass {
  address: UmiPublicKey
  signer: KeypairSigner
}

function MintPageContent() {
  const { programId } = useParams()
  const { publicKey, wallet } = useWallet()
  const [verxio, setVerxio] = useState<VerxioContext | null>(null)
  const [loading, setLoading] = useState(false)
  const [programDetails, setProgramDetails] = useState<ProgramDetails | null>(null)
  const [network, setNetwork] = useState<'devnet' | 'mainnet' | 'sonic-mainnet' | 'sonic-testnet'>('devnet')
  const [targetAddress, setTargetAddress] = useState<string>('')
  const [mintedPass, setMintedPass] = useState<MintedPass | null>(null)

  useEffect(() => {
    if (programId && publicKey && wallet?.adapter) {
      const initializeProtocol = async () => {
        try {
          // Create UMI instance
          const umi = createUmi(RPC_URLS[network])
          const umiPubKey = createUmiPublicKey(publicKey.toBase58())

          // Create initial context
          const context = initializeVerxio(umi, umiPubKey)

          // Set up wallet signer first
          const walletSigner = createSignerFromWalletAdapter(wallet.adapter)
          context.umi.use(signerIdentity(walletSigner))

          // Set collection address
          context.collectionAddress = createUmiPublicKey(programId as string)

          // Store context in state
          setVerxio(context)

          try {
            // Now fetch program details
            const details = await getProgramDetails(context)
            const tiers = await getProgramTiers(context)
            const pointsPerAction = await getPointsPerAction(context)

            setProgramDetails({
              ...details,
              tiers,
              pointsPerAction,
            })

            toast.success('Successfully loaded program details')
          } catch (error) {
            console.error('Error fetching program details:', error)
            toast.error('Failed to load program details. Please try again.')
          }
        } catch (error) {
          console.error('Protocol initialization error:', error)
          toast.error('Failed to initialize protocol')
        }
      }

      initializeProtocol()
    }
  }, [programId, publicKey, wallet, network])

  const mintPass = async () => {
    if (!verxio || !publicKey || !programDetails) return

    if (!targetAddress) {
      toast.error('Please enter a target address')
      return
    }

    try {
      // Validate target address
      const targetUmiPubkey = createUmiPublicKey(targetAddress)

      setLoading(true)
      toast.info('Initiating loyalty pass issuance via issueLoyaltyPass()')
      const authority = generateSigner(verxio.umi)

      const result = await issueLoyaltyPass(verxio, {
        collectionAddress: verxio.collectionAddress!,
        recipient: targetUmiPubkey,
        passName: `${programDetails.name} Loyalty Pass`,
        passMetadataUri: programDetails.uri,
        updateAuthority: authority,
        organizationName: programDetails.metadata.organizationName,
      })

      setMintedPass({
        address: createUmiPublicKey(result.asset.publicKey),
        signer: result.asset,
      })

      toast.success('Successfully minted loyalty pass')
    } catch (error) {
      console.error('Error minting pass:', error)
      toast.error('Failed to mint loyalty pass')
    }
    setLoading(false)
  }

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen p-8 relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs with glow */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-500/30 rounded-full mix-blend-overlay filter blur-[120px] animate-blob opacity-70"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/30 rounded-full mix-blend-overlay filter blur-[120px] animate-blob animation-delay-2000 opacity-70"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[800px] bg-pink-500/30 rounded-full mix-blend-overlay filter blur-[120px] animate-blob animation-delay-4000 opacity-70"></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/50 via-gray-900/30 to-gray-900/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Dashboard</span>
              </div>
            </Link>
            <WalletMultiButton className="wallet-button" />
          </div>
          {children}
        </div>
      </div>
    </div>
  )

  if (!publicKey) {
    return (
      <PageWrapper>
        <div className="glass-panel max-w-lg mx-auto text-center py-16">
          <div className="space-y-8">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500 rounded-full opacity-20 animate-pulse animation-delay-2000"></div>
            </div>

            <div>
              <h2 className="text-3xl font-bold gradient-text mb-4 text-gray-400">Connect Your Wallet</h2>
              <p className="text-gray-300 text-lg">Mint your loyalty pass and start earning rewards</p>
            </div>

            <div className="relative">
              {/* <WalletMultiButton className="wallet-button" /> */}
              {/* Decorative line */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            </div>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto">
        <div className="glass-panel space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-text mb-4 text-gray-300">
              {programDetails?.name ? `${programDetails.name} Loyalty Program` : 'Loyalty Program'}
            </h1>
            <p className="text-gray-400 text-lg">
              {mintedPass ? 'Earn rewards by completing actions' : 'Join the loyalty program and start earning rewards'}
            </p>
          </div>

          {/* Program Details */}
          {programDetails && !mintedPass && (
            <div className="space-y-6">
              {/* Add address input field */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Recipient Address</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                    placeholder="Enter the address to mint the pass to..."
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <p className="text-sm text-gray-500">The user address to recveive the loyalty pass and points</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Available Actions</h3>
                  <ul className="space-y-3">
                    {Object.entries(programDetails.pointsPerAction).map(([action, points]) => (
                      <li key={action} className="flex items-center space-x-3 text-gray-400">
                        <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="flex-1 capitalize">{action}</span>
                        <span className="text-blue-400 font-medium">{points} XP</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Reward Tiers</h3>
                  <ul className="space-y-3">
                    {programDetails.tiers.map((tier: any, index: number) => (
                      <li key={index} className="flex items-center space-x-3 text-gray-400">
                        <div className="w-8 h-8 rounded-full bg-blue-900/30 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-blue-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <span className="text-gray-300">{tier.name}</span>
                          <div className="text-sm text-gray-500">Requires {tier.xpRequired} XP</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {mintedPass && verxio ? (
            <ActionPanel
              verxio={verxio}
              passAddress={mintedPass.address}
              passSigner={mintedPass.signer}
              network={network}
              targetAddress={createUmiPublicKey(targetAddress)}
            />
          ) : (
            <button
              onClick={mintPass}
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg
                hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg
                font-semibold text-lg relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative">
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Minting Pass...</span>
                  </div>
                ) : (
                  'Mint Loyalty Pass'
                )}
              </div>
            </button>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

export default function MintPage() {
  return (
    <Providers>
      <MintPageContent />
    </Providers>
  )
}
