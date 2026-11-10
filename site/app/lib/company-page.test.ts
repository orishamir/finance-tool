import { describe, expect, it } from "vitest";
import { addressId, currentAddress, splitDocGroups } from "./company-page";

const bank = { key: "bank-current-account-deposits.md", title: "עובר ושב ופיקדונות", ids: ["BANK-33", "BANK-38"], about: { "BANK-38": ["savings-plan"] } };

describe("splitDocGroups", () => {
  it("puts an entry a product record names under that product alone, and the rest under each product of the group", () => {
    const { byProduct, rest } = splitDocGroups([bank], ["bank-deposit", "savings-plan", "current-account"]);
    expect(byProduct["bank-deposit"]?.[0]?.ids).toEqual(["BANK-33"]);
    expect(byProduct["savings-plan"]?.[0]?.ids).toEqual(["BANK-33", "BANK-38"]);
    expect(byProduct["current-account"]?.[0]?.ids).toEqual(["BANK-33"]);
    expect(rest).toEqual([]);
  });
  it("keeps a named entry under each product when the page lacks the product its record names", () => {
    const { byProduct } = splitDocGroups([bank], ["bank-deposit"]);
    expect(byProduct["bank-deposit"]?.[0]?.ids).toEqual(["BANK-33", "BANK-38"]);
  });
  it("leaves a group about none of the page's products to the overview", () => {
    const { byProduct, rest } = splitDocGroups([{ key: "switching-and-transfers.md", title: "מעבר", ids: ["SW-37"] }], ["bank-deposit"]);
    expect(byProduct).toEqual({});
    expect(rest.map((g) => g.key)).toEqual(["switching-and-transfers.md"]);
  });
});

describe("addressId", () => {
  it("gives the regulator's two Hebrew-named types a Latin address, and reads the old one", () => {
    expect(addressId("מרכזית לפיצויים")).toBe("central-severance");
    expect(addressId("keren-hishtalmut")).toBe("keren-hishtalmut");
    expect(currentAddress("מרכזית לפיצויים")).toBe("central-severance");
    expect(currentAddress("central-severance")).toBe("central-severance");
  });
});
