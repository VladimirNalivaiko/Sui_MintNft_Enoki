import { QueryProvider, SuiProvider } from '@/providers';
import { Header } from '@/components/header';
import { HomePage } from '@/pages/home';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <QueryProvider>
      <SuiProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <HomePage />
          </main>
          <Toaster />
        </div>
      </SuiProvider>
    </QueryProvider>
  );
}

export default App;
