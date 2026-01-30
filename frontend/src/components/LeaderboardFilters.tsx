import React, { useState } from 'react';

interface LeaderboardFiltersProps {
    onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
    timePeriod: 'all-time' | 'monthly' | 'weekly';
    tier: 'all' | 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
    searchAddress: string;
    sortBy: 'points' | 'streak' | 'level';
}

const LeaderboardFilters: React.FC<LeaderboardFiltersProps> = ({ onFilterChange }) => {
    const [filters, setFilters] = useState<FilterState>({
        timePeriod: 'all-time',
        tier: 'all',
        searchAddress: '',
        sortBy: 'points'
    });

    const updateFilter = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="leaderboard-filters">
            <div className="filter-group">
                <label>Time Period</label>
                <select
                    value={filters.timePeriod}
                    onChange={(e) => updateFilter('timePeriod', e.target.value)}
                >
                    <option value="all-time">All Time</option>
                    <option value="monthly">This Month</option>
                    <option value="weekly">This Week</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Tier</label>
                <select
                    value={filters.tier}
                    onChange={(e) => updateFilter('tier', e.target.value)}
                >
                    <option value="all">All Tiers</option>
                    <option value="bronze">🥉 Bronze</option>
                    <option value="silver">🥈 Silver</option>
                    <option value="gold">🥇 Gold</option>
                    <option value="platinum">💎 Platinum</option>
                    <option value="diamond">👑 Diamond</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Sort By</label>
                <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                >
                    <option value="points">Total Points</option>
                    <option value="streak">Current Streak</option>
                    <option value="level">Level</option>
                </select>
            </div>

            <div className="filter-group search-group">
                <label>Search Address</label>
                <input
                    type="text"
                    placeholder="SP1ABC..."
                    value={filters.searchAddress}
                    onChange={(e) => updateFilter('searchAddress', e.target.value)}
                />
            </div>

            <style jsx>{`
        .leaderboard-filters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .filter-group label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1a1a1a;
        }
        .filter-group select,
        .filter-group input {
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }
        .filter-group select:focus,
        .filter-group input:focus {
          outline: none;
          border-color: #667eea;
        }
        .search-group input {
          font-family: monospace;
        }
        @media (max-width: 768px) {
          .leaderboard-filters {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default LeaderboardFilters;
