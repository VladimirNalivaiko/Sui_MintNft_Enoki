import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollections } from '../../providers';

export function CollectionStatus() {
  const { collections, selectedCollection, isLoading, refreshCollections } = useCollections();

  console.log('CollectionStatus: Rendering with state:', {
    collections: collections.length,
    selectedCollection,
    isLoading
  });

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Collection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center">
            Loading collection status...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (collections.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Collection Status</CardTitle>
              <CardDescription className="text-muted-foreground">
                No collection created yet
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshCollections}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="text-muted-foreground">
            No Collection
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">
            Create a collection to start minting NFTs
          </p>
        </CardContent>
      </Card>
    );
  }

  if (selectedCollection) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Collection Status</CardTitle>
              <CardDescription className="text-muted-foreground">
                Collection is ready for minting
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshCollections}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Status:</span>
            <Badge variant="default" className="bg-green-500">
              Active
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="text-sm text-foreground">{selectedCollection.name}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Description:</span>
              <span className="text-sm text-foreground">{selectedCollection.description}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Max Supply:</span>
              <span className="text-sm text-foreground">
                {selectedCollection.maxSupply ? selectedCollection.maxSupply.toString() : 'Unlimited'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Creator:</span>
              <span className="text-sm text-foreground font-mono">
                {selectedCollection.creator.slice(0, 8)}...{selectedCollection.creator.slice(-8)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Image:</span>
              <div className="w-16 h-16 rounded-lg overflow-hidden">
                <img 
                  src={selectedCollection.imageUrl} 
                  alt={selectedCollection.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
