import { useState } from 'react';
import { CollectionsList, SimpleMintForm, CollectionCreationForm } from '../components/collections';
import { useCollections } from '../providers';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Layers, Zap } from 'lucide-react';

export function CollectionsPage() {
  const { collections, selectedCollection } = useCollections();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Debug logging
  console.log('CollectionsPage render - collections:', collections.length, collections);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Layers className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">NFT Collections</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create and manage your NFT collections. Each collection can have unlimited editions with simplified minting.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Collections</p>
                  <p className="text-2xl font-bold">{collections.length}</p>
                </div>
                <Layers className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selected Collection</p>
                  <p className="text-2xl font-bold">
                    {selectedCollection ? selectedCollection.name : 'None'}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Editions</p>
                  <p className="text-2xl font-bold">
                    {collections.reduce((sum, c) => sum + c.currentEdition, 0)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {collections.length > 0 ? 'Active' : 'Empty'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Collections List */}
          <div>
            <CollectionsList onCreateCollection={() => setShowCreateForm(true)} />
          </div>

          {/* Minting Form */}
          <div>
            <SimpleMintForm />
          </div>
        </div>

        {/* Collection Creation Modal */}
        {showCreateForm && (
          <CollectionCreationForm onClose={() => setShowCreateForm(false)} />
        )}
      </div>
    </div>
  );
}
