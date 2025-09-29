import { useEffect } from 'react';
import { useCollections } from '../../providers';
import { useNFTMinting } from '../../hooks/useNFTMinting';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Loader2, Zap } from 'lucide-react';

export function SimpleMintForm() {
  const { selectedCollection, updateCollectionEdition, refreshCollections } = useCollections();
  const { 
    isMinting, 
    mintedNFTs, 
    error, 
    mintEditionSponsored, 
    loadMintedNFTs, 
    clearError 
  } = useNFTMinting(selectedCollection?.id || null);


  // Load minted NFTs when collection changes
  useEffect(() => {
    if (selectedCollection?.id) {
      loadMintedNFTs();
    }
  }, [selectedCollection?.id, loadMintedNFTs]);

  // Clear error when collection changes
  useEffect(() => {
    clearError();
  }, [selectedCollection?.id, clearError]);

  if (!selectedCollection) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="space-y-2">
            <Zap className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-600">No Collection Selected</h3>
            <p className="text-gray-500">
              Select a collection from the list to start minting NFTs
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleMint = async () => {
    if (!selectedCollection) return;

    const result = await mintEditionSponsored(
      selectedCollection.name,
      selectedCollection.description,
      selectedCollection.imageUrl,
      selectedCollection.name.substring(0, 4).toUpperCase() // Use first 4 characters of name as symbol
    );
    
    if (result && selectedCollection) {
      // Success - the hook will update the state
      console.log('Successfully minted NFT with Enoki sponsorship:', result);
      
      // Update the collection edition count
      updateCollectionEdition(selectedCollection.id, result.editionNumber);
      
      // Refresh collections to get updated data from blockchain
      await refreshCollections();
    }
  };

  const getSupplyInfo = () => {
    if (selectedCollection.maxSupply) {
      const remaining = selectedCollection.maxSupply - selectedCollection.currentEdition;
      return {
        current: selectedCollection.currentEdition,
        max: selectedCollection.maxSupply,
        remaining,
        isFull: remaining <= 0,
      };
    }
    return {
      current: selectedCollection.currentEdition,
      max: null,
      remaining: null,
      isFull: false,
    };
  };

  const supplyInfo = getSupplyInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Mint NFT
        </CardTitle>
        <CardDescription>
          Collection: <span className="font-medium">{selectedCollection.name}</span> (sponsored by Enoki - TEST MODE)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Collection Preview */}
        <div className="text-center">
          <div className="aspect-square w-32 mx-auto overflow-hidden rounded-lg bg-gray-100">
            {selectedCollection.imageUrl ? (
              <img
                src={selectedCollection.imageUrl}
                alt={selectedCollection.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>
        </div>

        {/* Edition Info */}
        <div className="text-center space-y-2">
          <div className="text-sm text-gray-600">
            Next Edition
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            #{selectedCollection.currentEdition + 1}
          </Badge>
        </div>


        {/* Supply Info */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Minted:</span>
            <span className="font-medium">{supplyInfo.current}</span>
          </div>
          
          {supplyInfo.max && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Max Supply:</span>
              <span className="font-medium">{supplyInfo.max}</span>
            </div>
          )}

          {supplyInfo.remaining !== null && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Remaining:</span>
              <span className={`font-medium ${supplyInfo.remaining <= 0 ? 'text-red-500' : ''}`}>
                {supplyInfo.remaining}
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Mint Button */}
        <Button
          onClick={handleMint}
          disabled={isMinting || supplyInfo.isFull}
          className="w-full"
          size="lg"
        >
          {isMinting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Minting...
            </>
          ) : supplyInfo.isFull ? (
            'Collection Full'
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Mint Edition #{selectedCollection.currentEdition + 1} (Free - Test)
            </>
          )}
        </Button>

        {/* Recent Mints */}
        {mintedNFTs.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Recent Mints</h4>
            <div className="space-y-1">
              {mintedNFTs.slice(-3).map((nft, index) => (
                <div key={index} className="flex justify-between text-xs text-gray-500">
                  <span>Edition #{nft.editionNumber}</span>
                  <span>{new Date(nft.mintedAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
