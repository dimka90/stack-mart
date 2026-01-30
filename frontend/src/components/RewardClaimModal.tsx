import React, { useState } from 'react';

interface RewardClaimModalProps {
    isOpen: boolean;
    onClose: () => void;
    claimableAmount: number;
    onClaim: () => Promise<void>;
    claimHistory: Array<{ amount: number; claimedAt: number }>;
}

const RewardClaimModal: React.FC<RewardClaimModalProps> = ({
    isOpen,
    onClose,
    claimableAmount,
    onClaim,
    claimHistory
}) => {
    const [claiming, setClaiming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClaim = async () => {
        setClaiming(true);
        setError(null);
        try {
            await onClaim();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to claim rewards');
        } finally {
            setClaiming(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>

                <h2 className="modal-title">Claim Rewards</h2>

                <div className="claimable-section">
                    <div className="amount-display">
                        <span className="amount-label">Available to Claim</span>
                        <span className="amount-value">{claimableAmount.toLocaleString()} points</span>
                    </div>

                    <button
                        className="claim-btn"
                        onClick={handleClaim}
                        disabled={claiming || claimableAmount === 0}
                    >
                        {claiming ? 'Claiming...' : 'Claim Rewards'}
                    </button>

                    {error && <div className="error-message">{error}</div>}
                </div>

                <div className="history-section">
                    <h3>Claim History</h3>
                    <div className="history-list">
                        {claimHistory.length === 0 ? (
                            <p className="no-history">No claims yet</p>
                        ) : (
                            claimHistory.map((claim, index) => (
                                <div key={index} className="history-item">
                                    <span className="history-amount">{claim.amount.toLocaleString()} pts</span>
                                    <span className="history-date">
                                        {new Date(claim.claimedAt * 1000).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }
          .modal-content {
            background: white;
            border-radius: 16px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #666;
          }
          .modal-title {
            margin-bottom: 1.5rem;
            color: #1a1a1a;
          }
          .claimable-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
          }
          .amount-display {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-bottom: 1rem;
          }
          .amount-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.9rem;
          }
          .amount-value {
            color: white;
            font-size: 2rem;
            font-weight: bold;
            margin-top: 0.5rem;
          }
          .claim-btn {
            width: 100%;
            padding: 0.75rem;
            background: white;
            color: #667eea;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .claim-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
          .claim-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .error-message {
            color: #ff4444;
            margin-top: 0.5rem;
            font-size: 0.9rem;
          }
          .history-section h3 {
            margin-bottom: 1rem;
            color: #1a1a1a;
          }
          .history-list {
            max-height: 200px;
            overflow-y: auto;
          }
          .history-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem;
            background: #f5f5f5;
            border-radius: 8px;
            margin-bottom: 0.5rem;
          }
          .history-amount {
            font-weight: 600;
            color: #667eea;
          }
          .history-date {
            color: #666;
            font-size: 0.9rem;
          }
          .no-history {
            text-align: center;
            color: #999;
            padding: 1rem;
          }
        `}</style>
            </div>
        </div>
    );
};

export default RewardClaimModal;
