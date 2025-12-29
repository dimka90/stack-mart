import { useAllWallets } from '../hooks/useAllWallets';
import { formatAnyAddress, getWalletNetworkName } from '../utils/walletHelpers';

/**
 * Wallet Info Component
 * Displays comprehensive information about all connected wallets
 */
export const WalletInfo = () => {
  const { isAnyConnected, connectedWallets, getPrimaryAddress } = useAllWallets();
  const primaryAddress = getPrimaryAddress();

  if (!isAnyConnected) {
    return null;
  }

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      marginBottom: '1rem',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.5rem',
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>
          Wallet Connection Status
        </h3>
        <span style={{
          padding: '0.25rem 0.75rem',
          backgroundColor: 'var(--success)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: 'white',
          fontWeight: 'bold',
        }}>
          {connectedWallets.length} Connected
        </span>
      </div>
      
      {primaryAddress && (
        <div style={{ 
          marginBottom: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem' }}>
            Primary Address
          </div>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '0.875rem', 
            color: 'white',
            wordBreak: 'break-all',
          }}>
            {primaryAddress}
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {connectedWallets.map((wallet, index) => (
          <div 
            key={index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--success)',
                display: 'inline-block'
              }}></span>
              <span style={{ color: 'white', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                {wallet.type}
              </span>
            </div>
            <span style={{ 
              fontFamily: 'monospace', 
              fontSize: '0.75rem', 
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              {formatAnyAddress(wallet.address)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

