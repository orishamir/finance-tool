// A discount that ends (A-19, F-16, D83) on the fee page and in every place that replaces or scales a fee line: the provident fund
// for investing runs on Harel's 0.7% and 0% for five years, then up to 1.05% and 4%.
import { describe, expect, it } from "vitest";
import type { RunPlan } from "@finance-tool/engine";
import { compareBundle } from "./compare.server";
import { buildFeesData } from "./fees.server";
import { buildFees, feeInputs, feeSensitivity, headlineGap, reductionWorth, subjectRun } from "./fees";
import { withOwnFee } from "./compare";
import { withBalanceFee } from "./guide-signature-g2";
import { bandsOf } from "../components/fees/FeeDragChart";

const KGL = "kupat-gemel-lehashkaa";
const bundle = compareBundle();
const data = buildFeesData();
const w = bundle.wrappers.find((x) => x.id === KGL)!;
const fees = (p: RunPlan) => (p.run === "runProvident" ? p.input.fees : null);

describe("a discount that ends, outside the run", () => {
  const inputs = feeInputs(bundle, null, { entered: {}, age: null, employment: null });
  const r = buildFees(bundle, data, { kind: "wrapper", wrapperId: KGL }, inputs);
  if (r.kind !== "ok") throw new Error(`fee page did not run: ${JSON.stringify(r)}`);
  const lines = r.analysis.lines;

  it("the fee page lists the deposit fee that is 0% for five years and 4% after, and each line says both periods", () => {
    expect(lines.map((l) => l.line).sort()).toEqual(["balance", "deposit"]);
    const dep = lines.find((l) => l.line === "deposit")!;
    expect(dep.rateFraction).toBe(0);
    expect(dep.after).toMatchObject({ rate: { value: 4 }, period: { value: 5 }, unit: "years" });
    expect(dep.costNis).toBeGreaterThan(500);
    const bal = lines.find((l) => l.line === "balance")!;
    expect(bal.after).toMatchObject({ rate: { value: 1.05 }, period: { value: 5 }, unit: "years" });
    // the deposit fee is no longer left in "the fees' combined effect"
    expect(Math.abs(r.analysis.fm.interaction.value as number)).toBeLessThan(dep.costNis / 5);
  });

  it("the verdict follows what the cut to the average is worth, not what the fee costs, and the card says when the discount ends (D90 revised)", () => {
    const bal = lines.find((l) => l.line === "balance")!;
    const dep = lines.find((l) => l.line === "deposit")!;
    // the balance fee: the cut to the 0.62% average is worth 108.03 NIS, under the 1,000 NIS threshold, so it is not worth negotiating; its
    // 3,902 NIS cost, with an option on the page that charges no such fee, is F-62's other half, "worth avoiding"
    expect([bal.verdict, bal.reason, bal.judgedFraction]).toEqual(["avoid", "avoid", 0.0105]);
    expect(bal.worthNis).toBeCloseTo(108.03, 1);
    // the deposit fee: 0% now, so nothing to ask for; it can rise to 4%, above the 0% average, when the discount ends: check again then
    expect([dep.verdict, dep.reason, dep.judgedFraction, dep.worthNis]).toEqual(["not-worth", "check-after", 0.04, 0]);
    // the worth of bringing the balance fee to the average now is held through the discount only (D86): no renewal is priced past it
    expect(bal.suggestion).toBe(0.62);
    expect(reductionWorth(r.analysis, "balance", 0.62)!.value as number).toBeCloseTo(108.03, 1);
    // a fee at 0% now has no reduction to offer: no suggestion, so no field reads "זו לא הורדה"
    expect(dep.suggestion).toBeNull();
    expect(headlineGap(r.analysis)).toMatchObject({ kind: "more", line: "balance" });
  });

  it("the opening sentence never says no fee is above the average beside a card that says the fee can rise above it when the discount ends", () => {
    // the balance fee at or below the average now, the deposit fee at 0% then 4%: no reduction to offer now, but the deposit card says to check again then
    const an = { ...r.analysis, lines: r.analysis.lines.map((l) => (l.line === "balance" ? { ...l, suggestion: null, reason: "not-below" as const } : l)) };
    expect(an.lines.find((l) => l.line === "deposit")!.reason).toBe("check-after");
    expect(headlineGap(an)).toEqual({ kind: "after" });
    // keyed on the line, not its reason: a balance fee "worth avoiding" whose discount ends above the average counts too
    const avoidOnly = { ...an, lines: an.lines.map((l) => (l.line === "deposit" ? { ...l, risesAbove: false, reason: "not-below" as const } : { ...l, reason: "avoid" as const, risesAbove: true })) };
    expect(headlineGap(avoidOnly)).toEqual({ kind: "after" });
    // with no fee that can rise above the average, it is the plain "not above"
    const none = { ...an, lines: an.lines.map((l) => ({ ...l, reason: "not-below" as const, risesAbove: false })) };
    expect(headlineGap(none)).toEqual({ kind: "less" });
  });

  it("the class average's track was chosen by the site and is not the run's record: the page says so, and claims no average as the product's own", () => {
    for (const l of lines) {
      expect(l.reference.bySite).toMatchObject({ trackId: 7978 });
      expect(l.reference.ownAverage).toBeUndefined();
    }
  });

  it("within a horizon that ends inside the discount the verdict judges the rate charged now, in plain words", () => {
    const short = buildFees(bundle, data, { kind: "wrapper", wrapperId: KGL }, { ...inputs, g: { ...inputs.g, horizonYears: 5 } });
    if (short.kind !== "ok") throw new Error("no run");
    for (const l of short.analysis.lines) {
      expect(l.judgedFraction).toBeUndefined();
      expect(["check-after", "negotiate-ends"]).not.toContain(l.reason);
    }
  });

  it("the sensitivity judges each fee as its card does, by the rate after the discount (D88, D90)", () => {
    const s = feeSensitivity(r.args, r.analysis, r.args.runBundle)!;
    // the balance fee is worth avoiding until its cost falls under 2,500 NIS, near 0.63 times; within half to double the cut to the
    // average never reaches 1,000 NIS, so no row says "worth negotiating" (D90 revised)
    const bal = s.rows.find((x) => x.key === "fee:balance")!;
    expect(bal.flip).toMatchObject({ kind: "verdict", line: "balance", newVerdict: "not-worth" });
    expect(bal.flip!.to).toBeGreaterThan(0.6);
    expect(bal.flip!.to).toBeLessThan(0.66);
    expect(s.rows.some((x) => x.flip?.newVerdict === "negotiate")).toBe(false);
    // the holding period's axis never goes below a year
    const at2 = buildFees(bundle, data, { kind: "wrapper", wrapperId: KGL }, { ...inputs, g: { ...inputs.g, horizonYears: 2 } });
    if (at2.kind !== "ok") throw new Error("no run");
    expect(feeSensitivity(at2.args, at2.analysis, at2.args.runBundle)!.rows.find((x) => x.key === "horizon")!.lo).toBe(1);
  });

  it("the sensitivity moves both periods of a discounted fee", () => {
    const s = feeSensitivity(r.args, r.analysis, r.args.runBundle)!;
    const bal = s.rows.find((x) => x.key === "fee:balance")!;
    expect(bal.ratePct).toBeCloseTo(0.7, 9);
    expect(bal.afterPct).toBeCloseTo(1.05, 9);
    const dep = s.rows.find((x) => x.key === "fee:deposit")!;
    expect(dep.afterPct).toBeCloseTo(4, 9);
    // the page shows no rate the run never charges: the legal caps (PF-02) hold the doubled rates
    expect([bal.capPct, dep.capPct]).toEqual([1.05, 4]);
    // the deposit fee is 0% during the discount: its row is named for the rate after it
    expect(dep.label).toContain("אחרי תקופת ההנחה");
    expect(bal.label).not.toContain("אחרי תקופת ההנחה");
  });

  it("a fee the person enters below the record's holds for PF-13's five years, then returns to the rate after the discount (D86); the deposit fee keeps the record's discount", () => {
    const t = withOwnFee(w, w.terms!, { ownFees: { [KGL]: 0.5 } });
    expect(t.fees).toEqual({ deposit: 0, balance: 0.005, direct: 0, discount: { months: 60, listRate: 0.0105 }, depositDiscount: { months: 60, listRate: 0.04 } });
    expect(w.ownFeeHold).toMatchObject({ months: 60, revertsTo: 0.0105, rate: { value: 1.05 }, years: { value: 5 } });
    // a fee at or above the rate after the discount is one rate for the whole run
    expect(withOwnFee(w, w.terms!, { ownFees: { [KGL]: 1.2 } }).fees).toEqual({ deposit: 0, balance: 0.012, direct: 0, depositDiscount: { months: 60, listRate: 0.04 } });
  });

  it("the managers' range runs another track's fee as one rate", () => {
    const f = withBalanceFee(w.terms!, 0.9).fees!;
    expect(f.balance).toBeCloseTo(0.009, 12);
    expect(f.discount).toBeUndefined();
    expect(f.depositDiscount).toEqual({ months: 60, listRate: 0.04 });
  });

  it("inside the discount the deposit fee costs nothing yet and keeps its band, so the chart's legend and table hold (D63)", () => {
    const short = buildFees(bundle, data, { kind: "wrapper", wrapperId: KGL }, { ...inputs, g: { ...inputs.g, horizonYears: 1 } });
    if (short.kind !== "ok") throw new Error("no run");
    expect(short.analysis.lines.find((l) => l.line === "deposit")!.costNis).toBe(0);
    expect(bandsOf(short.analysis).map((b) => b.id).sort()).toEqual(bandsOf(r.analysis).map((b) => b.id).sort());
  });

  it("the plan the fee page scales carries both periods scaled", () => {
    const run = subjectRun(bundle, KGL, inputs.g, { [`${KGL}:balance`]: 2, [`${KGL}:deposit`]: 0.5 });
    if ("kind" in run) throw new Error("no run");
    const f = fees(run.plan)!;
    expect(f.balance).toBeCloseTo(0.014, 12);
    expect(f.discount!.listRate).toBeCloseTo(0.021, 12);
    expect(f.deposit).toBe(0);
    expect(f.depositDiscount!.listRate).toBeCloseTo(0.02, 12);
  });
});

describe("a cut on a line with no discount of its own is held, and the card says so once (D90, extended the same day)", () => {
  const KH = "keren-hishtalmut";
  const inputs = feeInputs(bundle, null, { entered: {}, age: null, employment: null });
  const r = buildFees(bundle, data, { kind: "wrapper", wrapperId: KH }, inputs);
  if (r.kind !== "ok") throw new Error(`fee page did not run: ${JSON.stringify(r)}`);

  it("the study fund's balance fee: the held five years are said by the reduction field, which names the rate that returns, not again in the reason", () => {
    const bal = r.analysis.lines.find((l) => l.line === "balance")!;
    expect(bal.after).toBeUndefined();
    expect(bal.held).toMatchObject({ period: { value: 5 }, unit: "years" });
    expect(bal.held!.rate.value).toBe(0.6);
    // the cut to the 0.51% average is worth 186.97 NIS, under the 1,000 NIS threshold: not worth negotiating (D90 revised); its 3,911 NIS
    // cost would make it "worth avoiding", but the fund ranks first on the page's numbers and no option above it lacks the fee (D90 revised
    // the same day), so the card gives the negotiate verdict alone
    expect([bal.verdict, bal.reason]).toEqual(["not-worth", "below"]);
    expect(bal.removedBy).toEqual([]);
    expect(bal.alternatives.length).toBeGreaterThan(0);
    expect(bal.worthNis).toBeCloseTo(186.97, 1);
    // the cut is worth far less than the fee's cost because it is held five years of the horizon (D86)
    const worth = reductionWorth(r.analysis, "balance", bal.suggestion!)!.value as number;
    expect(worth).toBeLessThan(bal.costNis / 5);
  });
});
