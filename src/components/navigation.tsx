import { Button } from '@/components/ui/button';
import { Home, Image, Layers } from 'lucide-react';

export type Page = 'home' | 'collections' | 'my-nfts';

interface NavigationProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
}

export function Navigation({ currentPage, onPageChange }: NavigationProps) {
  return (
    <nav className="hidden md:flex items-center space-x-4">
      <Button 
        variant={currentPage === 'home' ? 'default' : 'ghost'} 
        size="sm" 
        onClick={() => onPageChange('home')}
        className={currentPage === 'home' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
      >
        <Home className="w-4 h-4 mr-2" />
        Home
      </Button>
      <Button 
        variant={currentPage === 'collections' ? 'default' : 'ghost'} 
        size="sm" 
        onClick={() => onPageChange('collections')}
        className={currentPage === 'collections' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
      >
        <Layers className="w-4 h-4 mr-2" />
        Collections
      </Button>
      <Button 
        variant={currentPage === 'my-nfts' ? 'default' : 'ghost'} 
        size="sm" 
        onClick={() => onPageChange('my-nfts')}
        className={currentPage === 'my-nfts' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
      >
        <Image className="w-4 h-4 mr-2" />
        My NFTs
      </Button>
    </nav>
  );
}
