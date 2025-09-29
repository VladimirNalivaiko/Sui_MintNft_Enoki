import { useState } from 'react';
import { ConnectModal, useCurrentAccount, useDisconnectWallet, useWallets, useConnectWallet } from '@mysten/dapp-kit';
import { isEnokiWallet, EnokiWallet, AuthProvider } from '@mysten/enoki';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { enokiConfig } from '@/lib/enoki';

export function WalletConnect() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connect } = useConnectWallet();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get available Enoki wallets
  const allWallets = useWallets();
  const enokiWallets = allWallets.filter(isEnokiWallet) as unknown as EnokiWallet[];
  const walletsByProvider = enokiWallets.reduce(
    (map, wallet) => map.set(wallet.provider, wallet),
    new Map<AuthProvider, EnokiWallet>(),
  );

  // Format wallet address for display
  const formatAddress = (address: string): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Handle wallet disconnection
  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "Success",
      description: "Wallet disconnected",
    });
  };

  // Copy address to clipboard
  const handleCopyAddress = async () => {
    if (!currentAccount?.address) return;
    
    try {
      await navigator.clipboard.writeText(currentAccount.address);
      toast({
        title: "Success",
        description: "Address copied to clipboard!",
      });
    } catch (error) {
      console.error('Failed to copy address:', error);
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      });
    }
  };

  // Handle Enoki wallet connection
  const handleEnokiConnect = async (wallet: EnokiWallet) => {
    try {
      connect({ wallet: wallet as any });
      toast({
        title: "Success",
        description: `Connected with ${wallet.provider}`,
      });
    } catch (error) {
      console.error('Failed to connect Enoki wallet:', error);
      toast({
        title: "Error",
        description: `Failed to connect with ${wallet.provider}`,
        variant: "destructive",
      });
    }
  };

  // If not connected, show connect options
  if (!currentAccount?.address) {
    return (
      <div className="space-y-4">
        {/* Enoki wallet buttons - only show if OAuth is configured */}
        {enokiConfig.hasOAuth && enokiWallets.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Connect with Social</h3>
            <div className="flex flex-col gap-2">
              {walletsByProvider.get('google') && (
                <Button
                  variant="outline"
                  onClick={() => handleEnokiConnect(walletsByProvider.get('google')!)}
                  className="w-full justify-start"
                >
                  <span className="mr-2">🔍</span>
                  Sign in with Google
                </Button>
              )}
              {walletsByProvider.get('facebook') && (
                <Button
                  variant="outline"
                  onClick={() => handleEnokiConnect(walletsByProvider.get('facebook')!)}
                  className="w-full justify-start"
                >
                  <span className="mr-2">📘</span>
                  Sign in with Facebook
                </Button>
              )}
              {walletsByProvider.get('twitch') && (
                <Button
                  variant="outline"
                  onClick={() => handleEnokiConnect(walletsByProvider.get('twitch')!)}
                  className="w-full justify-start"
                >
                  <span className="mr-2">🎮</span>
                  Sign in with Twitch
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Standard wallet connection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">Connect with Wallet</h3>
          <Button
            variant="default"
            onClick={() => setIsModalOpen(true)}
            className="w-full"
          >
            Connect Wallet
          </Button>
          <ConnectModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            trigger={<div />}
          />
        </div>
      </div>
    );
  }

  // If connected, show connected state
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          {formatAddress(currentAccount.address)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyAddress}
          className="h-8 w-8 p-0"
        >
          📋
        </Button>
      </div>
      <Button
        variant="outline"
        onClick={handleDisconnect}
      >
        Disconnect
      </Button>
    </div>
  );
}
