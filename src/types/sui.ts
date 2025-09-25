export interface SuiNetworkConfig {
  network: 'testnet' | 'mainnet' | 'devnet';
  rpcUrl: string;
  faucetUrl?: string;
}

export interface SuiTransactionResult {
  digest: string;
  effects?: {
    status: {
      status: 'success' | 'failure';
    };
  };
  events?: Array<{
    type: string;
    data: Record<string, any>;
  }>;
}

export interface SuiObject {
  objectId: string;
  version: string;
  digest: string;
  type: string;
  owner?: {
    AddressOwner?: string;
    ObjectOwner?: string;
    Shared?: {
      initial_shared_version: string;
    };
  };
  previousTransaction: string;
}

export interface SuiBalance {
  coinType: string;
  coinObjectCount: number;
  totalBalance: string;
  lockedBalance?: Record<string, string>;
}

export interface WalletConnection {
  isConnected: boolean;
  address?: string;
  chain?: string;
}
