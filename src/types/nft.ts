export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface MintNFTParams {
  name: string;
  description: string;
  imageUrl: string;
  attributes?: NFTAttribute[];
}

export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  image: string;
  totalSupply?: number;
  maxSupply?: number;
}

export interface MintedNFT {
  id: string;
  name: string;
  description: string;
  image: string;
  collectionId: string;
  owner: string;
  transactionHash: string;
  createdAt: string;
  attributes?: NFTAttribute[];
}
