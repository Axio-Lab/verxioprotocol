# Verxio UI Component Demo

A Next.js demo application showcasing Verxio Protocol UI components and functionality.

## Features

- **Complete Form Library**: All Verxio Protocol operations with full form validation
- **Image Upload Support**: Server-side image uploads to Irys for metadata generation
- **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- **Accessible Components**: Built on Radix UI primitives for excellent accessibility
- **Customizable Styling**: Tailwind CSS with customizable design tokens
- **Wallet Integration**: Seamless Solana wallet integration
- **Netlify Ready**: Configured for easy deployment on Netlify

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ui-component

# Install dependencies
pnpm install
# or
npm install
```

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Solana Secret Key (for testing)
SECRET_KEY=your_base58_encoded_secret_key_here

# Optional: Custom RPC endpoint
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

### Development

```bash
# Start the development server
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the demo.

### Building for Production

```bash
# Build the application
pnpm build
# or
npm run build

# Start the production server
pnpm start
# or
npm start
```

## Deployment

### Netlify

This project is configured for easy deployment on Netlify:

1. **Connect your repository** to Netlify
2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `out`
3. **Environment variables**: Add your `SECRET_KEY` in Netlify's environment variables
4. **Deploy**: Netlify will automatically detect this as a Next.js project

### Other Platforms

The project uses static export (`output: 'export'`), making it compatible with any static hosting platform:

- Vercel
- GitHub Pages
- AWS S3
- Cloudflare Pages

## Available Components

### Loyalty Program Management

- `CreateLoyaltyProgramForm` - Create new loyalty programs
- `UpdateLoyaltyProgramForm` - Update existing programs
- `IssueLoyaltyPassForm` - Issue loyalty passes to users

### Voucher Management

- `CreateVoucherCollectionForm` - Create voucher collections
- `MintVoucherForm` - Mint individual vouchers
- `ValidateVoucherForm` - Validate voucher status
- `RedeemVoucherForm` - Redeem vouchers
- `GetUserVouchersForm` - Get user's vouchers
- `ExtendVoucherExpiryForm` - Extend voucher expiry
- `CancelVoucherForm` - Cancel vouchers

### Points Management

- `AwardLoyaltyPointsForm` - Award points to users
- `RevokeLoyaltyPointsForm` - Revoke points from users
- `GiftLoyaltyPointsForm` - Gift points between users

### Communication

- `MessagingForm` - Send direct messages
- `BroadcastsForm` - Send broadcast messages

### Data Retrieval

- `GetAssetDataForm` - Get asset data
- `GetProgramDetailsForm` - Get program details
- `ApproveTransferForm` - Approve transfers

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # UI components
│   ├── ui/            # Base UI components
│   └── verxio/        # Verxio-specific forms
└── lib/               # Utility functions
```

## API Routes

The demo includes API routes for all Verxio Protocol operations:

- `/api/create-loyalty-program` - Create loyalty programs
- `/api/mint-voucher` - Mint vouchers
- `/api/validate-voucher` - Validate vouchers
- `/api/redeem-voucher` - Redeem vouchers
- `/api/gift-loyalty-points` - Gift loyalty points
- And many more...

## Customization

### Styling

The components use Tailwind CSS and can be customized in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        verxio: {
          primary: '#00adef',
          secondary: '#6366f1',
        },
      },
    },
  },
}
```

### Environment Variables

Configure your environment for different networks:

```env
# Development
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com

# Production
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:

- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Documentation: [Read the docs](https://docs.verxio.com)
- Community: [Join our Discord](https://discord.gg/verxio)
