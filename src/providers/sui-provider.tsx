import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { ReactNode } from 'react';

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
      <WalletProvider 
        autoConnect={true}
        storageKey="sui-mint-nft-wallet"
        features={['sui:signAndExecuteTransactionBlock']}
      >
        {children}
      </WalletProvider>
    </SuiClientProvider>
  );
}
