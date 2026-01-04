import { useStacks } from '../hooks/useStacks';
import { formatAddress } from '../utils/validation';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';
import { BitcoinWalletSelector } from './BitcoinWalletSelector';

export const WalletButton = () => {
  const { isConnected, connectWallet, disconnectWallet, userData, isLoading, appKitAddress, isAppKitConnected, userSession } = useStacks();
  const { open } = useAppKit();
  const { address, isConnected: isAppKitAccountConnected } = useAccount();

  // Determine which wallet is connected
  const connectedAddress = appKitAddress || address || (userData?.profile?.stxAddress?.mainnet || userData?.profile?.stxAddress?.testnet);
  const walletConnected = isConnected || isAppKitConnected || isAppKitAccountConnected;

  // Use Bitcoin wallet selector for Stacks/Bitcoin wallets
  // AppKit is for EVM chains
  if (walletConnected && connectedAddress && !isAppKitAccountConnected) {
    // Show Bitcoin wallet selector for Stacks wallets
    return (
      <BitcoinWalletSelector
        userSession={userSession}
        onConnect={connectWallet}
        onDisconnect={disconnectWallet}
        isConnected={isConnected}
        userData={userData}
        isLoading={isLoading}
      />
    );
  }

  // If AppKit (EVM) wallet is connected, show that
  if (isAppKitAccountConnected && address) {
    const shortAddress = formatAddress(address);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'monospace',
          fontSize: '0.875rem'
        }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--success)',
            display: 'inline-block'
          }}></span>
          {shortAddress} (EVM)
        </div>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => {
            // Disconnect AppKit wallet
            window.location.reload();
          }} 
          disabled={isLoading}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  // Show Bitcoin wallet selector by default
  return (
    <BitcoinWalletSelector
      userSession={userSession}
      onConnect={connectWallet}
      onDisconnect={disconnectWallet}
      isConnected={isConnected}
      userData={userData}
      isLoading={isLoading}
    />
  );
};
