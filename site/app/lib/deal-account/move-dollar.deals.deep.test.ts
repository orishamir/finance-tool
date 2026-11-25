// A typed account built on a house moved into a deal (method §10.4), with the dollar moving (A-03 = +3% a year over 20 years), on every index
// the page prices: on the deal's terms it leaves what it left before on every fund, to the shekel (exceptions-fixtures.ts). move.test.ts runs
// a slice of this on a few indices.
import { describe, expect, it } from "vitest";
import type { CustomBroker } from "../custom-entries";
import type { WorkbenchInputs } from "../providers";
import { indexById, pairRow } from "../invest";
import { dealProviderId } from "./bundle";
import { movedDealId } from "./move";
import { compare, differing, fig, houses, movedBundle, on, plan, readBack, type Row } from "./move-fixtures";

/**
 * Method §10.4, the third stated difference: beside a typed minimum, a price's sum per unit in dollars stands at F-84's rate in the deal, so
 * where the dollar rises and the sum binds, the deal pays less than the account priced it at each month's rate. At this plan it binds only at
 * the exit sale of a cheap unit held many years (MSCI ACWI's US fund at about $156: some 174 units sold). For such a row, what must hold
 * exactly, or the reason it does not: every month before the exit charged the same; every line but the trade fee and the conversion of the
 * sale's proceeds (which the commission lessens, so it moves the other way by the commission's gap at the conversion's rate) the same; the gap all the trade fee's, at the exit; and the trade fee's gap what a sum per
 * unit gives at the exit's rate against the start's, above the typed minimum.
 */
function statedDollarGap(a: CustomBroker, r: Row, p: WorkbenchInputs, fxChange: number): string | null {
  if (!r.abroad || r.before === null || r.after === null || r.after <= r.before) return "not a row abroad where the deal leaves more";
  const both = movedBundle([a], true);
  const index = indexById(both, r.ix);
  if (!index) return `no index ${r.ix}`;
  const args = { bundle: both, index, plan: p, fundId: r.fund, fxChange };
  const before = pairRow({ ...args, providerId: a.id });
  const after = pairRow({ ...args, providerId: dealProviderId(movedDealId(a.id)) });
  if (!before || !after) return "a side has no run";
  // each comparison is written so that a NaN fails it (`!(x <= bound)`)
  if (before.run.series.length !== after.run.series.length) return "the two runs have different months";
  const months = before.run.series.map((x, m) => Math.abs(x.fees - (after.run.series[m]?.fees ?? Number.NaN)));
  if (!months.every((d) => d <= 1e-6)) return "a month before the exit charged differently";
  const lines = Object.keys(before.run.fees).filter((k) => k !== "trade" && k !== "fx" && !(Math.abs(before.run.fees[k as keyof typeof before.run.fees] - after.run.fees[k as keyof typeof after.run.fees]) <= 0.01));
  if (lines.length) return `lines other than the trade fee differ: ${lines.join(", ")}`;
  const trade = before.run.fees.trade - after.run.fees.trade;
  const fx = before.run.fees.fx - after.run.fees.fx;
  const exitIndex = before.run.series.at(-1)?.index ?? Number.NaN;
  // the sale's proceeds are converted after its commission, so the conversion moves the other way by the commission's gap at the rate the
  // account converts at (a price list's line or a deal's, some houses' rate outside `tariff.fx`): at most 1% of it on every list
  if (!(trade > 0 && fx <= 1e-6 && -fx <= 0.01 * trade)) return `the trade fee's gap is ${trade}, the conversion's ${fx}`;
  if (!(Math.abs(after.run.real - before.run.real - (trade + fx) / exitIndex) <= 0.01 && Math.abs(after.run.taxAtExit - before.run.taxAtExit) <= 1e-6)) return `the gap is not the exit's fees alone: ${after.run.real - before.run.real} against ${(trade + fx) / exitIndex}, tax ${before.run.taxAtExit} ${after.run.taxAtExit}`;
  const sell = before.tariff.sell;
  const start = before.tariff.currency?.startRate;
  const perShare = sell?.perShare;
  const min = sell?.min;
  if (!perShare || sell.in !== "instrument" || sell.sumIn?.min !== "nis" || min === undefined || start === undefined) return "the sale's price has no sum per unit in dollars beside a minimum in shekels";
  // the sale's units n: the account paid n × perShare at the exit's rate, the deal the larger of the minimum and n × perShare at the start's
  const atExit = start * Math.pow(1 + fxChange / 100, before.run.exitMonth / 12);
  const atMin = (trade + min) / (perShare * atExit);
  const above = trade / (perShare * (atExit - start));
  const fits = (n: number, dealAtMin: boolean) => n > 0 && n * perShare * atExit >= min && (dealAtMin ? n * perShare * start <= min : n * perShare * start >= min);
  return fits(atMin, true) || fits(above, false) ? null : "the trade fee's gap is not a sum per unit binding at the exit's rate";
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
