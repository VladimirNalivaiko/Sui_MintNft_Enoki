import { useState } from 'react';
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export function WalletConnect() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // If not connected, show connect button
  if (!currentAccount?.address) {
    return (
      <div>
        <Button
          variant="default"
          onClick={() => setIsModalOpen(true)}
        >
          Connect Wallet
        </Button>
        <ConnectModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          trigger={<div />}
        />
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
