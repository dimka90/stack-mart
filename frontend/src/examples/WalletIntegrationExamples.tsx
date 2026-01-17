/**
 * Wallet Integration Examples
 * 
 * This file demonstrates various ways to use WalletKit SDK and Reown AppKit
 * in your StackMart application components.
 */

import { useAppKit } from '@reown/appkit/react';
import { useAccount, useWriteContract } from 'wagmi';
import { useWalletKitLink } from '@walletkit/react-link';
import { useAllWallets } from '../hooks/useAllWallets';
import { formatEVMAddress } from '../utils/appkit';
import { formatWalletKitAddress } from '../utils/walletkit';

/**
 * Example 1: Simple AppKit Connection
 */
export const AppKitExample = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {formatEVMAddress(address || '')}</p>
        </div>
      ) : (
        <button onClick={() => open()}>
          Connect with AppKit
        </button>
      )}
    </div>
  );
};

/**
 * Example 2: WalletKit Gasless Transaction
 */
export const WalletKitExample = () => {
  const walletKit = useWalletKitLink() as any;

  const handleGaslessTransaction = async () => {
    if (!walletKit?.isConnected) {
      await walletKit?.connect();
      return;
    }

    try {
      // Send a gasless transaction
      await walletKit.sendTransaction({
        to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        value: '0x0',
        data: '0x',
      });
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div>
      {walletKit?.isConnected ? (
        <div>
          <p>WalletKit: {formatWalletKitAddress(walletKit.address || '')}</p>
          <button onClick={handleGaslessTransaction}>
            Send Gasless Transaction
          </button>
        </div>
      ) : (
        <button onClick={() => walletKit?.connect()}>
          Connect WalletKit
        </button>
      )}
    </div>
  );
};

/**
 * Example 3: EVM Transaction with AppKit/Wagmi
 */
export const EVMTransactionExample = () => {
  const { address, isConnected } = useAccount();
  const { writeContract, isPending } = useWriteContract();

  const handleEVMTransaction = async () => {
    if (!isConnected) return;

    // Example: Transfer tokens
    writeContract({
      address: '0x...' as `0x${string}`,
      abi: [
        {
          name: 'transfer',
          type: 'function',
          inputs: [
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
      functionName: 'transfer',
      args: ['0x...' as `0x${string}`, BigInt('1000000000000000000')],
    } as any);
  };

  return (
    <div>
      {isConnected ? (
        <button onClick={handleEVMTransaction} disabled={isPending}>
          {isPending ? 'Processing...' : 'Send EVM Transaction'}
        </button>
      ) : (
        <p>Connect a wallet to send transactions</p>
      )}
    </div>
  );
};

/**
 * Example 4: Unified Wallet State
 */
export const UnifiedWalletExample = () => {
  const { isAnyConnected, connectedWallets, getPrimaryAddress } = useAllWallets();

  if (!isAnyConnected) {
    return <div>No wallet connected</div>;
  }

  return (
    <div>
      <h3>Connected Wallets</h3>
      <p>Primary Address: {getPrimaryAddress()}</p>
      <ul>
        {connectedWallets.map((wallet, index) => (
          <li key={index}>
            {wallet.type}: {wallet.address}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Example 5: Conditional Rendering Based on Wallet Type
 */
export const ConditionalWalletExample = () => {
  const { stacks, appKit, walletKit } = useAllWallets();

  return (
    <div>
      {stacks.isConnected && (
        <div>
          <h4>Stacks Wallet Active</h4>
          <p>Use for Stacks blockchain transactions</p>
        </div>
      )}

      {appKit.isConnected && (
        <div>
          <h4>AppKit Wallet Active</h4>
          <p>Use for EVM chain transactions</p>
          <p>Address: {formatEVMAddress(appKit.address || '')}</p>
        </div>
      )}

      {walletKit.isConnected && (
        <div>
          <h4>WalletKit Active</h4>
          <p>Gasless transactions available</p>
          <p>Address: {formatWalletKitAddress(walletKit.address || '')}</p>
        </div>
      )}

      {!stacks.isConnected && !appKit.isConnected && !walletKit.isConnected && (
        <div>
          <p>Connect a wallet to get started</p>
        </div>
      )}
    </div>
  );
};

/**
 * Example 6: Multi-Wallet Transaction Handler
 */
export const MultiWalletTransactionExample = () => {
  const { stacks, appKit, walletKit } = useAllWallets();
  const { writeContract } = useWriteContract();

  const handleTransaction = async (type: 'stacks' | 'evm' | 'gasless') => {
    switch (type) {
      case 'stacks':
        if (stacks.isConnected && stacks.userSession) {
          // Use Stacks Connect for Stacks transactions
          // Example: makeContractCall with stacks
          console.log('Stacks transaction');
        }
        break;

      case 'evm':
        if (appKit.isConnected) {
          // Use AppKit/Wagmi for EVM transactions
          writeContract({
            address: '0x...' as `0x${string}`,
            abi: [],
            functionName: 'transfer',
            args: [],
          } as any);
        }
        break;

      case 'gasless':
        if (walletKit.isConnected && walletKit.walletKit) {
          // Use WalletKit for gasless transactions
          await walletKit.walletKit.sendTransaction({
            to: '0x...',
            value: '0x0',
            data: '0x',
          });
        }
        break;
    }
  };

  return (
    <div>
      <button 
        onClick={() => handleTransaction('stacks')}
        disabled={!stacks.isConnected}
      >
        Stacks Transaction
      </button>
      <button 
        onClick={() => handleTransaction('evm')}
        disabled={!appKit.isConnected}
      >
        EVM Transaction
      </button>
      <button 
        onClick={() => handleTransaction('gasless')}
        disabled={!walletKit.isConnected}
      >
        Gasless Transaction
      </button>
    </div>
  );
};

