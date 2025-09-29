import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { 
  CollectionInfo, 
  Collection, 
  MintCounter, 
  NFTInfo, 
  CollectionCreationParams,
  CollectionCreatedEvent,
  NFTCreatedEvent,
  MintCounterCreatedEvent,
  CollectionEditionUpdatedEvent
} from '../types/collection';

// Re-export types for backward compatibility
export type { CollectionInfo, Collection, MintCounter, NFTInfo, CollectionCreationParams };

// Contract constants - loaded from environment variables
export const NFT_FACTORY_PACKAGE_ID = import.meta.env.VITE_NFT_FACTORY_PACKAGE_ID;
export const NFT_FACTORY_MODULE = 'nft_factory';

// Global State Object ID (Shared Object)
export const GLOBAL_STATE_OBJECT_ID = import.meta.env.VITE_GLOBAL_STATE_OBJECT_ID;

// Validate environment variables
if (!NFT_FACTORY_PACKAGE_ID) {
  throw new Error('❌ VITE_NFT_FACTORY_PACKAGE_ID is required but not found in environment variables. Please set it in your .env file.');
}

if (!GLOBAL_STATE_OBJECT_ID) {
  throw new Error('❌ VITE_GLOBAL_STATE_OBJECT_ID is required but not found in environment variables. Please set it in your .env file.');
}

// Log current configuration
console.log('NFT Factory Configuration:', {
  packageId: NFT_FACTORY_PACKAGE_ID,
  globalStateObjectId: GLOBAL_STATE_OBJECT_ID,
  network: import.meta.env.VITE_SUI_NETWORK || 'testnet'
});

// Additional environment variables diagnostics
console.log('🔧 Environment variables check:', {
  VITE_NFT_FACTORY_PACKAGE_ID: import.meta.env.VITE_NFT_FACTORY_PACKAGE_ID,
  VITE_GLOBAL_STATE_OBJECT_ID: import.meta.env.VITE_GLOBAL_STATE_OBJECT_ID,
  VITE_SUI_NETWORK: import.meta.env.VITE_SUI_NETWORK,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

// Contract function names
export const CONTRACT_FUNCTIONS = {
  CREATE_COLLECTION: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::create_collection`,
  MINT_EDITION: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::mint_edition`,
  GET_COLLECTION_BY_ID: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::get_collection_info_by_id`,
  GET_COLLECTION_INFO: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::get_collection_info`,
  GET_MINT_COUNTER_INFO: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::get_mint_counter_info`,
  GET_NFT_INFO: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::get_nft_info`,
  GET_COLLECTION_COUNT: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::get_collection_count`,
  COLLECTION_EXISTS: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::collection_exists`,
  GET_COLLECTION_CURRENT_EDITION: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::get_collection_current_edition`,
} as const;

// === BCS SCHEMAS ===



// Contract utilities
export class NFTFactoryContract {
  private client: SuiClient;

  constructor(client: SuiClient) {
    this.client = client;
  }

  /**
   * Create a new collection
   */
  async createCollection(
    params: CollectionCreationParams,
    signAndExecute: (txb: any) => Promise<any>
  ): Promise<any> {
    const txb = new Transaction();

    // Prepare arguments
    console.log('🔄 createCollection: Preparing arguments with params:', params);
    console.log('🔄 createCollection: name type:', typeof params.name, 'value:', params.name);
    console.log('🔄 createCollection: description type:', typeof params.description, 'value:', params.description);
    console.log('🔄 createCollection: imageUrl type:', typeof params.imageUrl, 'value:', params.imageUrl);
    console.log('🔄 createCollection: maxSupply type:', typeof params.maxSupply, 'value:', params.maxSupply);
    
    const name = txb.pure.string(params.name);
    const description = txb.pure.string(params.description);
    const imageUrl = txb.pure.string(params.imageUrl);
    const maxSupply = params.maxSupply ? txb.pure.option('u64', params.maxSupply) : txb.pure.option('u64', null);

    // Call create_collection function
    txb.moveCall({
      target: CONTRACT_FUNCTIONS.CREATE_COLLECTION,
      arguments: [
        txb.object(GLOBAL_STATE_OBJECT_ID), // GlobalState
        name,
        description,
        imageUrl,
        maxSupply,
      ],
    });

    return await signAndExecute(txb);
  }

  /**
   * Mint a new edition from a collection
   */
  async mintEdition(
    counterId: string,
    name: string,
    description: string,
    imageUrl: string,
    symbol: string,
    signAndExecute: (txb: any) => Promise<any>
  ): Promise<any> {
    const txb = new Transaction();

    // Call mint_edition function with metadata
    txb.moveCall({
      target: CONTRACT_FUNCTIONS.MINT_EDITION,
      arguments: [
        txb.object(GLOBAL_STATE_OBJECT_ID), // GlobalState
        txb.object(counterId), // MintCounter
        txb.pure.string(name), // Name
        txb.pure.string(description), // Description
        txb.pure.string(imageUrl), // Image URL
        txb.pure.string(symbol), // Symbol
      ],
    });

    return await signAndExecute(txb);
  }

  /**
   * Get collection information by ID (DEPRECATED - using events)
   * This method doesn't work due to BCS deserialization issues
   */
  async getCollectionById(_collectionId: string, _sender?: string): Promise<CollectionInfo | null> {
    console.log('⚠️ getCollectionById: This method is deprecated due to BCS deserialization issues');
    console.log('⚠️ Use getUserCollectionsFromEvents instead');
    return null;
  }

  /**
   * Get collection information from Collection object
   */
  async getCollectionInfo(collectionId: string): Promise<Collection | null> {
    const txb = new Transaction();
    txb.moveCall({
      target: CONTRACT_FUNCTIONS.GET_COLLECTION_INFO,
      arguments: [txb.object(collectionId)],
    });

    const result = await this.client.dryRunTransactionBlock({
      transactionBlock: await txb.build({ client: this.client }),
    });

    if (result.effects.status.status !== 'success') {
      console.error('Failed to get collection info. Result:', result);
      return null;
    }

    const returnValues = (result.effects as any).returnValues || [];
    if (!returnValues || returnValues.length < 6) {
      return null;
    }

    // Parse return values (name, description, image_url, max_supply, creator, created_at)
    const name = this.parseString(returnValues[0].bcs);
    const description = this.parseString(returnValues[1].bcs);
    const imageUrl = this.parseString(returnValues[2].bcs);
    const maxSupply = returnValues[3].bcs ? this.parseU64(returnValues[3].bcs) : null;
    const creator = this.parseAddress(returnValues[4].bcs);
    const createdAt = this.parseU64(returnValues[5].bcs);

    return {
      id: collectionId,
      name,
      description,
      imageUrl,
      maxSupply,
      creator,
      createdAt,
    };
  }

  /**
   * Get mint counter information
   * Fixed: using getObject instead of devInspectTransactionBlock
   */
  async getMintCounterInfo(counterId: string, _sender?: string): Promise<MintCounter | null> {
    try {
      console.log('🔍 getMintCounterInfo: Getting object for counterId:', counterId);
      
      // Get object directly since MintCounter is a shared object
      const object = await this.client.getObject({
        id: counterId,
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (!object.data || object.data.content?.dataType !== 'moveObject') {
        console.error('❌ getMintCounterInfo: Object not found or not a move object:', object);
        return null;
      }

      const content = object.data.content as any;
      const fields = content.fields;

      if (!fields) {
        console.error('❌ getMintCounterInfo: No fields found in object');
        return null;
      }

      // Parse MintCounter object fields
      const currentCount = parseInt(fields.current_count);
      const maxSupply = fields.max_supply ? parseInt(fields.max_supply) : null;
      const owner = fields.owner;
      const collectionId = fields.collection_id;

      console.log('✅ getMintCounterInfo: Parsed counter data:', {
        currentCount,
        maxSupply,
        owner,
        collectionId
      });

      return {
        id: counterId,
        collectionId,
        currentCount,
        maxSupply,
        owner,
      };
    } catch (error) {
      console.error('❌ getMintCounterInfo: Error getting counter info:', error);
      return null;
    }
  }

  /**
   * Get NFT information
   */
  async getNFTInfo(nftId: string): Promise<NFTInfo | null> {
    const txb = new Transaction();
    txb.moveCall({
      target: CONTRACT_FUNCTIONS.GET_NFT_INFO,
      arguments: [txb.object(nftId)],
    });

    const result = await this.client.dryRunTransactionBlock({
      transactionBlock: await txb.build({ client: this.client }),
    });

    if (result.effects.status.status !== 'success') {
      console.error('Failed to get NFT info. Result:', result);
      return null;
    }

    const returnValues = (result.effects as any).returnValues || [];
    if (!returnValues || returnValues.length < 4) {
      return null;
    }

    // Parse return values (collection_id, edition_number, minted_at, owner)
    const collectionId = this.parseId(returnValues[0].bcs);
    const editionNumber = this.parseU64(returnValues[1].bcs);
    const mintedAt = this.parseU64(returnValues[2].bcs);
    const owner = this.parseAddress(returnValues[3].bcs);

    return {
      id: nftId,
      collectionId,
      editionNumber,
      mintedAt,
      owner,
      name: '', // These would be parsed from the NFT object
      description: '',
      imageUrl: '',
    };
  }

  /**
   * Get collection count
   */
  async getCollectionCount(): Promise<number> {
    const txb = new Transaction();
    txb.moveCall({
      target: CONTRACT_FUNCTIONS.GET_COLLECTION_COUNT,
      arguments: [txb.object(GLOBAL_STATE_OBJECT_ID)],
    });

    const result = await this.client.dryRunTransactionBlock({
      transactionBlock: await txb.build({ client: this.client }),
    });

    if (result.effects.status.status !== 'success') {
      console.error('Failed to get collection count. Result:', result);
      return 0;
    }

    const returnValues = (result.effects as any).returnValues || [];
    if (!returnValues || returnValues.length === 0) {
      return 0;
    }

    return this.parseU64(returnValues[0].bcs);
  }

  /**
   * Check if collection exists
   */
  async collectionExists(collectionId: string): Promise<boolean> {
    const txb = new Transaction();
    txb.moveCall({
      target: CONTRACT_FUNCTIONS.COLLECTION_EXISTS,
      arguments: [
        txb.object(GLOBAL_STATE_OBJECT_ID),
        txb.pure.id(collectionId),
      ],
    });

    const result = await this.client.dryRunTransactionBlock({
      transactionBlock: await txb.build({ client: this.client }),
    });

    if (result.effects.status.status !== 'success') {
      console.error('Failed to check collection existence. Result:', result);
      return false;
    }

    const returnValues = (result.effects as any).returnValues || [];
    if (!returnValues || returnValues.length === 0) {
      return false;
    }

    return returnValues[0].bcs === 'AQ==' || returnValues[0].bcs === 'AA=='; // true or false in base64
  }

  /**
   * Get current edition count for a collection
   */
  async getCollectionCurrentEdition(collectionId: string): Promise<number | null> {
    const txb = new Transaction();
    txb.moveCall({
      target: CONTRACT_FUNCTIONS.GET_COLLECTION_CURRENT_EDITION,
      arguments: [
        txb.object(GLOBAL_STATE_OBJECT_ID),
        txb.pure.id(collectionId),
      ],
    });

    const result = await this.client.dryRunTransactionBlock({
      transactionBlock: await txb.build({ client: this.client }),
    });

    if (result.effects.status.status !== 'success') {
      console.error('Failed to get collection current edition. Result:', result);
      return null;
    }

    const returnValues = (result.effects as any).returnValues || [];
    if (!returnValues || returnValues.length === 0) {
      return null;
    }

    // Parse Option<u64> - if it's Some, return the value, if None, return null
    const optionBcs = returnValues[0].bcs;
    if (!optionBcs || optionBcs === 'AA==') { // None case
      return null;
    }

    return this.parseU64(optionBcs);
  }

  /**
   * Get user's owned NFTs
   */
  async getUserNFTs(userAddress: string): Promise<string[]> {
    const objects = await this.client.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${NFT_FACTORY_PACKAGE_ID}::${NFT_FACTORY_MODULE}::NFT`,
      },
      options: {
        showContent: true,
      },
    });

    return objects.data.map(obj => obj.data?.objectId || '').filter(Boolean);
  }

  /**
   * Get user's owned collections
   */
  async getUserCollections(userAddress: string): Promise<string[]> {
    const objects = await this.client.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${NFT_FACTORY_PACKAGE_ID}::${NFT_FACTORY_MODULE}::Collection`,
      },
      options: {
        showContent: true,
      },
    });

    return objects.data.map(obj => obj.data?.objectId || '').filter(Boolean);
  }

  /**
   * Get user's owned mint counters
   */
  async getUserMintCounters(userAddress: string): Promise<string[]> {
    const objects = await this.client.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${NFT_FACTORY_PACKAGE_ID}::${NFT_FACTORY_MODULE}::MintCounter`,
      },
      options: {
        showContent: true,
      },
    });

    return objects.data.map(obj => obj.data?.objectId || '').filter(Boolean);
  }

  // === HYBRID APPROACH: Events for indexing + Table for data ===

  /**
   * Get only user collection IDs from events (fast)
   */
  async getUserCollectionIdsFromEvents(userAddress: string): Promise<string[]> {
    try {
      console.log('🔍 getUserCollectionIdsFromEvents: Starting query for user:', userAddress);
      
      const events = await this.client.queryEvents({
        query: { 
          MoveEventType: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::CollectionCreated`
        },
        order: 'descending',
        limit: 100,
      });
      
      const userCollectionIds = events.data
        .filter(event => {
          const parsedJson = event.parsedJson as CollectionCreatedEvent;
          return parsedJson?.creator === userAddress;
        })
        .map(event => {
          const parsedJson = event.parsedJson as CollectionCreatedEvent;
          return parsedJson?.collection_id || '';
        })
        .filter(Boolean);
      
      console.log('🔍 getUserCollectionIdsFromEvents: Found collection IDs:', userCollectionIds.length);
      return userCollectionIds;
    } catch (error) {
      console.error('❌ Failed to get collection IDs from events:', error);
      return [];
    }
  }

  /**
   * Load user collections through Events (SIMPLE AND RELIABLE APPROACH)
   * Using only events since smart contract has BCS deserialization issues
   */
  async getUserCollectionsFromEvents(userAddress: string): Promise<CollectionInfo[]> {
    try {
      console.log('🔍 getUserCollectionsFromEvents: Starting simple events query for user:', userAddress);
      
      // Get collections directly from CollectionCreated events
      const events = await this.client.queryEvents({
        query: { 
          MoveEventType: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::CollectionCreated`
        },
        order: 'descending',
        limit: 100,
      });
      
      console.log('🔍 Found events:', events.data.length);
      
      // Filter events by user
      const userEvents = events.data.filter(event => {
        const parsedJson = event.parsedJson as CollectionCreatedEvent;
        return parsedJson?.creator === userAddress;
      });
      
      console.log('🔍 Filtered events for user:', userEvents.length);
      
      if (userEvents.length === 0) {
        console.log('🔍 No collections found for user');
        return [];
      }
      
      // Get current edition count for each collection through CollectionEditionUpdated events
      console.log('🔍 Getting current editions for collections...');
      const collections = await Promise.all(
        userEvents.map(async (event) => {
          const parsedJson = event.parsedJson as CollectionCreatedEvent;
          if (!parsedJson) return null;
          
          try {
            // Get current edition count through mint counter
            const mintCounter = await this.getMintCounterByCollection(parsedJson.collection_id, userAddress);
            const currentEdition = mintCounter ? mintCounter.currentCount : 0;
            
            const collectionInfo: CollectionInfo = {
              id: parsedJson.collection_id,
              counterId: mintCounter ? mintCounter.id : '', // Get counter ID
              name: parsedJson.name,
              description: parsedJson.description,
              imageUrl: parsedJson.image_url,
              maxSupply: parsedJson.max_supply,
              creator: parsedJson.creator,
              createdAt: parsedJson.created_at,
              currentEdition: currentEdition,
            };
            
            console.log(`✅ Collection ${parsedJson.collection_id}: edition = ${currentEdition}`, {
              collectionInfo,
              currentEditionType: typeof currentEdition,
              mintCounter: mintCounter ? {
                id: mintCounter.id,
                currentCount: mintCounter.currentCount,
                maxSupply: mintCounter.maxSupply
              } : null
            });
            return collectionInfo;
          } catch (error) {
            console.error(`❌ Failed to get current edition for collection ${parsedJson.collection_id}:`, error);
            // Return collection with base currentEdition value
            return {
              id: parsedJson.collection_id,
              counterId: '',
              name: parsedJson.name,
              description: parsedJson.description,
              imageUrl: parsedJson.image_url,
              maxSupply: parsedJson.max_supply,
              creator: parsedJson.creator,
              createdAt: parsedJson.created_at,
              currentEdition: parsedJson.current_edition || 0,
            } as CollectionInfo;
          }
        })
      );
      
      const validCollections = collections.filter(Boolean) as CollectionInfo[];
      
      console.log('✅ getUserCollectionsFromEvents: Final result:', {
        requested: userEvents.length,
        found: validCollections.length,
        collections: validCollections
      });
      
      return validCollections;
    } catch (error) {
      console.error('❌ Failed to load collections from events:', error);
      return [];
    }
  }

  /**
   * Get current collection edition count through CollectionEditionUpdated events
   */
  async getCurrentEditionFromEvents(collectionId: string): Promise<number> {
    try {
      console.log('🔍 getCurrentEditionFromEvents: Searching for collectionId:', collectionId);
      
      const events = await this.client.queryEvents({
        query: { 
          MoveEventType: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::CollectionEditionUpdated`,
        },
        order: 'descending',
        limit: 100,
      });
      
      console.log('🔍 getCurrentEditionFromEvents: Found events:', events.data.length);
      
      // Filter by collection_id and take the latest event
      const filteredEvents = events.data.filter(event => {
        const parsedJson = event.parsedJson as CollectionEditionUpdatedEvent;
        return parsedJson?.collection_id === collectionId;
      });
      
      console.log('🔍 getCurrentEditionFromEvents: Filtered events:', filteredEvents.length);
      
      if (filteredEvents.length === 0) {
        console.log('🔍 No edition update events found, returning 0');
        return 0;
      }
      
      // Take the latest event (first in list since order: 'descending')
      const latestEvent = filteredEvents[0];
      const parsedJson = latestEvent.parsedJson as CollectionEditionUpdatedEvent;
      
      console.log('🔍 getCurrentEditionFromEvents: Latest event data:', {
        raw: latestEvent,
        parsed: parsedJson,
        current_edition_raw: parsedJson?.current_edition,
        current_edition_type: typeof parsedJson?.current_edition
      });
      
      const currentEdition = parseInt(String(parsedJson?.current_edition)) || 0;
      
      console.log('✅ getCurrentEditionFromEvents: Latest edition:', currentEdition, '(converted from string to number)');
      return currentEdition;
    } catch (error) {
      console.error('Failed to get collection current edition from events:', error);
      return 0;
    }
  }

  /**
   * Load user NFTs through Events
   */
  async getUserNFTsFromEvents(userAddress: string): Promise<NFTInfo[]> {
    try {
      // Get NFT creation events
      const events = await this.client.queryEvents({
        query: { 
          MoveEventType: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::NFTCreated`,
        },
        order: 'descending',
        limit: 100,
      });
      
      // Filter by user
      const userEvents = events.data.filter(event => {
        const parsedJson = event.parsedJson as NFTCreatedEvent;
        return parsedJson?.minter === userAddress;
      });
      
      // Get full NFT information from objects
      const nfts = await Promise.all(
        userEvents.map(async (event) => {
          const parsedJson = event.parsedJson as NFTCreatedEvent;
          if (!parsedJson?.nft_id) return null;
          
          try {
            // Get NFT object to retrieve metadata
            const nftObject = await this.client.getObject({
              id: parsedJson.nft_id,
              options: {
                showContent: true,
                showType: true,
              },
            });
            
            if (!nftObject.data || nftObject.data.content?.dataType !== 'moveObject') {
              return null;
            }
            
            const content = nftObject.data.content as any;
            const fields = content.fields;
            
            return {
              id: parsedJson.nft_id,
              collectionId: parsedJson.collection_id,
              editionNumber: parsedJson.edition_number || 0,
              mintedAt: parsedJson.minted_at || 0,
              owner: parsedJson.minter || '',
              name: fields?.name || 'Unknown',
              description: fields?.description || 'No description',
              imageUrl: fields?.image_url || 'https://via.placeholder.com/300x300?text=NFT',
            };
          } catch (error) {
            console.error(`Failed to get NFT object ${parsedJson.nft_id}:`, error);
            return null;
          }
        })
      );
      
      return nfts.filter(Boolean) as NFTInfo[];
    } catch (error) {
      console.error('Failed to load NFTs from events:', error);
      return [];
    }
  }

  /**
   * Load mint counters through Events (OPTIMIZED)
   * Get IDs from events, then current data from objects
   */
  async getUserMintCountersFromEvents(userAddress: string): Promise<MintCounter[]> {
    try {
      console.log('🔍 getUserMintCountersFromEvents: Starting query for user:', userAddress);
      
      // 1. Get counter IDs from events
      const events = await this.client.queryEvents({
        query: { 
          MoveEventType: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::MintCounterCreated`,
          Sender: userAddress 
        },
        order: 'descending',
        limit: 100,
      });
      
      const counterIds = events.data
        .map(event => {
          const parsedJson = event.parsedJson as MintCounterCreatedEvent;
          return parsedJson?.counter_id || '';
        })
        .filter(Boolean);
      
      console.log('🔍 Found counter IDs:', counterIds.length);
      
      if (counterIds.length === 0) {
        return [];
      }
      
      // 2. Get current data from objects
      const counters = await Promise.all(
        counterIds.map(async (counterId) => {
          try {
            const counterInfo = await this.getMintCounterInfo(counterId);
            console.log(`🔍 Counter ${counterId}:`, counterInfo ? 'found' : 'not found');
            return counterInfo;
          } catch (error) {
            console.error(`❌ Failed to get counter ${counterId}:`, error);
            return null;
          }
        })
      );
      
      const validCounters = counters.filter(Boolean) as MintCounter[];
      
      console.log('✅ getUserMintCountersFromEvents: Final result:', {
        requested: counterIds.length,
        found: validCounters.length
      });
      
      return validCounters;
    } catch (error) {
      console.error('Failed to load mint counters from events:', error);
      return [];
    }
  }

  /**
   * Find counter by collection (OPTIMIZED)
   * Use events only to get ID, then direct object access
   */
  async getMintCounterByCollection(collectionId: string, sender?: string): Promise<MintCounter | null> {
    try {
      console.log('🔍 getMintCounterByCollection: Searching for collectionId:', collectionId);
      
      // 1. Find counter ID through events
      const events = await this.client.queryEvents({
        query: { 
          MoveEventType: `${NFT_FACTORY_PACKAGE_ID}::nft_factory::MintCounterCreated`,
        },
        order: 'descending',
        limit: 100,
      });
      
      const counterEvent = events.data.find(event => {
        const parsedJson = event.parsedJson as MintCounterCreatedEvent;
        return parsedJson?.collection_id === collectionId;
      });
      
      if (!counterEvent) {
        console.log('🔍 No counter found for collection:', collectionId);
        return null;
      }
      
      const parsedJson = counterEvent.parsedJson as MintCounterCreatedEvent;
      const counterId = parsedJson?.counter_id;
      
      if (!counterId) {
        console.log('❌ No counter ID found in event');
        return null;
      }
      
      console.log('🔍 Found counter ID:', counterId);
      
      // 2. Get current data from object
      const mintCounter = await this.getMintCounterInfo(counterId, sender);
      
      if (mintCounter) {
        console.log('✅ getMintCounterByCollection: Found mint counter:', mintCounter);
      } else {
        console.log('❌ Failed to get counter info for ID:', counterId);
      }
      
      return mintCounter;
    } catch (error) {
      console.error('Failed to get mint counter by collection:', error);
      return null;
    }
  }




  /**
   * Parse address from BCS
   */
  private parseAddress(bcs: string): string {
    // This is a simplified parser - in production you'd use proper BCS decoding
    return '0x' + Buffer.from(bcs, 'base64').toString('hex');
  }

  /**
   * Parse ID from BCS
   */
  private parseId(bcs: string): string {
    // This is a simplified parser - in production you'd use proper BCS decoding
    return '0x' + Buffer.from(bcs, 'base64').toString('hex');
  }

  /**
   * Parse string from BCS
   */
  private parseString(bcs: string): string {
    // This is a simplified parser - in production you'd use proper BCS decoding
    return Buffer.from(bcs, 'base64').toString('utf-8');
  }

  /**
   * Parse u64 from BCS
   */
  private parseU64(bcs: string): number {
    // This is a simplified parser - in production you'd use proper BCS decoding
    const buffer = Buffer.from(bcs, 'base64');
    return buffer.readUIntLE(0, 8);
  }
}

// Export singleton instance
const suiClient = new SuiClient({
  url: import.meta.env.VITE_SUI_NETWORK === 'testnet' 
    ? 'https://fullnode.testnet.sui.io:443'
    : 'https://fullnode.mainnet.sui.io:443'
});

console.log('Sui client created for network:', import.meta.env.VITE_SUI_NETWORK || 'testnet');

export const nftFactoryContract = new NFTFactoryContract(suiClient);