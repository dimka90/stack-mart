interface Listing {
  id: number;
  seller: string;
  price: number;
  royaltyBips: number;
  royaltyRecipient: string;
  nftContract?: string;
  tokenId?: number;
  licenseTerms?: string;
}

interface ListingCardProps {
  listing: Listing;
  onBuy?: (id: number) => void;
  onViewDetails?: (id: number) => void;
}

export const ListingCard = ({ listing, onBuy, onViewDetails }: ListingCardProps) => {
  const priceInSTX = listing.price / 1000000; // Convert microSTX to STX
  const royaltyPercent = listing.royaltyBips / 100;

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      margin: '10px',
      maxWidth: '400px',
    }}>
      <h3>Listing #{listing.id}</h3>
      <p><strong>Seller:</strong> {listing.seller}</p>
      <p><strong>Price:</strong> {priceInSTX} STX</p>
      <p><strong>Royalty:</strong> {royaltyPercent}%</p>
      {listing.licenseTerms && (
        <p><strong>License:</strong> {listing.licenseTerms}</p>
      )}
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        {onViewDetails && (
          <button 
            onClick={() => onViewDetails(listing.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            View Details
          </button>
        )}
        {onBuy && (
          <button 
            onClick={() => onBuy(listing.id)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
};

