// Golden S56 (tests/golden/scenarios.md, steps in workings.md): the fee page (/fees) on the provident fund for investing, from the
// guide, runs P-05's example on Harel's binding documents: 0.7% of the balance and 0% of deposits for PF-13's five years, then the
// caps of PF-02, 1.05% and 4% (A-19, F-16, D83). The figures are tests/golden/expected_calc.py's (s56), computed apart from the
// engine; this test runs the site's own path and holds its F-61 figures and the headline to the shekel. The inputs are checked
// first, so a change of P-05 or of the record the page picks fails here instead of pinning another case.
import { describe, expect, it } from "vitest";
import { compareBundle } from "./compare.server";
import { buildFeesData } from "./fees.server";
import { buildFees, feeInputs } from "./fees";

const KGL = "kupat-gemel-lehashkaa";
const bundle = compareBundle();
const data = buildFeesData();
const inputs = feeInputs(bundle, null, { entered: {}, age: null, employment: null });
const r = buildFees(bundle, data, { kind: "wrapper", wrapperId: KGL }, inputs);
if (r.kind !== "ok") throw new Error(`fee page did not run: ${JSON.stringify(r)}`);
const an = r.analysis;
const line = (l: "deposit" | "balance") => an.lines.find((x) => x.line === l)!;

/** expected_calc.py s56, real NIS at month 120 after exit tax unless named otherwise. */
const golden = {
  withFees: 82303.22,
  withoutFees: 87525.89,
  depositCost: 1292.7,
  balanceCost: 3902.15,
  total: 5222.66,
  combined: 27.81,
  /** the chart's last point, before exit tax, and the note under the chart: how far it stands above the headline */
  chartEnd: 6563.55,
  exitGap: 1340.89,
};

/** To the nearest shekel. */
const shekel = (site: number, python: number) => expect(Math.abs(site - python)).toBeLessThan(0.5);

describe("golden S56: the fee page on Harel's provident fund for investing", () => {
  it("runs P-05's example: 10,000 now, 500 a month in today's money, 120 months, 7% gross, 2% inflation", () => {
    expect(r.subject.wrapperId).toBe(KGL);
    expect(inputs.fromGoal).toBe(false);
    expect(an.plan.run).toBe("runProvident");
    if (an.plan.run !== "runProvident") return;
    const p = an.plan.input;
    expect(p.wrapper).toBe(KGL);
    expect(p.goal.amountNow).toBe(10000);
    expect(p.goal.monthly).toBe(500);
    expect(p.goal.months).toBe(120);
    expect(p.goal.contributions ?? "real").toBe("real");
    expect(p.goal.firstMonth ?? 1).toBe(1);
    expect(p.market.grossReturn).toBeCloseTo(0.07, 12);
    expect(p.market.inflation).toBeCloseTo(0.02, 12);
    // the exit tax in the Python is the flat 25% of the real gain: no age (F-42 from 60), other income far below the surtax
    expect(p.profile.ageAtStart).toBeUndefined();
    expect(p.profile.annualIncome).toBe(144000);
    expect(p.existingBalance ?? 0).toBe(0);
    expect(p.depositsEvery).toBeUndefined();
  });

  it("on Harel's lines: 0.7% and 0% for 60 months, then 1.05% and 4%; no direct expenses", () => {
    expect(r.subject.record).toBe("Harel Pension and Gemel");
    for (const l of ["deposit", "balance"] as const) expect(line(l).rate?.source?.publisher).toBe("Harel Pension and Gemel");
    if (an.plan.run !== "runProvident") throw new Error("not a provident run");
    const f = an.plan.input.fees;
    expect(f.deposit).toBe(0);
    expect(f.balance).toBeCloseTo(0.007, 12);
    expect(f.direct).toBe(0);
    expect(f.discount!.months).toBe(60);
    expect(f.discount!.listRate).toBeCloseTo(0.0105, 12);
    expect(f.depositDiscount!.months).toBe(60);
    expect(f.depositDiscount!.listRate).toBeCloseTo(0.04, 12);
    expect(an.lines.map((l) => l.line).sort()).toEqual(["balance", "deposit"]);
  });

  it("the values with every fee and with none", () => {
    shekel(an.withFees.value as number, golden.withFees);
    shekel(an.withoutFees.value as number, golden.withoutFees);
  });

  it("F-61's four figures: the deposit fee's cost, the balance fee's cost, the total and the combined effect", () => {
    shekel(line("deposit").costNis, golden.depositCost);
    shekel(line("balance").costNis, golden.balanceCost);
    shekel(an.fm.total.value as number, golden.total);
    shekel(an.remainder.value as number, golden.combined);
  });

  it("the headline under the title is the total after exit tax; the chart ends before it, by the note's amount", () => {
    // fees.tsx passes an.total to FeeHeadline: "העמלות ב… יעלו לכם … ב־10 שנים, בכסף של היום"
    shekel(an.total.value as number, golden.total);
    shekel(an.series!.points.at(-1)!.total, golden.chartEnd);
    shekel(an.exitGap!.value as number, golden.exitGap);
  });
});
