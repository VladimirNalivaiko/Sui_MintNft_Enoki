// Collection types for the new NFT Factory contract

export interface CollectionInfo {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  maxSupply: number | null;
  creator: string;
  createdAt: number;
  currentEdition: number;
  counterId: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  maxSupply: number | null;
  creator: string;
  createdAt: number;
}

export interface MintCounter {
  id: string;
  collectionId: string;
  currentCount: number;
  maxSupply: number | null;
  owner: string;
}

export interface NFTInfo {
  id: string;
  collectionId: string;
  editionNumber: number;
  mintedAt: number;
  owner: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface CollectionCreationParams {
  name: string;
  description: string;
  imageUrl: string;
  maxSupply?: number;
}

export interface GlobalState {
  id: string;
  collectionCount: number;
  globalEditionCounter: number;
}

// === EVENT TYPES ===

export interface CollectionCreatedEvent {
  collection_id: string;
  name: string;
  description: string;
  image_url: string;
  max_supply: number | null;
  creator: string;
  created_at: number;
  current_edition: number;
}

export interface NFTCreatedEvent {
  nft_id: string;
  collection_id: string;
  edition_number: number;
  minter: string;
  minted_at: number;
}

export interface MintCounterCreatedEvent {
  counter_id: string;
  collection_id: string;
  owner: string;
  max_supply: number | null;
  created_at: number;
}

export interface CollectionEditionUpdatedEvent {
  collection_id: string;
  current_edition: number;
  updated_at: number;
}
