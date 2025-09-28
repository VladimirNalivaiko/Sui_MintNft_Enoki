import { useState, useEffect, useCallback, useRef } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { useCurrentAccount, useSignTransactionBlock } from '@mysten/dapp-kit';
import { nftFactoryContract } from '../lib/contract';
import { CollectionInfo, CollectionCreationParams } from '../types/collection';

export function useCollections() {
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<CollectionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastLoadedAddressRef = useRef<string | null>(null);
  const isRefreshingRef = useRef<boolean>(false);
  
  const client = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransactionBlock } = useSignTransactionBlock();

  /**
   * Load all collections for the current user (HYBRID APPROACH)
   */
  const loadCollections = useCallback(async () => {
    console.log('🔄 loadCollections: Called with address:', currentAccount?.address);
    if (!currentAccount?.address) {
      console.log('🚫 loadCollections: No wallet connected');
      return;
    }

    // Check if we already loaded data for this address
    // BUT only if this is not a forced refresh
    if (lastLoadedAddressRef.current === currentAccount.address && collections.length > 0 && !isRefreshingRef.current) {
      console.log('🔄 loadCollections: Collections already loaded for this address, skipping');
      return;
    }

    console.log('🔄 loadCollections: Starting load for address:', currentAccount.address);
    setIsLoading(true);
    setError(null);

    try {
      // FIXED approach: use Events for indexing + Table for data
      console.log('🔄 loadCollections: Calling getUserCollectionsFromEvents...');
      const loadedCollections = await nftFactoryContract.getUserCollectionsFromEvents(currentAccount.address);
      console.log('🔄 loadCollections: Received collections:', loadedCollections);
      setCollections(loadedCollections);

      // Update lastLoadedAddressRef to avoid reloading
      lastLoadedAddressRef.current = currentAccount.address;

      // Select first collection if none selected
      if (loadedCollections.length > 0 && !selectedCollection) {
        setSelectedCollection(loadedCollections[0]);
      }
    } catch (err) {
      console.error('Failed to load collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [currentAccount?.address, collections.length, selectedCollection, nftFactoryContract]);

  /**
   * Refresh collections data
   */
  const refreshCollections = useCallback(async () => {
    if (!currentAccount?.address) {
      console.log('🚫 refreshCollections: No wallet connected');
      return;
    }

    console.log('🔄 refreshCollections: Starting refresh for address:', currentAccount.address);
    isRefreshingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // FIXED approach: use Events for indexing + Table for data
      console.log('🔄 refreshCollections: Calling getUserCollectionsFromEvents...');
      const loadedCollections = await nftFactoryContract.getUserCollectionsFromEvents(currentAccount.address);
      console.log('🔄 !!!!!refreshCollections: Received collections:', loadedCollections);
      console.log('🔄 refreshCollections: Setting collections state...');
      console.log('🔄 refreshCollections: Before setCollections - current state length:', collections.length);
      
      // Force state update
      setCollections(prev => {
        console.log('🔄 refreshCollections: setCollections callback - prev length:', prev.length);
        console.log('🔄 refreshCollections: setCollections callback - new length:', loadedCollections.length);
        console.log('🔄 refreshCollections: setCollections callback - prev IDs:', prev.map(c => c.id));
        console.log('🔄 refreshCollections: setCollections callback - new IDs:', loadedCollections.map(c => c.id));
        return loadedCollections;
      });
      
      console.log('✅ refreshCollections: Collections state updated with', loadedCollections.length, 'collections');
      console.log('✅ refreshCollections: New collections IDs:', loadedCollections.map(c => c.id));
      
      // Force state update through setTimeout
      setTimeout(() => {
        console.log('🔄 refreshCollections: setTimeout - forcing state update');
        setCollections(prev => {
          console.log('🔄 refreshCollections: setTimeout setCollections - prev length:', prev.length);
          console.log('🔄 refreshCollections: setTimeout setCollections - new length:', loadedCollections.length);
          return loadedCollections;
        });
      }, 100);

      // Update lastLoadedAddressRef to avoid reloading
      lastLoadedAddressRef.current = currentAccount.address;

      // Select first collection if none selected
      if (loadedCollections.length > 0 && !selectedCollection) {
        console.log('🔄 refreshCollections: Selecting first collection');
        setSelectedCollection(loadedCollections[0]);
      }
    } catch (err) {
      console.error('Failed to refresh collections:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh collections');
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  }, [currentAccount?.address, selectedCollection, nftFactoryContract]);

  /**
   * Create a new collection
   */
  const createCollection = useCallback(async (params: CollectionCreationParams): Promise<CollectionInfo | null> => {
    if (!currentAccount?.address || !signTransactionBlock) {
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
        console.log('✅ Collection created successfully, refreshing collections...');
        // Reload collections after successful creation
        await refreshCollections();
        console.log('✅ Collections refreshed after creation');
        
        // Return the newly created collection (it should be the first one in the list)
        // We don't need to fetch again since refreshCollections already updated the state
        const updatedCollections = await nftFactoryContract.getUserCollectionsFromEvents(currentAccount.address);
        if (updatedCollections.length > 0) {
          // Find the most recently created collection (it should be the first one)
          return updatedCollections[0];
        }
        
        return null;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Failed to create collection:', err);
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    } finally {
      setIsLoading(false);
    }

    return null;
  }, [currentAccount?.address, signTransactionBlock, client, refreshCollections]);

  /**
   * Select a collection
   */
  const selectCollection = useCallback((collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (collection) {
      setSelectedCollection(collection);
    }
  }, [collections]);

  /**
   * Update collection edition count
   */
  const updateCollectionEdition = useCallback((collectionId: string, newEdition: number) => {
    setCollections(prev => prev.map(collection => 
      collection.id === collectionId 
        ? { ...collection, currentEdition: newEdition }
        : collection
    ));
    
    // Also update selected collection if it's the same
    setSelectedCollection(prev => 
      prev?.id === collectionId 
        ? { ...prev, currentEdition: newEdition }
        : prev
    );
  }, []);

  // Load collections on mount and when wallet changes
  useEffect(() => {
    console.log('🔄 useEffect: Wallet address changed to:', currentAccount?.address);
    if (currentAccount?.address) {
      // Check if we already loaded collections for this address
      // And if we are not currently refreshing collections (to avoid race condition)
      if (lastLoadedAddressRef.current !== currentAccount.address && !isRefreshingRef.current) {
        console.log('🔄 useEffect: Loading collections for new address');
        lastLoadedAddressRef.current = currentAccount.address;
        loadCollections();
      } else {
        console.log('🔄 useEffect: Collections already loaded for this address or refreshing, skipping');
      }
    } else {
      setCollections([]);
      setSelectedCollection(null);
      lastLoadedAddressRef.current = null;
    }
  }, [currentAccount?.address]); // Remove loadCollections from dependencies to avoid cycles

  return {
    collections,
    selectedCollection,
    isLoading,
    error,
    loadCollections,
    createCollection,
    selectCollection,
    refreshCollections,
    updateCollectionEdition,
  };
}
