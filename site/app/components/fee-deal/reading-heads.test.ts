// The reading's headlines and choices on the two picture deals read on 11.2026, and on the cases around them.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { feeDeal } from "../../copy";
import { ProvenanceProvider } from "../provenance";
import { ReadingCards } from "./reading";
import { feesData } from "../../lib/fees.server";
import { typed, type FeeDeal } from "../../lib/fee-deal/model";
import { readingOf, type LawRow } from "../../lib/fee-deal/reading";
import { curveChoices, curveGroups, curveHead, firstChoice, lawHead, periodChanges, periodsHead, spansOf, withConversion } from "./reading-heads";

const data = feesData();
const TODAY = "2026-11-12";

const account = (): FeeDeal => ({
  id: "deal-a",
  name: "",
  kind: "brokerage-account",
  held: { place: "abroad", currency: "USD", payout: "accumulating" },
  fees: [
    { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25), min: typed(15) } }] },
    { id: "fee-custody", kind: "custody", stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] },
    { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "free" }, until: "2027-03" }, { price: { form: "sum", amount: typed(10), every: 1 } }] },
    { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2) } }] },
    { id: "fee-fund", kind: "fund_management", stages: [{ price: { form: "held", rate: typed(0.07), per: 12, every: 12 } }] },
  ],
});

const provident = (): FeeDeal => ({
  id: "deal-p",
  name: "",
  kind: "kupat-gemel-lehashkaa",
  fees: [
    { id: "fee-balance", kind: "balance", stages: [{ price: { form: "held", rate: typed(0.6), per: 12, every: 1 }, until: "2028-03" }, { price: { form: "held", rate: typed(1.05), per: 12, every: 1 } }] },
    { id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) } }] },
  ],
});

describe("the periods' headline", () => {
  it("says two fees start after a free time in the account, and one rise at the cap in the provident fund", () => {
    const a = readingOf(account(), data.kinds, TODAY, data.fx);
    expect(periodChanges(a.periods).map((c) => [c.at, c.fee.kind, c.change])).toEqual([
      ["2027-03", "fixed_period", "starts"],
      ["2028-03", "custody", "starts"],
    ]);
    expect(periodsHead(a.periods)).toEqual({ kind: "starts", n: 2 });
    const p = readingOf(provident(), data.kinds, TODAY, data.fx);
    expect(periodsHead(p.periods)).toMatchObject({ kind: "one", change: { at: "2028-03", change: "rises", cap: "at", fee: { kind: "balance" } } });
  });
  it("names the months where the changes are of several kinds, and the month where they all fall in one", () => {
    const d = account();
    d.fees[0]!.stages = [{ price: { form: "action", rate: typed(0.25), min: typed(15) }, until: "2027-03" }, { price: { form: "action", rate: typed(0.3), min: typed(15) } }];
    expect(periodsHead(readingOf(d, data.kinds, TODAY, data.fx).periods)).toEqual({ kind: "months", months: ["2027-03", "2028-03"], n: 2 });
    d.fees[1]!.stages[0]!.until = "2027-03";
    expect(periodsHead(readingOf(d, data.kinds, TODAY, data.fx).periods)).toEqual({ kind: "one-month", at: "2027-03", n: 3 });
    expect(periodsHead(readingOf({ ...d, fees: [d.fees[3]!] }, data.kinds, TODAY, data.fx).periods)).toBeNull();
  });
});

describe("the curves", () => {
  it("groups a purchase or sale before holding, opens on today, and offers a choice only where the curves differ by period", () => {
    const r = readingOf(account(), data.kinds, TODAY, data.fx);
    const groups = curveGroups(r);
    expect(groups.map((g) => g.key)).toEqual(["action:trade:all", "held::all"]);
    const trade = curveChoices(groups[0]!, r.periods);
    expect(new Set(trade.map((c) => c.curve)).size).toBe(1);
    expect(firstChoice(trade, "2026-11")).toBe("2026-11");
    const held = curveChoices(groups[1]!, r.periods);
    expect(held.map((c) => c.from)).toEqual(["2028-03"]);
    expect(firstChoice(held, "2026-11")).toBe("2028-03");
  });
  it("says where the minimum binds on a trade with a conversion, and where the sums stop being the larger cost of holding", () => {
    const r = readingOf(account(), data.kinds, TODAY, data.fx);
    const [trade, held] = curveGroups(r);
    expect(curveHead(trade!.curves[0]!)).toMatchObject({ kind: "min", mark: { kind: "min", fee: { kind: "trade" } } });
    expect(withConversion(trade!.curves[0]!)).toBe(true);
    expect(curveHead(held!.curves[0]!)).toMatchObject({ kind: "meet" });
    expect(withConversion(held!.curves[0]!)).toBe(false);
  });
  it("says a minimum and a maximum together, and counts the sums where several bounds bind", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1), min: typed(10), max: typed(50) } }] }];
    const one = curveGroups(readingOf(d, data.kinds, TODAY, data.fx))[0]!.curves[0]!;
    expect(curveHead(one)).toMatchObject({ kind: "min-max", min: { kind: "min" }, max: { kind: "max" } });
    d.fees.push({ id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2), min: typed(5) } }] });
    const two = curveGroups(readingOf(d, data.kinds, TODAY, data.fx))[0]!.curves[0]!;
    expect(curveHead(two)).toEqual({ kind: "marks", n: 3 });
  });
  it("puts a curve it cannot draw in its group", () => {
    const d = account();
    d.fees[0]!.stages[0]!.price = { form: "action", rate: typed(0.1), min: typed(7), currency: "USD" };
    const groups = curveGroups(readingOf(d, data.kinds, TODAY, null));
    expect(groups[0]).toMatchObject({ key: "action:trade:all", curves: [], undrawn: [{ currency: "USD" }] });
  });
});

describe("the stretches a statement holds in", () => {
  const periods = [
    { from: "2026-11", to: "2027-03" },
    { from: "2027-03", to: "2028-03" },
    { from: "2028-03", to: null },
  ];
  it("says nothing where it holds throughout, and from and until where it holds in some periods", () => {
    expect(spansOf(["2026-11", "2027-03", "2028-03"], periods)).toEqual([]);
    expect(spansOf(["2028-03"], periods)).toEqual([{ from: "2028-03", to: null }]);
    expect(spansOf(["2026-11"], periods)).toEqual([{ from: null, to: "2027-03" }]);
    expect(spansOf(["2026-11", "2028-03"], periods)).toEqual([
      { from: null, to: "2027-03" },
      { from: "2028-03", to: null },
    ]);
  });
});

describe("the law's headline", () => {
  it("says a fee reaches the cap in the provident fund, and that no fee of the account has a cap", () => {
    expect(lawHead(readingOf(provident(), data.kinds, TODAY, data.fx).law)).toEqual({ kind: "at", n: 1 });
    expect(lawHead(readingOf(account(), data.kinds, TODAY, data.fx).law)).toEqual({ kind: "no-cap", n: 4 });
    expect(lawHead([])).toBeNull();
  });
  it("puts a price above the cap first, then all below, then nothing judged", () => {
    const d = provident();
    d.fees[1]!.stages[0]!.price = { form: "action", rate: typed(9) };
    expect(lawHead(readingOf(d, data.kinds, TODAY, data.fx).law)).toEqual({ kind: "above", n: 1 });
    const below = provident();
    below.fees[0]!.stages = [{ price: { form: "held", rate: typed(0.6), per: 12, every: 1 } }];
    expect(lawHead(readingOf(below, data.kinds, TODAY, data.fx).law)).toEqual({ kind: "below" });
    const rows: LawRow[] = [{ fee: "x", kind: "transfer_out", cap: { state: "value", value: { value: 10 } as never, binds: "banks", ruleIds: [] }, prices: [] }];
    expect(lawHead(rows)).toEqual({ kind: "not-judged" });
  });
});

describe("the reading on screen", () => {
  const draw = (deal: FeeDeal) => {
    const reading = readingOf(deal, data.kinds, TODAY, data.fx);
    const provenance = { rules: {}, terms: {}, dimensions: {}, today: TODAY };
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: provenance, children: createElement(ReadingCards, { reading, saved: deal.kind !== "brokerage-account", fx: data.fx }) })));
    return html.replace(/<[^>]+>/g, "").replace(/[\u2066-\u2069\u200e\u200f]/g, "");
  };
  it("reads the account: three periods, today's marked, the two curves, the points and that no fee has a cap", () => {
    const text = draw(account());
    const r = feeDeal.read;
    expect(text).toContain(r.periods.kicker);
    expect(text).toContain("שתי עמלות מתחילות אחרי תקופת פטור");
    expect(text).toContain(r.periods.here);
    expect(text).toContain(r.curves.kicker.trade);
    expect(text).toContain(r.curves.kicker.held);
    expect(text).toContain(r.curves.conversion);
    expect(text).toContain(r.points.title);
    expect(text).toContain("לעמלות שבעסקה אין תקרה בחוק");
  });
  it("reads the provident fund: two periods with the rise to the cap, no curve, the monthly charge, and the law rows", () => {
    const text = draw(provident());
    expect(text).toContain("עד התקרה");
    expect(text).toContain("עמלה אחת מגיעה למקסימום שמותר לגבות");
    expect(text).not.toContain(feeDeal.read.curves.kicker.held);
    // the fee on the savings is a yearly rate charged each month: the one point the library states
    expect(text).toContain("נגבה כל חודש: חלק אחד מ־12 בכל פעם.");
  });
});
