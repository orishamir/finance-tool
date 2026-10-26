// D29, second wave: the study fund, the provident fund for investing and the pensions. Every figure equals an engine run; the holding
// on each side is the same index; a gap is a gap, never a number.
import { describe, expect, it } from "vitest";
import { runInputs, runPlanned } from "@finance-tool/engine";
import { buildGuidePage } from "./guide.server";
import { fact } from "./guide-signature";
import { paidInToday } from "./engine";
import { entered as enteredValue } from "./value";
import { hishtalmutModel, hishtalmutTerms, pensionModel, providentModel, runWith } from "./guide-signature-g2";
import { signatureRegistry } from "../components/guide-signature";
import { guideSignature as copy } from "../copy";

const page = (id: string) => buildGuidePage(id)!;
const entered = (amount_now: number, monthly_deposit: number) => ({ amount_now, monthly_deposit });

describe("the pages have their visuals", () => {
  it("registers each page with its copy", () => {
    for (const id of ["keren-hishtalmut", "kupat-gemel-lehashkaa", "pension-comprehensive", "pension-general", "provident-for-annuity"]) {
      expect(signatureRegistry[id], id).toBeDefined();
      expect(copy.pages[id], id).toBeDefined();
      expect(page(id).signature, id).not.toBeNull();
    }
  });
});

describe("study fund", () => {
  const d = page("keren-hishtalmut").signature!;
  it("holds the same index as the brokerage account's fund, from the catalogue and the regulator's track", () => {
    expect(fact(d, "indexName")!.value).toBe("מדד S&P 500");
    expect(fact(d, "trackNumber")!.value).toBe("13245");
    expect(String(fact(d, "trackName")!.value)).toContain("S&P");
    expect(fact(d, "fundNumber")!.value).toBe("5139282");
    expect(fact(d, "trackFee")!.value).toBe(0.54);
    // the page's own run (P-05 track 880, a general track) is not the holding: the bundle carries the index track's fee
    expect(d.bundles["keren-hishtalmut"]!.terms.fees!.balance).toBeCloseTo(0.0054, 10);
    expect(Number(fact(d, "rangeMin")!.value)).toBeLessThan(Number(fact(d, "rangeMax")!.value));
  });
  it("is the engine's run: an employee's gain after the lock, the early withdrawal before it", () => {
    const b = d.bundles["keren-hishtalmut"]!;
    const m = hishtalmutModel(d, { amount: 10000, monthly: 500, years: 8, employment: "employee", income: 12000 });
    const plan = runInputs(b.record, [b.p05], hishtalmutTerms(b, { employment: "employee", income: 12000, early: false }), { profile: { annualIncome: 144000 }, scenarioIncome: true });
    const run = runPlanned({ ...plan, input: { ...plan.input, goal: { ...plan.input.goal, months: 96 } } } as typeof plan, { rules: b.rules, runDate: b.runDate });
    expect(m.early).toBe(false);
    expect(m.study!.net).toBe(run.real);
    // what was paid in is in today's money deposit by deposit (F-06), not the whole sum over the last month's index
    const lastIndex = run.series[run.series.length - 1]!.index;
    expect(m.study!.paidIn).toBe(paidInToday(run, 10000));
    expect(m.study!.paidIn).toBeGreaterThan(run.paidIn / lastIndex);
    expect(m.study!.gain).toBeCloseTo(run.real - paidInToday(run, 10000), 9);
    // the amount now counts in full and each month's deposit at its own index: 10,000 plus 96 deposits of 500 in today's money
    expect(m.study!.paidIn).toBeCloseTo(10000 + 96 * 500, -1);
    expect(m.study!.tax).toBeGreaterThan(0); // the part above the benefited deposit is taxed at exit (TXH-11)
    expect(m.diff).toBeCloseTo(m.study!.gain - m.broker!.gain, 9);
    // an employee's benefited deposit is 2.5% of the determining salary a month (TXH-08, TXH-02): 300 of 500
    expect(m.benefitedMonthly).toBeCloseTo(300, 9);
    expect(m.excessMonthly).toBeCloseTo(200, 9);

    const early = hishtalmutModel(d, { amount: 10000, monthly: 500, years: 3, employment: "employee", income: 12000 });
    expect(early.early).toBe(true);
    expect(early.studyGap).toBeNull();
    expect(early.study!.tax).toBeGreaterThan(0);
    expect(early.study!.run.detail.earlyGains).toBeGreaterThan(0); // F-47 ran
  });
  it("gives a self-employed person no number before the lock ends (TXH-07 is not in the engine) and the deduction after it", () => {
    const early = hishtalmutModel(d, { amount: 10000, monthly: 500, years: 3, employment: "self-employed", income: 12000 });
    expect(early.study).toBeNull();
    expect(early.studyGap).toBe("self-employed-early");
    expect(early.diff).toBeNull();
    expect(d.gaps).toContain("selfEmployedEarly");
    const late = hishtalmutModel(d, { amount: 10000, monthly: 500, years: 8, employment: "self-employed", income: 12000 });
    expect(late.study!.tax).toBe(0);
    expect(late.reliefTotal!).toBeGreaterThan(0);
    expect(late.deductionCap).toBeCloseTo(0.045 * 144000, 6); // TXH-05: 4.5% of the income, under its ceiling
    expect(late.diff!).toBeGreaterThan(0);
  });
  it("shows how far the difference moves with the broker and the manager (rule 3)", () => {
    const m = hishtalmutModel(d, { amount: 10000, monthly: 500, years: 8, employment: "employee", income: 12000 });
    expect(m.range.broker!.low).toBeLessThanOrEqual(m.diff!);
    expect(m.range.broker!.high).toBeGreaterThanOrEqual(m.diff!);
    expect(m.range.broker!.high).toBeGreaterThan(m.range.broker!.low);
    expect(m.range.manager!.low).toBeLessThanOrEqual(m.diff!);
    expect(m.range.manager!.high).toBeGreaterThanOrEqual(m.diff!);
    // the cheapest manager leaves more than the dearest
    const best = runWith(d.bundles["brokerage-best"]!, entered(10000, 500), 96)!;
    const worst = runWith(d.bundles["brokerage-worst"]!, entered(10000, 500), 96)!;
    expect(best.real).toBeGreaterThan(worst.real);
  });
});

describe("provident fund for investing", () => {
  const d = page("kupat-gemel-lehashkaa").signature!;
  it("holds the manager's track on the same index", () => {
    expect(fact(d, "trackNumber")!.value).toBe("13259");
    expect(String(fact(d, "trackName")!.value)).toContain("S&P");
    expect(fact(d, "trackFee")!.value).toBe(0.6);
    expect(d.bundles["kupat-gemel-lehashkaa"]!.terms.fees!.balance).toBeCloseTo(0.006, 10);
  });
  it("takes a lump sum at 25% of the real gain at any age (TXK-05 to TXK-07) and opens the annuity from the early retirement age (TXK-10)", () => {
    const m = providentModel(d, { amount: 10000, monthly: 500, years: 10, age: 30 });
    expect(m.lump!.tax).toBeCloseTo(0.25 * m.realGain!, 6);
    expect(m.lump!.net).toBeGreaterThan(0);
    expect(m.alt!.tax).toBeGreaterThan(0);
    expect(m.annuityOpen).toBe(false);
    expect(m.ageAtExit).toBe(40);
    expect(providentModel(d, { amount: 10000, monthly: 500, years: 30, age: 30 }).annuityOpen).toBe(true);
    expect(providentModel(d, { amount: 10000, monthly: 500, years: 10, age: null }).annuityOpen).toBeNull();
    // 2026-10-26 (F-44 with F-42, TXK-06): from 60 the reduced brackets apply first, so at 65 the same lump sum pays less tax than at 40;
    // the brokerage side gets the same profile, so both sides carry the relief
    const old = providentModel(d, { amount: 10000, monthly: 500, years: 10, age: 55 });
    expect(old.lump!.tax).toBeLessThan(0.25 * old.realGain! - 1e-6);
    expect(old.lump!.net).toBeGreaterThan(m.lump!.net);
    expect(old.broker!.tax).toBeLessThan(m.broker!.tax);
    // the visual reads the age-60 case off the run itself, and the figures carry that run's rules and flags (review 2026-10-26)
    expect(old.lump!.run.formulas).toContain("F-42");
    expect(m.lump!.run.formulas).not.toContain("F-42");
    expect(old.lump!.run.rules.map((r) => r.id)).toEqual(expect.arrayContaining(["TXG-04", "TXG-07", "TXK-26"]));
    expect(old.lump!.run.flags.map((f) => f.code)).toContain("TXK-26");
    expect(old.lump!.run.flags.map((f) => f.code)).not.toContain("G-21");
    // the balance that moves to an annuity fund is the gross balance, before the lump-sum tax
    expect(m.transfer!).toBeGreaterThan(m.lump!.net);
    expect(m.diff).toBeCloseTo(m.lump!.gain - m.broker!.gain, 9);
    expect(m.range.broker!.high).toBeGreaterThan(m.range.broker!.low);
    expect(d.gaps).toContain("annuityFactors");
  });
  it("notes deposits above the yearly ceiling (KGL-03)", () => {
    expect(providentModel(d, { amount: 10000, monthly: 500, years: 5, age: null }).overCeiling).toBe(false);
    expect(providentModel(d, { amount: 10000, monthly: 9000, years: 5, age: null }).overCeiling).toBe(true);
  });
});

describe("pensions", () => {
  const general = page("pension-general").signature!;
  it("splits the deposit at the legal minimum rates on the insured wage (PEN-03, PEN-04)", () => {
    const m = pensionModel(general, "pension-general", { salary: 12000, years: 10, insurancePct: null })!;
    expect(m.wage).toBe(12000);
    expect(m.you).toBeCloseTo(720, 9);
    expect(m.employer).toBeCloseTo(780, 9);
    expect(m.severance).toBeCloseTo(720, 9);
    expect(m.total).toBeCloseTo(2220, 9);
    const high = pensionModel(general, "pension-general", { salary: 30000, years: 10, insurancePct: null })!;
    expect(high.wage).toBe(Number(fact(general, "avgWage")!.value));
    expect(high.you).toBeCloseTo(0.06 * high.wage, 9);
  });
  it("returns the credit on the person's own part, by F-31 below the beneficiary threshold and F-32 above it (TXP-01 to TXP-04)", () => {
    const low = pensionModel(general, "pension-general", { salary: 8000, years: 10, insurancePct: null })!;
    expect(low.relief.beneficiary).toBe(false);
    expect(low.relief.formula).toBe("F-31");
    expect(low.relief.monthly).toBeCloseTo(0.35 * low.you, 9); // under the credited cap: 35% of what was paid
    const mid = pensionModel(general, "pension-general", { salary: 12000, years: 10, insurancePct: null })!;
    expect(mid.relief.beneficiary).toBe(true); // 26,640 a year of deposits reach the 26,436 threshold
    expect(mid.relief.formula).toBe("F-32");
    expect(mid.relief.monthly).toBeCloseTo((0.35 * 0.07 * 116400) / 12, 6); // credited up to 7% of the eligible income (TXP-02)
    expect(mid.netYou).toBeCloseTo(mid.you - mid.relief.monthly, 9);
  });
  it("lets the engine's F-30 find the same gross deposit, so the balance is the ledger's", () => {
    const b = general.bundles["pension-general"]!;
    const m = pensionModel(general, "pension-general", { salary: 12000, years: 10, insurancePct: 0.3 })!;
    const plan = runInputs(
      b.record,
      [b.p05],
      { ...b.terms, pension: { employment: "employee", monthlySalary: 12000, existingEmployeeRate: 0, employer: { pensionRate: 0.065, severanceRate: 0.06 } }, insurance: { rate: 0.003 } },
      { entered: { amount_now: enteredValue(0, "nis", b.runDate), monthly_deposit: enteredValue(m.netYou, "nis_per_month", b.runDate) }, profile: { annualIncome: 144000 }, scenarioIncome: true },
    );
    expect(plan.run).toBe("runPension");
    if (plan.run !== "runPension") return;
    plan.input.goal.contributions = "nominal";
    const run = runPlanned(plan, { rules: b.rules, runDate: b.runDate });
    expect(run.detail.grossDeposits).toBeCloseTo(m.you * 12 * 10, 4);
    expect(m.insuranceMonthly).toBeCloseTo(0.003 * m.total, 9);
    expect(m.balance!.real).toBeGreaterThan(0);
  });
  it("has no insurance for a provident fund for annuity (PEN-35), and no balance where no track is named", () => {
    const annuity = page("provident-for-annuity").signature!;
    const a = pensionModel(annuity, "provident-for-annuity", { salary: 12000, years: 10, insurancePct: 0.5 })!;
    expect(a.insuranceMonthly).toBeNull();
    expect(a.balance!.real).toBeGreaterThan(0);
    const comp = page("pension-comprehensive").signature!;
    const c = pensionModel(comp, "pension-comprehensive", { salary: 12000, years: 10, insurancePct: null })!;
    expect(c.balance).toBeNull();
    expect(c.balanceGap).toBe("no-fees");
    expect(c.you).toBeCloseTo(720, 9); // the deposit split needs no track
    expect(comp.gaps).toContain("pensionTrack");
    expect(general.gaps).toContain("annuityFactors");
  });
});
