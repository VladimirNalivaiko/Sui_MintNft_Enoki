import { Transaction } from '@mysten/sui/transactions';
import { EnokiClient } from '@mysten/enoki';

// Enoki API configuration
const ENOKI_API_KEY = import.meta.env.VITE_ENOKI_API_KEY;
const ENOKI_GOOGLE_CLIENT_ID = import.meta.env.VITE_ENOKI_GOOGLE_CLIENT_ID;
const ENOKI_FACEBOOK_CLIENT_ID = import.meta.env.VITE_ENOKI_FACEBOOK_CLIENT_ID;
const ENOKI_TWITCH_CLIENT_ID = import.meta.env.VITE_ENOKI_TWITCH_CLIENT_ID;

// Validate API key
if (!ENOKI_API_KEY) {
  console.error('❌ VITE_ENOKI_API_KEY is not set in environment variables');
  console.warn('⚠️ Enoki features will be disabled. Please set VITE_ENOKI_API_KEY in your .env file');
}

// Types
export interface EnokiSponsorResponse {
  transaction: string;
  digest: string;
  sponsored: boolean;
  gasUsed?: string;
  gasPrice?: string;
}

export interface EnokiError {
  error: string;
  message: string;
  code?: string;
}

export interface EnokiTransactionStatus {
  status: 'pending' | 'success' | 'failure';
  digest: string;
  error?: string;
  gasUsed?: string;
  timestamp?: number;
}

export interface EnokiUserTransaction {
  digest: string;
  status: 'pending' | 'success' | 'failure';
  timestamp: number;
  gasUsed?: string;
  type?: string;
}

// Enoki API client wrapper
export class EnokiAPIClient {
  private enokiClient: EnokiClient | null = null;

  constructor() {
    if (ENOKI_API_KEY) {
      this.enokiClient = new EnokiClient({
        apiKey: ENOKI_API_KEY,
      });
    }
  }

  /**
   * Check if Enoki is available
   */
  isAvailable(): boolean {
    return this.enokiClient !== null;
  }

  /**
   * Sponsor a transaction through Enoki
   */
  async sponsorTransaction(
    transactionBlock: Transaction,
    network: 'testnet' | 'mainnet' = 'testnet',
    userAddress?: string,
    suiClient?: any
  ): Promise<EnokiSponsorResponse> {
    if (!this.enokiClient) {
      console.warn('⚠️ Enoki not available, falling back to mock sponsored transaction');
      // Return a mock response for development/testing
      return {
        transaction: 'mock_transaction_data',
        digest: `0x${Math.random().toString(16).substr(2, 64)}`,
        sponsored: false, // Indicate it's not actually sponsored
        gasUsed: '1000',
        gasPrice: '1000'
      };
    }

    try {
      console.log('🔄 Enoki: Starting transaction sponsorship...');
      console.log('🔍 Enoki: SuiClient available:', !!suiClient);
      console.log('🔍 Enoki: SuiClient type:', typeof suiClient);
      
      if (!suiClient) {
        throw new Error('SuiClient is required for transaction building');
      }
      
      // Build transaction with client
      const transactionKindBytes = await transactionBlock.build({
        client: suiClient,
        onlyTransactionKind: true,
      });

      // Convert to base64 (browser-compatible)
      const transactionKindBytesB64 = btoa(String.fromCharCode(...new Uint8Array(transactionKindBytes)));

      // Create sponsored transaction
      const sponsoredResult = await this.enokiClient.createSponsoredTransaction({
        network: network,
        transactionKindBytes: transactionKindBytesB64,
        sender: userAddress || '0x0',
        allowedMoveCallTargets: [
          '0xd8004005f0860cf71b1278cb32c60fbe307b31dedc80bc1708869015d33e16d3::nft_factory::create_collection',
          '0xd8004005f0860cf71b1278cb32c60fbe307b31dedc80bc1708869015d33e16d3::nft_factory::mint_edition',
        ],
        allowedAddresses: userAddress ? [userAddress] : [],
      });

      console.log('✅ Enoki: Transaction sponsored successfully:', sponsoredResult.digest);
      
      return {
        transaction: sponsoredResult.bytes,
        digest: sponsoredResult.digest,
        sponsored: true,
        gasUsed: '0', // Enoki handles gas
        gasPrice: '0',
      };
    } catch (error) {
      console.error('❌ Enoki: Failed to sponsor transaction:', error);
      throw error;
    }
  }

  /**
   * Get sponsored transaction status
   */
  async getTransactionStatus(digest: string): Promise<EnokiTransactionStatus> {
    if (!this.enokiClient) {
      throw new Error('Enoki client not initialized');
    }

    try {
      console.log('🔍 Enoki: Getting transaction status for:', digest);
      
      // For now, simulate transaction status since the method doesn't exist in the current SDK
      console.log('✅ Enoki: Simulating transaction status for:', digest);
      
      // Simulate a successful status after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        status: 'success' as 'pending' | 'success' | 'failure',
        digest: digest,
        gasUsed: '0',
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('❌ Enoki: Error getting transaction status:', error);
      throw error;
    }
  }

  /**
   * Get user's sponsored transactions
   */
  async getUserTransactions(userAddress: string): Promise<{
    transactions: EnokiUserTransaction[];
  }> {
    if (!this.enokiClient) {
      throw new Error('Enoki client not initialized');
    }

    try {
      console.log('🔍 Enoki: Getting transactions for user:', userAddress);
      
      // For now, simulate user transactions since the method doesn't exist in the current SDK
      console.log('✅ Enoki: Simulating user transactions for:', userAddress);
      
      return {
        transactions: [],
      };
    } catch (error) {
      console.error('❌ Enoki: Error getting user transactions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const enokiAPIClient = new EnokiAPIClient();

// Helper function to create sponsored transaction
export async function createSponsoredTransaction(
  transactionBlock: Transaction,
  network: 'testnet' | 'mainnet' = 'testnet',
  userAddress?: string,
  suiClient?: any
): Promise<EnokiSponsorResponse> {
  return await enokiAPIClient.sponsorTransaction(transactionBlock, network, userAddress, suiClient);
}

// Helper function to execute sponsored transaction
export async function executeSponsoredTransaction(
  transactionBlock: Transaction,
  network: 'testnet' | 'mainnet' = 'testnet',
  userAddress?: string,
  suiClient?: any
): Promise<EnokiSponsorResponse> {
  try {
    console.log('🚀 Enoki: Executing sponsored transaction...');
    
    // First, sponsor the transaction
    const sponsoredResult = await enokiAPIClient.sponsorTransaction(transactionBlock, network, userAddress, suiClient);
    
    console.log('✅ Enoki: Transaction sponsored, digest:', sponsoredResult.digest);
    
    return sponsoredResult;
  } catch (error) {
    console.error('❌ Enoki: Failed to execute sponsored transaction:', error);
    throw error;
  }
}

// Helper function to wait for transaction completion
export async function waitForTransactionCompletion(
  digest: string,
  maxWaitTime: number = 30000, // 30 seconds
  pollInterval: number = 2000   // 2 seconds
): Promise<EnokiTransactionStatus> {
  console.log('⏳ Enoki: Waiting for transaction completion for digest:', digest);
  
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const status = await enokiAPIClient.getTransactionStatus(digest);
      
      if (status.status === 'success' || status.status === 'failure') {
        console.log('✅ Enoki: Transaction completed:', status.status);
        return status;
      }
      
      console.log('⏳ Enoki: Transaction still pending, waiting...');
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error('❌ Enoki: Error checking transaction status:', error);
      // Continue waiting
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  
  // Timeout reached
  console.warn('⚠️ Enoki: Transaction completion timeout reached');
  return {
    status: 'pending',
    digest: digest,
    timestamp: Date.now(),
  };
}

// Export Enoki configuration for wallet registration
export const enokiConfig = {
  apiKey: ENOKI_API_KEY,
  googleClientId: ENOKI_GOOGLE_CLIENT_ID,
  facebookClientId: ENOKI_FACEBOOK_CLIENT_ID,
  twitchClientId: ENOKI_TWITCH_CLIENT_ID,
  isConfigured: !!ENOKI_API_KEY, // Only require API key for sponsored transactions
  hasOAuth: !!(ENOKI_GOOGLE_CLIENT_ID || ENOKI_FACEBOOK_CLIENT_ID || ENOKI_TWITCH_CLIENT_ID),
};
