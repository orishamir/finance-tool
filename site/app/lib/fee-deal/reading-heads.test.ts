// The reading's headlines and choices on the two picture deals read on 11.2026, and on the cases around them.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import type { FxSnapshot } from "../fx";
import { typed, type FeeDeal } from "./model";
import { readDealFor } from "./parts";
import { readingOf, type LawRow } from "./reading";
import type { MarkView } from "./parts";
import { curveChoices, curveGroups, curveHead, firstChoice, lawHead, periodChanges, periodsHead, spansOf, withConversion } from "./reading-heads";

const data = feesData();
const TODAY = "2026-11-12";
const readOn = (deal: FeeDeal, fx: FxSnapshot | null) => readingOf(readDealFor(deal, data.kinds, TODAY), fx);

const account = (): FeeDeal => ({
  id: "deal-a",
  name: "",
  kind: "brokerage-account",
  readFor: [{ by: "what", is: "us" }],
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
    const a = readOn(account(), data.fx);
    expect(periodChanges(a.periods).map((c) => [c.at, c.fee.kind, c.change])).toEqual([
      ["2027-03", "fixed_period", "starts"],
      ["2028-03", "custody", "starts"],
    ]);
    expect(periodsHead(a.periods)).toEqual({ kind: "starts", n: 2 });
    const p = readOn(provident(), data.fx);
    expect(periodsHead(p.periods)).toMatchObject({ kind: "one", change: { at: "2028-03", change: "rises", cap: "at", fee: { kind: "balance" } } });
  });
  it("names the months where the changes are of several kinds, and the month where they all fall in one", () => {
    const d = account();
    d.fees[0]!.stages = [{ price: { form: "action", rate: typed(0.25), min: typed(15) }, until: "2027-03" }, { price: { form: "action", rate: typed(0.3), min: typed(15) } }];
    expect(periodsHead(readOn(d, data.fx).periods)).toEqual({ kind: "months", months: ["2027-03", "2028-03"], n: 2 });
    d.fees[1]!.stages![0]!.until = "2027-03";
    expect(periodsHead(readOn(d, data.fx).periods)).toEqual({ kind: "one-month", at: "2027-03", n: 3 });
    expect(periodsHead(readOn({ ...d, fees: [d.fees[3]!] }, data.fx).periods)).toBeNull();
  });
});

describe("the curves", () => {
  it("groups a purchase or sale before holding, opens on today, and offers a choice only where the curves differ by period", () => {
    const r = readOn(account(), data.fx);
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
    const r = readOn(account(), data.fx);
    const [trade, held] = curveGroups(r);
    expect(curveHead(trade!.curves[0]!)).toMatchObject({ kind: "min", mark: { kind: "min", fee: { kind: "trade" } } });
    expect(withConversion(trade!.curves[0]!)).toBe(true);
    expect(curveHead(held!.curves[0]!)).toMatchObject({ kind: "meet" });
    expect(withConversion(held!.curves[0]!)).toBe(false);
  });
  it("says a minimum and a maximum together, and counts the sums where several bounds bind", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1), min: typed(10), max: typed(50) } }] }];
    const one = curveGroups(readOn(d, data.fx))[0]!.curves[0]!;
    expect(curveHead(one)).toMatchObject({ kind: "min-max", min: { kind: "min" }, max: { kind: "max" } });
    d.fees.push({ id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2), min: typed(5) } }] });
    const two = curveGroups(readOn(d, data.fx))[0]!.curves[0]!;
    expect(curveHead(two)).toEqual({ kind: "marks", n: 3 });
  });
  it("gives the rate above a minimum only where the curve's fees are their whole group (F-111)", () => {
    const d = account();
    d.fees = [{ id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.2), per: 12, every: 12, min: typed(50) } }] }];
    const alone = curveGroups(readOn(d, data.fx)).find((g) => g.key === "held::all")!.curves[0]!;
    expect(curveHead(alone)).toMatchObject({ kind: "min", rate: { value: 0.2 } });
    // a sum per period on the same curve is not a share: the curve is no longer its group alone, and no rate is said
    d.fees.push({ id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(1), every: 1 } }] });
    const withSum = curveGroups(readOn(d, data.fx)).find((g) => g.key === "held::all")!.curves.find((c) => c.marks.some((m) => m.kind === "min"))!;
    expect(withSum.rate).toBeUndefined();
  });
  it("calls the sums the largest cost of holding only where every other share costs no more below the meeting value (F-112)", () => {
    const meetOf = (d: FeeDeal) => curveGroups(readOn(d, data.fx)).find((g) => g.key === "held::all")!.curves[0]!.marks.find((m) => m.kind === "meet") as Extract<MarkView, { kind: "meet" }>;
    const d = account();
    d.fees = [
      { id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 12 } }] },
      { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(10), every: 1 } }] },
    ];
    expect(meetOf(d)).toMatchObject({ amount: { value: 120000 }, largest: true });
    // a fund's own fee of 0.5%: 600 ₪ a year at 120,000 ₪ against 120 ₪ of sums, and 500 ₪ against 120 ₪ at 100,000 ₪
    d.fees.push({ id: "fee-fund", kind: "fund_management", stages: [{ price: { form: "held", rate: typed(0.5), per: 12, every: 12 } }] });
    expect(meetOf(d)).toMatchObject({ amount: { value: 120000 }, largest: false });
    // a small one stays below the sums at that value: 0.05% is 60 ₪ a year at 120,000 ₪
    d.fees[2]!.stages![0]!.price = { form: "held", rate: typed(0.05), per: 12, every: 12 };
    expect(meetOf(d).largest).toBe(true);
  });
  it("puts a curve it cannot draw in its group", () => {
    const d = account();
    d.fees[0]!.stages![0]!.price = { form: "action", rate: typed(0.1), min: typed(7), currency: "USD" };
    const groups = curveGroups(readOn(d, null));
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
    expect(lawHead(readOn(provident(), data.fx).law)).toEqual({ kind: "at", n: 1 });
    expect(lawHead(readOn(account(), data.fx).law)).toEqual({ kind: "no-cap", n: 4 });
    expect(lawHead([])).toBeNull();
  });
  it("puts a price above the cap first, then all below, then nothing judged", () => {
    const d = provident();
    d.fees[1]!.stages![0]!.price = { form: "action", rate: typed(9) };
    expect(lawHead(readOn(d, data.fx).law)).toEqual({ kind: "above", n: 1 });
    const below = provident();
    below.fees[0]!.stages = [{ price: { form: "held", rate: typed(0.6), per: 12, every: 1 } }];
    expect(lawHead(readOn(below, data.fx).law)).toEqual({ kind: "below" });
    const rows: LawRow[] = [{ fee: "x", kind: "transfer_out", cap: { state: "value", value: { value: 10 } as never, binds: "banks", ruleIds: [] }, prices: [] }];
    expect(lawHead(rows)).toEqual({ kind: "not-judged" });
  });
});
