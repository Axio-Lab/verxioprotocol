import { NextAuthOptions } from 'next-auth'
import { PublicKey } from '@solana/web3.js'

export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token.sub) {
        session.user.publicKey = new PublicKey(token.sub)
      }
      return session
    },
    async jwt({ token, account }: { token: any; account: any }) {
      if (account?.publicKey) {
        token.sub = account.publicKey
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
}
