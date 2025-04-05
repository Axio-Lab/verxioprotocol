'use client'

import { createSolanaDevnet, createSolanaLocalnet, createWalletUiConfig, WalletUi } from '@wallet-ui/react'

const config = createWalletUiConfig({
  clusters: [createSolanaDevnet(), createSolanaLocalnet()],
})

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  return <WalletUi config={config}>{children}</WalletUi>
}
