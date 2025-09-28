// import React from 'react';
import { CollectionInfo } from '../../types/collection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle } from 'lucide-react';

interface CollectionCardProps {
  collection: CollectionInfo;
  isSelected: boolean;
  onSelect: () => void;
}

export function CollectionCard({ collection, isSelected, onSelect }: CollectionCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getSupplyText = () => {
    if (collection.maxSupply) {
      return `${collection.currentEdition} / ${collection.maxSupply}`;
    }
    return `${collection.currentEdition} minted`;
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-1">{collection.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {collection.description}
            </CardDescription>
          </div>
          {isSelected && (
            <CheckCircle className="h-5 w-5 text-blue-500 ml-2 flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Collection Image */}
          <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            {collection.imageUrl ? (
              <img
                src={collection.imageUrl}
                alt={collection.name}
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

          {/* Collection Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Supply:</span>
              <span className="font-medium">{getSupplyText()}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Created:</span>
              <span className="font-medium">{formatDate(collection.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Next Edition:</span>
              <Badge variant="secondary">
                #{collection.currentEdition + 1}
              </Badge>
            </div>
          </div>

          {/* Collection ID (truncated) */}
          <div className="pt-2 border-t">
            <div className="text-xs text-gray-400 font-mono">
              ID: {collection.id.slice(0, 8)}...{collection.id.slice(-8)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
