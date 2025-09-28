import { useState } from 'react';
import { QueryProvider, SuiProvider, CollectionsProvider } from './providers';
import { Header } from './components/header';
import { HomePage } from './pages/home';
import { CollectionsPage } from './pages/collections';
import { MyNFTsPage } from './pages/my-nfts';
import { Toaster } from './components/ui/toaster';
import { Page } from './components/navigation';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'collections':
        return <CollectionsPage />;
      case 'my-nfts':
        return <MyNFTsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <Header 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
      />
      <main>
        {renderPage()}
      </main>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryProvider>
      <SuiProvider>
        <CollectionsProvider>
          <AppContent />
        </CollectionsProvider>
      </SuiProvider>
    </QueryProvider>
  );
}

export default App;
