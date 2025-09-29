# 🎨 NFT Factory - Sui Blockchain

A modern NFT minting application built on Sui blockchain with Enoki integration for sponsored transactions.

## ✨ Features

- 🚀 **Create NFT Collections** - Deploy your own NFT collections on Sui
- 🎯 **Mint NFTs** - Mint individual NFTs from your collections
- 💰 **Sponsored Transactions** - Gas-free transactions with Enoki integration
- 🔗 **Wallet Integration** - Connect with Sui wallets
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Real-time Updates** - Live collection and NFT data

## 🚀 Live Demo

**[View Live Application](https://your-app-url.vercel.app)**

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Blockchain**: Sui blockchain (testnet)
- **Wallet**: Sui Dapp Kit
- **Sponsorship**: Enoki API
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide icons

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Sui wallet (Sui Wallet, Suiet, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VladimirNalivaiko/Sui_MintNft_Enoki.git
   cd Sui_MintNft_Enoki
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   VITE_SUI_NETWORK=testnet
   VITE_NFT_FACTORY_PACKAGE_ID=your_package_id
   VITE_GLOBAL_STATE_OBJECT_ID=your_global_state_id
   VITE_ENOKI_API_KEY=your_enoki_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUI_NETWORK` | Sui network (testnet/mainnet) | Yes |
| `VITE_NFT_FACTORY_PACKAGE_ID` | NFT Factory contract package ID | Yes |
| `VITE_GLOBAL_STATE_OBJECT_ID` | Global state object ID | Yes |
| `VITE_ENOKI_API_KEY` | Enoki API key for sponsored transactions | Yes |

### Enoki Setup

1. Get your API key from [Enoki Dashboard](https://enoki.xyz)
2. Add it to your `.env` file
3. Sponsored transactions will work automatically!

## 📱 Usage

1. **Connect Wallet** - Click "Connect Wallet" and select your Sui wallet
2. **Create Collection** - Fill out the collection form with name, description, image, and max supply
3. **Mint NFTs** - Select a collection and mint individual NFTs
4. **View NFTs** - Check your minted NFTs in the "My NFTs" section

## 🏗 Smart Contract

The application uses a custom Move smart contract deployed on Sui testnet:

- **Package ID**: `0xd8004005f0860cf71b1278cb32c60fbe307b31dedc80bc1708869015d33e16d3`
- **Functions**: Create collections, mint NFTs, manage editions
- **Events**: Collection creation and NFT minting events

## 🚀 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Go to [Vercel](https://vercel.com)
3. Import your forked repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Netlify

1. Fork this repository
2. Go to [Netlify](https://netlify.com)
3. Connect your GitHub repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variables
7. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Sui Blockchain](https://sui.io) - The underlying blockchain
- [Enoki](https://enoki.xyz) - Sponsored transactions
- [Sui Dapp Kit](https://github.com/MystenLabs/sui/tree/main/sdk/dapp-kit) - Wallet integration
- [Vite](https://vitejs.dev) - Build tool
- [React](https://reactjs.org) - UI framework

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ for the Sui ecosystem**