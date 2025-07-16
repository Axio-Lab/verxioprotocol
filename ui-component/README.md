# Verxio UI Component Library

A comprehensive React component library for building Verxio Protocol applications with beautiful, accessible, and customizable UI components.

## Features

- **Complete Form Library**: All Verxio Protocol operations with full form validation
- **Image Upload Support**: Server-side image uploads to Irys for metadata generation
- **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- **Accessible Components**: Built on Radix UI primitives for excellent accessibility
- **Customizable Styling**: Tailwind CSS with customizable design tokens
- **Wallet Integration**: Seamless Solana wallet integration

## Installation

```bash
npm install @verxioprotocol/components
# or
yarn add @verxioprotocol/components
# or
pnpm add @verxioprotocol/components
```

## Quick Start

### Basic Setup

```tsx
import { CreateLoyaltyProgramForm } from '@verxioprotocol/components'

function App() {
  const context = // Your Verxio context
  const signer = // Your signer

  return (
    <CreateLoyaltyProgramForm
      context={context}
      signer={signer}
      onSuccess={(result) => console.log('Program created:', result)}
      onError={(error) => console.error('Error:', error)}
    />
  )
}
```

### Image Upload Setup

The component library includes server-side image upload functionality. To enable this, you need to:

1. **Install the Irys uploader package** in your server environment:
```bash
npm install @metaplex-foundation/umi-uploader-irys
```

2. **Create an API route** for image uploads (already included in this library):
```typescript
// app/api/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys'
import { createGenericFile } from '@metaplex-foundation/umi'

export async function POST(request: NextRequest) {
  // Implementation included in the library
}
```

3. **Use the upload functionality** in your forms:
```tsx
// The forms automatically handle image uploads when you select "Upload Image"
<CreateLoyaltyProgramForm
  context={context}
  signer={signer}
  // Image upload is handled automatically
/>
```

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

## Form Features

### Image Upload Support
All forms that support metadata can handle image uploads:

1. **Pre-uploaded URI**: Provide a metadata URI that's already uploaded
2. **Image Upload**: Upload an image file that gets automatically processed

### Validation
- Comprehensive form validation using Zod schemas
- Real-time error feedback
- Type-safe form handling

### Loading States
- Upload progress indicators
- Transaction status feedback
- Disabled states during operations

## Styling

The components use Tailwind CSS and can be customized using:

```css
/* Custom CSS variables */
:root {
  --verxio-primary: #00adef;
  --verxio-secondary: #6366f1;
}
```

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
import type { VerxioContext } from '@verxioprotocol/core'

interface FormProps {
  context: VerxioContext
  signer: KeypairSigner
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
}
```

## Error Handling

Components include comprehensive error handling:

```tsx
<CreateLoyaltyProgramForm
  onError={(error) => {
    console.error('Form error:', error)
    // Handle error appropriately
  }}
/>
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
