// The result across each plan number's range (founder, 2026-10-28, the indices page): one small curve per number, low values at the
// left, a dot at the plan's own value. A steep curve is a number that moves the result a lot. Own SVG, chart roles only.
import type { ReactNode } from "react";
import { useWidth } from "./marker";

export interface Curve {
  id: string;
  label: ReactNode;
  /** The plan's value of this number, as text ("10 שנים"). */
  now: ReactNode;
  /** The slider's ends, as text. */
  ends: [ReactNode, ReactNode];
  /** The result at evenly spread values from the low end to the high end; null where it cannot be priced. */
  ys: (number | null)[];
  /** Where the plan sits, 0 (low end) to 1, and its result. */
  at: { frac: number; y: number };
  /** The result at the high end, as a figure (the curve's own scale tops out there). */
  top: ReactNode;
}

const H = 64;
const PAD = 6;

function Spark({ c }: { c: Curve }) {
  const max = Math.max(0, ...c.ys.filter((v): v is number => v !== null));
  const [ref, w] = useWidth(240);
  const x = (f: number) => PAD + f * (w - 2 * PAD);
  const y = (v: number) => H - PAD - (max > 0 ? (v / max) * (H - 2 * PAD) : 0);
  const n = c.ys.length - 1;
  const d = c.ys.reduce<string>((acc, v, i) => (v === null ? acc : `${acc}${acc && c.ys[i - 1] !== null ? "L" : "M"}${x(i / n).toFixed(1)} ${y(v).toFixed(1)}`), "");
  return (
    <div ref={ref} dir="ltr">
      <svg width={w} height={H} aria-hidden="true" className="block">
        <line x1={PAD} x2={w - PAD} y1={H - PAD} y2={H - PAD} className="stroke-chart-axis" strokeWidth={1} />
        <path d={d} fill="none" className="stroke-chart-value" strokeWidth={2} />
        <circle cx={x(c.at.frac)} cy={y(c.at.y)} r={5} className="fill-chart-net stroke-card" strokeWidth={2} />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
        <span>{c.ends[0]}</span>
        <span>{c.ends[1]}</span>
      </div>
    </div>
  );
}

/** Each curve on its own scale from 0, topped by its high end's figure: the shape says how a number pulls, the figure how far. */
export function ResultCurves({ curves, lead, topWord }: { curves: Curve[]; lead?: ReactNode; topWord: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {lead && <p className="text-sm text-muted-foreground max-w-measure">{lead}</p>}
      <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
        {curves.map((c) => (
          <figure key={c.id} className="flex flex-col gap-1">
            <figcaption className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-medium">{c.label}</span>
              <span className="text-muted-foreground">{c.now}</span>
            </figcaption>
            <span className="text-xs text-muted-foreground">
              {topWord} {c.top}
            </span>
            <Spark c={c} />
          </figure>
        ))}
      </div>
    </div>
  );
}
