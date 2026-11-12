import { describe, expect, it } from "vitest";
import type { ProductRowData } from "../components/decoder/institutions/types";
import type { SiteValue } from "./value";
import { kindGroups, rateRange, sharedBands, sharedFacts, tableRows, taxPerLinkage, termRange } from "./bank-table";

const v = (value: number | string | null, unit = "ils"): SiteValue => ({ value, unit, source: { url: "https://example.org", title: "t", publisher: "p", strength: "institution" }, checked: "2026-11-09", state: "sourced" }) as unknown as SiteValue;

function rec(id: string, over: Omit<Partial<ProductRowData>, "rate"> & { min?: number; max?: number | null; rate?: number; days?: number; months?: number } = {}): ProductRowData {
  const { min = 1000, max = null, rate = 1, days, months, ...rest } = over;
  return {
    id,
    name: "פיקדון",
    model: null,
    alsoCalled: [],
    type447: days ? "פיקדון שבועי" : "פיקדון חודשי",
    wrapperId: "bank-deposit",
    currentAccount: false,
    term: days ? v(days, "days") : v(months ?? 1, "months"),
    rateType: "fixed",
    anchor: null,
    spread: null,
    rate: v(rate, "pct_per_year"),
    asOf: v("2026-11-09", "date"),
    asOfAfterRead: false,
    linkage: "none",
    linkageValue: v("none", "text"),
    taxBucket: v("unlinked_15", "text"),
    amountMin: v(min),
    amountMax: max === null ? null : v(max),
    breakTerms: { penalty: "not_allowed", quotes: [], rules: [] },
    exitPoints: { exists: false, everyMonths: null, firstMonths: null },
    autoRenew: { value: false, maxRenewals: null },
    variant: [],
    conditions: null,
    doubt: null,
    table: { url: "https://example.org", title: "t" },
    stale: false,
    snapshot: "2026-11-09",
    ...rest,
  };
}

describe("tableRows", () => {
  it("merges records that differ only by amount, by amount from the smallest", () => {
    const rows = tableRows([rec("b", { min: 100000, max: 249999, rate: 2 }), rec("a", { min: 1000, max: 99999 }), rec("c", { min: 250000, rate: 3 })]);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.lines.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });
  it("keeps apart records that differ in anything else", () => {
    expect(tableRows([rec("a"), rec("b", { min: 5000, exitPoints: { exists: true, everyMonths: 3, firstMonths: null } })])).toHaveLength(2);
  });
  it("never puts two rates in one cell: two records at one amount stay rows of their own", () => {
    expect(tableRows([rec("a", { rate: 1 }), rec("b", { rate: 2 })])).toHaveLength(2);
  });
});

describe("sharedBands", () => {
  it("gives one column per range when every row has the same ranges", () => {
    const rows = tableRows([rec("a", { max: 99999 }), rec("b", { min: 100000 }), rec("c", { months: 3, max: 99999 }), rec("d", { months: 3, min: 100000 })]);
    expect(sharedBands(rows)?.map((b) => b.key)).toEqual(["1000-99999", "100000-"]);
  });
  it("is null when the rows' ranges differ", () => {
    expect(sharedBands(tableRows([rec("a", { max: 99999 }), rec("b", { min: 100000 }), rec("c", { months: 3 })]))).toBeNull();
  });
});

describe("kindGroups", () => {
  it("orders kinds from the shortest period: a weekly deposit (7 days) before a monthly one", () => {
    expect(kindGroups(tableRows([rec("m", { months: 1 }), rec("w", { days: 7 })])).map((g) => g.kind)).toEqual(["פיקדון שבועי", "פיקדון חודשי"]);
  });
});

describe("sharedFacts", () => {
  it("shares only what every record holds", () => {
    const s = sharedFacts([rec("a"), rec("b", { rateType: "variable", autoRenew: { value: true, maxRenewals: null } })]);
    expect(s).toMatchObject({ rateType: false, autoRenew: false, breakTerms: true, exits: true, linkage: true, tax: true });
  });
  it("shares a break by whether one can break at all: the exits column says which wait for exit points", () => {
    expect(sharedFacts([rec("a"), rec("b", { exitPoints: { exists: true, everyMonths: 1, firstMonths: null } })]).breakTerms).toBe(true);
    expect(sharedFacts([rec("a"), rec("b", { breakTerms: { penalty: "with_penalty", quotes: [], rules: [] } })]).breakTerms).toBe(false);
  });
  it("says the tax once for each linkage when each linkage has one", () => {
    const linked = (id: string) => rec(id, { linkage: "cpi", taxBucket: { ...rec("x").taxBucket, value: "linked_25" } });
    const s = sharedFacts([rec("a"), rec("b"), linked("c")]);
    expect([s.tax, s.taxByLinkage]).toEqual([false, true]);
    expect(taxPerLinkage([linked("c"), rec("a")])?.map((p) => p.linkage)).toEqual(["none", "cpi"]);
    expect(taxPerLinkage([rec("a"), rec("b", { taxBucket: { ...rec("x").taxBucket, value: "linked_25" } })])).toBeNull();
  });
});

describe("rateRange", () => {
  it("is the lowest and the highest rate", () => {
    const r = rateRange([rec("a", { rate: 2 }), rec("b", { rate: 0.5 }), rec("c", { rate: 3.1 })]);
    expect([r?.low.value, r?.high.value]).toEqual([0.5, 3.1]);
  });
});

describe("termRange", () => {
  it("says the shortest and longest period, a single day as its from-form", () => {
    expect(termRange([rec("a", { days: 1 }), rec("b", { months: 12 }), rec("c", { months: 3 })])).toBe("מיום עד שנה");
  });
  it("says one unit once, and whole years of months in years", () => {
    expect(termRange([rec("a", { months: 36 }), rec("b", { months: 180 })])).toBe("מ־3 עד 15 שנים");
  });
  it("says a single period as itself, and nothing where no record holds one", () => {
    expect(termRange([rec("a", { months: 6 }), rec("b", { months: 6 })])).toBe("6 חודשים");
    expect(termRange([rec("a", { term: v(null, "months") })])).toBeNull();
  });
});
