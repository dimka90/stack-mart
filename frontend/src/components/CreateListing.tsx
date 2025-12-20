import { useState } from 'react';
import { useStacks } from '../hooks/useStacks';
import { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, uintCV, principalCV, stringAsciiCV } from '@stacks/transactions';
import { CONTRACT_ID } from '../config/contract';

export const CreateListing = () => {
  const { userSession, network, isConnected } = useStacks();
  const [price, setPrice] = useState('');
  const [royaltyBips, setRoyaltyBips] = useState('');
  const [royaltyRecipient, setRoyaltyRecipient] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !userSession) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    try {
      const priceMicroSTX = Math.floor(parseFloat(price) * 1000000);
      const royaltyBipsNum = parseInt(royaltyBips);

      const txOptions = {
        contractAddress: CONTRACT_ID.split('.')[0],
        contractName: CONTRACT_ID.split('.')[1],
        functionName: 'create-listing',
        functionArgs: [
          uintCV(priceMicroSTX),
          uintCV(royaltyBipsNum),
          principalCV(royaltyRecipient),
        ],
        senderKey: userSession.loadUserData().appPrivateKey,
        network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 150000,
      };

      const transaction = await makeContractCall(txOptions);
      const broadcastResponse = await broadcastTransaction({ transaction, network });

      if ('error' in broadcastResponse) {
        alert(`Error: ${broadcastResponse.error}`);
      } else {
        alert(`Listing created! TX: ${broadcastResponse.txid}`);
        // Reset form
        setPrice('');
        setRoyaltyBips('');
        setRoyaltyRecipient('');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return <p>Please connect your wallet to create a listing</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '20px' }}>
      <h2>Create New Listing</h2>
      <div style={{ marginBottom: '15px' }}>
        <label>
          Price (STX):
          <input
            type="number"
            step="0.000001"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>
          Royalty (basis points, max 1000 = 10%):
          <input
            type="number"
            min="0"
            max="1000"
            value={royaltyBips}
            onChange={(e) => setRoyaltyBips(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>
          Royalty Recipient (STX address):
          <input
            type="text"
            value={royaltyRecipient}
            onChange={(e) => setRoyaltyRecipient(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
        }}
      >
        {isSubmitting ? 'Creating...' : 'Create Listing'}
      </button>
    </form>
  );
};

