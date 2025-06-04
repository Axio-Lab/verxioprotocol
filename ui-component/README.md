# @verxio/components

A React component library for Verxio Protocol's functionalities.

## Installation

```bash
npm install @verxio/components
# or
yarn add @verxio/components
# or
pnpm add @verxio/components
```

## Usage

```tsx
import { CreateLoyaltyProgramForm } from '@verxio/components'

function App() {
  return (
    <CreateLoyaltyProgramForm 
      context={context}
      signer={signer}
      onSuccess={(result) => {
        console.log('Program created:', result)
      }}
      onError={(error) => {
        console.error('Error:', error)
      }}
    />
  )
}
```

## Available Components

- `CreateLoyaltyProgramForm` - Create a new loyalty program
- `UpdateLoyaltyProgramForm` - Update an existing loyalty program
- `IssueLoyaltyPassForm` - Issue a new loyalty pass
- `ApproveTransferForm` - Approve transfer of a loyalty pass
- `MessagingForm` - Send messages to loyalty pass holders
- `RevokeLoyaltyPointsForm` - Revoke points from a loyalty pass
- `GiftLoyaltyPointsForm` - Gift points to a loyalty pass
- `GetAssetDataForm` - Get data for a specific asset
- `GetProgramDetailsForm` - Get details of a loyalty program
- `AwardLoyaltyPointsForm` - Award points for specific actions
- `BroadcastsForm` - Send broadcasts to loyalty pass holders

## Base Components

The library also exports base components that can be used to create custom forms:

- `VerxioForm` - Base form component
- `VerxioFormSection` - Form section component
- `VerxioFormField` - Form field component

## Development

1. Clone the repository
2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Build the library:
```bash
pnpm build
```

## License

MIT 