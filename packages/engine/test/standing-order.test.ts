// F-12 (2026-10-31, D41): a monthly purchase pays the tariff's standing-order price where one is printed; a lump sum and a sale pay the regular line.
// Expected figures computed by a separate script from the formula, with no return, fund cost or inflation.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runSecurities, type SecuritiesInput } from "../src/ledgers/securities.ts";
import { buildTariff, type WorkbenchInput } from "../src/providers/workbench.ts";
import { context } from "./golden/harness.ts";

const ctx = context();
const regular = { rate: 0.004, min: 26, max: 6_300 };
const input = (tariff: SecuritiesInput["tariff"]): SecuritiesInput => ({
  goal: { amountNow: 10_000, monthly: 500, months: 12 },
  market: { grossReturn: 0, inflation: 0 },
  fund: { kind: "israeli-fund", drag: {} },
  tariff,
  profile: {},
});

describe("the standing-order price (F-12)", () => {
  it("prices the twelve monthly purchases at 5 and leaves the lump sum and the sale on the regular line", () => {
    const r = runSecurities(input({ buy: regular, buyStanding: { rate: 0.00225, min: 5, max: 6_300 }, sell: regular }), ctx);
    expect(r.fees.trade).toBeCloseTo(163.44, 1);
  });
  it("without a standing-order line every purchase pays the regular line", () => {
    const r = runSecurities(input({ buy: regular, sell: regular }), ctx);
    expect(r.fees.trade).toBeCloseTo(414.43, 1);
  });
});

describe("which tariff line is the standing-order price (F-12)", () => {
  const snapshot = (id: string) => JSON.parse(readFileSync(new URL(`../../../data/fees/${id}@2026-10-31.json`, import.meta.url), "utf8"));
  const read = (id: string, instrumentClass: string, channel: string) => {
    const snap = snapshot(id);
    return buildTariff({ instrumentClass, channel, wrapper: "brokerage-account" } as Omit<WorkbenchInput, "fund">, { snapshot: snap, level: "list" }, snap).tariff;
  };
  it("a tracking fund bought direct at Massad gets the direct standing line, and the regular line stays regular", () => {
    const t = read("massad", "mutual_fund_units", "direct");
    expect(t.buyStanding).toMatchObject({ rate: 0.004, min: 7, max: 6_300, cap: 0.25 });
    expect(t.buy?.min).toBe(35);
    expect(t.sell?.min).toBe(35);
  });
  it("the same fund through a branch gets the branch's standing line", () => {
    expect(read("massad", "mutual_fund_units", "branch").buyStanding).toMatchObject({ rate: 0.0064, min: 7, max: 7_000 });
  });
  it("an Israeli ETF gets the same line: each tariff names a tracking fund as the law defines it, and the law makes an ETF one (MF-58)", () => {
    expect(read("massad", "etf_units", "direct").buyStanding).toMatchObject({ rate: 0.004, min: 7, max: 6_300, cap: 0.25 });
    expect(read("fibi", "etf_units", "direct").buyStanding).toMatchObject({ rate: 0.003, min: 7, max: 6_900, cap: 0.3 });
    expect(read("leumi", "etf_units", "direct").buyStanding).toMatchObject({ min: 5, max: 6_300 });
    expect(read("leumi", "etf_units", "direct").buyStanding?.rate).toBeCloseTo(0.00225, 10);
    expect(read("massad", "etf_units", "direct").buy?.min).toBe(35);
  });
  it("a foreign fund listed on TASE keeps the regular exchange-traded line and gets no standing-order price: no tariff names it (MF-58)", () => {
    for (const id of ["massad", "fibi", "leumi"]) {
      const t = read(id, "tase_foreign_fund_units", "direct");
      expect(t.buyStanding, id).toBeUndefined();
      expect(t.buy?.min, id).toBe(read(id, "etf_units", "direct").buy?.min);
    }
  });
  it("Leumi's line prints no channel, so it holds on both", () => {
    for (const channel of ["direct", "branch"]) {
      const t = read("leumi", "mutual_fund_units", channel).buyStanding;
      expect(t?.rate).toBeCloseTo(0.00225, 10);
      expect(t?.min).toBe(5);
    }
  });
  it("a tariff that prints no standing-order line gives none", () => {
    const snap = JSON.parse(readFileSync(new URL("../../../data/fees/massad@2026-10-31.json", import.meta.url), "utf8"));
    snap.lines = snap.lines.filter((l: { band?: string | null }) => l.band !== "הוראת קבע");
    const t = buildTariff({ instrumentClass: "mutual_fund_units", channel: "direct", wrapper: "brokerage-account" } as Omit<WorkbenchInput, "fund">, { snapshot: snap, level: "list" }, snap).tariff;
    expect(t.buyStanding).toBeUndefined();
    expect(t.buy?.min).toBe(35);
  });
});
