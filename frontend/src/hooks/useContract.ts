import { useCallback } from 'react';
import { CONTRACT_ID, API_URL } from '../config/contract';
import { useStacks } from './useStacks';

export const useContract = () => {
  const { userSession } = useStacks();

  const getListing = useCallback(async (id: number) => {
    try {
      let sender = CONTRACT_ID.split('.')[0];
      try {
        const userData = userSession.loadUserData();
        if (userData?.profile?.stxAddress?.mainnet) {
          sender = userData.profile.stxAddress.mainnet;
        }
      } catch (error) {
        // User not signed in, use contract address as sender
        console.warn('User not signed in, using contract address as sender');
      }
      const response = await fetch(`${API_URL}/v2/contracts/call-read/${CONTRACT_ID}/get-listing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender,
          arguments: [id.toString()],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch listing: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching listing:', error);
      throw error;
    }
  }, [API_URL, CONTRACT_ID, userSession]);

  const getEscrowStatus = useCallback(async (listingId: number) => {
    try {
      let sender = CONTRACT_ID.split('.')[0];
      try {
        const userData = userSession.loadUserData();
        if (userData?.profile?.stxAddress?.mainnet) {
          sender = userData.profile.stxAddress.mainnet;
        }
      } catch (error) {
        // User not signed in, use contract address as sender
        console.warn('User not signed in, using contract address as sender');
      }
      const response = await fetch(`${API_URL}/v2/contracts/call-read/${CONTRACT_ID}/get-escrow-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender,
          arguments: [listingId.toString()],
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching escrow status:', error);
      throw error;
    }
  }, [API_URL, CONTRACT_ID, userSession]);

  const getAllListings = useCallback(async (limit = 100) => {
    // Note: This is a simplified version - in production, you'd need to track listing IDs
    // or use an indexer. For now, we'll try to fetch listings by ID incrementally.
    const listings = [];
    try {
      // Start from ID 1 and try to fetch until we hit errors
      for (let id = 1; id <= limit; id++) {
        try {
          const listing = await getListing(id);
          if (listing && listing.value) {
            listings.push({ id, ...listing.value });
          }
        } catch (err) {
          // Listing doesn't exist, continue
          break;
        }
      }
      return listings;
    } catch (error) {
      console.error('Error fetching listings:', error);
      return [];
    }
  }, [getListing]);

  return {
    getListing,
    getEscrowStatus,
    getAllListings,
  };
};

