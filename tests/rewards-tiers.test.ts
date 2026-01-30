import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

declare const simnet: any;

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet_1 = accounts.get("wallet_1")!;
const wallet_2 = accounts.get("wallet_2")!;

describe("Tier System Tests", () => {
    it("should start users at Bronze tier", () => {
        const { result } = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "get-user-tier",
            [Cl.principal(wallet_1)],
            deployer
        );
        expect(result).toBeOk(Cl.uint(0)); // TIER-BRONZE = 0
    });

    it("should upgrade to Silver tier at 1000 points", () => {
        simnet.callPublicFn(
            "rewards-leaderboard",
            "log-contract-activity",
            [Cl.principal(wallet_1), Cl.uint(20)],
            deployer
        );

        const { result } = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "get-user-tier",
            [Cl.principal(wallet_1)],
            deployer
        );
        expect(result).toBeOk(Cl.uint(1)); // TIER-SILVER = 1
    });

    it("should apply correct tier multipliers", () => {
        const bronzeMultiplier = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "get-tier-multiplier",
            [Cl.uint(0)],
            deployer
        );
        expect(bronzeMultiplier.result).toBe(Cl.uint(100));

        const diamondMultiplier = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "get-tier-multiplier",
            [Cl.uint(4)],
            deployer
        );
        expect(diamondMultiplier.result).toBe(Cl.uint(200));
    });
});

describe("Achievement System Tests", () => {
    it("should unlock first activity achievement", () => {
        simnet.callPublicFn(
            "rewards-leaderboard",
            "log-contract-activity",
            [Cl.principal(wallet_2), Cl.uint(1)],
            deployer
        );

        const { result } = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "has-achievement",
            [Cl.principal(wallet_2), Cl.uint(1)],
            deployer
        );
        expect(result).toBe(Cl.bool(true));
    });

    it("should track achievement unlock timestamps", () => {
        const { result } = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "get-achievement",
            [Cl.principal(wallet_2), Cl.uint(1)],
            deployer
        );
        expect(result).toBeSome();
    });

    it("should not unlock achievements twice", () => {
        const firstCheck = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "has-achievement",
            [Cl.principal(wallet_2), Cl.uint(1)],
            deployer
        );

        simnet.callPublicFn(
            "rewards-leaderboard",
            "log-contract-activity",
            [Cl.principal(wallet_2), Cl.uint(1)],
            deployer
        );

        const secondCheck = simnet.callReadOnlyFn(
            "rewards-leaderboard",
            "has-achievement",
            [Cl.principal(wallet_2), Cl.uint(1)],
            deployer
        );

        expect(firstCheck.result).toEqual(secondCheck.result);
    });
});
