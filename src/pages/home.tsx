import React from 'react';
import { useCollections } from '../providers';
import { CollectionsList, SimpleMintForm, CollectionCreationForm } from '../components/collections';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, Zap, Layers, ArrowRight } from 'lucide-react';

export function HomePage() {
  const { collections, selectedCollection } = useCollections();
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  // const handleCreateCollection = async (params: any) => {
  //   try {
  //     await createCollection(params);
  //     setShowCreateForm(false);
  //   } catch (err) {
  //     console.error('Failed to create collection:', err);
  //   }
  // };

  // if (isLoading) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <div className="flex items-center justify-center py-12">
  //         <Loader2 className="h-8 w-8 animate-spin mr-2" />
  //         <span>Loading...</span>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">NFT Factory Platform</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create multiple NFT collections and mint unlimited editions with our simplified platform on Sui blockchain.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Collections</p>
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
                  <p className="text-sm font-medium text-gray-600">Selected</p>
                  <p className="text-lg font-bold">
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
                <Badge variant="secondary">Active</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <p className="text-lg font-bold">
                    {collections.length > 0 ? 'Ready' : 'Empty'}
                  </p>
                </div>
                <Badge variant={collections.length > 0 ? 'default' : 'secondary'}>
                  {collections.length > 0 ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Quick Actions</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => setShowCreateForm(true)}
              size="lg"
              className="min-w-[200px]"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Collection
            </Button>
            {collections.length > 0 && (
              <Button 
                variant="outline"
                size="lg"
                className="min-w-[200px]"
                onClick={() => window.location.href = '#collections'}
              >
                <Layers className="h-5 w-5 mr-2" />
                View Collections
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Main Content - Only show if collections exist */}
        {collections.length > 0 && (
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
        )}

        {/* Empty State */}
        {collections.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Collections Yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first NFT collection to start minting unlimited editions
              </p>
              <Button onClick={() => setShowCreateForm(true)} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Collection
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Collection Creation Modal */}
        {showCreateForm && (
          <CollectionCreationForm onClose={() => setShowCreateForm(false)} />
        )}
      </div>
    </div>
  );
}