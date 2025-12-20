import { useStacks } from '../hooks/useStacks';

export const WalletButton = () => {
  const { isConnected, connectWallet, disconnectWallet, userData, isLoading } = useStacks();

  if (isConnected && userData?.profile?.stxAddress) {
    const address = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
    if (!address) return null;
    const shortAddress = `${address.slice(0, 5)}...${address.slice(-5)}`;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span>{shortAddress}</span>
        <button onClick={disconnectWallet} disabled={isLoading}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={connectWallet} disabled={isLoading}>
      {isLoading ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

