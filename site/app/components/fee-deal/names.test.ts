// The value sheet names every input of a deal's reading, however many fees of one kind the deal holds (values.ts, `inputKey`), and the
// rate a curve converts a bound in another currency at (reading.ts, `rateKey`).
import { describe, expect, it } from "vitest";
import { inputName } from "../provenance-sheets";
import { feesData } from "../../lib/fees.server";
import { BOUND_CURRENCIES, newDeal, typed, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { readDealFor } from "../../lib/fee-deal/parts";
import { rateKey, readingOf } from "../../lib/fee-deal/reading";
import { inputKey } from "../../lib/fee-deal/values";
import { feeName } from "./words";

describe("a deal's input names", () => {
  it("names the fifth custody fee of a deal, its bounds and its yearly figure, by the fee's name and its number", () => {
    const fees: Fee[] = Array.from({ length: 5 }, (_, k) => ({ id: `fee-${k}`, kind: "custody", stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 12 } }] }));
    const name = feeName("custody");
    expect(inputName(inputKey(fees, 0))).toBe(`${name} 1`);
    expect(inputName(inputKey(fees, 4))).toBe(`${name} 5`);
    expect(inputName(inputKey(fees, 4, "min"))).toBe(`${name} 5: המינימום`);
    expect(inputName(inputKey(fees, 4, "yearly"))).toBe(`${name} 5, בשנה`);
    expect(inputName(inputKey(fees.slice(0, 1), 0, "max"))).toBe(`${name}: המקסימום`);
  });
  it("names every input of every curve, the rate of each currency a bound may be typed in among them", () => {
    const data = feesData();
    const deal: FeeDeal = {
      ...newDeal("brokerage-account"),
      held: { place: "abroad", currency: "USD", payout: "accumulating" },
      fees: [
        { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.1), min: typed(7), currency: "USD" } }] },
        { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2), max: typed(20), currency: "EUR" } }] },
        { id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.1), per: 12, every: 3, min: typed(10) } }] },
        { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(10), every: 1 } }] },
      ],
    };
    const r = readingOf(readDealFor(deal, data.kinds, "2026-11-12"), data.fx);
    const keys = r.curves.flatMap((c) => Object.keys(c.inputs));
    expect(keys.length).toBeGreaterThan(0);
    if (data.fx) expect(keys).toContain(rateKey("USD"));
    for (const k of keys) expect(inputName(k), k).not.toBe(k);
    for (const code of BOUND_CURRENCIES.filter((c) => c !== "ILS")) expect(inputName(rateKey(code)), code).not.toBe(rateKey(code));
  });
  it("leaves a key that is no deal's as written", () => {
    expect(inputName("rate 1")).toBe("rate 1");
    expect(inputName("deal:nothing 2")).toBe("deal:nothing 2");
  });
});
