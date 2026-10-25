// The parts the "what makes it different" visuals share (D29): a measured plot box, the draggable marker that also answers a tap on the
// axis and the arrow keys, the guide inputs the visuals start from (rule 9 of the spec), and small lines (a gap, a source, a figure).
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { guideSignature as copy } from "../../copy";
import type { P05Input } from "@finance-tool/engine";
import { p05Number, p05Range, p05Units, p05Value, type Bundle } from "../../lib/engine";
import { useGoals } from "../../lib/goal";
import type { SignatureData } from "../../lib/guide-signature";
import { useInputs } from "../../lib/inputs";
import { computed, entered as enteredValue, type SiteValue, type Strength } from "../../lib/value";
import { Num } from "../provenance";
import { cx } from "../ui";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The measured width of a box (the SVG plots are as wide as their card), 326 px before the script runs. */
export function useWidth(initial = 326): [React.RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initial);
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(240, Math.round(el.clientWidth)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export interface MarkerProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  /** Accessible name and the text a screen reader hears for the value. */
  label: string;
  valueText: string;
  /** Plot area in px inside its positioned parent (the parent reads left to right). */
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * The marker's hit area: an invisible slider laid over the plot. A press anywhere on it (the axis included) moves the marker there, a
 * drag follows the finger or the mouse, and the arrow keys, Home, End, Page Up and Page Down move it (D29 rule 8). The parent draws
 * the marker itself from the same value. Vertical scrolling of the page is left to the browser (`touch-action: pan-y`).
 */
export function Marker({ min, max, step, value, onChange, label, valueText, left, top, width, height }: MarkerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const snap = useCallback((v: number) => clamp(Math.round((v - min) / step) * step + min, min, max), [min, max, step]);
  const at = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || r.width === 0) return value;
    return snap(min + clamp((clientX - r.left) / r.width, 0, 1) * (max - min));
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    onChange(at(e.clientX));
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) onChange(at(e.clientX));
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(step, Math.round((max - min) / 10 / step) * step);
    const next = { ArrowRight: value + step, ArrowUp: value + step, ArrowLeft: value - step, ArrowDown: value - step, PageUp: value + big, PageDown: value - big, Home: min, End: max }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    onChange(snap(next));
  };
  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-orientation="horizontal"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      onPointerDown={down}
      onPointerMove={move}
      onKeyDown={key}
      className="absolute cursor-ew-resize rounded-sm select-none touch-pan-y"
      style={{ left, top, width, height }}
    />
  );
}

/** The marker as drawn in the plot's SVG: a line with a handle the size of a touch target. */
export function MarkerMark({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <g>
      <line x1={x} x2={x} y1={y1} y2={y2} className="stroke-chart-crosshair" strokeWidth="1.5" />
      <circle cx={x} cy={(y1 + y2) / 2} r="11" className="fill-card stroke-chart-crosshair" strokeWidth="2" />
      <path d={`M ${x - 3} ${(y1 + y2) / 2 - 3} v 6 M ${x + 3} ${(y1 + y2) / 2 - 3} v 6`} className="stroke-chart-crosshair" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

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
  return (
    <p className="text-xs text-muted-foreground">
      {copy.common.sourceLead} {unique.map((s) => copy.common.source[s]).join(", ")}
    </p>
  );
}

// ---------------------------------------------------------------- small pieces

/** "עוד לא חושב" with its reason, for a part the data cannot compute yet. */
export function Gap({ id, className }: { id: string; className?: string }) {
  const reason = (copy.common.gaps as Record<string, string>)[id.split(":")[0]!] ?? copy.common.gapFallback;
  return (
    <p className={cx("text-sm text-muted-foreground max-w-measure", className)}>
      <span className="font-medium text-foreground">{copy.common.notComputed}:</span> {reason}
    </p>
  );
}

/** One figure of the readout: its name above, its provenance number below. */
export function FigureRow({ label, children, tone }: { label: ReactNode; children: ReactNode; tone?: "alt" | "value" | "cost" }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <dt className="text-sm text-muted-foreground flex items-center gap-1.5">
        {tone && <span aria-hidden="true" className={cx("size-2.5 rounded-sm shrink-0", tone === "alt" ? "bg-chart-alt" : tone === "value" ? "bg-chart-net" : "bg-muted-foreground")} />}
        {label}
      </dt>
      <dd className="text-lg font-semibold">{children}</dd>
    </div>
  );
}

/** A computed value of a visual: the engine run or formula that gave it, the inputs it read and the rules. */
export function figure(value: number, unit: SiteValue["unit"], formula: string, inputs: Record<string, SiteValue>, today: string, about: string, rules: { id: string; strength: Strength }[] = []): SiteValue {
  return computed(value, unit, formula, inputs, { today, about, rules });
}

/** The rules a bundle's runs read, as the list a computed value carries. */
export const rulesOfBundle = (b: Bundle): { id: string; strength: Strength }[] => b.rules.map((r) => ({ id: r.id, strength: r.strength as Strength }));

/** A line that names a sourced figure inside a sentence: "{before} {Num} {after}". */
export function Sentence({ before, value, after, display }: { before?: ReactNode; value: SiteValue; after?: ReactNode; display?: string }) {
  return (
    <>
      {before} <Num value={value} display={display} />
      {after ? <> {after}</> : null}
    </>
  );
}

/** A guide input as a value object: P-05's own (a site parameter) when untouched, else an entered one. */
export function inputSite(bundle: Bundle, key: P05Input, n: number, source: InputSource, today: string, about: string): SiteValue {
  return source === "p05" ? { ...p05Value(bundle.p05, key), about } : enteredValue(n, p05Units[key], today, about);
}

/** What a visual receives: the data the loader built for the page and the run date. */
export interface VisualProps {
  data: SignatureData;
  today: string;
}

export interface GainBar {
  key: string;
  label: ReactNode;
  value: SiteValue;
  tone: "value" | "alt";
}

/**
 * Two (or more) amounts as bars from the same start, the difference between the two ends as a bracket with its own number
 * (D29 rule 6: a difference is drawn as a difference, never as a third bar that reads like a third option). Bars grow from the start edge.
 */
export function GainBars({ bars, diff, diffLabel }: { bars: GainBar[]; diff: SiteValue | null; diffLabel: ReactNode }) {
  const nums = bars.map((b) => Math.max(0, Number(b.value.value) || 0));
  const max = Math.max(1e-9, ...nums);
  const hi = Math.max(...nums);
  const lo = Math.min(...nums);
  return (
    <div className="flex flex-col gap-1.5">
      {bars.map((b, i) => (
        <div key={b.key} className="flex flex-col gap-0.5">
          <span className="text-sm text-muted-foreground">{b.label}</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0 h-5 relative">
              <div className={cx("h-full rounded-sm", b.tone === "alt" ? "bg-chart-alt" : "bg-chart-value")} style={{ width: `${Math.max(0.5, (nums[i]! / max) * 100)}%` }} />
            </div>
            <span className="shrink-0 font-semibold w-28 text-end">
              <Num value={b.value} />
            </span>
          </div>
        </div>
      ))}
      {diff && bars.length === 2 && hi > lo && (
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="relative h-3">
              <div className="absolute top-0 h-3 border-x-2 border-b-2 border-foreground/60 rounded-b-sm" style={{ insetInlineStart: `${(lo / max) * 100}%`, width: `${((hi - lo) / max) * 100}%` }} />
            </div>
            {/* the label sits under the bracket's end of the row at full width: padding it to the bracket squeezed it into one word a line (2026-10-25) */}
            <span className="block text-sm text-muted-foreground mt-0.5 text-end">{diffLabel}</span>
          </div>
          <span className="shrink-0 w-28 text-end font-semibold">
            <Num value={diff} />
          </span>
        </div>
      )}
    </div>
  );
}
