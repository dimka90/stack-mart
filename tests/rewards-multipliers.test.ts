import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

// Import simnet for proper typing
declare const simnet: any;

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet_1 = accounts.get("wallet_1")!;

const contractName = "rewards-leaderboard";

describe("Rewards Multipliers & streaks", () => {
    it("should start with 1x multiplier", () => {
        const user = wallet_1;
        const impactScore = 0; // Result: 50 base points * 1 = 50 points

        simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(impactScore)], deployer);

        const stats: any = simnet.callReadOnlyFn(contractName, "get-user-stats", [Cl.standardPrincipal(user)], deployer).result;
        expect(stats.value.data["total-points"]).toEqual(Cl.uint(50));
    });

    it("should maintain 1x multiplier if same day activity", () => {
        const user = wallet_1;

        // Day 1
        simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(0)], deployer);

        // Same day (e.g. 10 blocks later)
        simnet.mineEmptyBlocks(10);
        simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(0)], deployer);

        const stats: any = simnet.callReadOnlyFn(contractName, "get-user-stats", [Cl.standardPrincipal(user)], deployer).result;
        expect(stats.value.data["total-points"]).toEqual(Cl.uint(100)); // 50 + 50
    });

    it("should increment streak after 1 day", () => {
        const user = wallet_1;
        const blocksPerDay = 144;

        // Day 1
        simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(0)], deployer);

        // Day 2
        simnet.mineEmptyBlocks(blocksPerDay + 1);
        simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(0)], deployer);

        const streak: any = simnet.callReadOnlyFn(contractName, "get-user-streak", [Cl.standardPrincipal(user)], deployer).result;
        expect(streak.data["current-streak"]).toEqual(Cl.uint(2));
    });

    it("should apply 2x multiplier for 7-day streak", () => {
        const user = accounts.get("wallet_2")!;
        const blocksPerDay = 144;

        // Simulate 7 days of activity
        for (let i = 0; i < 7; i++) {
            simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(0)], deployer);
            simnet.mineEmptyBlocks(blocksPerDay + 1);
        }

        // On day 8, 2x multiplier should be active
        // Base is 50. With 2x it should be 100.
        const { result } = simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(0)], deployer);
        expect(result).toBeOk(Cl.bool(true));

        const stats: any = simnet.callReadOnlyFn(contractName, "get-user-stats", [Cl.standardPrincipal(user)], deployer).result;
        // Total should be 50*7 + 100 = 450
        expect(stats.value.data["total-points"]).toEqual(Cl.uint(450));
    });

    it("should reset streak if activity is missed for 2 days", () => {
        const user = accounts.get("wallet_3")!;
        const blocksPerDay = 144;

        // Day 1
        simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(0)], deployer);

        // Wait 3 days
        simnet.mineEmptyBlocks(blocksPerDay * 3);

        // Activity on Day 4
        simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(0)], deployer);

        const streak: any = simnet.callReadOnlyFn(contractName, "get-user-streak", [Cl.standardPrincipal(user)], deployer).result;
        expect(streak.data["current-streak"]).toEqual(Cl.uint(1)); // Reset to 1
    });

    it("should allow admin to change base points and affect rewards", () => {
        const user = wallet_1;

        // Change base points to 100
        simnet.callPublicFn(contractName, "set-activity-point-base", [Cl.uint(100)], deployer);

        simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(0)], deployer);

        const stats: any = simnet.callReadOnlyFn(contractName, "get-user-stats", [Cl.standardPrincipal(user)], deployer).result;
        expect(stats.value.data["total-points"]).toEqual(Cl.uint(100));
    });
});
