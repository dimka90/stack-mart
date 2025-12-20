import { useState } from 'react';
import { WalletButton } from './components/WalletButton';
import { CreateListing } from './components/CreateListing';
import { ListingCard } from './components/ListingCard';
import { ChainhookEvents } from './components/ChainhookEvents';
import { useStacks } from './hooks/useStacks';
import './App.css';

function App() {
  const { isConnected } = useStacks();
  const { getAllListings } = useContract();
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  // Load listings from contract
  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoadingListings(true);
    try {
      const contractListings = await getAllListings(50);
      if (contractListings.length > 0) {
        setListings(contractListings);
      } else {
        // Fallback to mock data if no listings found
        setListings([{
          id: 1,
          seller: 'SP1EQNTKNRGME36P9EEXZCFFNCYBA50VN51676JB',
          price: 1000000,
          'royalty-bips': 500,
          'royalty-recipient': 'SP3J75H6FYTCJJW5R0CHVGWDFN8JPZP3DD4DPJRSP',
        }]);
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      // Use mock data on error
      setListings([{
        id: 1,
        seller: 'SP1EQNTKNRGME36P9EEXZCFFNCYBA50VN51676JB',
        price: 1000000,
        'royalty-bips': 500,
        'royalty-recipient': 'SP3J75H6FYTCJJW5R0CHVGWDFN8JPZP3DD4DPJRSP',
      }]);
    } finally {
      setIsLoadingListings(false);
    }
  };

  if (selectedListingId) {
    return (
      <div className="App">
        <header style={{ 
          padding: '20px', 
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1>StackMart Marketplace</h1>
          <WalletButton />
        </header>
        <ListingDetails 
          listingId={selectedListingId} 
          onClose={() => setSelectedListingId(null)}
        />
      </div>
    );
  }

  return (
    <div className="App">
      <header style={{ 
        padding: '20px', 
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <h1>StackMart Marketplace</h1>
        <WalletButton />
      </header>

      <main style={{ padding: '20px' }}>
        <section>
          <h2>Create Listing</h2>
          <CreateListing />
        </section>

        <section style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Available Listings</h2>
            <button
              onClick={loadListings}
              disabled={isLoadingListings}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoadingListings ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoadingListings ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          {isLoadingListings ? (
            <p>Loading listings...</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {listings.length === 0 ? (
                <p>No listings available. Create one above!</p>
              ) : (
                listings.map((listing) => (
              <ListingCard 
                key={listing.id} 
                listing={listing}
                onBuy={(id) => {
                  if (!isConnected) {
                    alert('Please connect your wallet to buy');
                    return;
                  }
                  setSelectedListingId(id);
                }}
                onViewDetails={(id) => setSelectedListingId(id)}
              />
            ))}
          </div>
        </section>

        <section style={{ marginTop: '40px' }}>
          <ChainhookEvents />
        </section>
      </main>
    </div>
  );
}

export default App;
