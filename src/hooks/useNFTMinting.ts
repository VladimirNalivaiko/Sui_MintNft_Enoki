import { useState, useCallback } from 'react';
import { useCurrentAccount, useSignTransactionBlock, useSuiClient } from '@mysten/dapp-kit';
import { nftFactoryContract } from '../lib/contract';
import { NFTInfo } from '../types/collection';
import { waitForTransactionCompletion } from '../lib/enoki';

export function useNFTMinting(collectionId: string | null) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFTs, setMintedNFTs] = useState<NFTInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransactionBlock } = useSignTransactionBlock();
  const client = useSuiClient();

  /**
   * Mint a new edition from the selected collection with Enoki sponsorship
   */
  const mintEditionSponsored = useCallback(async (name: string, description: string, imageUrl: string, symbol: string): Promise<NFTInfo | null> => {
    if (!collectionId) {
      setError('No collection selected');
      return null;
    }

    if (!currentAccount?.address) {
      setError('Wallet not connected');
      return null;
    }

    setIsMinting(true);
    setError(null);

    try {
      console.log('🔍 Starting sponsored mint process for collection:', collectionId);
      console.log('🔍 Client available:', !!client);
      
      if (!client) {
        throw new Error('Sui client not available');
      }
      
      // Find mint counter for the collection
      const mintCounter = await nftFactoryContract.getMintCounterByCollection(collectionId, currentAccount.address);
      console.log('🔍 Found mint counter:', mintCounter);

      if (!mintCounter) {
        throw new Error('Mint counter not found for this collection');
      }

      // Mint the edition with Enoki sponsorship
      console.log('🔍 Calling mintEditionSponsored with counterId:', mintCounter.id);
      const result = await nftFactoryContract.mintEditionSponsored(
        mintCounter.id,
        name,
        description,
        imageUrl,
        symbol,
        'testnet',
        currentAccount.address,
        client
      );
      
      console.log('🔍 Sponsored mint result:', result);

      if (result.sponsored) {
        // Wait for transaction completion
        console.log('⏳ Waiting for transaction completion...');
        const finalStatus = await waitForTransactionCompletion(result.digest);
        
        if (finalStatus.status === 'success') {
          // Get the updated mint counter to get the correct edition number
          const updatedMintCounter = await nftFactoryContract.getMintCounterInfo(mintCounter.id);
          const editionNumber = updatedMintCounter ? updatedMintCounter.currentCount : mintCounter.currentCount + 1;
          
          // Create NFT info
          const newNFT: NFTInfo = {
            id: result.digest, // Use digest as temporary ID
            collectionId,
            editionNumber: editionNumber,
            mintedAt: Date.now(),
            owner: currentAccount.address,
            name: name,
            description: description,
            imageUrl: imageUrl,
          };

          setMintedNFTs(prev => [...prev, newNFT]);
          
          console.log('✅ NFT minted successfully with Enoki sponsorship, edition number:', newNFT.editionNumber);
          
          return newNFT;
        } else {
          throw new Error(`Transaction failed: ${finalStatus.error || 'Unknown error'}`);
        }
      } else {
        // Fallback: Enoki not available, but we got a mock response
        console.warn('⚠️ Enoki not available, using mock response for development');
        
        // Create mock NFT info
        const newNFT: NFTInfo = {
          id: result.digest,
          collectionId,
          editionNumber: mintCounter.currentCount + 1,
          mintedAt: Date.now(),
          owner: currentAccount.address,
          name: name,
          description: description,
          imageUrl: imageUrl,
        };

        setMintedNFTs(prev => [...prev, newNFT]);
        
        console.log('✅ NFT minted successfully (mock), edition number:', newNFT.editionNumber);
        
        return newNFT;
      }
    } catch (err) {
      console.error('Failed to mint edition with Enoki:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint edition with Enoki');
      return null;
    } finally {
      setIsMinting(false);
    }
  }, [collectionId, currentAccount?.address]);

  /**
   * Mint a new edition from the selected collection (legacy method)
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

  return {
    isMinting,
    mintedNFTs,
    error,
    mintEdition,
    mintEditionSponsored,
    loadMintedNFTs,
    clearError,
  };
}
