import { useEffect } from 'react';
import { useSuiClientContext } from '@mysten/dapp-kit';
import { registerEnokiWallets, isEnokiNetwork } from '@mysten/enoki';
import { enokiConfig } from '../lib/enoki';

/**
 * Component to register Enoki wallets with the wallet standard
 * This should be rendered before the WalletProvider
 */
export function EnokiWalletRegistry() {
  const { client, network } = useSuiClientContext();

  useEffect(() => {
    // Only register Enoki wallets if we're on a supported network and have API key
    if (!isEnokiNetwork(network) || !enokiConfig.isConfigured) {
      console.log('⚠️ Enoki: Skipping wallet registration - network not supported or API key not configured');
      return;
    }

    // Only register OAuth wallets if we have OAuth configuration
    if (!enokiConfig.hasOAuth) {
      console.log('ℹ️ Enoki: API key configured, but no OAuth providers - social wallets disabled');
      return;
    }

    console.log('🔄 Enoki: Registering wallets for network:', network);

    try {
      const { unregister } = registerEnokiWallets({
        client: client as any, // Type assertion for compatibility
        network,
        apiKey: enokiConfig.apiKey!,
        providers: {
          // Only register providers that are configured
          ...(enokiConfig.googleClientId && {
            google: {
              clientId: enokiConfig.googleClientId,
            },
          }),
          ...(enokiConfig.facebookClientId && {
            facebook: {
              clientId: enokiConfig.facebookClientId,
            },
          }),
          ...(enokiConfig.twitchClientId && {
            twitch: {
              clientId: enokiConfig.twitchClientId,
            },
          }),
        },
      });

      console.log('✅ Enoki: Wallets registered successfully');

      // Return cleanup function
      return unregister;
    } catch (error) {
      console.error('❌ Enoki: Failed to register wallets:', error);
    }
  }, [client, network]);

  // This component doesn't render anything
  return null;
}
