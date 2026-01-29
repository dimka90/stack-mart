import React, { useState, useEffect } from 'react';
import { ReferralManager, ReferralData } from '../utils/ReferralManager';

export const RewardsSettings: React.FC = () => {
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [privacyMode, setPrivacyMode] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setReferralData(ReferralManager.getReferralData());
    }, []);

    const copyToClipboard = () => {
        const link = ReferralManager.getReferralLink();
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!referralData) return null;

    return (
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-8 max-w-2xl mx-auto shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center text-2xl">
                    ⚙️
                </div>
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Rewards Settings
                    </h2>
                    <p className="text-sm text-gray-500">Manage your point preferences and referrals</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Privacy Mode */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                    <div>
                        <h3 className="font-semibold text-sm">Privacy Mode</h3>
                        <p className="text-xs text-gray-500">Hide your profile on the global leaderboard</p>
                    </div>
                    <button
                        onClick={() => setPrivacyMode(!privacyMode)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${privacyMode ? 'bg-orange-500' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacyMode ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                {/* Referral Link */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <h3 className="font-semibold text-sm mb-2">Your Referral Link</h3>
                    <p className="text-xs text-gray-500 mb-4">Share this link to earn 250 points for every new builder you refer.</p>

                    <div className="flex gap-2">
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                            {ReferralManager.getReferralLink()}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-500/20 text-green-500' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total Referrals</span>
                        <p className="text-xl font-mono font-bold mt-1">{referralData.referralCount}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Referral Bonus</span>
                        <p className="text-xl font-mono font-bold mt-1 text-orange-500">+{referralData.totalBonusEarned} pts</p>
                    </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5">
                    <p className="text-[10px] text-gray-600 text-center italic">
                        Rewards are calculated daily. Changes to privacy mode may take up to 1 hour to reflect on the leaderboard.
                    </p>
                </div>
            </div>
        </div>
    );
};
