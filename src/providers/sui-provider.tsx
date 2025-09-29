import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { ReactNode } from 'react';
import { EnokiWalletRegistry } from '../components/enoki-wallet-registry';

interface SuiProviderProps {
  children: ReactNode;
}

const networks = {
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
  devnet: { url: getFullnodeUrl('devnet') },
};

export function SuiProvider({ children }: SuiProviderProps) {
  return (
    <SuiClientProvider networks={networks} defaultNetwork="testnet">
      <EnokiWalletRegistry />
      <WalletProvider 
        autoConnect={true}
        storageKey="sui-mint-nft-wallet"
      >
        {children}
      </WalletProvider>
    </SuiClientProvider>
  );
}
