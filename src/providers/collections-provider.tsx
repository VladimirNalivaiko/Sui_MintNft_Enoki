import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { useCurrentAccount, useSignTransactionBlock } from '@mysten/dapp-kit';
import { nftFactoryContract } from '../lib/contract';
import { CollectionInfo } from '../types/collection';

interface CollectionsContextType {
  collections: CollectionInfo[];
  selectedCollection: CollectionInfo | null;
  isLoading: boolean;
  error: string | null;
  loadCollections: () => Promise<void>;
  createCollection: (params: {
    name: string;
    description: string;
    imageUrl: string;
    maxSupply?: number;
  }) => Promise<CollectionInfo | null>;
  selectCollection: (collection: CollectionInfo | null) => void;
  refreshCollections: () => Promise<void>;
  updateCollectionEdition: (collectionId: string, edition: number) => void;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

export const useCollections = () => {
  const context = useContext(CollectionsContext);
  if (context === undefined) {
    throw new Error('useCollections must be used within a CollectionsProvider');
  }
  return context;
};

interface CollectionsProviderProps {
  children: React.ReactNode;
}

export const CollectionsProvider: React.FC<CollectionsProviderProps> = ({ children }) => {
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransactionBlock } = useSignTransactionBlock();
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<CollectionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCollections = useCallback(async () => {
    if (!client || !currentAccount?.address) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const collectionsData = await nftFactoryContract.getUserCollectionsFromEvents(currentAccount.address);
      setCollections(collectionsData);
    } catch (err) {
      console.error('❌ Failed to load collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  }, [client, currentAccount?.address]);

  const refreshCollections = useCallback(async () => {
    await loadCollections();
  }, [loadCollections]);

  const createCollection = useCallback(async (params: {
    name: string;
    description: string;
    imageUrl: string;
    maxSupply?: number;
  }): Promise<CollectionInfo | null> => {
    if (!client || !signTransactionBlock || !currentAccount) {
      setError('Wallet not connected');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await nftFactoryContract.createCollection(
        params,
        async (txb) => {
          const signedTx = await signTransactionBlock({ transactionBlock: txb as any });
          
          if (!signedTx) {
            throw new Error('Failed to sign transaction');
          }
          
          // Execute the signed transaction
          return await client.executeTransactionBlock({
            transactionBlock: signedTx.transactionBlockBytes,
            signature: signedTx.signature,
            options: {
              showEffects: true,
              showObjectChanges: true,
            },
          });
        }
      );

      if (result.effects?.status?.status === 'success') {
        await refreshCollections();
        return { success: true } as any;
      } else {
        setError('Failed to create collection');
        return null;
      }
    } catch (err) {
      console.error('❌ Failed to create collection:', err);
      setError(err instanceof Error ? err.message : 'Failed to create collection');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, signTransactionBlock, currentAccount, refreshCollections]);

  const selectCollection = useCallback((collection: CollectionInfo | null) => {
    setSelectedCollection(collection);
  }, []);

  const updateCollectionEdition = useCallback((collectionId: string, edition: number) => {
    setCollections(prev => 
      prev.map(collection => 
        collection.id === collectionId 
          ? { ...collection, currentEdition: edition }
          : collection
      )
    );
    
    // Also update selected collection if it's the same
    setSelectedCollection(prev => 
      prev?.id === collectionId 
        ? { ...prev, currentEdition: edition }
        : prev
    );
  }, []);

  // Load collections on mount
  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  // Auto-select first collection if none selected
  useEffect(() => {
    if (collections.length > 0 && !selectedCollection) {
      console.log('🔄 Auto-selecting first collection:', collections[0].id);
      setSelectedCollection(collections[0]);
    }
  }, [collections, selectedCollection]);

  const value = useMemo(() => ({
    collections,
    selectedCollection,
    isLoading,
    error,
    loadCollections,
    createCollection,
    selectCollection,
    refreshCollections,
    updateCollectionEdition,
  }), [
    collections,
    selectedCollection,
    isLoading,
    error,
    loadCollections,
    createCollection,
    selectCollection,
    refreshCollections,
    updateCollectionEdition,
  ]);

  return (
    <CollectionsContext.Provider value={value}>
      {children}
    </CollectionsContext.Provider>
  );
};
