import { useState, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image, Calendar, User, ExternalLink, Loader2 } from 'lucide-react';
import { nftFactoryContract } from '@/lib/contract';
import { NFTInfo } from '../types/collection';

export function MyNFTsPage() {
  const currentAccount = useCurrentAccount();
  
  const [nfts, setNfts] = useState<NFTInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's NFTs using the new contract
  const loadNFTs = async () => {
    if (!currentAccount) return;

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading NFTs for user:', currentAccount.address);
      
      // Use the new contract method to get user's NFTs
      const userNFTs = await nftFactoryContract.getUserNFTsFromEvents(currentAccount.address);
      console.log('🔍 Found NFTs:', userNFTs);
      setNfts(userNFTs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load NFTs';
      console.error('Failed to load NFTs:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load NFTs when account changes
  useEffect(() => {
    if (currentAccount) {
      loadNFTs();
    } else {
      setNfts([]);
      setError(null);
    }
  }, [currentAccount]);

  if (!currentAccount) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">My NFTs</CardTitle>
              <CardDescription className="text-muted-foreground">
                Please connect your wallet to view your NFTs
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My NFTs</h1>
        <p className="text-muted-foreground">
          View and manage your minted NFTs
        </p>
      </div>

      {isLoading ? (
        <Card className="bg-card border-border">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading your NFTs...</span>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Error</CardTitle>
            <CardDescription className="text-muted-foreground">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadNFTs} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : nfts.length === 0 ? (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">No NFTs Found</CardTitle>
            <CardDescription className="text-muted-foreground">
              You haven't minted any NFTs yet. Go to the home page to mint your first NFT!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              <Image className="w-4 h-4 mr-2" />
              Mint Your First NFT
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((nft, index) => (
            <Card key={nft.id || index} className="bg-card border-border overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src={nft.imageUrl || "https://via.placeholder.com/300x300?text=NFT"} 
                  alt={nft.name || `NFT #${nft.editionNumber}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback image if the URL is invalid
                    e.currentTarget.src = 'https://via.placeholder.com/300x300?text=NFT';
                  }}
                />
              </div>
              <CardHeader>
                <CardTitle className="text-foreground text-lg">{nft.name || `Edition #${nft.editionNumber}`}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {nft.description || `Collection: ${nft.collectionId ? nft.collectionId.slice(0, 8) + '...' : 'Unknown'}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(nft.mintedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="w-4 h-4 mr-2" />
                  {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                </div>
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => {
                      if (nft.id) {
                        window.open(`https://testnet.suivision.xyz/object/${nft.id}`, '_blank');
                      }
                    }}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View on Explorer
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    #{nft.editionNumber}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


