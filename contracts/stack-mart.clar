;; StackMart marketplace scaffold

;; SIP-009 NFT Standard Trait
;; Standard interface for NFT contracts on Stacks
(define-trait sip009-nft-trait
  (
    ;; Get the owner of an NFT token
    ;; Returns (optional principal) if token exists, or error code
    (get-owner (uint) (response (optional principal) uint))
    
    ;; Transfer an NFT from sender to recipient
    ;; Returns bool (true if successful) or error code
    (transfer (uint principal principal) (response bool uint))
  )
)

(define-data-var next-id uint u1)
(define-data-var next-bundle-id uint u1)
(define-data-var next-pack-id uint u1)

;; Constants for new features
(define-constant MAX_LISTING_DESCRIPTION_LENGTH u1000)
(define-constant MAX_TAGS_PER_LISTING u10)
(define-constant MIN_AUCTION_DURATION u144) ;; 1 day minimum
(define-constant MAX_AUCTION_DURATION u1440) ;; 10 days maximum
(define-data-var next-auction-id uint u1)
(define-constant ERR_BAD_ROYALTY (err u400))
(define-constant ERR_NOT_FOUND (err u404))
(define-constant ERR_NOT_OWNER (err u403))
(define-constant ERR_NFT_TRANSFER_FAILED (err u500))
(define-constant ERR_ESCROW_NOT_FOUND (err u404))
(define-constant ERR_INVALID_STATE (err u400))
(define-constant ERR_NOT_BUYER (err u403))
(define-constant ERR_NOT_SELLER (err u403))
(define-constant ERR_TIMEOUT_NOT_REACHED (err u400))
(define-constant ERR_ALREADY_ATTESTED (err u400))
(define-constant ERR_NOT_DELIVERED (err u400))
(define-constant ERR_DISPUTE_NOT_FOUND (err u404))
(define-constant ERR_DISPUTE_RESOLVED (err u400))
(define-constant ERR_INSUFFICIENT_STAKES (err u400))
(define-constant ERR_INVALID_SIDE (err u400))
(define-constant ERR_BUNDLE_NOT_FOUND (err u404))
(define-constant ERR_PACK_NOT_FOUND (err u404))
(define-constant ERR_INVALID_LISTING (err u400))
(define-constant ERR_BUNDLE_EMPTY (err u400))
(define-data-var admin principal tx-sender)
(define-constant ERR_ALREADY_WISHLISTED (err u405))
(define-constant ERR_PAUSED (err u406))
(define-data-var paused bool false)

;; Marketplace fee constants
(define-data-var marketplace-fee-bips uint u250) ;; 2.5% fee
(define-data-var fee-recipient principal tx-sender) ;; Deployer is initial fee recipient

;; Bundle and pack constants
(define-constant MAX_BUNDLE_SIZE u10)
(define-constant MAX_PACK_SIZE u20)
(define-constant MAX_DISCOUNT_BIPS u5000) ;; 50% max discount
(define-constant BPS_DENOMINATOR u10000)
(define-constant MAX_ROYALTY_BIPS u2000) ;; 20% max royalty

;; Dispute resolution constants
(define-constant MIN_STAKE_AMOUNT u1000) ;; Minimum stake amount
(define-constant DISPUTE_RESOLUTION_THRESHOLD u5000) ;; Minimum total stakes to resolve

;; Escrow timeout: 144 blocks (approximately 1 day assuming 10 min blocks)
;; Note: Using burn-block-height for timeout calculation
(define-constant ESCROW_TIMEOUT_BLOCKS u144)

(define-map listings
  { id: uint }
  { seller: principal
  , price: uint
  , royalty-bips: uint
  , royalty-recipient: principal
  , nft-contract: (optional principal)
  , token-id: (optional uint)
  , license-terms: (optional (string-ascii 500))
  })

;; Seller Indexing Maps
(define-map seller-listings 
  { seller: principal, index: uint } 
  { listing-id: uint })

(define-map seller-listing-count
  { seller: principal }
  uint)

;; Escrow state: pending, delivered, confirmed, disputed, released, cancelled
(define-map escrows
  { listing-id: uint }
  { buyer: principal
  , amount: uint
  , created-at-block: uint
  , state: (string-ascii 20)
  , timeout-block: uint
  })

;; Reputation system
(define-map reputation
  { user: principal }
  { successful-txs: uint
  , failed-txs: uint
  , rating-sum: uint
  , rating-count: uint
  , total-volume: uint
  })

;; Like system
(define-map listing-likes-count
  { listing-id: uint }
  { count: uint })

;; Delivery attestations
(define-map delivery-attestations
  { listing-id: uint }
  { delivery-hash: (buff 32)
  , attested-at-block: uint
  , confirmed: bool
  , rejected: bool
  , rejection-reason: (optional (string-ascii 200))
  })

;; Transaction history tracking
(define-map transaction-history
  { principal: principal
  , tx-index: uint }
  { listing-id: uint
  , counterparty: principal
  , amount: uint
  , completed: bool
  , timestamp: uint
  })

(define-map tx-index-counter
  { principal: principal }
  uint)

;; Dispute resolution system
(define-data-var next-dispute-id uint u1)

(define-map disputes
  { id: uint }
  { escrow-id: uint
  , created-by: principal
  , reason: (string-ascii 500)
  , created-at-block: uint
  , resolved: bool
  , buyer-stakes: uint
  , seller-stakes: uint
  , resolution: (optional (string-ascii 20))
  })

(define-map dispute-stakes
  { dispute-id: uint
  , staker: principal }
  { amount: uint
  , side: bool
  })

(define-map dispute-votes
  { dispute-id: uint
  , voter: principal }
  { vote: bool
  , weight: uint
  })

(define-private (add-listing-to-seller-index (seller principal) (listing-id uint))
  (let ((current-count (default-to u0 (map-get? seller-listing-count { seller: seller }))))
    (map-set seller-listings 
      { seller: seller, index: current-count }
      { listing-id: listing-id })
    (map-set seller-listing-count
      { seller: seller }
      (+ current-count u1))))

;; Enhanced listing creation with description
(define-public (create-listing-enhanced 
    (price uint) 
    (royalty-bips uint) 
    (royalty-recipient principal)
    (description (string-ascii 1000))
    (category (string-ascii 50))
    (tags (list 10 (string-ascii 20))))
  (begin
    (asserts! (not (var-get paused)) ERR_PAUSED)
    (asserts! (<= royalty-bips MAX_ROYALTY_BIPS) ERR_BAD_ROYALTY)
    (asserts! (<= (len description) MAX_LISTING_DESCRIPTION_LENGTH) ERR_INVALID_LISTING)
    (let ((id (var-get next-id)))
      (begin
        (map-set listings
          { id: id }
          { seller: tx-sender
          , price: price
          , royalty-bips: royalty-bips
          , royalty-recipient: royalty-recipient
          , nft-contract: none
          , token-id: none
          , license-terms: (some description) })
        (map-set listing-categories
          { listing-id: id }
          { category: category
          , tags: tags })
        (var-set next-id (+ id u1))
        (add-listing-to-seller-index tx-sender id)
        (print { event: "listing_created", id: id, seller: tx-sender, price: price })
        (ok id)))))

;; Price history tracking
(define-map price-history
  { listing-id: uint }
  { history: (list 10 { price: uint, block-height: uint }) })

(define-public (set-admin (new-admin principal)) 
  (begin 
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_OWNER) 
    (ok (var-set admin new-admin))))

(define-public (set-marketplace-fee (new-fee uint)) 
  (begin 
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_OWNER) 
    (ok (var-set marketplace-fee-bips new-fee))))

(define-public (set-fee-recipient (new-recipient principal)) 
  (begin 
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_OWNER) 
    (ok (var-set fee-recipient new-recipient))))

(define-public (set-paused (new-paused bool))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_OWNER)
    (ok (var-set paused new-paused))))

(define-public (update-listing-price (id uint) (new-price uint))
  (let (
    (listing (unwrap! (map-get? listings { id: id }) ERR_NOT_FOUND))
    (current-history (get history (default-to { history: (list) } (map-get? price-history { listing-id: id }))))
  )
    (begin
        (asserts! (is-eq (get seller listing) tx-sender) ERR_NOT_OWNER)
        (map-set listings { id: id } (merge listing { price: new-price }))
        (map-set price-history 
          { listing-id: id } 
          { history: (unwrap! (as-max-len? (append current-history { price: new-price, block-height: burn-block-height }) u10) (err u500)) })
        (ok true))))

(define-read-only (get-wishlist (user principal))
  (ok (default-to { listing-ids: (list) } (map-get? wishlists { user: user }))))

(define-read-only (is-wishlisted (user principal) (listing-id uint)) 
  (let ((current-wishlist (get listing-ids (default-to { listing-ids: (list) } (map-get? wishlists { user: user }))))) 
    (ok (is-some (index-of current-wishlist listing-id)))))

(define-read-only (get-price-history (listing-id uint))
  (ok (default-to { history: (list) } (map-get? price-history { listing-id: listing-id }))))

(define-read-only (get-listing-likes (listing-id uint))
  (ok (get count (default-to { count: u0 } (map-get? listing-likes-count { listing-id: listing-id })))))

(define-private (filter-id (id uint))
  (not (is-eq id (var-get remove-id-iter))))

(define-data-var remove-id-iter uint u0)

(define-public (toggle-wishlist (listing-id uint))
  (let (
    (current-wishlist (default-to (list) (get listing-ids (map-get? wishlists { user: tx-sender }))))
  )
    (if (is-some (index-of current-wishlist listing-id))
      (begin
        (var-set remove-id-iter listing-id)
        (map-set wishlists { user: tx-sender } { listing-ids: (filter filter-id current-wishlist) })
        ;; Decrement like count
        (let ((current-likes (get count (default-to { count: u0 } (map-get? listing-likes-count { listing-id: listing-id })))))
           (map-set listing-likes-count { listing-id: listing-id } { count: (if (> current-likes u0) (- current-likes u1) u0) }))
        (ok false))
      (begin
        (map-set wishlists { user: tx-sender } { listing-ids: (unwrap! (as-max-len? (append current-wishlist listing-id) u100) (err u500)) })
        ;; Increment like count
        (let ((current-likes (get count (default-to { count: u0 } (map-get? listing-likes-count { listing-id: listing-id })))))
           (map-set listing-likes-count { listing-id: listing-id } { count: (+ current-likes u1) }))
        (ok true)))))

;; Auction System
(define-map auctions
  { id: uint }
  { seller: principal
  , nft-contract: principal
  , token-id: uint
  , start-price: uint
  , reserve-price: uint
  , end-block: uint
  , highest-bid: uint
  , highest-bidder: (optional principal)
  , state: (string-ascii 20) ;; "active", "ended", "cancelled"
  })

(define-public (create-auction (nft-trait <sip009-nft-trait>) (token-id uint) (start-price uint) (reserve-price uint) (duration uint))
  (let ((id (var-get next-auction-id)))
    (begin
      ;; Transfer NFT to contract
      (try! (contract-call? nft-trait transfer token-id tx-sender (as-contract tx-sender)))
      (map-set auctions
        { id: id }
        { seller: tx-sender
        , nft-contract: (contract-of nft-trait)
        , token-id: token-id
        , start-price: start-price
        , reserve-price: reserve-price
        , end-block: (+ burn-block-height duration)
        , highest-bid: u0
        , highest-bidder: none
        , state: "active" })
      (var-set next-auction-id (+ id u1))
      (ok id))))

(define-public (place-bid (auction-id uint) (amount uint))
  (match (map-get? auctions { id: auction-id })
    auction
      (let ((current-bid (get highest-bid auction))
            (current-bidder (get highest-bidder auction)))
        (begin
          (asserts! (is-eq (get state auction) "active") ERR_INVALID_STATE)
          (asserts! (< burn-block-height (get end-block auction)) ERR_TIMEOUT_NOT_REACHED)
          (asserts! (> amount current-bid) ERR_INVALID_LISTING) ;; Bid must be higher
          (asserts! (>= amount (get start-price auction)) ERR_INVALID_LISTING)
          
          ;; Transfer STX to contract
          (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
          
          ;; Refund previous bidder
          (match current-bidder
            prev-bidder (try! (as-contract (stx-transfer? current-bid tx-sender prev-bidder)))
            true)
            
          (map-set auctions
            { id: auction-id }
            (merge auction { highest-bid: amount, highest-bidder: (some tx-sender) }))
          (ok true)))
    ERR_NOT_FOUND))

(define-public (end-auction (auction-id uint) (nft-trait <sip009-nft-trait>))
  (match (map-get? auctions { id: auction-id })
    auction
      (begin
        (asserts! (is-eq (get state auction) "active") ERR_INVALID_STATE)
        ;; Allow ending if expired OR if seller cancels (if no bids)
        ;; If bids exist, must wait for expiry
        (asserts! (or (>= burn-block-height (get end-block auction)) 
                      (and (is-eq tx-sender (get seller auction)) (is-eq (get highest-bid auction) u0))) 
                  ERR_TIMEOUT_NOT_REACHED)
        
        ;; Verify trait matches
        (asserts! (is-eq (contract-of nft-trait) (get nft-contract auction)) ERR_INVALID_LISTING)

        (let ((winner (get highest-bidder auction))
              (price (get highest-bid auction))
              (seller (get seller auction))
              (token-id (get token-id auction)))
           (begin
             (match winner
               buyer 
                 (if (>= price (get reserve-price auction))
                   (begin
                     ;; Success - Transfer NFT to winner, STX to seller (minus fee)
                     (try! (as-contract (contract-call? nft-trait transfer token-id tx-sender buyer)))
                     ;; Transfer STX to seller (minus fee)
                     (let ((marketplace-fee (/ (* price (var-get marketplace-fee-bips)) BPS_DENOMINATOR))
                           (seller-share (- price marketplace-fee)))
                       (try! (as-contract (stx-transfer? marketplace-fee tx-sender (var-get fee-recipient))))
                       (try! (as-contract (stx-transfer? seller-share tx-sender seller))))
                     
                     (map-set auctions { id: auction-id } (merge auction { state: "ended" }))
                     (ok true))
                   (begin
                     ;; Reserve not met - Return NFT to seller, refund buyer
                     (try! (as-contract (stx-transfer? price tx-sender buyer)))
                     (try! (as-contract (contract-call? nft-trait transfer token-id tx-sender seller)))
                     (map-set auctions { id: auction-id } (merge auction { state: "ended" }))
                     (ok false)))
               ;; No bids - Return NFT to seller
               (begin 
                  (try! (as-contract (contract-call? nft-trait transfer token-id tx-sender seller)))
                  (map-set auctions { id: auction-id } (merge auction { state: "ended" }))
                  (ok true)))
           )) 
      )
    ERR_NOT_FOUND))

;; Bundle and curated pack system
(define-map bundles
  { id: uint }
  { listing-ids: (list 10 uint)
  , discount-bips: uint
  , creator: principal
  , created-at-block: uint
  })

(define-map packs
  { id: uint }
  { listing-ids: (list 20 uint)
  , price: uint
  , curator: principal
  , created-at-block: uint
  })

(define-read-only (get-next-id)
  (ok (var-get next-id)))

(define-read-only (get-listing (id uint))
  (match (map-get? listings { id: id })
    listing (ok listing)
    ERR_NOT_FOUND))

;; get-listing-with-nft is an alias for get-listing (both return same data)
(define-read-only (get-listing-with-nft (id uint))
  (get-listing id))

(define-read-only (get-escrow-status (listing-id uint))
  (match (map-get? escrows { listing-id: listing-id })
    escrow (ok escrow)
    ERR_ESCROW_NOT_FOUND))

;; Shared default reputation structure
(define-constant DEFAULT_REPUTATION {
  successful-txs: u0
, failed-txs: u0
, rating-sum: u0
, rating-count: u0
})

(define-read-only (get-user-reputation (user principal))
  (ok (default-to { successful-txs: u0, failed-txs: u0, rating-sum: u0, rating-count: u0, total-volume: u0 } (map-get? reputation { user: user }))))

;; Legacy aliases for compatibility
