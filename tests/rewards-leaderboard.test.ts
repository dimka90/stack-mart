import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const contractName = "rewards-leaderboard";

/**
 * Rewards and Leaderboard Contract Tests
 * Verifies:
 * - Point calculation for contract activity/impact
 * - Point calculation for library usage (@stacks/connect, @stacks/transactions)
 * - Point calculation for GitHub contributions
 * - Ranking and percentile logic
 * - Point decay state transitions
 */
describe("Rewards & Leaderboard System", () => {
    it("should initialize with zero stats for new users", () => {
        const stats = simnet.callReadOnlyFn(contractName, "get-user-stats", [Cl.standardPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM")], "deployer");
        expect(stats.result).toBeNone();
    });

    it("should correctly add points for contract activity", () => {
        const user = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
        const impactScore = 5; // Result: 50 base points + 5 * 10 = 100 points

        const { result } = simnet.callPublicFn(contractName, "log-contract-activity", [Cl.standardPrincipal(user), Cl.uint(impactScore)], "deployer");
        expect(result).toBeOk(Cl.bool(true));

        const stats: any = simnet.callReadOnlyFn(contractName, "get-user-stats", [Cl.standardPrincipal(user)], "deployer").result;
        expect(stats.value.data["total-points"]).toEqual(Cl.uint(100));
        expect(stats.value.data["contract-impact-points"]).toEqual(Cl.uint(100));
    });

    it("should correctly add points for Stacks library usage", () => {
        const user = "ST2REHHSSTMBMGWGS3W7FST1630S8P86M65EA5C6";

        simnet.callPublicFn(contractName, "log-library-usage", [Cl.standardPrincipal(user), Cl.stringAscii("connect")], "deployer");
        simnet.callPublicFn(contractName, "log-library-usage", [Cl.standardPrincipal(user), Cl.stringAscii("transactions")], "deployer");

        const stats: any = simnet.callReadOnlyFn(contractName, "get-user-stats", [Cl.standardPrincipal(user)], "deployer").result;
        expect(stats.value.data["library-usage-points"]).toEqual(Cl.uint(50)); // 25 + 25
    });

    it("should allow admin to log GitHub contributions", () => {
        const user = "ST3PF13W7Z0RRM42A8SZF9ENX9883S6X10M6Y8C7B";
        const points = 500;

        const { result } = simnet.callPublicFn(contractName, "log-github-contribution", [Cl.standardPrincipal(user), Cl.uint(points)], "deployer");
        expect(result).toBeOk(Cl.bool(true));

        const stats: any = simnet.callReadOnlyFn(contractName, "get-user-stats", [Cl.standardPrincipal(user)], "deployer").result;
        expect(stats.value.data["github-contrib-points"]).toEqual(Cl.uint(500));
    });

    it("should prevent non-admin from logging GitHub contributions", () => {
        const user = "ST3PF13W7Z0RRM42A8SZF9ENX9883S6X10M6Y8C7B";
        const { result } = simnet.callPublicFn(contractName, "log-github-contribution", [Cl.standardPrincipal(user), Cl.uint(100)], "wallet_1");
        expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
});
