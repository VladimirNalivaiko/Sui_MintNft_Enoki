# Enoki Integration Setup

This project now includes full Enoki integration for sponsored transactions and social wallet authentication.

## Features

- ✅ **Sponsored Transactions**: Gas-free NFT minting and collection creation
- ✅ **Social Wallet Authentication**: Google, Facebook, Twitch login (optional)
- ✅ **Regular Wallet Support**: Works with traditional Sui wallets
- ✅ **Real Enoki SDK**: No more mock data, uses actual Enoki API
- ✅ **Automatic Wallet Registration**: Enoki wallets are registered automatically
- ✅ **Enhanced UI**: Separate social login buttons and wallet connection

## Setup Instructions

### 1. Get Enoki API Keys

1. Visit [Enoki Portal](https://portal.enoki.network)
2. Create an account and set up a new project
3. Get your **Public API Key** for zkLogin
4. (Optional) Configure OAuth providers (Google, Facebook, Twitch) and get their Client IDs

**Minimum requirement**: Only the API key is needed for sponsored transactions!

### 2. Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Sui Network Configuration
VITE_SUI_NETWORK=testnet

# NFT Factory Contract Configuration
VITE_NFT_FACTORY_PACKAGE_ID=0xd8004005f0860cf71b1278cb32c60fbe307b31dedc80bc1708869015d33e16d3
VITE_GLOBAL_STATE_OBJECT_ID=0x92da41eff3d36845f6bf63f05311345272d7eb417f885db0ef527c6889f12f01

# Enoki Configuration (Required for sponsored transactions)
VITE_ENOKI_API_KEY=your_public_enoki_api_key_here

# OAuth Configuration (Optional - only needed for social login)
# VITE_ENOKI_GOOGLE_CLIENT_ID=your_google_client_id_here
# VITE_ENOKI_FACEBOOK_CLIENT_ID=your_facebook_client_id_here
# VITE_ENOKI_TWITCH_CLIENT_ID=your_twitch_client_id_here
```

### 3. OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
6. Copy the Client ID to `VITE_ENOKI_GOOGLE_CLIENT_ID`

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Copy the App ID to `VITE_ENOKI_FACEBOOK_CLIENT_ID`

#### Twitch OAuth
1. Go to [Twitch Developers](https://dev.twitch.tv)
2. Create a new application
3. Set OAuth redirect URL
4. Copy the Client ID to `VITE_ENOKI_TWITCH_CLIENT_ID`

### 4. Enoki Portal Configuration

1. In the Enoki Portal, configure your project:
   - Set **Network** to `testnet` (for development)
   - Add your OAuth provider Client IDs
   - Configure **Allowed Move Call Targets**:
     - `0xd8004005f0860cf71b1278cb32c60fbe307b31dedc80bc1708869015d33e16d3::nft_factory::create_collection`
     - `0xd8004005f0860cf71b1278cb32c60fbe307b31dedc80bc1708869015d33e16d3::nft_factory::mint_edition`

### 5. Run the Application

```bash
npm install
npm run dev
```

## How It Works

### Social Authentication
- Users can connect using Google, Facebook, or Twitch
- Enoki handles the OAuth flow in a popup window
- No need for users to have Sui wallets or SUI tokens

### Sponsored Transactions
- All NFT minting and collection creation is gas-free
- Enoki sponsors the transaction fees
- Users only need to sign the transaction (no gas required)

### Wallet Integration
- Enoki wallets are automatically registered with dapp-kit
- Works alongside traditional Sui wallets
- Seamless switching between wallet types

## Troubleshooting

### Enoki Status Shows "Disabled"
- Check that `VITE_ENOKI_API_KEY` is set correctly
- Verify the API key is valid in Enoki Portal
- Ensure you're on testnet network

### Social Login Not Working
- Verify OAuth Client IDs are correct
- Check that redirect URIs match your domain
- Ensure OAuth providers are enabled in Enoki Portal

### Transactions Failing
- Check that Move call targets are configured in Enoki Portal
- Verify the user address is in allowed addresses
- Check Enoki Portal for transaction logs

## Development vs Production

### Development
- Use testnet network
- Use development OAuth redirect URIs
- Test with small amounts

### Production
- Switch to mainnet network
- Update OAuth redirect URIs to production domain
- Configure production Enoki API keys
- Set up proper error monitoring

## API Limits

Enoki has usage limits based on your plan:
- Free tier: Limited sponsored transactions
- Paid tiers: Higher limits and priority

Check your Enoki Portal dashboard for current usage and limits.
