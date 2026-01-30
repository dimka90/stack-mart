import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

declare const simnet: any;

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet_1 = accounts.get("wallet_1")!;
const wallet_2 = accounts.get("wallet_2")!;

describe("Reward Claiming Tests", () => {
    beforeEach(() => {
        simnet.callPublicFn(
            "rewards-leaderboard",
            "add-claimable-rewards",
            [Cl.principal(wallet_1), Cl.uint(500)],
            deployer
        );
    });

    it("should show correct claimable rewards", () => {
        const { result } = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "get-claimable-rewards",
            [Cl.principal(wallet_1)],
            deployer
        );
        expect(result).toBeOk(Cl.uint(500));
    });

    it("should allow users to claim rewards", () => {
        const claimResult = simnet.callPublicFn(
            "rewards-leaderboard",
            "claim-rewards",
            [],
            wallet_1
        );
        expect(claimResult.result).toBeOk(Cl.uint(500));
    });

    it("should reset claimable rewards after claiming", () => {
        simnet.callPublicFn("rewards-leaderboard", "claim-rewards", [], wallet_1);

        const { result } = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "get-claimable-rewards",
            [Cl.principal(wallet_1)],
            deployer
        );
        expect(result).toBeOk(Cl.uint(0));
    });

    it("should prevent double claiming", () => {
        simnet.callPublicFn("rewards-leaderboard", "claim-rewards", [], wallet_1);

        const secondClaim = simnet.callPublicFn(
            "rewards-leaderboard",
            "claim-rewards",
            [],
            wallet_1
        );
        expect(secondClaim.result).toBeErr(Cl.uint(103)); // ERR-INVALID-POINTS
    });

    it("should track claim history", () => {
        simnet.callPublicFn("rewards-leaderboard", "claim-rewards", [], wallet_1);

        const { result } = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "get-claim-history",
            [Cl.principal(wallet_1), Cl.uint(0)],
            deployer
        );
        expect(result).toBeSome();
    });

    it("should add claimed rewards to user points", () => {
        const statsBefore = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "get-user-stats",
            [Cl.principal(wallet_1)],
            deployer
        );

        simnet.callPublicFn("rewards-leaderboard", "claim-rewards", [], wallet_1);

        const statsAfter = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "get-user-stats",
            [Cl.principal(wallet_1)],
            deployer
        );

        expect(statsAfter.result.value.data['total-points']).toBeGreaterThan(
            statsBefore.result.value.data['total-points']
        );
    });

    it("should only allow admin to add claimable rewards", () => {
        const result = simnet.callPublicFn(
            "rewards-leaderboard",
            "add-claimable-rewards",
            [Cl.principal(wallet_2), Cl.uint(100)],
            wallet_1
        );
        expect(result.result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
});
