import { WalletConnect } from './wallet-connect';
import { Navigation, Page } from './navigation';
import { Image } from 'lucide-react';

interface HeaderProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onCreateCollection?: () => void;
}

export function Header({ currentPage, onPageChange, onCreateCollection }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">NFT Factory</h1>
            </div>
            <Navigation 
              currentPage={currentPage} 
              onPageChange={onPageChange}
              onCreateCollection={onCreateCollection}
            />
          </div>
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
