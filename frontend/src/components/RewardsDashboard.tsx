import React from 'react';

interface RewardsDashboardProps {
    points: number;
    level: number;
    streak: number;
    reputation: number;
    nextLevelPoints: number;
}

const RewardsDashboard: React.FC<RewardsDashboardProps> = ({
    points,
    level,
    streak,
    reputation,
    nextLevelPoints
}) => {
    const progress = (points % nextLevelPoints) / nextLevelPoints * 100;

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Rewards</h2>
                    <p className="text-slate-500 mt-1">Track your progress and earnings</p>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                    <span className="text-amber-600 font-bold text-xl">{points.toLocaleString()}</span>
                    <span className="text-amber-800 font-medium uppercase text-xs tracking-wider">Points</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 transition-hover hover:border-indigo-200 group">
                    <p className="text-slate-500 text-sm font-medium mb-1">Current Level</p>
                    <p className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Level {level}</p>
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                        <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">
                        {Math.round(nextLevelPoints - (points % nextLevelPoints))} points until level {level + 1}
                    </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 transition-hover hover:border-orange-200 group">
                    <p className="text-slate-500 text-sm font-medium mb-1">Daily Streak</p>
                    <p className="text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{streak} Days</p>
                    <div className="flex gap-1 mt-4">
                        {[...Array(7)].map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 flex-1 rounded-sm ${i < streak % 7 ? 'bg-orange-500' : 'bg-slate-200'}`}
                            />
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">
                        {streak >= 7 ? '2x Multiplier Active!' : `${7 - (streak % 7)} days until 2x`}
                    </p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 transition-hover hover:border-emerald-200 group">
                    <p className="text-slate-500 text-sm font-medium mb-1">Reputation</p>
                    <p className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{reputation}</p>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="flex -space-x-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className={`w-3 h-3 rounded-full ${i < Math.floor(reputation / 100) ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide">Elite Status</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Milestone Progress</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold">1</div>
                            <div>
                                <p className="font-bold text-slate-800">Refer 5 Friends</p>
                                <p className="text-xs text-slate-500">Earn 500 bonus points</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">2/5</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RewardsDashboard;
