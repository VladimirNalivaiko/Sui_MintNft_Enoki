import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useCollections } from '../../providers';
import { CollectionCreationParams } from '../../types/collection';

export function CollectionCreationForm() {
  const currentAccount = useCurrentAccount();
  const { toast } = useToast();
  const { createCollection, isLoading } = useCollections();

  const [formData, setFormData] = useState<CollectionCreationParams>({
    name: '',
    description: '',
    imageUrl: '',
    maxSupply: undefined,
  });

  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field: keyof CollectionCreationParams, value: string | number) => {
    setFormData((prev: CollectionCreationParams) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateCollection = async () => {
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

    setIsCreating(true);

    try {
      await createCollection({
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        maxSupply: formData.maxSupply || undefined,
      });
      
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        maxSupply: undefined,
      });
    } catch (error) {
      // Error handling is done in the hook
      console.error('Create collection error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentAccount) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Create Collection</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please connect your wallet to create a collection
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Create Collection</CardTitle>
        <CardDescription className="text-muted-foreground">
          Create a new NFT collection on the SUI blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">Collection Name *</Label>
          <Input
            id="name"
            placeholder="Enter collection name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground">Description *</Label>
          <Input
            id="description"
            placeholder="Enter collection description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="text-foreground">Image URL *</Label>
          <Input
            id="imageUrl"
            placeholder="Enter image URL for all NFTs in this collection"
            value={formData.imageUrl}
            onChange={(e) => handleInputChange('imageUrl', e.target.value)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxSupply" className="text-foreground">Max Supply (Optional)</Label>
          <Input
            id="maxSupply"
            type="number"
            placeholder="Enter max supply (leave empty for unlimited)"
            value={formData.maxSupply || ''}
            onChange={(e) => handleInputChange('maxSupply', e.target.value ? parseInt(e.target.value) : 0)}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Button
          onClick={handleCreateCollection}
          disabled={isCreating || isLoading || !formData.name || !formData.description || !formData.imageUrl}
          className="w-full"
        >
          {isCreating ? 'Creating Collection...' : 'Create Collection'}
        </Button>
      </CardContent>
    </Card>
  );
}
