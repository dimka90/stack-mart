import { useState } from 'react';
import { WalletButton } from './WalletButton';
import { AppKitConnectButton } from './AppKitConnectButton';
import { WalletKitButton } from './WalletKitButton';

type WalletOption = 'stacks' | 'appkit' | 'walletkit';

/**
 * Unified Wallet Selector Component
 * Allows users to choose between Stacks Connect, Reown AppKit, or WalletKit
 */
export const UnifiedWalletSelector = () => {
  const [selectedOption, setSelectedOption] = useState<WalletOption>('stacks');
  const [showOptions, setShowOptions] = useState(false);

  const walletOptions = [
    { value: 'stacks' as WalletOption, label: 'Bitcoin Wallets', icon: '₿', description: 'Leather, Xverse & more' },
    { value: 'appkit' as WalletOption, label: 'Reown AppKit', icon: '🔌', description: 'EVM multi-wallet support' },
    { value: 'walletkit' as WalletOption, label: 'WalletKit', icon: '⚡', description: 'Gasless transactions' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {!showOptions ? (
        <button
          className="btn btn-primary"
          onClick={() => setShowOptions(true)}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.3)' }}
        >
          🔗 Connect Wallet
        </button>
      ) : (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          minWidth: '300px',
          zIndex: 1000,
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>Choose Wallet</h3>
            <button
              onClick={() => setShowOptions(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ×
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {walletOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedOption(option.value);
                  setShowOptions(false);
                }}
                style={{
                  padding: '0.75rem',
                  backgroundColor: selectedOption === option.value ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${selectedOption === option.value ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{option.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{option.label}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{option.description}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
            {selectedOption === 'stacks' && <WalletButton />}
            {selectedOption === 'appkit' && <AppKitConnectButton />}
            {selectedOption === 'walletkit' && <WalletKitButton />}
          </div>
        </div>
      )}
    </div>
  );
};

