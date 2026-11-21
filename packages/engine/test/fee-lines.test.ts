// The fee lines a plan charges and the plan with one removed (fees/materiality.ts): the re-run the provider workbench (F-63)
// prices each line's cost from.
import { describe, expect, it } from "vitest";
import { feeLines, withoutFeeLine, type RunPlan } from "../src/index.ts";

/** Golden S43's brokerage plan: a US fund bought in dollars through an Israeli broker. */
const s43: RunPlan = {
  run: "runSecurities",
  input: {
    goal: { amountNow: 100_000, monthly: 2_000, months: 60 },
    market: { grossReturn: 0.06, returnIn: "instrument", inflation: 0.025, fxChange: 0.01 },
    fund: { kind: "foreign-fund", domicile: "us", w8ben: true, drag: { management: 0.0003 }, halfSpread: 0.0002, distribution: { yield: 0.013, perYear: 4 } },
    tariff: {
      buy: { rate: 0.003, min: 25 },
      sell: { rate: 0.003, min: 25 },
      custody: { rate: 0.0015, everyMonths: 3 },
      fx: 0.0025,
      currency: { code: "USD", startRate: 3.107 },
    },
    broker: "israeli",
    profile: {},
  },
};

describe("fee lines and the plan without one", () => {
  it("lists the lines the plan charges, and removes one line while keeping the rest", () => {
    expect(feeLines(s43)).toEqual(["trade", "spread", "custody", "fund", "fx"]);
    const noFx = withoutFeeLine(s43, "fx");
    expect(noFx.run === "runSecurities" && noFx.input.tariff.fx).toBeUndefined();
    expect(noFx.run === "runSecurities" && noFx.input.tariff.custody).toBeDefined();
  });

  it("a line the plan lacks is an error", () => {
    expect(() => withoutFeeLine(s43, "manager")).toThrow(/manager/);
  });
});
