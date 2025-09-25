import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { MintNFTParams } from '@/types';

export function NFTMintForm() {
  const currentAccount = useCurrentAccount();
  const { toast } = useToast();

  const [formData, setFormData] = useState<MintNFTParams>({
    name: '',
    description: '',
    imageUrl: '',
    attributes: []
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof MintNFTParams, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMint = async () => {
    if (!currentAccount) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.description || !formData.imageUrl) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // For now, just simulate a successful mint
      // In a real implementation, you would use your custom NFT contract
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      toast({
        title: "Success!",
        description: `NFT "${formData.name}" would be minted successfully! (Demo mode)`,
      });
      
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        attributes: []
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to mint NFT: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mint NFT</CardTitle>
          <CardDescription>
            Please connect your wallet to mint NFTs
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mint NFT</CardTitle>
        <CardDescription>
          Create a new NFT on the SUI blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="Enter NFT name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            placeholder="Enter NFT description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL *</Label>
          <Input
            id="imageUrl"
            placeholder="Enter image URL"
            value={formData.imageUrl}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
          />
        </div>

        <Button
          onClick={handleMint}
          disabled={isLoading || !formData.name || !formData.description || !formData.imageUrl}
          className="w-full"
        >
          {isLoading ? 'Minting...' : 'Mint NFT'}
        </Button>
      </CardContent>
    </Card>
  );
}
