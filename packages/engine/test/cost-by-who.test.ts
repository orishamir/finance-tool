// F-91: a way's cost by who takes it adds up to X − left, and the tax helper divides by I_T.
import { describe, expect, it } from "vitest";
import { costByWho, taxReal, beforeTax, type RunResult } from "../src/index.ts";

const run = (over: Partial<RunResult>): RunResult =>
  ({ exitMonth: 12, nominal: 110, real: 100, paidIn: 0, fees: {}, taxDuring: 0, taxAtExit: 0, series: [{ month: 12, index: 1.1, paidIn: 0, balance: 0, fees: 0, taxDuring: 0 }], detail: {}, flags: [], labels: [], outcome: { code: "eligible" }, formulas: [], rules: [], ...over }) as RunResult;

describe("F-91", () => {
  it("the state is what remains, so the three parts add up to X − left", () => {
    const p = costByWho({ base: 93_367.85, left: 86_492.15, account: 1_056.85, fund: 115.54 });
    expect(p.account + p.fund + p.state).toBeCloseTo(93_367.85 - 86_492.15, 9);
    expect(p.state).toBeCloseTo(5_703.31, 2);
  });

  it("tax is divided by the index at the exit, also when the value left is nothing", () => {
    expect(taxReal(run({ taxDuring: 11, taxAtExit: 22 }))).toBeCloseTo(30, 9);
    expect(taxReal(run({ nominal: 0, real: 0, taxDuring: 11 }))).toBeCloseTo(10, 9);
    expect(beforeTax(run({ taxAtExit: 22 }))).toBeCloseTo(120, 9);
  });
});
