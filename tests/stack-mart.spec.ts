import { describe, it, expect } from "vitest";
import { Cl } from "@stacks/transactions";

const contractName = "stack-mart";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const seller = accounts.get("wallet_1")!;
const buyer = accounts.get("wallet_2")!;
const royaltyRecipient = accounts.get("wallet_3")!;

describe("stack-mart listings", () => {
  it("creates a listing with royalty cap", () => {
    const res = simnet.callPublicFn(
      contractName,
      "create-listing",
      [Cl.uint(1_000), Cl.uint(500), Cl.principal(royaltyRecipient)],
      seller
    );

    expect(res.result).toBeOk(Cl.uint(1));

    const listing = simnet.callReadOnlyFn(
      contractName,
      "get-listing",
      [Cl.uint(1)],
      deployer
    );

    expect(listing.result).toBeOk(
      Cl.tuple({
        price: Cl.uint(1_000),
        "royalty-bips": Cl.uint(500),
        "royalty-recipient": Cl.principal(royaltyRecipient),
        seller: Cl.principal(seller),
      })
    );
  });

  it("buys a listing and deletes it", () => {
    simnet.callPublicFn(
      contractName,
      "create-listing",
      [Cl.uint(2_000), Cl.uint(1000), Cl.principal(royaltyRecipient)],
      seller
    );

    const purchase = simnet.callPublicFn(
      contractName,
      "buy-listing",
      [Cl.uint(1)],
      buyer
    );

    expect(purchase.result).toBeOk(Cl.bool(true));

    const missing = simnet.callReadOnlyFn(
      contractName,
      "get-listing",
      [Cl.uint(1)],
      deployer
    );

    expect(missing.result).toBeErr(Cl.uint(404));
  });
});

