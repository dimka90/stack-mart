import { useState } from 'react';
import { useStacks } from '../hooks/useStacks';
import { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, uintCV } from '@stacks/transactions';
import { CONTRACT_ID } from '../config/contract';

interface BuyListingProps {
  listingId: number;
  price: number; // in microSTX
  onSuccess?: (txid: string) => void;
  onError?: (error: string) => void;
}

export const BuyListing = ({ listingId, price, onSuccess, onError }: BuyListingProps) => {
  const { userSession, network, isConnected } = useStacks();
  const [useEscrow, setUseEscrow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBuy = async () => {
    if (!isConnected || !userSession) {
      onError?.('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      let userData;
      try {
        userData = userSession.loadUserData();
      } catch (error) {
        onError?.('Please connect your wallet first');
        setIsSubmitting(false);
        return;
      }
      
      if (!userData || !userData.appPrivateKey) {
        onError?.('Wallet not properly connected');
        setIsSubmitting(false);
        return;
      }

      const functionName = useEscrow ? 'buy-listing-escrow' : 'buy-listing';
      
      const txOptions = {
        contractAddress: CONTRACT_ID.split('.')[0],
        contractName: CONTRACT_ID.split('.')[1],
        functionName,
        functionArgs: [uintCV(listingId)],
        senderKey: userData.appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 150000,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction({ transaction, network });

      if ('error' in broadcastResponse) {
        onError?.(broadcastResponse.error);
      } else {
        onSuccess?.(broadcastResponse.txid);
      }
    } catch (error) {
      console.error('Error buying listing:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to buy listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priceInSTX = price / 1000000;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h3>Purchase Listing #{listingId}</h3>
      <p><strong>Price:</strong> {priceInSTX} STX</p>
      
      <div style={{ margin: '15px 0' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={useEscrow}
            onChange={(e) => setUseEscrow(e.target.checked)}
          />
          <span>Use Escrow (recommended for digital goods)</span>
        </label>
        {useEscrow && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f8ff', borderRadius: '4px', fontSize: '0.9em' }}>
            <p>ℹ️ Escrow protects both buyer and seller:</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Funds held until delivery is confirmed</li>
              <li>Seller must attest delivery before payment</li>
              <li>Buyer can confirm receipt or dispute if needed</li>
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={handleBuy}
        disabled={isSubmitting || !isConnected}
        style={{
          padding: '12px 24px',
          backgroundColor: isSubmitting ? '#ccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isSubmitting || !isConnected ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        {isSubmitting ? 'Processing...' : useEscrow ? 'Buy with Escrow' : 'Buy Now'}
      </button>

      {!isConnected && (
        <p style={{ color: '#dc3545', marginTop: '10px' }}>Please connect your wallet to purchase</p>
      )}
    </div>
  );
};

