# verxio-starter

A CLI tool to create a new Verxio project with pre-installed dependencies and components.

## Quick Start

Create a new Verxio project with a single command:

```bash
pnpm create verxio-starter@latest my-project
```

Or if you want to be prompted for the project name:

```bash
pnpm create verxio-starter@latest
```

## Features

- Creates a new Verxio project with all necessary dependencies
- Sets up a modern React + TypeScript development environment
- Includes pre-configured components and utilities
- Ready-to-use project structure
- Server-side keypair management
- Client-side wallet integration
- Loyalty program management features

## Environment Setup

After creating your project, you'll need to set up your environment variables:

1. Create a `.env.local` file in your project root
2. Add your Solana secret key:
   ```bash
   SECRET_KEY=your_solana_secret_key_here
   ```
3. Never commit your secret key to version control

## Requirements

- Node.js >= 14.0.0
- pnpm
- Solana secret key for program management

## Recent Updates

- Added server-side keypair management
- Implemented shared Verxio context initialization
- Added loyalty program creation and management
- Integrated wallet adapter
- Added points management features
- Added asset data viewing capabilities

## License

MIT 