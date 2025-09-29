import { useState, useCallback, useEffect } from 'react';
import { useCurrentAccount, useSignTransactionBlock, useSuiClient } from '@mysten/dapp-kit';
import { nftFactoryContract } from '../lib/contract';
import { NFTInfo } from '../types/collection';

export function useNFTMinting(collectionId: string | null) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState<NFTInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransactionBlock } = useSignTransactionBlock();
  const client = useSuiClient();

  /**
   * Mint a new edition from the selected collection
   */
  const mintEdition = useCallback(async (name: string, description: string, imageUrl: string, symbol: string): Promise<NFTInfo | null> => {
    if (!collectionId) {
      setError('No collection selected');
      return null;
    }

    if (!currentAccount?.address || !signTransactionBlock) {
      setError('Wallet not connected');
      return null;
    }

    setIsMinting(true);
    setError(null);

    try {
      console.log('🔍 Starting mint process for collection:', collectionId);
      
      // FIXED approach: use Events to find counter
      const mintCounter = await nftFactoryContract.getMintCounterByCollection(collectionId, currentAccount.address);
      console.log('🔍 Found mint counter:', mintCounter);

      if (!mintCounter) {
        throw new Error('Mint counter not found for this collection');
      }

      // Mint the edition with metadata
      console.log('🔍 Calling mintEdition with counterId:', mintCounter.id);
      const result = await nftFactoryContract.mintEdition(
        mintCounter.id,
        name,
        description,
        imageUrl,
        symbol,
        async (txb) => {
          console.log('🔍 Signing transaction...');
          const signedTx = await signTransactionBlock({ transactionBlock: txb as any });
          
          if (!signedTx) {
            throw new Error('Failed to sign transaction');
          }
          
          console.log('🔍 Executing transaction...');
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
      
      console.log('🔍 Mint result:', result);

      if (result.effects?.status?.status === 'success') {
        // Get the updated mint counter to get the correct edition number
        const updatedMintCounter = await nftFactoryContract.getMintCounterInfo(mintCounter.id);
        const editionNumber = updatedMintCounter ? updatedMintCounter.currentCount : mintCounter.currentCount + 1;
        
        // Get the newly minted NFT info
        // Note: In a real implementation, you'd parse the transaction events
        // to get the NFT ID, but for now we'll create a placeholder
        const newNFT: NFTInfo = {
          id: '', // Would be parsed from transaction events
          collectionId,
          editionNumber: editionNumber,
          mintedAt: Date.now(),
          owner: currentAccount.address,
          name: name,
          description: description,
          imageUrl: imageUrl,
        };

        setMintedNFTs(prev => [...prev, newNFT]);
        
        // Update counter locally
        console.log('✅ NFT minted successfully, edition number:', newNFT.editionNumber);
        
        // Reload minted NFTs to get the latest data
        await loadMintedNFTs();
        
        return newNFT;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Failed to mint edition:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint edition');
      return null;
    } finally {
      setIsMinting(false);
    }
  }, [collectionId, currentAccount?.address, signTransactionBlock, client]);

  /**
   * Load user's minted NFTs for the selected collection (through Events)
   */
  const loadMintedNFTs = useCallback(async () => {
    if (!currentAccount?.address || !collectionId) return;

    try {
      // FIXED approach: use Events to load NFTs
      const allNFTs = await nftFactoryContract.getUserNFTsFromEvents(currentAccount.address);
      const collectionNFTs = allNFTs.filter(nft => nft.collectionId === collectionId);
      setMintedNFTs(collectionNFTs);
    } catch (err) {
      console.error('Failed to load minted NFTs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load minted NFTs');
    }
  }, [currentAccount?.address, collectionId]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load minted NFTs when collection changes
  useEffect(() => {
    if (collectionId && currentAccount?.address) {
      loadMintedNFTs();
    } else {
      setMintedNFTs([]);
    }
  }, [collectionId, currentAccount?.address, loadMintedNFTs]);

  return {
    isMinting,
    mintedNFTs,
    error,
    mintEdition,
    loadMintedNFTs,
    clearError,
  };
}
