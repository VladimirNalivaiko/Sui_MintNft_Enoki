import React, { useState } from 'react';
import { useCollections } from '../../providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Loader2, X } from 'lucide-react';

interface CollectionCreationFormProps {
  onClose: () => void;
}

export function CollectionCreationForm({ onClose }: CollectionCreationFormProps) {
  const { createCollection, isLoading } = useCollections();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    maxSupply: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Collection name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    } else {
      try {
        new URL(formData.imageUrl);
      } catch {
        newErrors.imageUrl = 'Please enter a valid URL';
      }
    }

    if (formData.maxSupply && (isNaN(Number(formData.maxSupply)) || Number(formData.maxSupply) <= 0)) {
      newErrors.maxSupply = 'Max supply must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Collection creation form: Form validation failed');
      return;
    }

    const params = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim(),
      maxSupply: formData.maxSupply ? Number(formData.maxSupply) : undefined,
    };

    console.log('🔄 Collection creation form: Submitting with params:', params);

    // Additional validation before sending
    if (!params.name || !params.description || !params.imageUrl) {
      console.error('❌ Collection creation form: Missing required fields:', {
        name: params.name,
        description: params.description,
        imageUrl: params.imageUrl
      });
      setErrors({ general: 'All required fields must be filled' });
      return;
    }

    try {
      const result = await createCollection(params);
      if (result) {
        console.log('✅ Collection creation form: Collection created successfully, closing form');
        onClose();
      }
    } catch (err) {
      console.error('❌ Collection creation form: Error creating collection:', err);
      setErrors({ general: err instanceof Error ? err.message : 'Failed to create collection' });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create Collection</CardTitle>
              <CardDescription>
                Create a new NFT collection to start minting
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Collection Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Collection Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter collection name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter collection description"
                disabled={isLoading}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL *</Label>
              <Input
                id="imageUrl"
                type="url"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                placeholder="https://example.com/image.png"
                disabled={isLoading}
              />
              {errors.imageUrl && (
                <p className="text-sm text-red-500">{errors.imageUrl}</p>
              )}
            </div>

            {/* Max Supply */}
            <div className="space-y-2">
              <Label htmlFor="maxSupply">Max Supply (Optional)</Label>
              <Input
                id="maxSupply"
                type="number"
                value={formData.maxSupply}
                onChange={(e) => handleInputChange('maxSupply', e.target.value)}
                placeholder="Leave empty for unlimited"
                min="1"
                disabled={isLoading}
              />
              {errors.maxSupply && (
                <p className="text-sm text-red-500">{errors.maxSupply}</p>
              )}
              <p className="text-xs text-gray-500">
                Leave empty for unlimited supply
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Collection'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
