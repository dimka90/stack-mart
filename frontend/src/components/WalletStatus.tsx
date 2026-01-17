import { useStacks } from '../hooks/useStacks';
import { useAppKitIntegration } from '../hooks/useAppKitIntegration';
import { useWalletKitHook } from '../hooks/useWalletKit';
import { formatAddress } from '../utils/validation';
import { formatEVMAddress } from '../utils/appkit';
import { formatWalletKitAddress } from '../utils/walletkit';

/**
 * Wallet Status Component
 * Displays connection status for all wallet types
 */
export const WalletStatus = () => {
  const { isConnected: stacksConnected, userData } = useStacks();
  const { isConnected: appKitConnected, address: appKitAddress } = useAppKitIntegration();
  const { isConnected: walletKitConnected, address: walletKitAddress } = useWalletKitHook();

  const userDataAny = userData as any;
  const stacksAddress = userDataAny?.profile?.stxAddress?.mainnet || userDataAny?.profile?.stxAddress?.testnet;
  const hasAnyConnection = stacksConnected || appKitConnected || walletKitConnected;

  if (!hasAnyConnection) {
    return (
      <div style={{
        padding: '0.75rem',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        color: 'rgba(255, 255, 255, 0.7)',
      }}>
        No wallet connected
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '1rem',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 'var(--radius-md)',
      fontSize: '0.875rem',
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: 'white' }}>
        Connected Wallets:
      </div>
      
      {stacksConnected && stacksAddress && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--success)' }}>●</span>
          <span style={{ color: 'white' }}>Stacks:</span>
          <span style={{ fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.9)' }}>
            {formatAddress(stacksAddress)}
          </span>
        </div>
      )}
      
      {appKitConnected && appKitAddress && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--success)' }}>●</span>
          <span style={{ color: 'white' }}>AppKit:</span>
          <span style={{ fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.9)' }}>
            {formatEVMAddress(appKitAddress)}
          </span>
        </div>
      )}
      
      {walletKitConnected && walletKitAddress && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--success)' }}>●</span>
          <span style={{ color: 'white' }}>WalletKit:</span>
          <span style={{ fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.9)' }}>
            {formatWalletKitAddress(walletKitAddress)}
          </span>
        </div>
      )}
    </div>
  );
};

