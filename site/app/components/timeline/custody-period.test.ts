// A custody rate charged per period names its period ("0.03% ברבעון"): a bare rate read as a year's (F-14).
import { describe, expect, it } from "vitest";
import { custodyPeriodWord } from "./Timeline";
import type { Bundle } from "../../lib/engine";

const bundle = (everyMonths?: number) => ({ terms: everyMonths ? { tariff: { custody: { rate: 0.0003, everyMonths } } } : {} }) as unknown as Pick<Bundle, "terms">;

describe("the custody line's period word", () => {
  it("follows the rate and a bound printed per period, by the months in the period", () => {
    expect(custodyPeriodWord(bundle(3), "custodyRate", { unit: "pct_of_balance_per_period", value: 0.03 })).toBe("ברבעון");
    expect(custodyPeriodWord(bundle(12), "custodyRate", { unit: "pct_of_balance_per_period", value: 0.1 })).toBe("בשנה");
    expect(custodyPeriodWord(bundle(3), "custodyMin", { unit: "nis", value: 15 })).toBe("ברבעון");
  });
  it("not after a zero rate, a bound per month, another figure, or with no custody line", () => {
    expect(custodyPeriodWord(bundle(12), "custodyRate", { unit: "pct_of_balance_per_period", value: 0 })).toBeNull();
    expect(custodyPeriodWord(bundle(3), "custodyMin", { unit: "nis_per_month", value: 5 })).toBeNull();
    expect(custodyPeriodWord(bundle(3), "tradeRate", { unit: "pct_of_trade", value: 0.1 })).toBeNull();
    expect(custodyPeriodWord(bundle(), "custodyRate", { unit: "pct_of_balance_per_period", value: 0.03 })).toBeNull();
  });
});
