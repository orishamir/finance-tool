// The parts that belong to the "what makes it different" visuals alone (D29): the guide inputs they start from (rule 9 of the spec), the
// run date and what a visual receives, and the lines that look their copy up (the source of a starting value, a gap). The parts any
// page can use (marker, bars, stat, field, legend) live in the shared kit, components/kit.
import type { P05Input, RunResult } from "@finance-tool/engine";
import { guideSignature as copy } from "../../copy";
import { p05Number, p05Range, p05Units, p05Value, type Bundle } from "../../lib/engine";
import { useGoals } from "../../lib/goal";
import type { SignatureData } from "../../lib/guide-signature";
import { useInputs } from "../../lib/inputs";
import { computed, entered as enteredValue, weaker, type SiteValue, type Strength } from "../../lib/value";
import { GapNote, SourceLine as SourceNote } from "../kit";
import { IdText, Num } from "../provenance";

// ---------------------------------------------------------------- the guide inputs a visual starts from

export type InputSource = "guide" | "goal" | "p05";

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
 * fields, else the saved goal's, else P-05's. Editing a control writes the guide's field, the same one the timeline reads.
 */
export function useSigInputs(bundle: Bundle): SigInputs {
  const { state, ready, setEntered } = useInputs();
  const { resolved } = useGoals();
  const p05 = { amount: p05Number(bundle.p05, "amount_now"), monthly: p05Number(bundle.p05, "monthly_deposit"), years: p05Number(bundle.p05, "horizon_years") };
  const pick = (entered: number | undefined, goal: number | null | undefined, base: number): [number, InputSource] => {
    if (!ready) return [base, "p05"];
    if (entered !== undefined) return [entered, "guide"];
    if (goal !== null && goal !== undefined && Number.isFinite(goal)) return [goal, "goal"];
    return [base, "p05"];
  };
  const [amount, sa] = pick(state.entered.amount_now, resolved?.amountNow, p05.amount);
  const [monthly, sm] = pick(state.entered.monthly_deposit, resolved?.monthly, p05.monthly);
  const [years, sy] = pick(state.entered.horizon_years, resolved?.horizonYears, p05.years);
  const set = (key: "amount_now" | "monthly_deposit" | "horizon_years", base: number) => (n: number | null) => setEntered(key, n === null || n === base ? null : n);
  return { amount, monthly, years, source: { amount: sa, monthly: sm, years: sy }, ready, setAmount: set("amount_now", p05.amount), setMonthly: set("monthly_deposit", p05.monthly), setYears: set("horizon_years", p05.years), p05 };
}

/** The slider range of the years field, from P-05. */
export const yearsRange = (bundle: Bundle) => p05Range(bundle.p05, "sliders", "horizon_years") ?? { min: 1, max: 40, step: 1, values: {} };

/** Where the starting values came from, in one small line under the controls. */
export function SourceLine({ sources }: { sources: InputSource[] }) {
  const unique = [...new Set(sources)];
  return <SourceNote lead={copy.common.sourceLead} items={unique.map((s) => copy.common.source[s] ?? "")} />;
}

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

/** The rules a bundle's runs read, as the list a computed value carries. */
export const rulesOfBundle = (b: Bundle): { id: string; strength: Strength }[] => b.rules.map((r) => ({ id: r.id, strength: r.strength as Strength }));

/** A guide input as a value object: P-05's own (a site parameter) when untouched, else an entered one. */
export function inputSite(bundle: Bundle, key: P05Input, n: number, source: InputSource, today: string, about: string): SiteValue {
  return source === "p05" ? { ...p05Value(bundle.p05, key), about } : enteredValue(n, p05Units[key], today, about);
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
