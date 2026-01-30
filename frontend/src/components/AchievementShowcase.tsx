import React from 'react';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    progress: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
    const tierColors = {
        Bronze: 'border-orange-900/30 text-orange-500',
        Silver: 'border-gray-500/30 text-gray-300',
        Gold: 'border-yellow-500/30 text-yellow-500',
        Platinum: 'border-blue-400/30 text-blue-400'
    };

    return (
        <div className={`p-4 rounded-xl border transition-all relative group ${achievement.unlocked
            ? 'bg-white/[0.03] border-white/10'
            : 'bg-white/[0.01] border-white/5 grayscale opacity-60'
            }`}>
            <div className="flex items-start justify-between mb-3">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{achievement.icon}</span>
                <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border ${tierColors[achievement.tier]}`}>
                    {achievement.tier}
                </span>
            </div>
            <h3 className="font-bold text-sm mb-1">{achievement.title}</h3>
            <p className="text-[10px] text-gray-450 leading-tight mb-3 h-8">{achievement.description}</p>

            <div className="space-y-1.5">
                <div className="flex justify-between text-[8px] font-mono text-gray-500">
                    <span>Progress</span>
                    <span>{achievement.progress}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ${achievement.unlocked ? 'bg-orange-500' : 'bg-gray-600'}`}
                        style={{ width: `${achievement.progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export const AchievementShowcase: React.FC = () => {
    const achievements: Achievement[] = [
        { id: '1', title: 'Smart Architect', description: 'Deploy and maintain impactful smart contracts on Stacks', icon: '🏗️', unlocked: true, progress: 100, tier: 'Silver' },
        { id: '2', title: 'Connect Master', description: 'Deep integration of @stacks/connect & transactions', icon: '🧪', unlocked: false, progress: 66, tier: 'Gold' },
        { id: '3', title: 'OSS Contributor', description: 'GitHub contributions to public Stacks & Mart repos', icon: '🌍', unlocked: false, progress: 40, tier: 'Bronze' },
        { id: '4', title: 'StackMart OG', description: 'Legacy builder with consistent leaderboard presence', icon: '👑', unlocked: true, progress: 100, tier: 'Platinum' },
    ];

    return (
        <div className="bg-black/20 border border-white/5 rounded-3xl p-8 backdrop-blur-xl">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold tracking-tight">
                        Milestones
                    </h2>
                    <span className="text-[10px] font-mono bg-white/5 px-3 py-1 rounded-full text-gray-400">2/15 Completed</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed max-w-md">
                    Rewards are based on your leaderboard position, determined by Stacks contract activity,
                    <code className="text-orange-500/80 mx-1">@stacks/connect</code> usage, and GitHub contributions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map(a => <AchievementCard key={a.id} achievement={a} />)}
            </div>

            <button className="w-full mt-8 py-3 text-[10px] uppercase tracking-widest font-black text-gray-500 hover:text-white transition-all bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-2xl">
                Explore All Achievements
            </button>
        </div>
    );
};
