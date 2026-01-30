/**
 * batch-rewards.ts
 * Simulates a reward oracle that batches activity logs and 
 * distributes points via simulated Stacks transactions.
 */

import { PointsCalculator, ActivityType, UserTier } from '../frontend/src/utils/PointsCalculator';
import * as fs from 'fs';
import * as path from 'path';

interface ActivityLog {
    userId: string;
    type: ActivityType;
    tier: UserTier;
    timestamp: number;
    streak?: number;
    metadata: any;
}

const CSV_FILE_PATH = path.join(__dirname, 'rewards_data.csv');

// Mock data generator if CSV doesn't exist
const generateMockLogs = (): ActivityLog[] => [
    { userId: 'ST1....123', type: ActivityType.CONTRACT_CALL, tier: UserTier.GOLD, timestamp: Date.now(), streak: 5, metadata: { txId: '0x123' } },
    { userId: 'ST1....456', type: ActivityType.CONTRACT_DEPLOY, tier: UserTier.BRONZE, timestamp: Date.now(), streak: 2, metadata: { txId: '0x456' } },
    { userId: 'ST1....789', type: ActivityType.LIBRARY_USE, tier: UserTier.GOLD, timestamp: Date.now(), streak: 10, metadata: { lib: '@stacks/connect' } },
    { userId: 'ST1....000', type: ActivityType.GITHUB_CONTRIBUTION, tier: UserTier.SILVER, timestamp: Date.now(), streak: 0, metadata: { pr: '234' } },
];

async function parseCSV(filePath: string): Promise<ActivityLog[]> {
    if (!fs.existsSync(filePath)) {
        console.log(`[CSV] No file found at ${filePath}, using mock data...`);
        return generateMockLogs();
    }

    const data = fs.readFileSync(filePath, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        const values = line.split(',');
        return {
            userId: values[0],
            type: values[1] as ActivityType,
            tier: values[2] as UserTier,
            streak: parseInt(values[3] || '0'),
            timestamp: Date.now(),
            metadata: JSON.parse(values[4] || '{}')
        };
    });
}

async function runBatchDistribution() {
    console.log("🚀 Starting Batch Rewards Distribution...");
    console.log("Environment: Local Devnet");
    console.log("------------------------------------------");

    const logs = await parseCSV(CSV_FILE_PATH);
    const distributions: Record<string, number> = {};

    console.log(`[Processor] Processing ${logs.length} activity logs...`);

    // 1. Calculate points for each activity
    logs.forEach(log => {
        const points = PointsCalculator.calculatePoints(log.type, log.tier, log.streak || 0);
        distributions[log.userId] = (distributions[log.userId] || 0) + points;

        console.log(`[Calc] User ${log.userId.substring(0, 10)}... earned ${points} pts (${log.type}) [Streak: ${log.streak || 0}d]`);
    });

    console.log("------------------------------------------");
    console.log(`📦 Summary: Distributing to ${Object.keys(distributions).length} unique recipients`);

    // 2. Simulate transaction batching
    for (const [userId, totalPoints] of Object.entries(distributions)) {
        console.log(`[Oracle] Sending ${totalPoints} PTS -> ${userId}...`);

        const txParams = {
            recipient: userId,
            amount: totalPoints,
            contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            contractName: 'rewards-leaderboard',
            functionName: 'log-contract-activity',
            fee: 10000, // Fixed gas fee for batch
        };

        // Artificial delay for broadcast simulation
        await new Promise(resolve => setTimeout(resolve, 500));

        const txId = Math.random().toString(16).substring(2, 10);
        console.log(`   └─ ✅ Success! TX: 0x${txId}`);
    }

    console.log("------------------------------------------");
    console.log("✨ Batch Distribution Complete!");
    console.log(`Total Points Distributed: ${Object.values(distributions).reduce((a, b) => a + b, 0)}`);
}

runBatchDistribution().catch(error => {
    console.error("❌ Batch Distribution Failed:");
    console.error(error);
});
