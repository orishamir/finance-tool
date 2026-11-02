// D29, second wave: the study fund, the provident fund for investing and the pensions. Every figure equals an engine run; the holding
// on each side is the same index; a gap is a gap, never a number.
import { describe, expect, it } from "vitest";
import { runInputs, runPlanned } from "@finance-tool/engine";
import { buildGuidePage } from "./guide.server";
import { fact } from "./guide-signature";
import { paidInToday } from "./engine";
import { entered as enteredValue } from "./value";
import { hishtalmutTerms, pensionModel, providentModel, runWith, studyRange, studyYear, studyYears } from "./guide-signature-g2";
import { signatureRegistry } from "../components/guide-signature";
import { guideSignature as copy } from "../copy";
import { buildInvest, indexById } from "./invest";
import { buildWorkbenchBundle } from "./providers.server";

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
  const employee = { employment: "employee" as const, income: 12000, ownMonthly: 300, employerMonthly: 900, returnPct: 7 };
  const self = { employment: "self-employed" as const, income: 12000, ownMonthly: 500, employerMonthly: 0, returnPct: 7 };

  it("tells an employee's money as two runs, which add up: own, employer, return, tax, left", () => {
    const b = d.bundles["keren-hishtalmut"]!;
    const years = studyYears(d, employee, 12);
    expect(years).toHaveLength(12);
    const y8 = years[7]!.slice!;
    expect(y8.own + y8.extra + y8.gain - y8.tax).toBeCloseTo(y8.net, 6);
    const terms = hishtalmutTerms(b, { employment: "employee", income: 12000, early: false });
    const own = runWith(b, { amount_now: 0, monthly_deposit: 300, "A-01": 7 }, 96, { terms: { ...terms, hishtalmut: { ...terms.hishtalmut!, salaryFollowsPrices: true } }, profile: { annualIncome: 144000 } })!;
    const emp = runWith(b, { amount_now: 0, monthly_deposit: 900, "A-01": 7 }, 96, { terms: { ...terms, hishtalmut: { ...terms.hishtalmut!, salaryFollowsPrices: true, money: "employer" } }, profile: { annualIncome: 144000 } })!;
    expect(y8.net).toBeCloseTo(own.real + emp.real, 6);
    // each month's deposit in today's money
    expect(y8.own).toBeCloseTo(96 * 300, -1);
    expect(y8.extra).toBeCloseTo(96 * 900, -1);
    expect(y8.gain).toBeGreaterThan(0);
  });
  it("taxes nothing from the lock's end while the deposits stay under the limits, and the employer's deposits before it", () => {
    const years = studyYears(d, employee, 12);
    for (let y = 6; y <= 12; y++) expect(years[y - 1]!.slice!.tax).toBeCloseTo(0, 6);
    const y3 = years[2]!.slice!;
    expect(y3.tax).toBeGreaterThan(0.1 * y3.extra); // F-47: the employer's deposits are income, not only the gains
    expect(y3.own + y3.extra + y3.gain - y3.tax).toBeCloseTo(y3.net, 6);
    expect(years[2]!.runs).toHaveLength(2);
  });
  it("does not stack what was income when paid under the own gains of an early withdrawal", () => {
    const b = d.bundles["keren-hishtalmut"]!;
    const y = studyYear(b, 6, { ...employee, income: 35000, ownMonthly: 875, employerMonthly: 2625 }, 5);
    const [mine, employer] = y.runs;
    expect(employer!.detail.earlyEmployerDeposits!).toBeLessThan(employer!.detail.grossBalance! - employer!.detail.earlyGains!);
    // the same own run stacked on the whole balance is taxed more: the salary 35,000 case crosses a schedule's step between the two
    const t = hishtalmutTerms(b, { employment: "employee", income: 35000, early: true });
    const whole = runWith(b, { amount_now: 0, monthly_deposit: 875, "A-01": 7 }, 60, { terms: { ...t, hishtalmut: { ...t.hishtalmut!, salaryFollowsPrices: true } }, profile: { annualIncome: 420000, otherIncome: 420000 + employer!.detail.grossBalance! } })!;
    expect(mine!.taxAtExit).toBeLessThan(whole.taxAtExit);
  });
  it("stacks the own gains of an early withdrawal on the salary and what the employer's run paid out", () => {
    const b = d.bundles["keren-hishtalmut"]!;
    const low = studyYear(b, 6, { ...employee, employerMonthly: 0 }, 5).slice!;
    const high = studyYear(b, 6, employee, 5).slice!;
    expect(high.tax).toBeGreaterThan(low.tax);
  });
  it("taxes what is above a limit even after the lock", () => {
    const over = studyYears(d, { ...employee, ownMonthly: 840 }, 12); // 7% of the salary, the benefit stops at 2.5%
    expect(over[7]!.slice!.tax).toBeGreaterThan(0);
    const high = studyYears(d, { ...employee, income: 20000, ownMonthly: 500, employerMonthly: 1500 }, 12);
    const y8 = high[7]!.slice!;
    expect(y8.tax).toBeGreaterThan(0); // the employer's part above the ceiling is salary when paid (TXH-03)
    expect(y8.own + y8.extra + y8.gain - y8.tax).toBeCloseTo(y8.net, 6);
  });
  it("moves with every input", () => {
    const base = studyYears(d, employee, 12)[9]!.slice!.net;
    expect(studyYears(d, { ...employee, ownMonthly: 200 }, 12)[9]!.slice!.net).toBeLessThan(base);
    expect(studyYears(d, { ...employee, employerMonthly: 600 }, 12)[9]!.slice!.net).toBeLessThan(base);
    expect(studyYears(d, { ...employee, returnPct: 3 }, 12)[9]!.slice!.net).toBeLessThan(base);
    expect(studyYears(d, { ...employee, returnPct: 1 }, 12)[9]!.slice!.gain).toBeLessThan(0);
  });
  it("gives a self-employed person no number before the lock ends (TXH-07 is not in the engine) and the tax back after it", () => {
    const years = studyYears(d, self, 12);
    for (let y = 1; y < 6; y++) expect(years[y - 1]).toEqual({ slice: null, gap: "self-employed-early", runs: [] });
    expect(d.gaps).toContain("selfEmployedEarly");
    const y10 = years[9]!.slice!;
    expect(y10.tax).toBe(0);
    expect(y10.extra).toBeGreaterThan(0);
    expect(y10.own).toBeCloseTo(120 * 500, -1);
    expect(y10.own + y10.extra + y10.gain).toBeCloseTo(y10.net, 6);
    expect(studyYears(d, { ...self, income: 30000 }, 12)[9]!.slice!.extra).toBeGreaterThan(y10.extra); // a higher bracket saves more
  });
  it("gives the range over the collected fees and, for a self-employed person, the account's range (rule 3)", () => {
    const y = studyYears(d, employee, 12)[7]!.slice!;
    const r = studyRange(d, employee, 8);
    expect(r.fund!.low).toBeLessThanOrEqual(y.net);
    expect(r.fund!.high).toBeGreaterThanOrEqual(y.net);
    expect(r.account).toBeNull();
    const s = studyRange(d, self, 10);
    expect(s.fund!.high).toBeGreaterThan(s.fund!.low);
    expect(s.account!.net).toBeGreaterThanOrEqual(s.account!.range!.low);
    expect(s.account!.net).toBeLessThanOrEqual(s.account!.range!.high);
    expect(studyRange(d, self, 3).fund).toBeNull();
  });
});

describe("the guides' securities-account range and the indices page (issue 143)", () => {
  const bundle = buildWorkbenchBundle();
  const t = bundle.today;
  const money = (n: number) => enteredValue(n, "nis", t);
  const plan = { amountNow: 10000, monthly: 500, years: 10, grossReturn: 0.07, inflation: 0.02, age: null, income: null, values: { amount: money(10000), monthly: enteredValue(500, "nis_per_month", t), years: enteredValue(10, "years", t), returnV: enteredValue(7, "pct_per_year", t), inflation: enteredValue(2, "pct_per_year", t) }, fromGoal: false, returnFromParameter: false };
  const view = buildInvest({ bundle, index: indexById(bundle, "index-sp500")!, plan });
  const onFund = view.houses.flatMap((h) => h.entries.filter((e) => e.fund.number === "5139282" && e.price && !e.price.open).map((e) => ({ id: h.provider.id, value: e.price!.valueN }))).sort((a, b) => b.value - a.value);
  for (const id of ["keren-hishtalmut", "kupat-gemel-lehashkaa"]) {
    it(`${id}: counts the same houses and names the same pick`, () => {
      const d = page(id).signature!;
      expect(fact(d, "brokerCount")!.value).toBe(onFund.length);
      const best = String(fact(d, "brokerBestName")!.value);
      expect(onFund.some((h) => h.id === "fair")).toBe(true);
      expect(onFund[0]!.id).toBe("fair");
      expect(best).toContain("פייר");
    });
  }
  it("prices the pick the same on both pages", () => {
    const run = runWith(page("keren-hishtalmut").signature!.bundles["brokerage-best"]!, entered(10000, 500), 120)!;
    expect(Math.abs(run.real - onFund[0]!.value) / onFund[0]!.value).toBeLessThan(0.001);
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
