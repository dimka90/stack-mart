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

(define-constant MAX_ROYALTY_BIPS u1000) ;; 10% in basis points
(define-constant BPS_DENOMINATOR u10000)
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

;; Marketplace fee constants
(define-data-var marketplace-fee-bips uint u250) ;; 2.5% fee
(define-data-var fee-recipient principal tx-sender) ;; Deployer is initial fee recipient

;; Bundle and pack constants
(define-constant MAX_BUNDLE_SIZE u10)
(define-constant MAX_PACK_SIZE u20)
(define-constant MAX_DISCOUNT_BIPS u5000) ;; 50% max discount

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

(define-map wishlists
  { user: principal }
  { listing-ids: (list 100 uint) })

;; Price history tracking
(define-map price-history
  { listing-id: uint }
  { history: (list 10 { price: uint, block-height: uint }) })
(define-public (set-admin (new-admin principal)) (begin (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_OWNER) (ok (var-set admin new-admin))))
(define-public (set-marketplace-fee (new-fee uint)) (begin (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_OWNER) (ok (var-set marketplace-fee-bips new-fee))))
(define-public (set-fee-recipient (new-recipient principal)) (begin (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_OWNER) (ok (var-set fee-recipient new-recipient))))

(define-public (update-listing-price (id uint) (new-price uint))
  (let (
    (listing (unwrap! (map-get? listings { id: id }) ERR_NOT_FOUND))
    (current-history (get history (default-to { history: (list) } (map-get? price-history { listing-id: id }))))
  )
    (asserts! (is-eq (get seller listing) tx-sender) ERR_NOT_OWNER)
    (map-set listings { id: id } (merge listing { price: new-price }))
    (map-set price-history 
      { listing-id: id } 
      { history: (unwrap! (as-max-len? (append current-history { price: new-price, block-height: burn-block-height }) u10) (err u500)) })
    (ok true)))

(define-read-only (is-wishlisted (user principal) (listing-id uint)) (let ((current-wishlist (get listing-ids (default-to { listing-ids: (list) } (map-get? wishlists { user: user }))))) (ok (is-some (index-of current-wishlist listing-id)))))

(define-read-only (get-wishlist (user principal))
  (ok (default-to { listing-ids: (list) } (map-get? wishlists { user: user }))))

(define-read-only (get-price-history (listing-id uint))
  (ok (default-to { history: (list) } (map-get? price-history { listing-id: listing-id }))))

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
        (ok false))
      (begin
        (map-set wishlists { user: tx-sender } { listing-ids: (unwrap! (as-max-len? (append current-wishlist listing-id) u100) (err u500)) })
        (ok true)))))

