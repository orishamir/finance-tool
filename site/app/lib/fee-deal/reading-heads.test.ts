// The reading's headlines and choices on the two picture deals read on 11.2026, and on the cases around them.
import { describe, expect, it } from "vitest";
import { feesData } from "../fees.server";
import type { FxSnapshot } from "../fx";
import { typed, type FeeDeal } from "./model";
import { readDealFor } from "./deal-read";
import { readingOf, type LawRow } from "./reading";
import { lawHead, periodChanges, periodsHead } from "./reading-heads";

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
