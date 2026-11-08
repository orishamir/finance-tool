// The parts that belong to the "what makes it different" visuals alone (D29): the guide inputs they start from (rule 9 of the spec), the
// run date and what a visual receives, and the lines that look their copy up (a gap, a common rate). The parts any
// page can use (marker, bars, stat, field, legend) live in the shared kit, components/kit.
import type { P05Input, RunResult } from "@finance-tool/engine";
import { computedInputs as ci, guideBlocks, guideSignature as copy } from "../../copy";
import { p05Number, p05Range, p05Units, p05Value, type Bundle } from "../../lib/engine";
import type { SignatureData } from "../../lib/guide-signature";
import { useInputs } from "../../lib/inputs";
import { asField, computed, entered as enteredValue, feeLabel, feeYear, weaker, type SiteValue, type Strength } from "../../lib/value";
import { GapNote } from "../kit";
import { IdText, Num } from "../provenance";

// ---------------------------------------------------------------- the guide inputs a visual starts from

export type InputSource = "guide" | "p05";

export interface SigInputs {
  amount: number;
  monthly: number;
  years: number;
  source: { amount: InputSource; monthly: InputSource; years: InputSource };
  /** True once the saved values have been read after hydration; before it the numbers are P-05's. */
  ready: boolean;
  setAmount: (n: number | null) => void;
  setMonthly: (n: number | null) => void;
  setYears: (n: number | null) => void;
  p05: { amount: number; monthly: number; years: number };
}

/**
 * The amount, the monthly deposit and the years a visual starts from (D29 rule 9): what the person typed in the guide's own
 * fields, else P-05's; never the saved goal (founder, 2026-10-28: only the goal page speaks of a goal). Editing a control writes the guide's field, the same one the timeline reads.
 */
export function useSigInputs(bundle: Bundle): SigInputs {
  const { state, ready, setEntered } = useInputs();
  const p05 = { amount: p05Number(bundle.p05, "amount_now"), monthly: p05Number(bundle.p05, "monthly_deposit"), years: p05Number(bundle.p05, "horizon_years") };
  const pick = (entered: number | undefined, base: number): [number, InputSource] => (ready && entered !== undefined ? [entered, "guide"] : [base, "p05"]);
  const [amount, sa] = pick(state.entered.amount_now, p05.amount);
  const [monthly, sm] = pick(state.entered.monthly_deposit, p05.monthly);
  const [years, sy] = pick(state.entered.horizon_years, p05.years);
  const set = (key: "amount_now" | "monthly_deposit" | "horizon_years", base: number) => (n: number | null) => setEntered(key, n === null || n === base ? null : n);
  return { amount, monthly, years, source: { amount: sa, monthly: sm, years: sy }, ready, setAmount: set("amount_now", p05.amount), setMonthly: set("monthly_deposit", p05.monthly), setYears: set("horizon_years", p05.years), p05 };
}

/** The slider range of the years field, from P-05. */
export const yearsRange = (bundle: Bundle) => p05Range(bundle.p05, "sliders", "horizon_years") ?? { min: 1, max: 40, step: 1, values: {} };

/** "עוד לא חושב" with its reason, for a part the data cannot compute yet. */
export function Gap({ id, className }: { id: string; className?: string }) {
  const reason = (copy.common.gaps as Record<string, string>)[id.split(":")[0]!] ?? copy.common.gapFallback;
  return <GapNote reason={<IdText text={reason} />} className={className} />;
}

/** A computed value of a visual: the engine run or formula that gave it, the inputs it read and the rules. */
export function figure(value: number, unit: SiteValue["unit"], formula: string, inputs: Record<string, SiteValue>, today: string, about: string, rules: { id: string; strength: Strength }[] = []): SiteValue {
  return computed(value, unit, formula, inputs, { today, about, rules });
}

/**
 * A figure that is one engine run's own number (2026-10-26 review): it carries the rules that run read, each at the weakest strength
 * it carried, and the run's flags and labels, so its sheet shows what that run rested on, not every rule the bundle holds. `keepFlag`
 * leaves out the flags that are about another figure of the run (a tax figure drops the fee flags, as the timeline does).
 */
export const notFeeFlag = (code: string) => code !== "G-14" && code !== "PF-13";
export function runFigure(value: number, unit: SiteValue["unit"], formula: string, inputs: Record<string, SiteValue>, today: string, about: string, run: RunResult, keepFlag: (code: string) => boolean = () => true): SiteValue {
  return computed(value, unit, formula, inputs, {
    today,
    about,
    rules: run.rules.map((u) => ({ id: u.id, strength: u.figures.reduce<Strength>((w, f) => weaker(w, f.strength as Strength) ?? w, u.strength as Strength) })),
    flags: [...new Set(run.flags.map((f) => f.code))].filter(keepFlag),
    labels: run.labels.map((l) => ({ code: l.code, ruleId: l.ruleId })),
  });
}

/**
 * What a bundle's run reads from its terms: each fee line, the term and every other number the guide's terms block names, under that
 * block's name (a regulator's average with its year), as the timeline lists them, and the direct expenses. A figure from the run lists
 * these beside the plan it ran on, so its sheet holds the lines of that run and of no other: a page that runs another bundle (the
 * brokerage account at the best tariff) names that bundle's lines, not its own fund's (founder, 2026-11-08: "make sure the chip displayed
 * is correct ... make less mistakes"). A provident fee shown under its list or regulator label is not listed again as the plain fee.
 */
export function termInputs(bundle: Bundle): Record<string, SiteValue> {
  const fv = bundle.feeValues;
  const out: Record<string, SiteValue> = {};
  if (fv.balance && !fv.listBalance && !fv.discountBalance && !fv.regBalance) out[ci.balanceFee] = fv.balance;
  if (fv.deposit && !fv.listDeposit && !fv.discountDeposit && !fv.regDeposit) out[ci.depositFee] = fv.deposit;
  for (const [key, label] of Object.entries(guideBlocks.terms.labels)) {
    const v = fv[key];
    if (v && typeof v.value === "number") out[feeLabel(label, feeYear(v))] = v;
  }
  if (fv.direct && typeof fv.direct.value === "number") out[ci.directExpenses] = fv.direct;
  return out;
}

/** The bundle's term (a deposit's, a makam series'), under the name termInputs gives it, for a figure that reads the term alone (a price on the curve). */
export function termOf(bundle: Bundle | undefined): Record<string, SiteValue> {
  const v = bundle?.feeValues.term;
  return v && typeof v.value === "number" ? { [feeLabel(guideBlocks.terms.labels.term!, null)]: v } : {};
}

/** The rules a bundle's runs read, as the list a computed value carries. */
export const rulesOfBundle = (b: Bundle): { id: string; strength: Strength }[] => b.rules.map((r) => ({ id: r.id, strength: r.strength as Strength }));

/**
 * A guide input as a value object: P-05's own when untouched, else an entered one. Either way it is a field's value (founder, 2026-11-08):
 * a plain number in the sentence and in a calculation sheet, with no site-parameter tag and no "you entered" mark.
 */
export function inputSite(bundle: Bundle, key: P05Input, n: number, source: InputSource, today: string, about: string): SiteValue {
  return asField(source === "p05" ? { ...p05Value(bundle.p05, key), about } : enteredValue(n, p05Units[key], today, about));
}

/** A value the reader set in a visual's own control (a field, a point picked on the chart), as a field's value: plain wherever it shows. */
export function typed(n: number, unit: SiteValue["unit"], today: string, about?: string): SiteValue {
  return asField(enteredValue(n, unit, today, about));
}

/** What a visual receives: the data the loader built for the page and the run date. */
export interface VisualProps {
  data: SignatureData;
  today: string;
}

/** The rate most of the collected banks pay on a current account (F-85), in one sentence: the current-account page and the notes under the
 *  daily money-market fund's table say it in the same words (2026-10-26). */
export function CommonRateLine({ rate, count, of }: { rate: SiteValue; count: SiteValue; of: SiteValue }) {
  return (
    <>
      {copy.common.commonRate.before} <Num value={rate} />: <Num value={count} /> {copy.common.commonRate.of} <Num value={of} /> {copy.common.commonRate.after}
    </>
  );
}
