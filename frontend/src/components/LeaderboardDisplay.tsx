import React, { useState, useMemo } from 'react';

interface LeaderboardEntry {
    rank: number;
    user: string;
    points: number;
    level: number;
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

type Period = 'lifetime' | 'monthly' | 'weekly';

export const LeaderboardDisplay: React.FC = () => {
    const [activePeriod, setActivePeriod] = useState<Period>('lifetime');
    const [searchQuery, setSearchQuery] = useState('');

    const leaderboardData: Record<Period, LeaderboardEntry[]> = {
        lifetime: [
            { rank: 1, user: 'st1abc...xyz', points: 150200, level: 150, impactScore: 98, tier: 'Diamond' },
            { rank: 2, user: 'st1def...234', points: 142500, level: 142, impactScore: 95, tier: 'Diamond' },
            { rank: 3, user: 'st1ghi...567', points: 121000, level: 121, impactScore: 89, tier: 'Platinum' },
            { rank: 4, user: 'st1jkl...890', points: 98000, level: 98, impactScore: 82, tier: 'Gold' },
            { rank: 5, user: 'st1mno...111', points: 85000, level: 85, impactScore: 78, tier: 'Gold' },
        ],
        monthly: [
            { rank: 1, user: 'st1ghi...567', points: 12000, level: 121, impactScore: 92, tier: 'Platinum' },
            { rank: 2, user: 'st1abc...xyz', points: 10500, level: 150, impactScore: 88, tier: 'Diamond' },
            { rank: 3, user: 'st1pqr...222', points: 9800, level: 45, impactScore: 85, tier: 'Silver' },
        ],
        weekly: [
            { rank: 1, user: 'st1pqr...222', points: 3500, level: 45, impactScore: 94, tier: 'Silver' },
            { rank: 2, user: 'st1ghi...567', points: 3100, level: 121, impactScore: 87, tier: 'Platinum' },
            { rank: 3, user: 'st1def...234', points: 2800, level: 142, impactScore: 82, tier: 'Diamond' },
        ],
    };

    const filteredLeaderboard = useMemo(() => {
        return leaderboardData[activePeriod].filter(entry =>
            entry.user.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activePeriod, searchQuery]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                            <span className="bg-gradient-to-br from-amber-400 to-orange-600 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-orange-500/20">🏆</span>
                            Global Leaderboard
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Recognizing top builders and contributors</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-slate-800/50 border border-slate-700 text-white text-sm rounded-xl px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-orange-500/50 w-full sm:w-64 transition-all"
                            />
                            <span className="absolute left-3 top-2.5 text-slate-500">🔍</span>
                        </div>
                        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
                            {(['lifetime', 'monthly', 'weekly'] as Period[]).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setActivePeriod(p)}
                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${activePeriod === p
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 bg-slate-900/80">
                            <th className="px-8 py-5">Rank</th>
                            <th className="px-8 py-5">Developer</th>
                            <th className="px-8 py-5 text-center">Level</th>
                            <th className="px-8 py-5 text-right">Points</th>
                            <th className="px-8 py-5 text-right">Impact</th>
                            <th className="px-8 py-5 text-center">Tier</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredLeaderboard.map((entry) => (
                            <tr
                                key={`${activePeriod}-${entry.user}`}
                                className="hover:bg-white/5 transition-all group"
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xl font-black ${entry.rank === 1 ? 'text-amber-400' :
                                                entry.rank === 2 ? 'text-slate-300' :
                                                    entry.rank === 3 ? 'text-amber-700' : 'text-slate-600'
                                            }`}>
                                            {entry.rank.toString().padStart(2, '0')}
                                        </span>
                                        {entry.rank <= 3 && (
                                            <span className="text-lg">
                                                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-slate-300 font-bold overflow-hidden shadow-inner">
                                            {entry.user.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-100 group-hover:text-orange-400 transition-colors uppercase tracking-tight">{entry.user}</span>
                                            <span className="text-[10px] text-slate-500 font-medium">Verified Builder</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-lg text-xs font-black border border-slate-700">
                                        LVL {entry.level}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-lg text-white tabular-nums">
                                            {entry.points.toLocaleString()}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <span className="w-1 h-1 rounded-full bg-orange-500 animate-pulse"></span>
                                            <span className="text-[9px] text-orange-500/80 font-black uppercase tracking-widest">Points</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                        <span className="text-slate-400 font-bold text-xs tabular-nums">{entry.impactScore}%</span>
                                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-600 to-amber-400 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.4)] transition-all"
                                                style={{ width: `${entry.impactScore}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border-2 transition-all group-hover:scale-110 cursor-default inline-block ${TIER_COLORS[entry.tier]}`}>
                                        {entry.tier}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {filteredLeaderboard.length === 0 && (
                <div className="p-20 text-center bg-slate-900/50">
                    <p className="text-slate-500 font-bold text-lg">No builders found matching your search</p>
                </div>
            )}
        </div>
    );
};
