// B4 (QA 2026-10-24): a study fund held with an employer deposit runs F-61 with that deposit, as golden S42 does.
import { feeMateriality } from "@finance-tool/engine";
import { beforeAll, describe, expect, it } from "vitest";
import { buildCompareBundle } from "./compare.server";
import type { CompareBundle, RunGoal } from "./compare";
import { buildHoldingsBundle } from "./holdings.server";
import { draftOf, holdingPlan, liquidityOf, mergedRules, prefillFees } from "./holdings";
import type { Holding } from "./state";
import { entered } from "./value";

let bundle: CompareBundle;
beforeAll(() => {
  bundle = buildCompareBundle();
}, 120_000);

const day = "2026-10-24";
const runGoal: RunGoal = {
  horizonYears: 10,
  amountNow: 0,
  monthly: 0,
  available: 0,
  anytime: false,
  returnPct: 6,
  inflationPct: 2.5,
  age: 30,
  employment: "employee",
  salary: 12_000,
  pensionEmployee: null,
  pensionEmployer: null,
  insurancePct: null,
  preset: "other" as RunGoal["preset"],
  fromPreset: { horizon: false, monthly: false, available: false },
};

const holding = (over: Partial<Holding> = {}): Holding => ({
  id: "h1",
  wrapperId: "keren-hishtalmut",
  company: { name: "חברה" },
  balance: entered(120_000, "nis", day),
  feeBalance: entered(0.74, "pct_per_year", day),
  directExpenses: entered(0.11, "pct_per_year", day),
  monthlyOwn: entered(300, "nis_per_month", day),
  monthlyEmployer: entered(900, "nis_per_month", day),
  firstDeposit: { ...entered(0, "text", day), value: "2015-01-01" },
  statementDate: { ...entered(0, "text", day), value: day },
  order: 0,
  ...over,
});

describe("holdingPlan reads the employer deposit (B4)", () => {
  it("S42 from a holding: balance fee 17,901.59, total drag 20,664.79", () => {
    const rules = mergedRules({ rules: [] } as never, bundle);
    const hp = holdingPlan(holding(), bundle, { years: 10, name: "g", run: runGoal }, rules);
    expect(hp).toMatchObject({ ok: true });
    if (!hp.ok) return;
    if (hp.plan.run !== "runProvident") throw new Error("plan");
    // the statement's deposits are flat nominal NIS, as golden S42 has them (workings Q20)
    expect(hp.plan.input.goal.contributions).toBe("nominal");
    const m = feeMateriality(hp.plan, hp.ctx);
    const balance = m.lines.find((l) => l.line === "balance")!.cost.value as number;
    expect(Math.abs(balance - 17_901.59)).toBeLessThan(0.02);
    expect(Math.abs((m.total.value as number) - 20_664.79)).toBeLessThan(0.02);
  });

  it("without the employer deposit the run differs", () => {
    const rules = mergedRules({ rules: [] } as never, bundle);
    const hp = holdingPlan(holding({ monthlyEmployer: undefined }), bundle, { years: 10, name: "g", run: runGoal }, rules);
    expect(hp.ok).toBe(true);
    if (!hp.ok) return;
    expect(Math.abs((feeMateriality(hp.plan, hp.ctx).total.value as number) - 20_664.79)).toBeGreaterThan(100);
  });

  it("an employer deposit above TXH-01's limit runs, the part above taxed as salary (F-52, 2026-10-24)", () => {
    // salary 12,000: limit 900 a month; the payslip says 450 own + 1,350 employer
    const rules = mergedRules(buildHoldingsBundle(), bundle);
    const hp = holdingPlan(holding({ monthlyOwn: entered(450, "nis_per_month", day), monthlyEmployer: entered(1350, "nis_per_month", day) }), bundle, { years: 10, name: "g", run: runGoal }, rules);
    expect(hp.ok).toBe(true);
    if (!hp.ok) return;
    const m = feeMateriality(hp.plan, hp.ctx);
    expect(m.total.value as number).toBeGreaterThan(0);
    // 450 above the limit: 5,400 a year in the 20% band (TXG-02) = 1,080 a year, 10,800 over 10 years
    expect(m.run.detail.employerDepositTax).toBeCloseTo(10_800, 2);
    // National Insurance and health, 12.17% × 450 × 120 months (TXG-35, a reading)
    expect(m.run.detail.employerSocial).toBeCloseTo(6_571.8, 2);
    // benefited: own 300 (2.5% of 12,000) + employer 900 (the limit); in excess: own 150 above its share + employer 450 = 600
    expect(m.run.detail.benefitedMonthly).toBeCloseTo(1_200, 9);
    expect(m.run.detail.excessMonthly).toBeCloseTo(600, 9);
    // the label travels to the page value (the fee page marks an inference like a secondary-source label)
    expect(m.run.labels).toContainEqual({ code: "reading", ruleId: "TXG-35" });
  });
});

// ---------------------------------------------------------------- the add sheet's checks and matching (audit 2026-10-24, A15, A17)

import { autoLink, checkDraft, emptyDraft, holdingOf, matchCompanies, matchTracks, matchTracksKind, type Draft, type HoldingsBundle } from "./holdings";

const miniBundle = {
  today: day,
  companies: [
    { id: "1", name: 'הפניקס פנסיה וגמל בע"מ' },
    { id: "2", name: 'כלל פנסיה וגמל בע"מ' },
    { id: "3", name: 'אלטשולר שחם גמל ופנסיה בע"מ' },
  ],
  classifications: ["מסלול כללי"],
  tracks: [
    { id: 1377, n: "אלטשולר שחם השתלמות מניות", c: 2, w: "keren-hishtalmut", k: 0, d: 0, s: "", ss: "" },
    { id: 1399, n: "אלטשולר שחם השתלמות כללי", c: 2, w: "keren-hishtalmut", k: 0, d: 0, s: "", ss: "" },
    { id: 2001, n: "הפניקס פנסיה מסלול לבני 50 ומטה", c: 0, w: "pension-comprehensive", k: 0, d: 1, s: "", ss: "" },
    { id: 2002, n: "הפניקס פנסיה מסלול לבני 60 ומעלה", c: 0, w: "pension-comprehensive", k: 0, d: 1, s: "", ss: "" },
    { id: 2003, n: "כלל פנסיה כללי", c: 1, w: "pension-comprehensive", k: 0, d: 1, s: "", ss: "" },
  ],
} as unknown as HoldingsBundle;

const goodDraft = (over: Partial<Draft> = {}): Draft => ({
  ...emptyDraft(),
  wrapperId: "kupat-gemel-lehashkaa",
  companyId: "3",
  companyName: 'אלטשולר שחם גמל ופנסיה בע"מ',
  typedName: "מסלול כלשהו",
  balance: 100_000,
  feeBalance: 0.7,
  statementDate: "2026-06-30",
  ...over,
});

describe("checkDraft (A15)", () => {
  it("a statement with no deposits (empty מהפקדה) passes, and is saved as an entered 0", () => {
    expect(checkDraft(goodDraft({ feeDeposit: null }), day)).toEqual([]);
    const h = holdingOf(goodDraft({ feeDeposit: null }), miniBundle, day);
    expect(h.feeDeposit).toMatchObject({ value: 0, state: "entered" });
  });
  it("the balance fee is still required", () => {
    expect(checkDraft(goodDraft({ feeBalance: null }), day)).toEqual([{ field: "feeBalance", code: "required" }]);
  });
  it("each failure has its own code", () => {
    const errs = checkDraft(goodDraft({ balance: -1, feeBalance: 150, statementDate: "2030-01-01", firstDeposit: "2031-01-01", wrapperId: "keren-hishtalmut" }), day);
    expect(errs).toEqual(
      expect.arrayContaining([
        { field: "balance", code: "balance-negative" },
        { field: "feeBalance", code: "percent-over" },
        { field: "statementDate", code: "statement-future" },
        { field: "firstDeposit", code: "first-future" },
      ]),
    );
    expect(checkDraft(goodDraft({ statementDate: "" }), day)).toEqual([{ field: "statementDate", code: "required" }]);
    expect(checkDraft(goodDraft({ wrapperId: "keren-hishtalmut", firstDeposit: "2026-07-01" }), day)).toEqual([{ field: "firstDeposit", code: "first-after-statement" }]);
    expect(checkDraft(goodDraft({ typedName: "", fundId: null }), day)).toEqual([{ field: "track", code: "no-track" }]);
  });
  it("no product type is an error of its own", () => {
    expect(checkDraft(emptyDraft(), day)).toContainEqual({ field: "wrapperId", code: "required" });
  });
});

describe("matchTracks and matchCompanies (A17)", () => {
  it("an exact name is the one track, and linking on save follows", () => {
    const m = matchTracksKind(miniBundle, "keren-hishtalmut", "אלטשולר שחם השתלמות מניות");
    expect(m.kind).toBe("exact");
    expect(m.tracks.map((t) => t.id)).toEqual([1377]);
    const linked = autoLink(miniBundle, goodDraft({ wrapperId: "keren-hishtalmut", typedName: "אלטשולר שחם השתלמות מניות", companyId: null, companyName: "" }));
    expect(linked).toMatchObject({ fundId: 1377, typedName: "", companyId: "3" });
  });
  it("a name that is part of several tracks is not linked", () => {
    expect(matchTracks(miniBundle, "keren-hishtalmut", "אלטשולר שחם השתלמות")).toHaveLength(2);
    const d = goodDraft({ wrapperId: "keren-hishtalmut", typedName: "אלטשולר שחם השתלמות" });
    expect(autoLink(miniBundle, d)).toBe(d);
  });
  it("a fund number, with or without the word, finds the track", () => {
    expect(matchTracks(miniBundle, "keren-hishtalmut", "1399").map((t) => t.id)).toEqual([1399]);
    expect(matchTracksKind(miniBundle, "keren-hishtalmut", "קופה 1399").kind).toBe("number");
    expect(matchTracks(miniBundle, "keren-hishtalmut", "9999")).toEqual([]);
  });
  it("a company pasted with the track's words around it still finds the company", () => {
    const list = miniBundle.companies;
    const m = matchCompanies(list, "הפניקס פנסיה מקיפה מסלול כללי");
    expect(m.partial).toBe(true);
    expect(m.list.map((c) => c.id)).toEqual(["1"]);
    expect(matchCompanies(list, "אלטשולר").list.map((c) => c.id)).toEqual(["3"]);
    expect(matchCompanies(list, "zzz").list).toEqual([]);
    expect(matchCompanies(list, "").list).toHaveLength(3);
  });
  it("every word of a longer paste, company and track together, finds the tracks", () => {
    const m = matchTracksKind(miniBundle, "pension-comprehensive", "הפניקס פנסיה לבני 60");
    expect(m.kind).toBe("words");
    expect(m.tracks.map((t) => t.id)).toEqual([2002]);
  });
});

// scenario fix 2026-10-24: a study fund that became liquid (fee prefill, the first-deposit checkbox, the liquidity line)
describe("fee prefill from the regulator's track average", () => {
  const hb = buildHoldingsBundle();
  const track = hb.tracks.find((t) => t.w === "keren-hishtalmut" && typeof trackBalance(t) === "number")!;
  function trackBalance(t: (typeof hb.tracks)[number]) {
    return t.fb.value;
  }
  const base = (over: Partial<Draft> = {}): Draft => ({
    ...emptyDraft(),
    wrapperId: "keren-hishtalmut",
    companyId: hb.companies[track.c]!.id,
    companyName: hb.companies[track.c]!.name,
    fundId: track.id,
    balance: 150_000,
    statementDate: "2026-09-30",
    ...over,
  });
  it("a picked track with a published average gives a sourced balance fee", () => {
    const p = prefillFees(hb, base());
    expect(p.balance).toMatchObject({ value: track.fb.value, state: "sourced" });
    expect(p.balance?.source.url).toBeTruthy();
  });
  it("no track, or a track with no average, prefills nothing", () => {
    expect(prefillFees(hb, base({ fundId: null })).balance).toBeNull();
  });
  it("the fee is required only when nothing could be prefilled", () => {
    expect(checkDraft(base(), day, hb)).toEqual([]);
    expect(checkDraft(base({ fundId: null, typedName: "x" }), day, hb)).toContainEqual({ field: "feeBalance", code: "required" });
  });
  it("saved empty it is the sourced average; typed it is entered", () => {
    const h = holdingOf(base(), hb, day);
    expect(h.feeBalance).toMatchObject({ value: track.fb.value, state: "sourced" });
    const typed = holdingOf(base({ feeBalance: 0.5 }), hb, day);
    expect(typed.feeBalance).toMatchObject({ value: 0.5, state: "entered" });
  });
  it("editing a holding that kept the average shows the prefill again, not an entered number", () => {
    const h = holdingOf(base(), hb, day);
    expect(draftOf(h, hb).feeBalance).toBeNull();
    expect(draftOf(h).feeBalance).toBe(track.fb.value);
  });
});

describe("liquidity of a study fund (TXH-09)", () => {
  const rules = mergedRules(buildHoldingsBundle(), bundle);
  const hb = buildHoldingsBundle();
  const at = (first: string | null, over = false) => {
    const d: Draft = { ...emptyDraft(), wrapperId: "keren-hishtalmut", companyName: "חברה", typedName: "מסלול", balance: 1, feeBalance: 1, statementDate: "2026-09-30", firstDeposit: first ?? "", firstDepositOver: over };
    return holdingOf(d, hb, day);
  };
  it("six years or more after the first deposit: liquid from the end of that month (TXH-09)", () => {
    const l = liquidityOf(at("2020-09-01"), rules, day);
    expect(l).toMatchObject({ kind: "liquid", from: { value: "2026-09-30" } });
  });
  it("less than six years: not yet, with the date", () => {
    expect(liquidityOf(at("2021-03-15"), rules, day)).toMatchObject({ kind: "not-yet", from: { value: "2027-03-31" } });
  });
  it("the checkbox stands for the date: liquid with no date", () => {
    const h = at(null, true);
    expect(h.firstDeposit).toBeUndefined();
    expect(liquidityOf(h, rules, day)).toMatchObject({ kind: "liquid", from: null });
  });
  it("neither date nor checkbox: unknown; another product: none; no rule: nothing derived", () => {
    expect(liquidityOf(at(null), rules, day)).toEqual({ kind: "unknown" });
    expect(liquidityOf({ ...at("2015-01-01"), wrapperId: "kupat-gemel-lehashkaa" }, rules, day)).toBeNull();
    expect(liquidityOf(at("2015-01-01"), {}, day)).toEqual({ kind: "no-rule" });
  });
  it("the fee run accepts the checkbox in place of the date", () => {
    const h = at(null, true);
    const hp = holdingPlan({ ...h, monthlyEmployer: undefined }, bundle, { years: 10, name: "g", run: runGoal }, rules);
    expect(hp).toMatchObject({ ok: true });
    const none = holdingPlan({ ...h, firstDepositOverSix: undefined } as never, bundle, { years: 10, name: "g", run: runGoal }, rules);
    expect(none).toMatchObject({ ok: false, reason: "needs-first-deposit" });
  });
});
