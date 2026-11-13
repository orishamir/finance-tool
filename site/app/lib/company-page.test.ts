import { describe, expect, it } from "vitest";
import { CAPS_FROM_AGE, addressId, currentAddress, splitDocGroups } from "./company-page";
import { loadRules, loadWrappers } from "./data.server";

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

describe("a company page's products and their caps", () => {
  it("puts the self-directed fund's documents under its two products", () => {
    const { byProduct } = splitDocGroups([{ key: "ira-self-directed.md", title: "ניהול אישי", ids: ["IRA-29"] }], ["ira-provident", "ira-hishtalmut", "provident-for-annuity"]);
    expect(byProduct["ira-provident"]?.[0]?.ids).toEqual(["IRA-29"]);
    expect(byProduct["ira-hishtalmut"]?.[0]?.ids).toEqual(["IRA-29"]);
    expect(byProduct["provident-for-annuity"]).toBeUndefined();
  });

  it("says a child-savings fund's caps bind after 21, the age to which the National Insurance Institute pays its fees (CS-18)", () => {
    const rules = loadRules();
    expect(Object.keys(CAPS_FROM_AGE)).toEqual(["child-savings-provident"]);
    for (const [product, at] of Object.entries(CAPS_FROM_AGE)) {
      expect(loadWrappers().some((w) => w.id === product && w.fee_caps)).toBe(true);
      const figure = rules[at.rule]?.figures?.[at.figure] as { unit?: string } | undefined;
      expect(figure?.unit).toBe("years");
    }
    expect((rules["CS-18"]?.figures?.nii_pays_until_age as { value?: unknown } | undefined)?.value).toBe(21);
  });
});
