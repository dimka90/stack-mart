import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const contractName = "rewards-leaderboard";
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
const wallet_1 = "ST1SJ3DTE5DN7X54Y7D5KS9NM2XY2Z6G2M7D78NE";
const wallet_2 = "ST2REHHSSTMBMGWGS3W7FST1630S8P86M65EA5C6";
const wallet_3 = "ST3PF13W7Z0RRM42A8SZF9ENX9883S6X10M6Y8C7B";

describe("Rewards Referral System", () => {
    it("should allow a user to refer another user", () => {
        const referrer = wallet_1;
        const newUser = wallet_2;

        const { result } = simnet.callPublicFn(
            contractName,
            "log-referral",
            [Cl.standardPrincipal(newUser), Cl.standardPrincipal(referrer)],
            deployer
        );

        expect(result).toBeOk(Cl.bool(true));
    });

    it("should reward the referrer with 100 points", () => {
        const referrer = wallet_1;
        const newUser = wallet_3;

        simnet.callPublicFn(
            contractName,
            "log-referral",
            [Cl.standardPrincipal(newUser), Cl.standardPrincipal(referrer)],
            deployer
        );

        const stats: any = simnet.callReadOnlyFn(
            contractName,
            "get-user-stats",
            [Cl.standardPrincipal(referrer)],
            deployer
        ).result;

        // Referrer should have 100 points from the referral
        expect(stats.value.data["total-points"]).toEqual(Cl.uint(100));
    });

    it("should prevent a user from referring themselves", () => {
        const user = wallet_1;

        const { result } = simnet.callPublicFn(
            contractName,
            "log-referral",
            [Cl.standardPrincipal(user), Cl.standardPrincipal(user)],
            deployer
        );

        expect(result).toBeErr(Cl.uint(103)); // ERR-INVALID-POINTS
    });

    it("should prevent a user from being referred twice", () => {
        const referrer1 = wallet_1;
        const referrer2 = wallet_2;
        const newUser = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG";

        // First referral should succeed
        const result1 = simnet.callPublicFn(
            contractName,
            "log-referral",
            [Cl.standardPrincipal(newUser), Cl.standardPrincipal(referrer1)],
            deployer
        );
        expect(result1.result).toBeOk(Cl.bool(true));

        // Second referral should fail
        const result2 = simnet.callPublicFn(
            contractName,
            "log-referral",
            [Cl.standardPrincipal(newUser), Cl.standardPrincipal(referrer2)],
            deployer
        );
        expect(result2.result).toBeErr(Cl.uint(103)); // ERR-INVALID-POINTS
    });

    it("should track multiple referrals for a single referrer", () => {
        const referrer = "ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE";
        const user1 = "ST2JHG321VHYSMJQE9WGZJ3WK4VW6XVQX0ZZMS1E";
        const user2 = "ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0";
        const user3 = "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP";

        simnet.callPublicFn(contractName, "log-referral", [Cl.standardPrincipal(user1), Cl.standardPrincipal(referrer)], deployer);
        simnet.callPublicFn(contractName, "log-referral", [Cl.standardPrincipal(user2), Cl.standardPrincipal(referrer)], deployer);
        simnet.callPublicFn(contractName, "log-referral", [Cl.standardPrincipal(user3), Cl.standardPrincipal(referrer)], deployer);

        const stats: any = simnet.callReadOnlyFn(
            contractName,
            "get-user-stats",
            [Cl.standardPrincipal(referrer)],
            deployer
        ).result;

        // 3 referrals * 100 points = 300 points
        expect(stats.value.data["total-points"]).toEqual(Cl.uint(300));
    });
});
