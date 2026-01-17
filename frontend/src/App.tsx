import { useState, useEffect } from 'react';
import { WalletButton } from './components/WalletButton';
import { LandingPage } from './components/LandingPage';
import { CreateListing } from './components/CreateListing';
import { ListingCard } from './components/ListingCard';
import { ListingDetails } from './components/ListingDetails';
import { ChainhookEvents } from './components/ChainhookEvents';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { BundleManagement } from './components/BundleManagement';
import { CuratedPack } from './components/CuratedPack';
import { DisputeResolution } from './components/DisputeResolution';
import { Dashboard } from './components/Dashboard';
import { useStacks } from './hooks/useStacks';
import { useContract } from './hooks/useContract';
import './App.css';

type TabType = 'listings' | 'bundles' | 'packs' | 'disputes' | 'dashboard';

function App() {
  const { isConnected } = useStacks();
  const { getAllListings } = useContract();
  const [showLanding, setShowLanding] = useState(() => {
    // Check if user has visited before (stored in localStorage)
    const hasVisited = localStorage.getItem('stackmart_has_visited');
    return !hasVisited;
  });
  const [listings, setListings] = useState<any[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Always start at listings tab (home)
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Check if there's a saved tab preference, otherwise default to listings
    const savedTab = localStorage.getItem('stackmart_active_tab') as TabType;
    return savedTab && ['listings', 'bundles', 'packs', 'disputes', 'dashboard'].includes(savedTab) 
      ? savedTab 
      : 'listings';
  });
  const [disputeEscrowId, setDisputeEscrowId] = useState<number | null>(null);

  const goHome = () => {
    setSelectedListingId(null);
    setActiveTab('listings');
    setDisputeEscrowId(null);
    localStorage.setItem('stackmart_active_tab', 'listings');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showLandingPage = () => {
    setShowLanding(true);
  };

  const loadListings = async () => {
    setIsLoadingListings(true);
    setError(null);
    try {
      const contractListings = await getAllListings(50);
      if (contractListings && contractListings.length > 0) {
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
      setError(error instanceof Error ? error.message : 'Failed to load listings');
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

  // Load listings from contract - with error handling
  useEffect(() => {
    // Only load listings if not on landing page
    if (showLanding) return;
    
    // Use setTimeout to ensure component is mounted
    const timer = setTimeout(() => {
      try {
        loadListings();
      } catch (err) {
        console.error('Error in loadListings:', err);
        setError('Failed to initialize listings');
        // Set mock data as fallback
        setListings([{
          id: 1,
          seller: 'SP1EQNTKNRGME36P9EEXZCFFNCYBA50VN51676JB',
          price: 1000000,
          'royalty-bips': 500,
          'royalty-recipient': 'SP3J75H6FYTCJJW5R0CHVGWDFN8JPZP3DD4DPJRSP',
        }]);
      }
    }, 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLanding]);

  const enterMarketplace = () => {
    localStorage.setItem('stackmart_has_visited', 'true');
    setShowLanding(false);
    // Always go to listings (home) tab when entering marketplace
    setActiveTab('listings');
    localStorage.setItem('stackmart_active_tab', 'listings');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save tab preference when it changes
  useEffect(() => {
    if (!showLanding) {
      localStorage.setItem('stackmart_active_tab', activeTab);
    }
  }, [activeTab, showLanding]);

  // Show landing page if user hasn't visited (after all hooks are called)
  if (showLanding) {
    return <LandingPage onEnter={enterMarketplace} />;
  }

  if (selectedListingId) {
    return (
      <div className="App">
        <header>
          <h1 
            onClick={goHome}
            style={{ 
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            title="Click to go home"
          >
            🏠 StackMart Marketplace
          </h1>
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
      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 
            onClick={goHome}
            style={{ 
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'opacity 0.2s',
              margin: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            title="Click to go home"
          >
            🏠 StackMart Marketplace
          </h1>
          <button
            onClick={showLandingPage}
            className="btn btn-outline btn-sm"
            style={{ 
              fontSize: '0.85rem',
              padding: '0.4rem 0.8rem'
            }}
            title="View landing page"
          >
            ℹ️ About
          </button>
        </div>
        <WalletButton />
      </header>

      <main>
        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '2rem',
          borderBottom: '2px solid var(--gray-200)',
          paddingBottom: '10px',
          alignItems: 'center'
        }}>
          <button
            className="btn btn-outline"
            onClick={goHome}
            style={{ 
              borderRadius: '8px 8px 0 0',
              marginRight: 'auto'
            }}
            title="Go to home (Listings)"
          >
            🏠 Home
          </button>
          <button
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('dashboard')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            👤 Dashboard
          </button>
          <button
            className={`btn ${activeTab === 'listings' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('listings')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            🛍️ Listings
          </button>
          <button
            className={`btn ${activeTab === 'bundles' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('bundles')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            📦 Bundles
          </button>
          <button
            className={`btn ${activeTab === 'packs' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('packs')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            🎁 Packs
          </button>
          <button
            className={`btn ${activeTab === 'disputes' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('disputes')}
            style={{ borderRadius: '8px 8px 0 0' }}
          >
            ⚖️ Disputes
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'listings' && (
          <>
            <section>
              <h2>📝 Create Listing</h2>
              <CreateListing />
            </section>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 style={{ marginBottom: 0 }}>🛍️ Available Listings</h2>
                <button
                  className="btn btn-secondary"
                  onClick={loadListings}
                  disabled={isLoadingListings}
                >
                  {isLoadingListings ? (
                    <>
                      <span className="loading"></span>
                      Loading...
                    </>
                  ) : (
                    '🔄 Refresh'
                  )}
                </button>
              </div>

              {isLoadingListings ? (
                <div className="grid grid-cols-1" style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  <LoadingSkeleton count={6} />
                </div>
              ) : listings.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'var(--gray-500)',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: 'var(--radius-lg)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--gray-700)' }}>No listings available</h3>
                  <p>Be the first to create a listing!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1" style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {listings.map((listing) => (
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
              )}
            </section>
          </>
        )}

        {activeTab === 'bundles' && (
          <section>
            <BundleManagement />
          </section>
        )}

        {activeTab === 'packs' && (
          <section>
            <CuratedPack />
          </section>
        )}

        {activeTab === 'disputes' && (
          <section>
            <h2>⚖️ Dispute Resolution</h2>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Escrow ID (for dispute)</label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={disputeEscrowId || ''}
                onChange={(e) => setDisputeEscrowId(e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Enter escrow ID"
                style={{ maxWidth: '300px' }}
              />
              <div className="form-help">
                Enter the listing ID that has an escrow you want to dispute or view disputes for
              </div>
            </div>
            {disputeEscrowId && (
              <DisputeResolution
                listingId={disputeEscrowId}
                escrowId={disputeEscrowId}
              />
            )}
            {!disputeEscrowId && (
              <div className="card">
                <div className="card-body">
                  <p>Enter an escrow ID above to view or create disputes.</p>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard />
        )}

        <section>
          <ChainhookEvents />
        </section>
      </main>
    </div>
  );
}

export default App;
