import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useEffect } from 'react';

/**
 * Custom hook to integrate AppKit with the application
 * Provides unified interface for wallet connection state
 */
export const useAppKitIntegration = () => {
  const { open, close, isOpen } = useAppKit();
  const { address, isConnected, chain } = useAppKitAccount();

  // Log connection state changes for debugging
  useEffect(() => {
    if (isConnected && address) {
      console.log('AppKit wallet connected:', { address, chain });
    }
  }, [isConnected, address, chain]);

  return {
    open,
    close,
    isOpen,
    address,
    isConnected,
    chain,
  };
};

