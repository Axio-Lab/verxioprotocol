# Verxio Starter Template

This is a starter template for building Solana dApps with Next.js, Tailwind CSS, and Verxio components.

## Features

- 🚀 Next.js 15 with App Router
- 💅 Tailwind CSS for styling
- 🔗 Solana Web3.js integration
- 👛 Wallet adapter integration
- 🎨 Pre-built Verxio components
- 📱 Responsive design
- 🔍 TypeScript support
- 🎯 ESLint and Prettier configuration

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   Create a `.env.local` file in the root directory and add your Solana secret key:
   ```bash
   SECRET_KEY=your_solana_secret_key_here
   ```
   Note: Never commit your secret key to version control. The `.env.local` file is automatically ignored by git.

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `src/app` - Next.js app router pages
  - `program` - Create and manage loyalty programs
  - `manage` - Manage loyalty passes and points
- `src/components` - Reusable components
  - `verxio` - Verxio-specific components
  - `ui` - Shared UI components
- `src/lib` - Utility functions and configurations
  - `actions.ts` - Server actions for keypair management

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Recent Updates

- Added server-side keypair management for secure operations
- Implemented shared Verxio context initialization
- Added loyalty program creation and management features
- Integrated wallet adapter for client-side operations
- Added points management and asset data viewing capabilities

## Learn More

To learn more about the technologies used in this template:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Verxio Documentation](https://verxio.com/docs) 