import { describe, expect, it } from "vitest";
import { loadFunds } from "./instruments.server";
import { knownIndices } from "./invest";
import { allLabels, fundLabels, label } from "./labels";
import { buildIndicesBundle } from "./providers.server";

describe("label icons (2026-11-05 sweep)", () => {
  // labels that say the same thing of a different case share an icon; any other two never do
  const same = [
    ["currency", "currency-many"],
    ["hedged", "hedged-many"],
    ["tax-currency-open", "tax-currency-unknown"],
  ];
  const kin = (a: string, b: string) => same.some((g) => g.includes(a) && g.includes(b));

  it("labels about different things never share an icon", () => {
    const all = allLabels();
    for (const a of all) for (const b of all) if (a.id < b.id && !kin(a.id, b.id)) expect(`${a.id} ${a.icon}`).not.toBe(`${a.id} ${b.icon}`);
  });

  it("a currency label draws that currency's sign, and the general sign for one without its own", () => {
    expect(label("currency", "USD").icon).toBe("dollar");
    expect(label("currency", "EUR").icon).toBe("euro");
    expect(label("currency", "INR").icon).toBe("currency");
    expect(label("currency-foreign").icon).toBe("currency");
  });
});

describe("the currency's tax on an Israeli fund on a foreign index (TXS-14, F-04)", () => {
  const rec = loadFunds().find((f) => f.id === "5129275");
  const status = rec?.tax_status.foreign_investment_fund;
  const index = knownIndices(buildIndicesBundle()).find((i) => i.id === rec?.exposure_id);
  if (!rec || !status || !index) throw new Error("the S&P 500 fund 5129275, its status and its index are in the data");
  const withStatus = (hedged: boolean, value: string | false | null) => ({ ...rec, hedged, tax_status: { ...rec.tax_status, foreign_investment_fund: { ...status, value, notes: "as the test sets it" } } });
  const ids = (hedged: boolean, value: string | false | null) => fundLabels(withStatus(hedged, value), index, "il-etf").map((l) => l.id);
  it("says the currency is taxed only where the fund is known not to be a foreign-investment fund", () => {
    expect(ids(false, false)).toContain("tax-currency");
    expect(ids(false, false)).not.toContain("tax-currency-open");
    expect(ids(false, false)).not.toContain("tax-currency-unknown");
    expect(ids(true, false)).not.toContain("tax-currency");
  });
  it("where the fund's documents name it one, says only the regulations are open; where its status is not known, says that too", () => {
    for (const hedged of [false, true]) {
      expect(ids(hedged, "USD")).toEqual(expect.arrayContaining(["tax-currency-open"]));
      expect(ids(hedged, null)).toEqual(expect.arrayContaining(["tax-currency-unknown"]));
      for (const value of ["USD", null] as const) expect(ids(hedged, value)).not.toContain("tax-currency");
      expect(ids(hedged, "USD")).not.toContain("tax-currency-unknown");
      expect(ids(hedged, null)).not.toContain("tax-currency-open");
    }
    // the words: a fund named one is said to be one; a fund whose status is not known is said not to be known
    expect(label("tax-currency-open").explain).toContain("לפי מסמכי הקרן היא קרן נאמנות להשקעות חוץ");
    expect(label("tax-currency-unknown").explain).toContain("האתר לא יודע אם הקרן הזו היא קרן נאמנות להשקעות חוץ");
  });
});
