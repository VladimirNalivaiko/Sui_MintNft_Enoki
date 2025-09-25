import { WalletConnect } from './wallet-connect';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">SUI NFT Mint</h1>
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
