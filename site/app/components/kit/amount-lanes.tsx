// The lanes under a chart by size (`ShareChart`), on the same amount axis: a lane a fee, its parts along the amounts each with its words
// (which part decides there: "מינימום 39 $", "0.25%") inside it wherever they fit, a part too narrow for its words with them under the lane,
// centred under the part or held to the lane's end it reaches, joined to it by a tick in the fee's colour, and bold while the part holds the
// reader's amount. A fee whose price is the same at every amount is one quiet line up to its name and price. Lanes stand in groups, each under its
// small name. The reader's amount runs down through them as a line, and the part holding it is lit and outlined in its fee's colour; a
// tap on a part hands it up (the chart's point moves into it), and the lane under the pointer is handed up too, so the page can set it
// apart in the chart and the reading as well: the lane set apart has its name bold and every part outlined, and where the others step back
// (`back`) their parts fade, the lit part staying as it is. A part takes a press 44 px tall and at least 44 px wide, however small it is
// drawn. On a phone a lane's name takes its period (`per`) and its parts only their figures (`short`). Inside a `ShareStack` the stack draws
// the reader's line through the chart and the lanes at once.
import type { PointerEvent, ReactNode } from "react";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";
import { logAt, type LogRange } from "./log-axis";
import { SHARE_PLOT, useInStack } from "./share-chart";
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
 * A fee's lane: its name, its swatch (`bg-fee-trade`) and its edge (`border-fee-trade`, a part's outline), its parts, or none for a price
 * the same at every amount, whose quiet line carries `price` after the name. `per`: the words a phone adds to the name (the period its
 * parts' figures are per). `group`: the group it stands in.
 */
export interface AmountLane {
  id: string;
  name: string;
  swatch: string;
  edge?: string;
  parts: AmountLanePart[] | null;
  price?: ReactNode;
  per?: string;
  group?: string;
}

/** The narrowest container that still writes a part's whole words; narrower is a phone's. */
const PHONE = 520;
/** Room a part's words keep inside it at each side: they stand inside wherever this much is left. */
const PART_PAD = 4;

const clip = (range: LogRange, a: number) => Math.max(0, Math.min(1, logAt(range, Math.max(a, range.lo * 1e-9))));

/**
 * `title`: the lanes' heading. `groups`: the groups' names in order, by id (lanes without a group stand first, under no name). `at`: the
 * reader's amount; `strong`: the lane set apart, and `back`, whether the other lanes step back while it is. `onPart` and `onLane`: a tap on
 * a part, the lane under the pointer (null as it leaves).
 */
export function AmountLanes({ title, range, lanes, groups = [], at = null, entered = false, strong = null, back = false, onPart, onLane, className }: { title: ReactNode; range: LogRange; lanes: AmountLane[]; groups?: { id: string; label: string }[]; at?: number | null; /** The reader's amount is one they set (the chart's point): its line is in the entered colour. */ entered?: boolean; strong?: string | null; back?: boolean; onPart?: (lane: string, part: AmountLanePart) => void; onLane?: (lane: string | null) => void; className?: string }) {
  const [ref, w] = useWidth(560);
  const stacked = useInStack();
  const phone = w < PHONE;
  const plotW = Math.max(1, w - SHARE_PLOT.left - SHARE_PLOT.right);
  const sets = [{ id: "", label: "" }, ...groups].map((g) => ({ g, lanes: lanes.filter((l) => (l.group ?? "") === g.id) })).filter((s) => s.lanes.length > 0);
  // one part lit in a lane, at a boundary the earlier one (a part "up to" a sum takes its top in), as the reading picks it
  const holds = (p: AmountLanePart) => at !== null && at > p.from * (1 - 1e-9) && (p.to === null || at <= p.to * (1 + 1e-9));
  const lit = (p: AmountLanePart) => holds(p) && lanes.find((l) => l.parts?.includes(p))?.parts?.find(holds) === p;
  const inset = { marginLeft: SHARE_PLOT.left, marginRight: SHARE_PLOT.right };

  return (
    <div ref={ref} className={cx("relative flex flex-col gap-2", className)}>
      <h4 className="text-sm font-semibold">{title}</h4>
      {sets.map(({ g, lanes: ls }) => (
        <div key={g.id || "-"} className="flex flex-col gap-2">
          {g.label && <p className="text-xs text-muted-foreground">{g.label}</p>}
          {ls.map((l) => {
            const name = phone && l.per ? `${l.name}${l.per}` : l.name;
            const hot = strong === l.id;
            const dim = back && strong !== null && !hot;
            const nameClass = cx("flex items-center gap-1.5 text-xs", hot ? "font-semibold text-foreground" : "text-muted-foreground", dim && "opacity-70");
            const events = onLane ? { onPointerEnter: (e: PointerEvent) => e.pointerType === "mouse" && onLane(l.id), onPointerLeave: (e: PointerEvent) => e.pointerType === "mouse" && onLane(null) } : {};
            if (!l.parts)
              return (
                <div key={l.id} {...events} className="flex items-center gap-3">
                  <span className={cx(nameClass, "shrink-0")}>
                    <span aria-hidden="true" className={cx("size-2 rounded-full", l.swatch)} />
                    {name}
                    {l.price && <span>· {l.price}</span>}
                  </span>
                  <span data-lane-bar aria-hidden="true" className={cx("flex-1 rounded-full transition-opacity", l.swatch, hot ? "h-[5px]" : "h-[3px]", hot ? "opacity-100" : dim ? "opacity-30" : "opacity-60")} style={{ marginLeft: SHARE_PLOT.left }} />
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
              <div key={l.id} {...events} className="flex flex-col gap-1">
                <span className={nameClass}>
                  <span aria-hidden="true" className={cx("size-2 rounded-full", l.swatch)} />
                  {name}
                </span>
                <div data-lane-bar dir="ltr" className="relative h-7" style={inset}>
                  {parts.map(({ p, s, e, words, fits }) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onPart?.(l.id, p)}
                      aria-label={`${l.name}: ${p.label}`}
                      aria-pressed={lit(p)}
                      className={cx(
                        "absolute inset-y-0 rounded-md text-xs font-semibold tabular-nums transition-colors",
                        // the press reaches 44 px tall and at least 44 px wide round the part, centred on it
                        "after:absolute after:z-[1] after:top-1/2 after:h-[max(100%,var(--target))] after:-translate-y-1/2 after:inset-x-[min(0px,calc((100%_-_var(--target))/2))] after:content-['']",
                        lit(p) ? "border-[1.5px]" : "border",
                        lit(p) || hot ? (l.edge ?? "border-current") : "border-transparent",
                        onPart ? "cursor-pointer" : "cursor-default",
                      )}
                      style={{ left: `calc(${s * 100}% + 1px)`, width: `calc(${(e - s) * 100}% - 2px)` }}
                    >
                      <span aria-hidden="true" className={cx("absolute inset-0 rounded-[5px]", l.swatch, lit(p) ? "opacity-45" : hot ? "opacity-30" : dim ? "opacity-[0.08]" : "opacity-20")} />
                      {fits && (
                        <span dir="rtl" className={cx("relative whitespace-nowrap text-foreground", !lit(p) && !hot && "font-normal")}>
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
                        // centred under its part, or held to the lane's end where centred it would run past it
                        const half = (chartTextWidth(words, CHART_TEXT_PX) / 2) / plotW;
                        const place = mid + half > 1 ? { right: "0%", alignItems: "flex-end" } : mid - half < 0 ? { left: "0%", alignItems: "flex-start" } : { left: `${mid * 100}%`, transform: "translateX(-50%)", alignItems: "center" };
                        return [
                          <span key={`${p.id}:tick`} aria-hidden="true" className={cx("absolute -top-1 h-1.5 w-[1.5px]", l.swatch)} style={{ left: `${mid * 100}%` }} />,
                          <span key={p.id} className={cx("absolute top-1 flex flex-col text-xs", lit(p) ? "font-semibold text-foreground" : "text-muted-foreground")} style={place}>
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
      {!stacked && at !== null && at >= range.lo && at <= range.hi && (
        <div aria-hidden="true" dir="ltr" className="pointer-events-none absolute inset-y-0 inset-s-0 inset-e-0 top-6" style={inset}>
          <span className={cx("absolute inset-y-0 w-px", entered ? "bg-entered" : "bg-chart-crosshair")} style={{ left: `${clip(range, at) * 100}%` }} />
        </div>
      )}
    </div>
  );
}
