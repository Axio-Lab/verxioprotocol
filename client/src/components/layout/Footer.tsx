'use client'

import Link from 'next/link'
import { FaGithub, FaTwitter, FaDiscord } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-opacity-20 border-slate-700 py-6 backdrop-blur-sm">
      <div className="mt-6 text-center text-[10px] text-white/50">
        <p className="pixel-font">© {new Date().getFullYear()} Verxio. All rights reserved.</p>
      </div>
    </footer>
  )
}
