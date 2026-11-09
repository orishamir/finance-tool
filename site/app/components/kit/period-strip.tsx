// The plan's years as one strip, each stretch in its own hue with what holds in it written on it (an account on a
// group's price: "the years at the group's price, then the years at the price list"). Time runs left to right, as in every chart; the
// words inside a stretch run right to left. The ends of the stretches are written under the strip. Not a control: nothing in it is pressed.
import { cx } from "./cx";

export interface PeriodSegment {
  /** The stretch in years from today: it starts at `from` and ends at `to`. */
  from: number;
  to: number;
  /** What holds in the stretch, written inside it when it is wide enough. */
  label: string;
  /** `first`: the prices that hold from the start; `middle`: a stretch where only some of them still do; `after`: what follows them (the price list). */
  tone: "first" | "middle" | "after";
}

const TONE = { first: "bg-chart-value", middle: "bg-chart-net", after: "bg-chart-alt" } as const;
/** The share of the strip a stretch needs to hold its words. */
const WIDE = 0.14;
/** The share of the strip two written ends need between them. */
const GAP = 0.13;

/** `years`: the whole strip; `word`: how an end is written ("שנה 5"); `today`: the start's word. The stretches follow one another from 0 to `years`. */
export function PeriodStrip({ years, segments, today, word, label }: { years: number; segments: PeriodSegment[]; today: string; word: (year: number) => string; label: string }) {
  if (years <= 0 || segments.length === 0) return null;
  // an end is written only where it has room: not on top of the start's word, the last end's, or the end before it
  const ends: number[] = [];
  for (const e of [...new Set(segments.map((s) => s.to).filter((t) => t > 0 && t < years))].sort((a, b) => a - b)) {
    if (e / years >= GAP && (years - e) / years >= GAP && (ends.length === 0 || (e - ends[ends.length - 1]!) / years >= GAP)) ends.push(e);
  }
  // a stretch too narrow for its words is named under the strip, so no stretch is a colour without a name
  const unnamed = segments.filter((s) => (s.to - s.from) / years < WIDE);
  const at = (y: number) => `${(Math.min(Math.max(y, 0), years) / years) * 100}%`;
  return (
    <div role="img" aria-label={label} className="flex w-full min-w-0 flex-col gap-1">
      <div dir="ltr" className="flex h-11 rounded-md overflow-hidden">
        {segments.map((s, i) => (
          <span key={`${s.from}-${i}`} className={cx("flex items-center justify-center px-1.5 text-center text-xs font-semibold leading-tight text-background overflow-hidden border-e border-card last:border-e-0", TONE[s.tone])} style={{ width: `${((s.to - s.from) / years) * 100}%` }}>
            <span dir="rtl" className="line-clamp-2">
              {(s.to - s.from) / years >= WIDE ? s.label : null}
            </span>
          </span>
        ))}
      </div>
      <div dir="ltr" className="relative h-5 text-xs text-muted-foreground tabular-nums">
        <span className="absolute start-0">{today}</span>
        {ends.map((e) => (
          <span key={e} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: at(e) }}>
            <span dir="rtl">{word(e)}</span>
          </span>
        ))}
        <span className="absolute end-0 whitespace-nowrap">
          <span dir="rtl">{word(years)}</span>
        </span>
      </div>
      {unnamed.length > 0 && (
        <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          {unnamed.map((s, i) => (
            <li key={`${s.from}-${i}`} className="flex items-center gap-1.5">
              <span aria-hidden="true" className={cx("size-2.5 rounded-sm", TONE[s.tone])} />
              {s.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
