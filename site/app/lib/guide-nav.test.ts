import { describe, expect, it } from "vitest";
import { exposureFoldedInto, groupGuides, guideLayout, isClosedAudience, rulesAnchor, splitTerms } from "./guide-nav";

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

describe("isClosedAudience (audit A86)", () => {
  it("is closed only when every track is for a sector's or a plant's workers", () => {
    expect(isClosedAudience(["עובדי סקטור מסויים", "עובדי מפעל/גוף מסויים"])).toBe(true);
    expect(isClosedAudience(["עובדי סקטור מסויים", "כלל האוכלוסיה"])).toBe(false);
    expect(isClosedAudience(["עובדי סקטור מסויים", ""])).toBe(false);
    expect(isClosedAudience([])).toBe(false);
  });
});

describe("splitTerms (audit A83)", () => {
  const t = (he: string) => ({ he });
  it("hides a table under three rows", () => {
    expect(splitTerms([t("א"), t("ב")], ["א"]).hide).toBe(true);
    expect(splitTerms([], []).hide).toBe(true);
  });
  it("caps the table at the terms the page opens when there are enough of them", () => {
    const r = splitTerms([t("א"), t("ב"), t("ג"), t("ד"), t("ה")], ["א", "ג", "ה", "ו"]);
    expect(r.main.map((x) => x.he)).toEqual(["א", "ג", "ה"]);
    expect(r.rest.map((x) => x.he)).toEqual(["ב", "ד"]);
    expect(r.hide).toBe(false);
  });
  it("puts everything behind the toggle when too few terms are highlighted", () => {
    const r = splitTerms([t("א"), t("ב"), t("ג")], ["א"]);
    expect(r.main).toEqual([]);
    expect(r.rest).toHaveLength(3);
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
