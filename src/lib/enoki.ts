import { Transaction } from '@mysten/sui/transactions';

// Enoki API configuration
const ENOKI_API_KEY = import.meta.env.VITE_ENOKI_API_KEY;
const ENOKI_BASE_URL = 'https://api.enoki.network/v1';

// Types
export interface EnokiSponsorResponse {
  transaction: string;
  digest: string;
}

export interface EnokiError {
  error: string;
  message: string;
}

// Enoki API client
export class EnokiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Sponsor a transaction through Enoki
   */
  async sponsorTransaction(
    _transactionBlock: Transaction,
    network: 'testnet' | 'mainnet' = 'testnet'
  ): Promise<EnokiSponsorResponse> {
    // For now, we'll use a placeholder - in production you'd serialize the transaction properly
    // TODO: Implement proper transaction serialization using transactionBlock
    // const serializedTx = _transactionBlock.serialize(); // This would be the proper implementation
    const serializedTx = 'placeholder_serialized_transaction';

    const response = await fetch(`${ENOKI_BASE_URL}/sponsor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        transaction: serializedTx,
        network,
      }),
    });

    if (!response.ok) {
      const error: EnokiError = await response.json();
      throw new Error(`Enoki API error: ${error.message}`);
    }

    return await response.json();
  }

  /**
   * Get sponsored transaction status
   */
  async getTransactionStatus(digest: string): Promise<{
    status: 'pending' | 'success' | 'failure';
    digest: string;
    error?: string;
  }> {
    const response = await fetch(`${ENOKI_BASE_URL}/transaction/${digest}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get transaction status');
    }

    return await response.json();
  }

  /**
   * Get user's sponsored transactions
   */
  async getUserTransactions(userAddress: string): Promise<{
    transactions: Array<{
      digest: string;
      status: 'pending' | 'success' | 'failure';
      timestamp: number;
    }>;
  }> {
    const response = await fetch(`${ENOKI_BASE_URL}/user/${userAddress}/transactions`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user transactions');
    }

    return await response.json();
  }
}

// Export singleton instance
export const enokiClient = new EnokiClient(ENOKI_API_KEY);

// Helper function to create sponsored transaction
export async function createSponsoredTransaction(
  transactionBlock: Transaction,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<EnokiSponsorResponse> {
  return await enokiClient.sponsorTransaction(transactionBlock, network);
}
