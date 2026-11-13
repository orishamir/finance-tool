import { describe, expect, it } from "vitest";
import { exposureFoldedInto, firstInGuideOrder, groupGuides, guideLayout, rulesAnchor, omitsSection } from "./guide-nav";

const allIds = guideLayout.flatMap((g) => g.ids);

describe("groupGuides (audit A44)", () => {
  it("puts every product in exactly one group", () => {
    const groups = groupGuides(allIds);
    const flat = groups.flatMap((g) => g.ids);
    expect([...flat].sort()).toEqual([...allIds].sort());
    expect(new Set(flat).size).toBe(flat.length);
  });
  it("keeps the layout's group order and the everyday-to-advanced order inside a group", () => {
    const groups = groupGuides([...allIds].reverse());
    expect(groups.map((g) => g.id)).toEqual(["short", "tax-benefit", "retirement", "children", "self-directed"]);
    expect(groups[0]!.ids[0]).toBe("current-account");
    expect(groups[1]!.ids).toEqual(["keren-hishtalmut", "kupat-gemel-lehashkaa"]);
  });
  it("drops a group none of whose products exist, and puts an unknown product last", () => {
    const groups = groupGuides(["bank-deposit", "brand-new-product"]);
    expect(groups).toEqual([
      { id: "short", ids: ["bank-deposit"] },
      { id: "other", ids: ["brand-new-product"] },
    ]);
  });
  it("starts the list with the everyday account, not the alphabetical first id", () => {
    expect(groupGuides(["bank-deposit", "current-account", "brokerage-account"])[0]!.ids).toEqual(["current-account", "bank-deposit"]);
  });
});

describe("rulesAnchor (audit A27)", () => {
  const r = (id: string, il_finance_file: string) => ({ id, il_finance_file });
  it("lands on the product's own file, not the regulators file the first rule may come from", () => {
    const rules = [r("REG-17", "regulators-and-protection.md"), r("KH-01", "keren-hishtalmut.md"), r("KH-02", "keren-hishtalmut.md"), r("TXH-01", "tax-hishtalmut.md")];
    expect(rulesAnchor(rules)).toBe("keren-hishtalmut");
  });
  it("prefers a product file to a tax file even when the tax file holds more rules", () => {
    const rules = [r("TXP-01", "tax-pension-gemel-lekitzba.md"), r("TXP-02", "tax-pension-gemel-lekitzba.md"), r("PEN-05", "pension-and-gemel-lekitzba.md")];
    expect(rulesAnchor(rules)).toBe("pension-and-gemel-lekitzba");
  });
  it("falls back to a tax file, then a shared one, when there is no product file", () => {
    expect(rulesAnchor([r("REG-17", "regulators-and-protection.md"), r("TXI-03", "tax-interest-deposits-bonds.md")])).toBe("tax-interest-deposits-bonds");
    expect(rulesAnchor([r("REG-17", "regulators-and-protection.md")])).toBe("regulators-and-protection");
  });
  it("takes the most common among product files, the first met on a tie", () => {
    expect(rulesAnchor([r("A-1", "a.md"), r("B-1", "b.md"), r("B-2", "b.md")])).toBe("b");
    expect(rulesAnchor([r("A-1", "a.md"), r("B-1", "b.md")])).toBe("a");
  });
  it("is empty with no rules", () => {
    expect(rulesAnchor([])).toBe("");
  });
});

describe("exposureFoldedInto (D6 as amended 2026-10-27)", () => {
  const products = [{ id: "makam", held_as: "direct" }, { id: "money-market-fund-daily", held_as: "fund_units" }, { id: "brokerage-account" }];
  it("an exposure a security held directly is gets that security's page", () => {
    expect(exposureFoldedInto(["makam", "money-market-fund-daily"], products)).toBe("makam");
  });
  it("an exposure held only through funds or wrappers keeps its own page", () => {
    expect(exposureFoldedInto(["money-market-fund-daily", "brokerage-account"], products)).toBeNull();
  });
});

describe("omitsSection (D49)", () => {
  it("leaves out only what a guide lists", () => {
    expect(omitsSection("bank-deposit", "cost")).toBe(true);
    expect(omitsSection("bank-deposit", "tax")).toBe(false);
    expect(omitsSection("money-market-fund-daily", "inout")).toBe(true);
    expect(omitsSection("money-market-fund-daily", "cost")).toBe(false);
    expect(omitsSection("keren-hishtalmut", "inout")).toBe(false);
  });
});

describe("firstInGuideOrder", () => {
  it("takes the guide's first of a term's products, whatever the order of their ids", () => {
    expect(firstInGuideOrder(["ira-hishtalmut", "ira-provident", "keren-hishtalmut", "kupat-gemel-lehashkaa", "pension-comprehensive"])).toBe("keren-hishtalmut");
    expect(firstInGuideOrder(["kupat-gemel-lehashkaa", "pension-comprehensive", "pension-general"])).toBe("kupat-gemel-lehashkaa");
  });
  it("puts a product the guide's order does not know after the ones it knows, and keeps the order among such", () => {
    expect(firstInGuideOrder(["makam", "pension-general"])).toBe("pension-general");
    expect(firstInGuideOrder(["makam", "government-bond"])).toBe("makam");
    expect(firstInGuideOrder([])).toBeUndefined();
  });
});
