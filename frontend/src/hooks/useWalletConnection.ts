import { useEffect, useState } from 'react';
import { useAllWallets } from './useAllWallets';

/**
 * Hook for managing wallet connection state and events
 * Provides connection status, auto-reconnect, and connection events
 */
export const useWalletConnection = () => {
  const wallets = useAllWallets();
  const [connectionHistory, setConnectionHistory] = useState<Array<{
    walletType: string;
    timestamp: Date;
    action: 'connect' | 'disconnect';
  }>>([]);

  // Track connection changes
  useEffect(() => {
    const previousState = {
      stacks: wallets.stacks.isConnected,
      appKit: wallets.appKit.isConnected,
      walletKit: wallets.walletKit.isConnected,
    };

    const checkConnection = () => {
      const currentState = {
        stacks: wallets.stacks.isConnected,
        appKit: wallets.appKit.isConnected,
        walletKit: wallets.walletKit.isConnected,
      };

      // Detect new connections
      if (currentState.stacks && !previousState.stacks) {
        setConnectionHistory(prev => [...prev, {
          walletType: 'stacks',
          timestamp: new Date(),
          action: 'connect',
        }]);
      }
      if (currentState.appKit && !previousState.appKit) {
        setConnectionHistory(prev => [...prev, {
          walletType: 'appkit',
          timestamp: new Date(),
          action: 'connect',
        }]);
      }
      if (currentState.walletKit && !previousState.walletKit) {
        setConnectionHistory(prev => [...prev, {
          walletType: 'walletkit',
          timestamp: new Date(),
          action: 'connect',
        }]);
      }

      // Detect disconnections
      if (!currentState.stacks && previousState.stacks) {
        setConnectionHistory(prev => [...prev, {
          walletType: 'stacks',
          timestamp: new Date(),
          action: 'disconnect',
        }]);
      }
      if (!currentState.appKit && previousState.appKit) {
        setConnectionHistory(prev => [...prev, {
          walletType: 'appkit',
          timestamp: new Date(),
          action: 'disconnect',
        }]);
      }
      if (!currentState.walletKit && previousState.walletKit) {
        setConnectionHistory(prev => [...prev, {
          walletType: 'walletkit',
          timestamp: new Date(),
          action: 'disconnect',
        }]);
      }
    };

    checkConnection();
  }, [
    wallets.stacks.isConnected,
    wallets.appKit.isConnected,
    wallets.walletKit.isConnected,
  ]);

  return {
    ...wallets,
    connectionHistory,
    clearHistory: () => setConnectionHistory([]),
  };
};

