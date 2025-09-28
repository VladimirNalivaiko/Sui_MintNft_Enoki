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
      console.log('❌ loadCollections: No client or account available');
      return;
    }

    console.log('🔄 loadCollections: Starting to load collections...');
    setIsLoading(true);
    setError(null);

    try {
      const collectionsData = await nftFactoryContract.getUserCollectionsFromEvents(currentAccount.address);
      console.log('✅ loadCollections: Loaded collections:', collectionsData.length);
      
      setCollections(prev => {
        console.log('🔄 loadCollections: Updating collections state from', prev.length, 'to', collectionsData.length);
        return collectionsData;
      });
    } catch (err) {
      console.error('❌ loadCollections: Error loading collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  }, [client, currentAccount?.address]);

  const refreshCollections = useCallback(async () => {
    console.log('🔄 refreshCollections: Starting refresh...');
    await loadCollections();
  }, [loadCollections]);

  const createCollection = useCallback(async (params: {
    name: string;
    description: string;
    imageUrl: string;
    maxSupply?: number;
  }): Promise<CollectionInfo | null> => {
    if (!client || !signTransactionBlock || !currentAccount) {
      console.log('❌ createCollection: Missing required dependencies');
      setError('Wallet not connected');
      return null;
    }

    console.log('🔄 createCollection: Creating collection with params:', params);
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
        console.log('✅ createCollection: Collection created successfully, refreshing collections...');
        await refreshCollections();
        
        // Return the newly created collection (it should be the first one in the list)
        const updatedCollections = await nftFactoryContract.getUserCollectionsFromEvents(currentAccount.address);
        if (updatedCollections.length > 0) {
          return updatedCollections[0];
        }
        
        return null;
      } else {
        console.log('❌ createCollection: Transaction failed');
        setError('Failed to create collection');
        return null;
      }
    } catch (err) {
      console.error('❌ createCollection: Error creating collection:', err);
      setError(err instanceof Error ? err.message : 'Failed to create collection');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, signTransactionBlock, currentAccount, refreshCollections]);

  const selectCollection = useCallback((collection: CollectionInfo | null) => {
    console.log('🔄 selectCollection: Selecting collection:', collection?.id || 'null');
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
