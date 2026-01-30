interface PointsHistory {
    date: string;
    points: number;
    type: 'contract' | 'library' | 'github' | 'referral';
}

interface StreakAnalytics {
    currentStreak: number;
    longestStreak: number;
    streakHistory: Array<{ date: string; streak: number }>;
}

interface TierProgression {
    tier: string;
    achievedAt: string;
    pointsAtAchievement: number;
}

export class RewardsAnalytics {
    static calculatePointsHistory(activities: any[]): PointsHistory[] {
        return activities.map(activity => ({
            date: new Date(activity.timestamp * 1000).toISOString().split('T')[0],
            points: activity.points,
            type: activity.type
        }));
    }

    static analyzeStreaks(streakData: any[]): StreakAnalytics {
        const streaks = streakData.map(d => d.streak);
        return {
            currentStreak: streaks[streaks.length - 1] || 0,
            longestStreak: Math.max(...streaks, 0),
            streakHistory: streakData.map(d => ({
                date: new Date(d.date).toISOString().split('T')[0],
                streak: d.streak
            }))
        };
    }

    static analyzeTierProgression(tierEvents: any[]): TierProgression[] {
        return tierEvents.map(event => ({
            tier: this.getTierName(event.tier),
            achievedAt: new Date(event.upgradedAtBlock * 144 * 10 * 60 * 1000).toISOString(),
            pointsAtAchievement: event.pointsAtUpgrade
        }));
    }

    static calculateReferralMetrics(referrals: any[]) {
        const totalReferrals = referrals.length;
        const activeReferrals = referrals.filter(r => r.isActive).length;
        const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

        return {
            totalReferrals,
            activeReferrals,
            conversionRate: Math.round(conversionRate * 100) / 100,
            totalPointsEarned: totalReferrals * 100
        };
    }

    static exportToCSV(data: any[], filename: string): void {
        const headers = Object.keys(data[0] || {});
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(h => row[h]).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    }

    private static getTierName(tier: number): string {
        const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
        return tiers[tier] || 'Unknown';
    }
}
