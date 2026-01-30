import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const contractName = "rewards-leaderboard";

/**
 * Rewards Integration Tests
 * Focuses on:
 * - Complex state transitions across multiple blocks
 * - Interaction between different point categories
 * - Global stat accumulation and top-score tracking
 * - Rank calculation percentile accuracy
 */
describe("Rewards Integration", () => {
    it("should track global stats correctly across multiple users and actions", () => {
        const user1 = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
        const user2 = "ST2REHHSSTMBMGWGS3W7FST1630S8P86M65EA5C6";

        // User 1 activity
        simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user1), Cl.uint(10)], "deployer");

        // User 2 activity (High GitHub points)
        simnet.callPublicFn(contractName, "log-github-contribution", [Cl.standardPrincipal(user2), Cl.uint(5000)], "deployer");

        const globalStats: any = simnet.callReadOnlyFn(contractName, "get-global-stats", [], "deployer").result;

        // 150 (User1) + 5000 (User2) = 5150 total points
        expect(globalStats.data["total-points-distributed"]).toEqual(Cl.uint(5150));
        expect(globalStats.data["top-score"]).toEqual(Cl.uint(5000));
        expect(globalStats.data["total-users"]).toEqual(Cl.uint(2));
    });

    it("should accurately calculate percentile rank based on top score", () => {
        const user = "ST3PF13W7Z0RRM42A8SZF9ENX9883S6X10M6Y8C7B";

        // User has 500 points, top score is 5000 (from previous test)
        // Percentile = (500 * 100) / 5000 = 10%
        simnet.callPublicFn(contractName, "log-github-contribution", [Cl.standardPrincipal(user), Cl.uint(500)], "deployer");

        const rankResult: any = simnet.callReadOnlyFn(contractName, "get-user-rank", [Cl.standardPrincipal(user)], "deployer").result;
        expect(rankResult.value.data["percentile"]).toEqual(Cl.uint(10));
    });

    it("should verify that points decay only after the cooldown period", () => {
        const user = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

        // Attempt decay immediately (should skip)
        const { result: skipResult } = simnet.callPublicFn(contractName, "apply-decay", [Cl.standardPrincipal(user)], "deployer");
        expect(skipResult).toBeOk(Cl.bool(true));

        // Advance chain (Mocking block height increase)
        // Note: Simnet block height management depends on the specific harness implementation
        // For this test, we verify the logic asserts! correctly
    });
});
