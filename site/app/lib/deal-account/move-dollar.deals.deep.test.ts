// A typed account built on a house moved into a deal (method §10.4), with the dollar moving (A-03 = +3% a year over 20 years), on every index
// the page prices: on the deal's terms it leaves what it left before on every fund, to the shekel (exceptions-fixtures.ts). move.test.ts runs
// a slice of this on a few indices.
import { describe, expect, it } from "vitest";
import { saleConversion, type ComparedProvider } from "@finance-tool/engine";
import type { CustomBroker } from "../custom-entries";
import type { WorkbenchInputs } from "../providers";
import { indexById, pairRow } from "../invest";
import { dealProviderId } from "./bundle";
import { movedDealId } from "./move";
import { compare, differing, fig, houses, movedBundle, on, plan, readBack, type Row } from "./move-fixtures";

/**
 * Method §10.4, the third stated difference: beside a typed minimum, a price's sum per unit in dollars stands at F-84's rate in the deal, so
 * where the dollar rises and the sum binds, the deal pays less than the account priced it at each month's rate. At this plan it binds only at
 * the exit sale of a cheap unit held many years. For such a row, what must hold exactly, or the reason it does not: every month before the
 * exit charged the same; every line but the trade fee and the conversion the same; the trade fee's gap, to the cent, the price per unit on
 * the `n` units sold at the exit's rate against the start's, each above the typed minimum and under the line's cap (`n` the run's
 * `exitGross / exitUnitPrice`); the conversion's gap, to the cent, the line's price on the proceeds less what the commission's gap adds to
 * them (`exactConversion`); and the value's gap those two at the exit, with the tax the same.
 */
function statedDollarGap(a: CustomBroker, r: Row, p: WorkbenchInputs, fxChange: number, perturb?: (row: ComparedProvider) => ComparedProvider): string | null {
  if (!r.abroad || r.before === null || r.after === null || r.after <= r.before) return "not a row abroad where the deal leaves more";
  const both = movedBundle([a], true);
  const index = indexById(both, r.ix);
  if (!index) return `no index ${r.ix}`;
  const args = { bundle: both, index, plan: p, fundId: r.fund, fxChange };
  const before = pairRow({ ...args, providerId: a.id });
  const dealRow = pairRow({ ...args, providerId: dealProviderId(movedDealId(a.id)) });
  if (!before || !dealRow) return "a side has no run";
  const after = perturb ? perturb(dealRow) : dealRow;
  // each comparison is written so that a NaN fails it (`!(x <= bound)`)
  if (before.run.series.length !== after.run.series.length) return "the two runs have different months";
  const months = before.run.series.map((x, m) => Math.abs(x.fees - (after.run.series[m]?.fees ?? Number.NaN)));
  if (!months.every((d) => d <= 1e-6)) return "a month before the exit charged differently";
  const lines = Object.keys(before.run.fees).filter((k) => k !== "trade" && k !== "fx" && !(Math.abs(before.run.fees[k as keyof typeof before.run.fees] - after.run.fees[k as keyof typeof after.run.fees]) <= 0.01));
  if (lines.length) return `lines other than the trade fee differ: ${lines.join(", ")}`;
  const trade = before.run.fees.trade - after.run.fees.trade;
  const fx = before.run.fees.fx - after.run.fees.fx;
  const { exitGross: gross, exitFxRate: atExit, exitUnitPrice: unitPrice, exitConverted: converted } = before.run.detail;
  if (gross === undefined || atExit === undefined || unitPrice === undefined || converted === undefined) return "the run gives no exit sale in units";
  const sell = before.tariff.sell;
  const start = before.tariff.currency?.startRate;
  const perShare = sell?.perShare;
  const min = sell?.min;
  if (!perShare || sell.in !== "instrument" || sell.sumIn?.min !== "nis" || min === undefined || start === undefined) return "the sale's price has no sum per unit in dollars beside a minimum in shekels";
  // F-12's commission on the sale: the sum per unit at a rate, at least the minimum, at most the line's cap of the sale
  const n = gross / unitPrice;
  const atRate = (rate: number) => Math.min(Math.max(min, n * perShare * rate), sell.cap === undefined ? Infinity : sell.cap * gross);
  const expected = atRate(atExit) - atRate(start);
  if (!(trade > 0 && Math.abs(trade - expected) <= 0.005)) return `the trade fee's gap is ${trade}, where a sum per unit on ${n} units at the exit's rate against the start's gives ${expected}`;
  // the sale's proceeds are converted after its commission, so the deal converts `trade` more: the conversion's gap is exactly the
  // house's price on the two sums
  const exact = exactConversion(before, converted, trade, atExit);
  if (exact === null) return "the house's conversion at the exit is not one line and spread, so its gap is not known here";
  if (!(Math.abs(fx - exact) <= 0.005)) return `the conversion's gap is ${fx}, where the house's price on the two sums gives ${exact}`;
  const exitIndex = before.run.series.at(-1)?.index ?? Number.NaN;
  if (!(Math.abs(after.run.real - before.run.real - (trade + fx) / exitIndex) <= 0.01 && Math.abs(after.run.taxAtExit - before.run.taxAtExit) <= 1e-6)) return `the gap is not the exit's fees alone: ${after.run.real - before.run.real} against ${(trade + fx) / exitIndex}, tax ${before.run.taxAtExit} ${after.run.taxAtExit}`;
  return null;
}

/**
 * F-13's conversion gap at the exit sale, on the house's `tariff.fx` line and its spread: the account converts `converted`, the deal
 * `converted + trade`. Null where the tariff changes during the run (F-101), whose price at the exit this does not read.
 */
function exactConversion(row: ComparedProvider, converted: number, trade: number, fxRate: number): number | null {
  const t = row.tariff;
  if (t.fx === undefined || t.until !== undefined) return null;
  return saleConversion(t.fx, converted, { fxRate }, t.fxSpread) - saleConversion(t.fx, converted + trade, { fxRate }, t.fxSpread);
}

describe("the move with the dollar moving: A-03 = +3% a year over 20 years, on every index", () => {
  const at = (amount: number) => ({ ...plan, amountNow: amount, years: 20, values: { ...plan.values, amount: fig(amount, "nis"), years: fig(20, "years") } });
  const shapes = houses.flatMap((id): [string, string, CustomBroker][] => [
    [id, "nothing typed", on(id, {})],
    [id, "the trade's percent alone", on(id, { tradePct: 0.07 })],
    [id, "the custody's percent and minimum", on(id, { custodyPct: 0.08, custodyMin: 1 })],
    [id, "the conversion alone", on(id, { fxPct: 0.2 })],
    [id, "the trade's minimum alone", on(id, { tradeMin: 3 })],
  ]);
  const got = compare(shapes.map((s) => s[2]), true, at(10_000), 3);
  it.each(shapes)("%s, %s: the same on every fund on the deal's terms, but the stated difference (3) at the exit sale", (_id, _, a) => {
    // a row that differs is one only where the deal leaves more at the exit sale of a cheap unit abroad (§10.4 (3), statedDollarGap)
    const unexplained = differing(got.get(a.id)!).map((r) => ({ ...r, why: statedDollarGap(a, r, at(10_000), 3) })).filter((r) => r.why !== null);
    expect(unexplained).toEqual([]);
  });

  // the check holds the gap to the claim: a row whose deal pays one shekel less at the exit for some other reason, or converts at a price a
  // shekel off its line, fails it even with the value moved to match
  const stated = shapes.flatMap(([, , a]) => {
    const rows = got.get(a.id);
    return rows ? differing(rows).map((r): [string, CustomBroker, Row] => [`${a.id} ${r.fund}`, a, r]) : [];
  });
  it("finds rows with the stated difference to hold to it", () => expect(stated.length).toBeGreaterThan(0));
  const shifted = (line: "trade" | "fx") => (row: ComparedProvider): ComparedProvider => {
    const exitIndex = row.run.series.at(-1)?.index ?? Number.NaN;
    return { ...row, run: { ...row.run, fees: { ...row.run.fees, [line]: row.run.fees[line] - 1 }, real: row.run.real + 1 / exitIndex } };
  };
  it.each(stated)("%s: a shekel off the trade fee at the exit, or off the conversion, fails the stated difference", (_name, a, r) => {
    expect(statedDollarGap(a, r, at(10_000), 3)).toBeNull();
    expect(statedDollarGap(a, r, at(10_000), 3, shifted("trade"))).toMatch(/^the trade fee's gap is/);
    expect(statedDollarGap(a, r, at(10_000), 3, shifted("fx"))).toMatch(/^the conversion's gap is/);
  });

  it.each(shapes)("%s, %s: the deal reads back as it was written", (_id, _, a) => {
    const { wrote, read } = readBack(a);
    expect(read).toEqual(wrote);
  });

  // the third stated difference: beside a typed minimum, a maximum in dollars stands at F-84's rate, so where it binds (a large first sum)
  // and the dollar rises, the deal pays less than the account priced it at each month's rate; with the dollar still, the two agree
  const banks = ["hapoalim", "yahav", "massad"].map((id): [string, CustomBroker] => [id, on(id, { tradeMin: 3 })]);
  const big = compare(banks.map((b) => b[1]), true, at(1_000_000), 3);
  const still = compare(banks.map((b) => b[1]), true, at(1_000_000), 0);
  it.each(banks)("%s: a typed minimum over a maximum in dollars leaves no less with the dollar rising, and the same with it still", (_id, a) => {
    const rows = differing(big.get(a.id)!).filter((r) => r.abroad);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.filter((r) => r.before === null || r.after === null || r.after < r.before)).toEqual([]);
    expect(differing(still.get(a.id)!).filter((r) => r.abroad)).toEqual([]);
  });
});
