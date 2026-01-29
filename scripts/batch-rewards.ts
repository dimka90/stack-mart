/**
 * batch-rewards.ts
 * Simulates a reward oracle that batches activity logs and 
 * distributes points via simulated Stacks transactions.
 */

import { PointsCalculator, ActivityType, UserTier } from '../frontend/src/utils/PointsCalculator';

interface ActivityLog {
    userId: string;
    type: ActivityType;
    tier: UserTier;
    timestamp: number;
    metadata: any;
}

// Mock activity database
const MOCK_ACTIVITY_LOGS: ActivityLog[] = [
    { userId: 'user_1', type: ActivityType.CONTRACT_CALL, tier: UserTier.GOLD, timestamp: Date.now(), metadata: { txId: '0x123' } },
    { userId: 'user_2', type: ActivityType.CONTRACT_DEPLOY, tier: UserTier.BRONZE, timestamp: Date.now(), metadata: { txId: '0x456' } },
    { userId: 'user_1', type: ActivityType.LIBRARY_USE, tier: UserTier.GOLD, timestamp: Date.now(), metadata: { lib: '@stacks/connect' } },
    { userId: 'user_3', type: ActivityType.CONNECT_USAGE, tier: UserTier.SILVER, timestamp: Date.now(), metadata: {} },
    { userId: 'user_2', type: ActivityType.REFERRAL, tier: UserTier.BRONZE, timestamp: Date.now(), metadata: { ref: 'HERO123' } },
];

async function runBatchDistribution() {
    console.log("🚀 Starting Batch Rewards Distribution...");
    console.log("------------------------------------------");

    const distributions: Record<string, number> = {};

    // 1. Calculate points for each activity
    MOCK_ACTIVITY_LOGS.forEach(log => {
        const points = PointsCalculator.calculatePoints(log.type, log.tier);
        distributions[log.userId] = (distributions[log.userId] || 0) + points;

        console.log(`[Processor] User ${log.userId} earned ${points} pts for ${log.type} (Tier: ${log.tier})`);
    });

    console.log("------------------------------------------");
    console.log("📦 Batch Summary:");

    // 2. Simulate transaction batching
    for (const [userId, totalPoints] of Object.entries(distributions)) {
        console.log(`[Oracle] Distributing ${totalPoints} points to ${userId}...`);

        // Simulate a Stacks transaction construction
        const txStub = {
            recipient: userId,
            amount: totalPoints,
            contract: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.stack-mart-rewards',
            function: 'distribute-points'
        };

        // Artificial delay to simulate network broadcast
        await new Promise(resolve => setTimeout(resolve, 300));

        console.log(`✅ Transaction Broadcasted: ${Math.random().toString(16).substring(2, 10)}`);
    }

    console.log("------------------------------------------");
    console.log("✨ Distribution Complete!");
}

runBatchDistribution().catch(console.error);
