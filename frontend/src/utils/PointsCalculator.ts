/**
 * PointsCalculator Utility
 * Handles complex points calculation logic including base points, 
 * multipliers based on user tier, and streak bonuses.
 * This file is kept in sync with contracts/rewards-leaderboard.clar
 */

export const ActivityType = {
    CONTRACT_CALL: 'contract-interaction',
    CONTRACT_DEPLOY: 'contract-deployment',
    CONNECT_USAGE: 'connect',
    LIBRARY_USE: 'library_use',
    REFERRAL: 'referral',
    GITHUB_CONTRIBUTION: 'github_contribution'
} as const;

export type ActivityType = typeof ActivityType[keyof typeof ActivityType];

export const UserTier = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum'
} as const;

export type UserTier = typeof UserTier[keyof typeof UserTier];

export class PointsCalculator {
    public static readonly LEVEL_THRESHOLD = 1000;

    private static BASE_POINTS: Record<ActivityType, number> = {
        [ActivityType.CONTRACT_CALL]: 50,
        [ActivityType.CONTRACT_DEPLOY]: 500,
        [ActivityType.CONNECT_USAGE]: 25,
        [ActivityType.LIBRARY_USE]: 100,
        [ActivityType.REFERRAL]: 250,
        [ActivityType.GITHUB_CONTRIBUTION]: 75
    };

    private static TIER_MULTIPLIERS: Record<UserTier, number> = {
        [UserTier.BRONZE]: 1.0,
        [UserTier.SILVER]: 1.2,
        [UserTier.GOLD]: 1.5,
        [UserTier.PLATINUM]: 2.0
    };

    /**
     * Calculates total points for a given activity and user state
     */
    static calculatePoints(
        type: ActivityType,
        tier: UserTier = UserTier.BRONZE,
        streakDays: number = 0
    ): number {
        const base = this.BASE_POINTS[type] || 0;
        const tierMultiplier = this.TIER_MULTIPLIERS[tier] || 1.0;

        // Base calculation
        let total = base * tierMultiplier;

        // Apply streak multiplier (Matches Clarity contract logic)
        let streakMultiplier = 1;
        if (streakDays >= 30) {
            streakMultiplier = 3;
        } else if (streakDays >= 7) {
            streakMultiplier = 2;
        }

        return Math.floor(total * streakMultiplier);
    }

    /**
     * Calculates current level based on total points
     */
    static calculateLevel(points: number): number {
        return Math.floor(points / this.LEVEL_THRESHOLD);
    }

    /**
     * Calculates progress to next level (0-100)
     */
    static calculateProgress(points: number): number {
        const currentPointsInLevel = points % this.LEVEL_THRESHOLD;
        return (currentPointsInLevel / this.LEVEL_THRESHOLD) * 100;
    }

    /**
     * Determines next tier progress (Legacy support for UI)
     */
    static getTierProgress(currentPoints: number): { current: UserTier; next: UserTier | null; progress: number } {
        if (currentPoints < 1000) return { current: UserTier.BRONZE, next: UserTier.SILVER, progress: (currentPoints / 1000) * 100 };
        if (currentPoints < 5000) return { current: UserTier.SILVER, next: UserTier.GOLD, progress: ((currentPoints - 1000) / 4000) * 100 };
        if (currentPoints < 20000) return { current: UserTier.GOLD, next: UserTier.PLATINUM, progress: ((currentPoints - 5000) / 15000) * 100 };
        return { current: UserTier.PLATINUM, next: null, progress: 100 };
    }
}
