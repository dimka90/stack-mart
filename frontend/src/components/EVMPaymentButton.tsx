import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useWalletKitLink } from '@walletkit/react-link';
import { parseEther, formatEther } from 'viem';
import { useAppKit } from '@reown/appkit/react';

interface EVMPaymentButtonProps {
  recipient: string;
  amount: string; // Amount in ETH (as string)
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  useGasless?: boolean; // Use WalletKit for gasless transactions
}

/**
 * EVM Payment Button Component
 * Uses AppKit (Wagmi) or WalletKit for EVM chain payments
 */
export const EVMPaymentButton = ({
  recipient,
  amount,
  onSuccess,
  onError,
  useGasless = false,
}: EVMPaymentButtonProps) => {
  const { address, isConnected: appKitConnected } = useAccount();
  const { open: openAppKit } = useAppKit();
  const walletKit = useWalletKitLink() as any;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'appkit' | 'walletkit'>(
    useGasless ? 'walletkit' : 'appkit'
  );

  // Wagmi hooks for AppKit
  const { 
    writeContract, 
    data: hash, 
    isPending: isPendingAppKit,
    error: errorAppKit 
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle AppKit payment
  const handleAppKitPayment = async () => {
    if (!appKitConnected || !address) {
      openAppKit();
      return;
    }

    setIsProcessing(true);
    try {
      // Simple ETH transfer using native transfer
      // In production, you'd use a payment contract or token transfer
      writeContract({
        address: recipient as `0x${string}`,
        abi: [],
        functionName: 'transfer',
        value: parseEther(amount),
      } as any);
    } catch (error) {
      console.error('AppKit payment error:', error);
      onError?.(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  // Handle WalletKit gasless payment
  const handleWalletKitPayment = async () => {
    if (!walletKit?.isConnected) {
      await walletKit?.connect();
      return;
    }

    setIsProcessing(true);
    try {
      const txHash = await walletKit.sendTransaction({
        to: recipient,
        value: parseEther(amount).toString(),
        data: '0x',
      });
      
      onSuccess?.(txHash);
    } catch (error) {
      console.error('WalletKit payment error:', error);
      onError?.(error instanceof Error ? error.message : 'Gasless payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment based on selected method
  const handlePayment = () => {
    if (paymentMethod === 'walletkit') {
      handleWalletKitPayment();
    } else {
      handleAppKitPayment();
    }
  };

  // Handle AppKit transaction confirmation
  if (hash && isConfirmed && paymentMethod === 'appkit') {
    onSuccess?.(hash);
    setIsProcessing(false);
  }

  if (errorAppKit && paymentMethod === 'appkit') {
    onError?.(errorAppKit.message);
    setIsProcessing(false);
  }

  const canPay = 
    (paymentMethod === 'appkit' && appKitConnected) ||
    (paymentMethod === 'walletkit' && walletKit?.isConnected);

  return (
    <div style={{
      padding: '1rem',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', marginBottom: '0.5rem' }}>
          <input
            type="radio"
            checked={paymentMethod === 'appkit'}
            onChange={() => setPaymentMethod('appkit')}
          />
          <span>Pay with AppKit (Standard)</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
          <input
            type="radio"
            checked={paymentMethod === 'walletkit'}
            onChange={() => setPaymentMethod('walletkit')}
          />
          <span>Pay with WalletKit (Gasless ⚡)</span>
        </label>
      </div>

      <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '0.25rem' }}>
          Amount
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>
          {amount} ETH
        </div>
        {paymentMethod === 'walletkit' && (
          <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.25rem' }}>
            ⚡ Gas fees covered by WalletKit
          </div>
        )}
      </div>

      <button
        onClick={handlePayment}
        disabled={isProcessing || isPendingAppKit || isConfirming || !canPay}
        style={{
          width: '100%',
          padding: '0.75rem 1.5rem',
          backgroundColor: canPay && !isProcessing 
            ? (paymentMethod === 'walletkit' ? '#fbbf24' : '#6366f1')
            : 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: canPay && !isProcessing ? 'pointer' : 'not-allowed',
          fontSize: '1rem',
          fontWeight: 'bold',
        }}
      >
        {isProcessing || isPendingAppKit || isConfirming ? (
          <>
            <span className="loading"></span>
            {isConfirming ? 'Confirming...' : 'Processing...'}
          </>
        ) : !canPay ? (
          paymentMethod === 'appkit' 
            ? 'Connect AppKit Wallet'
            : 'Connect WalletKit'
        ) : (
          paymentMethod === 'walletkit'
            ? `⚡ Pay ${amount} ETH (Gasless)`
            : `Pay ${amount} ETH`
        )}
      </button>

      {paymentMethod === 'appkit' && !appKitConnected && (
        <button
          onClick={() => openAppKit()}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          Connect AppKit Wallet
        </button>
      )}

      {paymentMethod === 'walletkit' && !walletKit?.isConnected && (
        <button
          onClick={() => walletKit?.connect()}
          style={{
            width: '100%',
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          Connect WalletKit
        </button>
      )}
    </div>
  );
};

