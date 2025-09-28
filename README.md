# SUI NFT Mint with Enoki

A modern web application for minting NFTs on the Sui blockchain with gasless transactions powered by Enoki.

## Features

- 🎨 **Modern Dark UI** - Beautiful interface inspired by shadcn/ui dashboard
- 🔗 **Wallet Integration** - Connect with Sui wallets (Sui Wallet, Suiet, etc.)
- 🚀 **Gasless Minting** - All transactions sponsored through Enoki
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🖼️ **NFT Gallery** - View your minted NFTs
- ⚡ **Fast & Reliable** - Built with React, TypeScript, and Vite

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Blockchain**: Sui dApp Kit
- **Gas Sponsorship**: Enoki
- **Move Contract**: Custom NFT minting module

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Sui CLI (for contract deployment)
- Enoki API key

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd SUI_MintNft_Enoki
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_ENOKI_API_KEY=your_enoki_api_key_here
VITE_SUI_NETWORK=testnet
```

### 3. Deploy Move Contract

```bash
# Navigate to move directory
cd move/nft_mint

# Deploy to testnet
sui client publish --gas-budget 100000000

# Note the package ID and update it in your frontend code
```

### 4. Update Contract Address

After deployment, update the contract address in your frontend code:

```typescript
// In src/lib/contract.ts or similar
export const NFT_CONTRACT_PACKAGE_ID = "0x..."; // Your deployed package ID
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── header.tsx      # App header with navigation
│   ├── nft-mint-form.tsx # NFT minting form
│   └── wallet-connect.tsx # Wallet connection
├── pages/              # Page components
│   ├── home.tsx        # Home page with minting
│   └── my-nfts.tsx     # NFT gallery page
├── providers/          # React context providers
│   ├── sui-provider.tsx # Sui blockchain provider
│   └── query-provider.tsx # React Query provider
├── types/              # TypeScript type definitions
└── lib/                # Utility functions

move/
└── nft_mint/           # Move smart contract
    ├── Move.toml       # Move package config
    └── sources/
        └── nft_mint.move # NFT minting contract
```

## Move Contract

The Move contract includes:

- **Shared Object Collection** - Allows minting from any wallet
- **Unique NFT IDs** - Each NFT has a unique identifier
- **Metadata Support** - Name, description, and image URL
- **Events** - Emit events for NFT creation and collection info

### Key Functions

- `init()` - Initialize the collection (deploy time)
- `mint_nft()` - Mint a new NFT
- `get_collection_info()` - Get collection statistics
- `get_nft_info()` - Get specific NFT details

## Enoki Integration

This project uses Enoki for gasless transactions:

1. **API Key Setup** - Configure your Enoki API key in `.env`
2. **Transaction Sponsorship** - All minting transactions are sponsored
3. **Testnet Only** - Currently configured for Sui testnet

## Usage

1. **Connect Wallet** - Click "Connect Wallet" to connect your Sui wallet
2. **Mint NFT** - Fill in the form with NFT details and click "Mint NFT"
3. **View NFTs** - Navigate to "My NFTs" to see your minted NFTs
4. **Gasless** - All transactions are sponsored, no gas fees required!

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Pages** - Add to `src/pages/` and update navigation
2. **New Components** - Add to `src/components/`
3. **Contract Changes** - Update Move contract and redeploy

## Deployment

### Frontend Deployment

The frontend can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Contract Deployment

Deploy the Move contract to your desired Sui network:

```bash
# Testnet
sui client publish --gas-budget 100000000

# Mainnet (when ready)
sui client publish --gas-budget 100000000 --network mainnet
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

- Create an issue in this repository
- Check Sui documentation: https://docs.sui.io/
- Check Enoki documentation: https://docs.enoki.network/

---

Built with ❤️ for the Sui ecosystem