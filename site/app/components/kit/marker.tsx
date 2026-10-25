// A draggable marker on a chart axis, and the two-bar comparison with a bracket (guide visuals, D29).
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from "react";
import type { SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { cx } from "./cx";

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The measured width of a box (the SVG plots are as wide as their card), 326 px before the script runs. */
export function useWidth(initial = 326): [RefObject<HTMLDivElement | null>, number] {
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
