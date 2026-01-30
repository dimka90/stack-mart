import React from 'react';

interface Activity {
    id: string;
    type: 'contract' | 'library' | 'github' | 'referral';
    description: string;
    points: number;
    timestamp: number;
}

interface ActivityFeedProps {
    activities: Activity[];
    onLoadMore?: () => void;
    hasMore?: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, onLoadMore, hasMore }) => {
    const activityIcons: Record<string, string> = {
        contract: '📜',
        library: '📚',
        github: '💻',
        referral: '👥'
    };

    const formatTimestamp = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp * 1000;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    return (
        <div className="activity-feed">
            <h3 className="feed-title">Recent Activity</h3>
            <div className="activity-list">
                {activities.length === 0 ? (
                    <p className="no-activity">No activity yet. Start earning points!</p>
                ) : (
                    activities.map((activity) => (
                        <div key={activity.id} className="activity-item">
                            <div className="activity-icon">{activityIcons[activity.type]}</div>
                            <div className="activity-content">
                                <p className="activity-description">{activity.description}</p>
                                <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                            </div>
                            <div className="activity-points">+{activity.points}</div>
                        </div>
                    ))
                )}
            </div>
            {hasMore && (
                <button className="load-more-btn" onClick={onLoadMore}>
                    Load More
                </button>
            )}
            <style jsx>{`
        .activity-feed {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .feed-title {
          margin: 0 0 1rem 0;
          color: #1a1a1a;
        }
        .activity-list {
          max-height: 400px;
          overflow-y: auto;
        }
        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 0.75rem;
          transition: all 0.2s ease;
        }
        .activity-item:hover {
          background: #e9ecef;
          transform: translateX(4px);
        }
        .activity-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .activity-content {
          flex: 1;
        }
        .activity-description {
          margin: 0 0 0.25rem 0;
          color: #1a1a1a;
          font-size: 0.95rem;
        }
        .activity-time {
          color: #6c757d;
          font-size: 0.85rem;
        }
        .activity-points {
          color: #28a745;
          font-weight: 600;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .no-activity {
          text-align: center;
          color: #6c757d;
          padding: 2rem;
        }
        .load-more-btn {
          width: 100%;
          padding: 0.75rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
        }
        .load-more-btn:hover {
          background: #5568d3;
          transform: translateY(-2px);
        }
      `}</style>
        </div>
    );
};

export default ActivityFeed;
