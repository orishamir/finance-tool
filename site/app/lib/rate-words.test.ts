import { describe, expect, it } from "vitest";
import type { FeesSnapshot } from "@finance-tool/schema";
import { STANDING_ORDER_BAND } from "@finance-tool/engine";
import { rateWords } from "./rate-words";
import { buildIndicesBundle } from "./providers.server";
import { buildInvest, indexById, pairCosts, type PairCosts } from "./invest";
import type { WorkbenchInputs } from "./providers";
import { entered } from "./value";

type Line = FeesSnapshot["lines"][number];
const src = { url: "https://example.org/list.pdf", title: "תעריפון", publisher: "בית", strength: "institution" as const };
const fig = (value: number | null, unit: string) => ({ value, unit, source: src, checked: "2026-11-01", effective_from: null, effective_to: null, tax_year: null, update_rule: "provider-set", state: "sourced", notes: null }) as unknown as NonNullable<Line["rate"]>;
const line = (over: Partial<Line> & Pick<Line, "base" | "rate">): Line => ({ id: `l-${over.base}-${over.band ?? ""}`, applies_to: ["all"], level: "list", min: null, max: null, period: null, channel: null, band: null, names: { tariff: [] }, ...over }) as unknown as Line;
const priced = (lines: Line[], extra: Partial<PairCosts["priced"]> = {}): PairCosts["priced"] => ({ lines, currentAccount: null, house: "בית", entered: false, ...extra });

describe("a fee's rate as the price list prints it (the receipt's account lines)", () => {
  it("a trade line: its share of each trade and its minimum", () => {
    const w = rateWords("trade", priced([line({ base: "trade", rate: fig(0.07, "pct_of_trade"), min: fig(2, "nis_per_trade") })]), 500);
    expect(w).toEqual([{ standing: false, parts: [{ kind: "rate", value: expect.objectContaining({ value: 0.07 }), per: "trade" }, { kind: "min", value: expect.objectContaining({ value: 2 }), per: null }] }]);
  });
  it("custody: the share of the balance for the period the list prints, and a bound for that period or a month", () => {
    const w = rateWords("custody", priced([line({ base: "custody", rate: fig(0.03, "pct_of_balance_per_period"), period: "quarter", min: fig(5, "nis_per_month") })]), 500);
    expect(w![0]!.parts.map((p) => [p.kind, p.per])).toEqual([["rate", "quarter"], ["min", "month"]]);
  });
  it("a custody bound per trade is not read into: no rate is said", () => {
    expect(rateWords("custody", priced([line({ base: "custody", rate: fig(0.1, "pct_of_balance_per_period"), period: "year", min: fig(4, "nis_per_trade") })]), 500)).toBeNull();
  });
  it("a standing-order line is said before the regular one, and only where there is a monthly deposit", () => {
    const lines = [line({ base: "trade", rate: fig(0.1, "pct_of_trade") }), line({ base: "trade", rate: fig(0, "pct_of_trade"), band: STANDING_ORDER_BAND })];
    expect(rateWords("trade", priced(lines), 500)!.map((x) => x.standing)).toEqual([true, false]);
    expect(rateWords("trade", priced(lines), 0)!.map((x) => x.standing)).toEqual([false]);
  });
  it("two regular lines of one base, or the person's own prices: nothing is said", () => {
    expect(rateWords("trade", priced([line({ base: "trade", rate: fig(0.1, "pct_of_trade") }), line({ base: "trade", rate: fig(0.2, "pct_of_trade"), id: "x" } as Partial<Line> & Pick<Line, "base" | "rate">)]), 500)).toBeNull();
    expect(rateWords("trade", priced([line({ base: "trade", rate: fig(0.07, "pct_of_trade") })], { entered: true }), 500)).toBeNull();
  });
  it("a flat price for an order or a conversion up to a sum is said after the bounds, with the sum; one in a unit the line does not explain says nothing", () => {
    const trade = rateWords("trade", priced([line({ base: "trade", rate: fig(0.1, "pct_of_trade"), min: fig(26, "nis_per_trade"), flat_up_to: { amount: fig(4, "nis_per_trade"), up_to: fig(30000, "nis") } } as Partial<Line> & Pick<Line, "base" | "rate">)]), 500);
    expect(trade![0]!.parts.map((p) => p.kind)).toEqual(["rate", "min", "flat"]);
    expect(trade![0]!.parts[2]).toMatchObject({ value: expect.objectContaining({ value: 4 }), upTo: expect.objectContaining({ value: 30000 }), per: "eachTrade" });
    const fx = rateWords("fx", priced([line({ base: "fx", rate: fig(0.17, "pct_of_trade"), min: fig(5.7, "usd"), max: fig(2300, "usd"), flat_up_to: { amount: fig(3.3, "usd"), up_to: fig(99, "usd") }, spread: fig(0.3, "pct_of_trade") } as Partial<Line> & Pick<Line, "base" | "rate">)]), 500);
    expect(fx![0]!.parts.map((p) => p.kind)).toEqual(["rate", "min", "max", "flat", "spread"]);
    expect(fx![0]!.parts[3]).toMatchObject({ upTo: expect.objectContaining({ value: 99 }), per: "conversion" });
    expect(rateWords("trade", priced([line({ base: "trade", rate: fig(0.1, "pct_of_trade"), flat_up_to: { amount: fig(4, "pct_of_trade"), up_to: fig(30000, "nis") } } as Partial<Line> & Pick<Line, "base" | "rate">)]), 500)).toBeNull();
  });
  it("a line with an offer (a price for its first months, the price it reverts to, or the offer's words): nothing is said", () => {
    const base = { base: "trade" as const, rate: fig(0, "pct_of_trade") };
    for (const extra of [{ discount_months: fig(6, "months") }, { reverts_to: fig(0.1, "pct_of_trade") }, { offer_he: "מבצע להצטרפות" }])
      expect(rateWords("trade", priced([line({ ...base, ...extra } as Partial<Line> & Pick<Line, "base" | "rate">)]), 500)).toBeNull();
    // and on a standing order's line beside a plain regular one
    const lines = [line({ base: "trade", rate: fig(0.1, "pct_of_trade") }), line({ base: "trade", rate: fig(0, "pct_of_trade"), band: STANDING_ORDER_BAND, offer_he: "מבצע" } as Partial<Line> & Pick<Line, "base" | "rate">)];
    expect(rateWords("trade", priced(lines), 500)).toBeNull();
  });
  it("a conversion: its share and the spread the list limits; agorot a dollar carry their own unit", () => {
    expect(rateWords("fx", priced([line({ base: "fx", rate: fig(0.5, "pct_of_trade"), spread: fig(0.3, "pct_of_trade") } as Partial<Line> & Pick<Line, "base" | "rate">)]), 500)![0]!.parts.map((p) => p.kind)).toEqual(["rate", "spread"]);
    expect(rateWords("fx", priced([line({ base: "fx", rate: fig(0.015, "nis_per_usd") })]), 500)![0]!.parts[0]!.per).toBeNull();
  });
  it("a bank's current account: the monthly minimum the run counts; the remainder and the fund are never a line of the list", () => {
    const cur = { monthly_minimum: fig(5.5, "nis_per_month") } as NonNullable<FeesSnapshot["current_account"]>;
    expect(rateWords("account", priced([], { currentAccount: cur }), 500)![0]!.parts[0]).toMatchObject({ kind: "min", per: "month" });
    expect(rateWords("fund" as never, priced([]), 500)).toBeNull();
  });
});

describe("on the collected price lists", () => {
  const bundle = buildIndicesBundle();
  const t = bundle.today;
  const plan: WorkbenchInputs = {
    amountNow: 10000, monthly: 500, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null,
    values: { amount: entered(10000, "nis", t), monthly: entered(500, "nis_per_month", t), years: entered(10, "years", t), returnV: entered(7, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
    returnFromParameter: false, currentAccounts: { own: null },
  };
  const index = indexById(bundle, "index-sp500")!;
  const view = buildInvest({ bundle, index, plan });
  const fund = view.headline!.fund.rec.id;
  it("every priced line's rate comes from a line of the house's own record, or is not said", () => {
    let said = 0;
    for (const p of view.providers) {
      const pc = pairCosts({ bundle, index, plan, fundId: fund, providerId: p.id });
      if (!pc) continue;
      const own = bundle.snapshots.find((s) => s.id === p.id);
      for (const l of pc.account) {
        const w = rateWords(l.line, pc.priced, plan.monthly);
        if (!w) continue;
        said++;
        for (const x of w) for (const part of x.parts) {
          const inRecord = own?.lines.some((r) => [r.rate, r.min, r.max, r.cap, r.spread].includes(part.value as never)) || own?.current_account?.monthly_minimum === part.value;
          expect(inRecord, `${p.id} ${l.line}`).toBe(true);
        }
      }
    }
    expect(said).toBeGreaterThan(10);
  });
});
