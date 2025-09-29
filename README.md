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

**[View Live Application](https://sui-mint-nft-enoki.vercel.app/)**

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
- **Testnet SUI tokens** - Get free testnet tokens from [Sui Faucet](https://faucet.sui.io/)

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

3. **Get testnet SUI tokens**
   
   Before using the application, you need testnet SUI tokens:
   
   - Visit [Sui Faucet](https://faucet.sui.io/)
   - Connect your Sui wallet
   - Switch to **testnet** network
   - Request testnet SUI tokens (usually 10 SUI per request)
   - Wait for transaction confirmation
   
   > **Note**: You may need to request tokens multiple times if you run out during testing.

4. **Configure environment variables**
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

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:{port}`


## 📱 Usage

1. **Connect Wallet** - Click "Connect Wallet" and select your Sui wallet
2. **Create Collection** - Fill out the collection form with name, description, image, and max supply
3. **Mint NFTs** - Select a collection and mint individual NFTs
4. **View NFTs** - Check your minted NFTs in the "My NFTs" section

## 🏗 Smart Contract

The application uses a custom Move smart contract deployed on Sui testnet:

- **Package ID**: `0xc1ec2a4ee4f3b74554fe22b256973b43862a8defbbc7270c19784ebf8cef16d4`
- **Functions**: Create collections, mint NFTs, manage editions
- **Events**: Collection creation and NFT minting events


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Made with ❤️ for the Sui ecosystem**