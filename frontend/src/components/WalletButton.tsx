import { useStacks } from '../hooks/useStacks';
import { formatAddress } from '../utils/validation';

export const WalletButton = () => {
  const { isConnected, connectWallet, disconnectWallet, userData, isLoading } = useStacks();

  if (isConnected && userData?.profile?.stxAddress) {
    const address = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
    if (!address) return null;
    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

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
          {shortAddress}
        </div>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={disconnectWallet} 
          disabled={isLoading}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
        >
          {isLoading ? (
            <>
              <span className="loading"></span>
              Disconnecting...
            </>
          ) : (
            'Disconnect'
          )}
        </button>
      </div>
    );
  }

  return (
    <button 
      className="btn btn-primary"
      onClick={connectWallet} 
      disabled={isLoading}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
    >
      {isLoading ? (
        <>
          <span className="loading"></span>
          Connecting...
        </>
      ) : (
        '🔗 Connect Wallet'
      )}
    </button>
  );
};

