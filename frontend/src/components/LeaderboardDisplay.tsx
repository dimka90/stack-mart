import React from 'react';

interface LeaderboardEntry {
    rank: number;
    user: string;
    points: number;
    impactScore: number;
    tier: 'Diamond' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';
}

const TIER_COLORS = {
    Diamond: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    Platinum: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    Gold: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    Silver: 'text-gray-300 bg-gray-300/10 border-gray-300/20',
    Bronze: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

export const LeaderboardDisplay: React.FC = () => {
    const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([
        { rank: 1, user: 'st1abc...xyz', points: 150200, impactScore: 98, tier: 'Diamond' },
        { rank: 2, user: 'st1def...234', points: 142500, impactScore: 95, tier: 'Diamond' },
        { rank: 3, user: 'st1ghi...567', points: 121000, impactScore: 89, tier: 'Platinum' },
        { rank: 4, user: 'st1jkl...890', points: 98000, impactScore: 82, tier: 'Gold' },
        { rank: 42, user: 'Your Account', points: 24500, impactScore: 45, tier: 'Silver' },
    ]);

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span>🏆</span> Global Leaderboard
                </h2>
                <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                        All Time
                    </button>
                    <button className="px-3 py-1 text-xs font-medium rounded-lg hover:bg-white/10 transition-colors text-gray-400">
                        Monthly
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5 bg-white/5">
                            <th className="px-6 py-4">Rank</th>
                            <th className="px-6 py-4">Developer</th>
                            <th className="px-6 py-4 text-right">Points</th>
                            <th className="px-6 py-4 text-right">Impact</th>
                            <th className="px-6 py-4 text-center">Tier</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {leaderboard.map((entry) => (
                            <tr
                                key={entry.user}
                                className={`hover:bg-white/10 transition-colors ${entry.user === 'Your Account' ? 'bg-orange-500/10' : ''}`}
                            >
                                <td className="px-6 py-4">
                                    <span className={`font-bold ${entry.rank <= 3 ? 'text-orange-500' : 'text-gray-400'}`}>
                                        #{entry.rank}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-white">
                                    {entry.user}
                                </td>
                                <td className="px-6 py-4 text-right font-mono font-bold text-gray-200">
                                    {entry.points.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <span className="text-orange-500 font-bold">{entry.impactScore}</span>
                                        <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-orange-500"
                                                style={{ width: `${entry.impactScore}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded border ${TIER_COLORS[entry.tier]}`}>
                                        {entry.tier}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
