import type { Metadata } from 'next'
import './globals.css'
import DocLayout from './components/DocLayout'

export const metadata: Metadata = {
  title: 'Verxio Protocol - Documentation',
  description:
    'Complete documentation for the Verxio Protocol SDK - On-chain loyalty protocol powered by Metaplex CORE',
  keywords: ['Verxio', 'Protocol', 'SDK', 'Solana', 'Loyalty', 'Metaplex', 'CORE', 'Blockchain'],
  authors: [{ name: 'Verxio Protocol Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Verxio Protocol - Documentation',
    description:
      'Complete documentation for the Verxio Protocol SDK - On-chain loyalty protocol powered by Metaplex CORE',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verxio Protocol - Documentation',
    description:
      'Complete documentation for the Verxio Protocol SDK - On-chain loyalty protocol powered by Metaplex CORE',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const themeColor = '#00adef'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DocLayout>{children}</DocLayout>
      </body>
    </html>
  )
}
