import { useEffect, useMemo } from 'react';
import { useCollections } from '../../providers';
import { CollectionCard } from './collection-card';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Plus, RefreshCw } from 'lucide-react';

interface CollectionsListProps {
  onCreateCollection: () => void;
}

export function CollectionsList({ onCreateCollection }: CollectionsListProps) {
  const { collections, selectedCollection, isLoading, error, refreshCollections, selectCollection } = useCollections();

  // Debug logging
  console.log('CollectionsList render - collections:', collections.length, collections.map((c: any) => c.id));
  console.log('CollectionsList render - isLoading:', isLoading);
  console.log('CollectionsList render - error:', error);
  console.log('CollectionsList render - collections reference:', collections);

  // Track collections changes with useMemo
  useMemo(() => {
    console.log('CollectionsList useMemo - collections changed:', collections.length, collections.map((c: any) => c.id));
  }, [collections]);

  // Track collections changes
  useEffect(() => {
    console.log('CollectionsList useEffect - collections changed:', collections.length, collections.map((c: any) => c.id));
  }, [collections]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading collections...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={refreshCollections} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (collections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Collections</CardTitle>
          <CardDescription>
            Create your first NFT collection to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onCreateCollection} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Collections</h2>
        <div className="flex gap-2">
          <Button onClick={refreshCollections} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onCreateCollection} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection: any) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            isSelected={selectedCollection?.id === collection.id}
            onSelect={() => selectCollection(collection)}
          />
        ))}
      </div>
    </div>
  );
}
