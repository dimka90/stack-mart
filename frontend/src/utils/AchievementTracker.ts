interface AchievementDefinition {
    id: number;
    name: string;
    description: string;
    icon: string;
    criteria: (stats: any) => boolean;
    progress: (stats: any) => number;
    reward: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
    {
        id: 1,
        name: 'First Steps',
        description: 'Complete your first activity',
        icon: '🎯',
        criteria: (stats) => stats.totalPoints > 0,
        progress: (stats) => stats.totalPoints > 0 ? 100 : 0,
        reward: 50
    },
    {
        id: 2,
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        criteria: (stats) => stats.currentStreak >= 7,
        progress: (stats) => Math.min((stats.currentStreak / 7) * 100, 100),
        reward: 100
    },
    {
        id: 3,
        name: 'Month Master',
        description: 'Maintain a 30-day streak',
        icon: '⚡',
        criteria: (stats) => stats.currentStreak >= 30,
        progress: (stats) => Math.min((stats.currentStreak / 30) * 100, 100),
        reward: 250
    },
    {
        id: 4,
        name: 'Referral Champion',
        description: 'Refer 10 users',
        icon: '👥',
        criteria: (stats) => stats.referralCount >= 10,
        progress: (stats) => Math.min((stats.referralCount / 10) * 100, 100),
        reward: 100
    },
    {
        id: 5,
        name: 'Library Master',
        description: 'Use Stacks libraries 50 times',
        icon: '📚',
        criteria: (stats) => stats.libraryUsagePoints >= 1250,
        progress: (stats) => Math.min((stats.libraryUsagePoints / 1250) * 100, 100),
        reward: 100
    },
    {
        id: 10,
        name: 'Point Collector',
        description: 'Reach 10,000 total points',
        icon: '💰',
        criteria: (stats) => stats.totalPoints >= 10000,
        progress: (stats) => Math.min((stats.totalPoints / 10000) * 100, 100),
        reward: 250
    }
];

export class AchievementTracker {
    private static STORAGE_KEY = 'stack-mart-achievements';

    static checkAchievements(stats: any): number[] {
        const unlockedIds: number[] = [];
        const stored = this.getStoredAchievements();

        ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
            if (!stored.includes(achievement.id) && achievement.criteria(stats)) {
                unlockedIds.push(achievement.id);
                this.unlockAchievement(achievement.id);
            }
        });

        return unlockedIds;
    }

    static unlockAchievement(achievementId: number): void {
        const stored = this.getStoredAchievements();
        if (!stored.includes(achievementId)) {
            stored.push(achievementId);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
            this.triggerNotification(achievementId);
        }
    }

    static getStoredAchievements(): number[] {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    static getProgress(achievementId: number, stats: any): number {
        const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
        return achievement ? achievement.progress(stats) : 0;
    }

    private static triggerNotification(achievementId: number): void {
        const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === achievementId);
        if (achievement) {
            const event = new CustomEvent('achievement-unlocked', {
                detail: { achievement }
            });
            window.dispatchEvent(event);
        }
    }
}
