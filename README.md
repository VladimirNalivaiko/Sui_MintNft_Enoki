# SUI NFT Mint Application

A React application for minting NFTs on the SUI blockchain using modern web3 technologies.

## Technologies Used

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **@mysten/dapp-kit** - SUI blockchain integration
- **@mysten/sui.js** - SUI SDK
- **@tanstack/react-query** - Data fetching and caching

## Features

- 🔗 Wallet connection (SUI-compatible wallets)
- 🎨 NFT minting form with metadata
- 📱 Responsive design
- 🎯 TypeScript support
- 🎨 Modern UI with shadcn/ui components
- ⚡ Fast development with Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── header.tsx      # App header
│   ├── wallet-connect.tsx  # Wallet connection component
│   └── nft-mint-form.tsx  # NFT minting form
├── pages/              # Page components
│   └── home.tsx        # Home page
├── providers/          # React context providers
│   ├── query-provider.tsx  # React Query provider
│   └── sui-provider.tsx    # SUI dapp-kit provider
├── types/              # TypeScript type definitions
│   ├── nft.ts         # NFT-related types
│   └── sui.ts         # SUI blockchain types
├── lib/               # Utility functions
│   └── utils.ts       # Common utilities
├── App.tsx            # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## Configuration

### SUI Network

The app is configured to use the SUI testnet by default. You can change this in `src/providers/sui-provider.tsx`:

```typescript
<SuiClientProvider networks={networks} defaultNetwork="testnet">
```

Available networks: `testnet`, `mainnet`, `devnet`

### Wallet Integration

The app uses `@mysten/dapp-kit` for wallet integration. Supported wallets include:
- Sui Wallet
- Suiet
- Ethos Wallet
- And other SUI-compatible wallets

## Development

### Code Style

- ESLint for code linting
- TypeScript for type checking
- Prettier for code formatting (recommended)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details
