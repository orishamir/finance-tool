// The lanes under a chart by size (`ShareChart`), on the same amount axis: a lane a fee, its parts along the amounts each with its words
// (which part decides there: "מינימום 39 $", "0.25%"), a part too narrow for its words with them under the lane at its place, joined by a
// tick. A fee whose price is the same at every amount is one quiet line up to its name and price. Lanes stand in groups, each under its
// small name. The reader's amount runs down through them as a line, and the part holding it is lit; a tap on a part hands it up (the
// chart's point moves into it), and the lane under the pointer is handed up too, so the page can set it apart in the chart and the
// reading as well. On a phone a lane's name takes its period (`per`) and its parts only their figures (`short`).
import type { PointerEvent, ReactNode } from "react";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";
import { logAt, type LogRange } from "./log-axis";
import { SHARE_PLOT } from "./share-chart";
import { cx } from "./cx";
import { useWidth } from "./marker";

/** A part of a lane: the amounts it holds over (`to` null: to the axis's end), its words, and its words on a phone. */
export interface AmountLanePart {
  id: string;
  from: number;
  to: number | null;
  label: string;
  short?: string;
}

/**
 * A fee's lane: its name, its swatch (`bg-fee-trade`), its parts, or none for a price the same at every amount, whose quiet line carries
 * `price` after the name. `per`: the words a phone adds to the name (the period its parts' figures are per). `group`: the group it stands in.
 */
export interface AmountLane {
  id: string;
  name: string;
  swatch: string;
  parts: AmountLanePart[] | null;
  price?: ReactNode;
  per?: string;
  group?: string;
}

/** The narrowest container that still writes a part's whole words; narrower is a phone's. */
const PHONE = 520;
/** Room a part's words keep inside it at each side. */
const PART_PAD = 12;

const clip = (range: LogRange, a: number) => Math.max(0, Math.min(1, logAt(range, Math.max(a, range.lo * 1e-9))));

/**
 * `title`: the lanes' heading. `groups`: the groups' names in order, by id (lanes without a group stand first, under no name). `at`: the
 * reader's amount; `strong`: the lane set apart. `onPart` and `onLane`: a tap on a part, the lane under the pointer (null as it leaves).
 */
export function AmountLanes({ title, range, lanes, groups = [], at = null, entered = false, strong = null, onPart, onLane, className }: { title: ReactNode; range: LogRange; lanes: AmountLane[]; groups?: { id: string; label: string }[]; at?: number | null; /** The reader's amount is one they set (the chart's point): its line is in the entered colour. */ entered?: boolean; strong?: string | null; onPart?: (lane: string, part: AmountLanePart) => void; onLane?: (lane: string | null) => void; className?: string }) {
  const [ref, w] = useWidth(560);
  const phone = w < PHONE;
  const plotW = Math.max(1, w - SHARE_PLOT.left - SHARE_PLOT.right);
  const sets = [{ id: "", label: "" }, ...groups].map((g) => ({ g, lanes: lanes.filter((l) => (l.group ?? "") === g.id) })).filter((s) => s.lanes.length > 0);
  const lit = (p: AmountLanePart) => at !== null && at > p.from * (1 - 1e-9) && (p.to === null || at <= p.to * (1 + 1e-9));
  const inset = { marginLeft: SHARE_PLOT.left, marginRight: SHARE_PLOT.right };

  return (
    <div ref={ref} className={cx("relative flex flex-col gap-2", className)}>
      <h4 className="text-sm font-semibold">{title}</h4>
      {sets.map(({ g, lanes: ls }) => (
        <div key={g.id || "-"} className="flex flex-col gap-2">
          {g.label && <p className="text-xs text-muted-foreground">{g.label}</p>}
          {ls.map((l) => {
            const name = phone && l.per ? `${l.name}${l.per}` : l.name;
            const dim = strong !== null && strong !== l.id;
            const events = onLane ? { onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && onLane(l.id), onPointerLeave: (e: PointerEvent) => e.pointerType === "mouse" && onLane(null) } : {};
            if (!l.parts)
              return (
                <div key={l.id} {...events} className={cx("flex items-center gap-3 transition-opacity", dim && "opacity-40")}>
                  <span className={cx("flex shrink-0 items-center gap-1.5 text-xs", strong === l.id ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    <span aria-hidden="true" className={cx("size-2 rounded-full", l.swatch)} />
                    {name}
                    {l.price && <span>· {l.price}</span>}
                  </span>
                  <span aria-hidden="true" className={cx("h-[3px] flex-1 rounded-full opacity-60", l.swatch)} style={{ marginLeft: SHARE_PLOT.left }} />
                </div>
              );
            const parts = l.parts
              .filter((p) => (p.to === null || p.to > range.lo) && p.from < range.hi)
              .map((p) => {
                const s = clip(range, p.from);
                const e = p.to === null ? 1 : clip(range, p.to);
                const words = phone ? (p.short ?? p.label) : p.label;
                const fits = (e - s) * plotW >= chartTextWidth(words, CHART_TEXT_PX) + 2 * PART_PAD;
                return { p, s, e, words, fits };
              });
            return (
              <div key={l.id} {...events} className={cx("flex flex-col gap-1 transition-opacity", dim && "opacity-40")}>
                <span className={cx("flex items-center gap-1.5 text-xs", strong === l.id ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  <span aria-hidden="true" className={cx("size-2 rounded-full", l.swatch)} />
                  {name}
                </span>
                <div dir="ltr" className="relative h-7" style={inset}>
                  {parts.map(({ p, s, e, words, fits }) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onPart?.(l.id, p)}
                      aria-label={`${l.name}: ${p.label}`}
                      aria-pressed={lit(p)}
                      className={cx("absolute inset-y-0 overflow-hidden rounded-md border text-xs font-semibold tabular-nums transition-colors", lit(p) ? "border-current" : "border-transparent", onPart ? "cursor-pointer" : "cursor-default")}
                      style={{ left: `calc(${s * 100}% + 1px)`, width: `calc(${(e - s) * 100}% - 2px)` }}
                    >
                      <span aria-hidden="true" className={cx("absolute inset-0", l.swatch, lit(p) ? "opacity-45" : "opacity-20")} />
                      {fits && (
                        <span dir="rtl" className="relative whitespace-nowrap text-foreground">
                          {words}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {parts.some((x) => !x.fits) && (
                  <div dir="ltr" className="relative h-5" style={inset}>
                    {parts
                      .filter((x) => !x.fits)
                      .map(({ p, s, e, words }) => {
                        const mid = (s + e) / 2;
                        const right = mid > 0.5;
                        return [
                          <span key={`${p.id}:tick`} className="absolute -top-1 h-1.5 w-px bg-muted-foreground" style={{ left: `${mid * 100}%` }} />,
                          <span key={p.id} className="absolute top-1 flex flex-col text-xs text-muted-foreground" style={right ? { right: `${(1 - e) * 100}%`, alignItems: "flex-end" } : { left: `${s * 100}%`, alignItems: "flex-start" }}>
                            <span dir="rtl" className="whitespace-nowrap leading-4">
                              {words}
                            </span>
                          </span>,
                        ];
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      {at !== null && at >= range.lo && at <= range.hi && (
        <div aria-hidden="true" dir="ltr" className="pointer-events-none absolute inset-y-0 start-0 end-0 top-6" style={inset}>
          <span className={cx("absolute inset-y-0 w-px", entered ? "bg-entered" : "bg-chart-crosshair")} style={{ left: `${clip(range, at) * 100}%` }} />
        </div>
      )}
    </div>
  );
}
