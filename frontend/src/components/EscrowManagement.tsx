import { useState, useEffect } from 'react';
import { useStacks } from '../hooks/useStacks';
import { useContract } from '../hooks/useContract';
import { makeContractCall, broadcastTransaction, AnchorMode, PostConditionMode, uintCV, stringAsciiCV, bufferCV } from '@stacks/transactions';
import { CONTRACT_ID } from '../config/contract';

interface EscrowManagementProps {
  listingId: number;
  userRole: 'buyer' | 'seller';
}

export const EscrowManagement = ({ listingId, userRole }: EscrowManagementProps) => {
  const { userSession, network, isConnected } = useStacks();
  const { getEscrowStatus } = useContract();
  const [escrowStatus, setEscrowStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryHash, setDeliveryHash] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (listingId && isConnected) {
      loadEscrowStatus();
    }
  }, [listingId, isConnected]);

  const loadEscrowStatus = async () => {
    setIsLoading(true);
    try {
      const status = await getEscrowStatus(listingId);
      setEscrowStatus(status);
    } catch (error) {
      console.error('Error loading escrow status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttestDelivery = async () => {
    if (!deliveryHash || deliveryHash.length !== 64) {
      alert('Please enter a valid 32-byte hash (64 hex characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      let userData;
      try {
        userData = userSession.loadUserData();
      } catch (error) {
        alert('Please connect your wallet first');
        setIsSubmitting(false);
        return;
      }
      
      if (!userData || !userData.appPrivateKey) {
        alert('Wallet not properly connected');
        setIsSubmitting(false);
        return;
      }

      const hashBuffer = Buffer.from(deliveryHash, 'hex');
      if (hashBuffer.length !== 32) {
        throw new Error('Hash must be exactly 32 bytes');
      }

      const txOptions = {
        contractAddress: CONTRACT_ID.split('.')[0],
        contractName: CONTRACT_ID.split('.')[1],
        functionName: 'attest-delivery',
        functionArgs: [
          uintCV(listingId),
          bufferCV(hashBuffer),
        ],
        senderKey: userData.appPrivateKey,
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
        alert(`Delivery attested! TX: ${broadcastResponse.txid}`);
        setDeliveryHash('');
        loadEscrowStatus();
      }
    } catch (error) {
      console.error('Error attesting delivery:', error);
      alert('Failed to attest delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReceipt = async () => {
    setIsSubmitting(true);
    try {
      let userData;
      try {
        userData = userSession.loadUserData();
      } catch (error) {
        alert('Please connect your wallet first');
        setIsSubmitting(false);
        return;
      }
      
      if (!userData || !userData.appPrivateKey) {
        alert('Wallet not properly connected');
        setIsSubmitting(false);
        return;
      }

      const txOptions = {
        contractAddress: CONTRACT_ID.split('.')[0],
        contractName: CONTRACT_ID.split('.')[1],
        functionName: 'confirm-receipt',
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
        alert(`Error: ${broadcastResponse.error}`);
      } else {
        alert(`Receipt confirmed! TX: ${broadcastResponse.txid}`);
        loadEscrowStatus();
      }
    } catch (error) {
      console.error('Error confirming receipt:', error);
      alert('Failed to confirm receipt');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectDelivery = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      let userData;
      try {
        userData = userSession.loadUserData();
      } catch (error) {
        alert('Please connect your wallet first');
        setIsSubmitting(false);
        return;
      }
      
      if (!userData || !userData.appPrivateKey) {
        alert('Wallet not properly connected');
        setIsSubmitting(false);
        return;
      }

      const txOptions = {
        contractAddress: CONTRACT_ID.split('.')[0],
        contractName: CONTRACT_ID.split('.')[1],
        functionName: 'reject-delivery',
        functionArgs: [
          uintCV(listingId),
          stringAsciiCV(rejectionReason),
        ],
        senderKey: userData.appPrivateKey,
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
        alert(`Delivery rejected! TX: ${broadcastResponse.txid}`);
        setRejectionReason('');
        loadEscrowStatus();
      }
    } catch (error) {
      console.error('Error rejecting delivery:', error);
      alert('Failed to reject delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReleaseEscrow = async () => {
    setIsSubmitting(true);
    try {
      let userData;
      try {
        userData = userSession.loadUserData();
      } catch (error) {
        alert('Please connect your wallet first');
        setIsSubmitting(false);
        return;
      }
      
      if (!userData || !userData.appPrivateKey) {
        alert('Wallet not properly connected');
        setIsSubmitting(false);
        return;
      }

      const txOptions = {
        contractAddress: CONTRACT_ID.split('.')[0],
        contractName: CONTRACT_ID.split('.')[1],
        functionName: 'release-escrow',
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
        alert(`Error: ${broadcastResponse.error}`);
      } else {
        alert(`Escrow released! TX: ${broadcastResponse.txid}`);
        loadEscrowStatus();
      }
    } catch (error) {
      console.error('Error releasing escrow:', error);
      alert('Failed to release escrow');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading escrow status...</div>;
  }

  if (!escrowStatus) {
    return <div>No escrow found for this listing</div>;
  }

  const state = escrowStatus.state || escrowStatus.value?.state;
  const amount = escrowStatus.amount || escrowStatus.value?.amount || 0;
  const amountInSTX = amount / 1000000;

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', margin: '20px 0' }}>
      <h3>Escrow Management - Listing #{listingId}</h3>
      <p><strong>Status:</strong> <span style={{ 
        color: state === 'confirmed' ? '#28a745' : 
               state === 'delivered' ? '#ffc107' : 
               state === 'disputed' ? '#dc3545' : '#007bff',
        fontWeight: 'bold'
      }}>{state}</span></p>
      <p><strong>Amount:</strong> {amountInSTX} STX</p>

      {userRole === 'seller' && state === 'pending' && (
        <div style={{ marginTop: '20px' }}>
          <h4>Attest Delivery</h4>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
            Provide a 32-byte hash (64 hex characters) proving delivery
          </p>
          <input
            type="text"
            value={deliveryHash}
            onChange={(e) => setDeliveryHash(e.target.value)}
            placeholder="Enter 64-character hex hash"
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
            maxLength={64}
          />
          <button
            onClick={handleAttestDelivery}
            disabled={isSubmitting || !deliveryHash}
            style={{
              padding: '10px 20px',
              backgroundColor: isSubmitting ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Attest Delivery'}
          </button>
        </div>
      )}

      {userRole === 'buyer' && state === 'delivered' && (
        <div style={{ marginTop: '20px' }}>
          <h4>Confirm or Reject Delivery</h4>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={handleConfirmReceipt}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                backgroundColor: isSubmitting ? '#ccc' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Receipt'}
            </button>
            <div style={{ flex: 1 }}>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Rejection reason (optional)"
                style={{ width: '100%', padding: '8px', marginRight: '10px' }}
              />
              <button
                onClick={handleRejectDelivery}
                disabled={isSubmitting || !rejectionReason.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isSubmitting ? '#ccc' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  marginTop: '5px',
                }}
              >
                Reject Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {(state === 'delivered' || state === 'pending') && (
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handleReleaseEscrow}
            disabled={isSubmitting}
            style={{
              padding: '10px 20px',
              backgroundColor: isSubmitting ? '#ccc' : '#ffc107',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Processing...' : 'Release Escrow (Timeout)'}
          </button>
          <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
            Release escrow after timeout (seller gets funds if delivered, buyer gets refund if pending)
          </p>
        </div>
      )}

      <button
        onClick={loadEscrowStatus}
        disabled={isLoading}
        style={{
          marginTop: '15px',
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? 'Loading...' : 'Refresh Status'}
      </button>
    </div>
  );
};

