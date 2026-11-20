// What something costs as a share of an amount, the amount on a log axis (the deal's charts by size, method F-112 and F-123). Its curve is
// either one line (what one action costs) or layers stacked from zero with their total as a line on top (what a year of holding costs, the
// layers a fee each, named by group inside one of the group's layers where it holds the name). Over the plot it may carry zones named above
// it (which part decides), the amounts where the cost changes behaviour as points with their words right at them (charts.md, "Labels"),
// and where the curve leaves the top of the axis, its value at the axis's start written over the value axis. A point the reader drags reads
// one amount (an action's size); on a chart without one, the pointer reads the amount under it with a box of its values beside it, a tap on
// a phone, and a drag with a mouse picks a range to zoom to. On a phone the chart says less: no group names, a mark's label without the
// line over it, fewer amounts under it, a lower plot, and on a chart with a point no labels and no tag, the point held by a knob on the
// amount axis. The lanes under the chart (`AmountLanes`) stand on the same plot: both keep `SHARE_PLOT`'s room at the sides, and inside a
// `ShareStack` the reader's amount is one line from the chart's top down through the lanes. Own SVG.
import { createContext, useContext, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { fmt } from "../../lib/format";
import { ChartTip } from "./chart-interact";
import { CHART_TEXT_PX, chartTextWidth } from "./chart-text";
import { amountAt, amountTick, logAt, logTicks, shareTicks, type LogRange } from "./log-axis";
import { cx } from "./cx";
import { useWidth } from "./marker";

/** The room at the plot's two sides, in px: the value axis's words at its left, and air at its right. The lanes under it keep the same. */
export const SHARE_PLOT = { left: 44, right: 14 } as const;

/** A sample of the curve: its total share at an amount (a percent, 0.77 for 0.77%), and on a layered chart each layer's share, bottom up. */
export interface SharePoint {
  at: number;
  share: number;
  layers?: number[];
}

/** A layer of a layered chart, bottom up: its fill (`fill-fee-custody`), its edge while it is set apart (`stroke-fee-custody`), and the group it is named with. */
export interface ShareLayer {
  id: string;
  fill: string;
  edge?: string;
  group: string;
}

/** A group of layers, named on its band where the band holds the name (`groupNameAt`). */
export interface ShareGroup {
  id: string;
  label: string;
}

/** A point on the curve where it changes behaviour: its words over it (`label`, a line above it `sub`), and a sentence beside it (`note`). */
export interface ShareMark {
  id: string;
  at: number;
  label: string;
  sub?: string;
  note?: string[];
}

/** A stretch of amounts named above the plot (which part decides there), drawn a shade apart from its neighbours. */
export interface ShareZone {
  from: number;
  to: number;
  label: string;
}

const TEXT_UP = 11;
const TEXT_DOWN = 3;
/** Over a mark's point, its label's baseline; a mark with a line over its label (`sub`) stands a little higher, above and to the right. */
const MARK_LABEL = 10;
const SUB_LABEL = 12;
/** How far right of its point a mark with a line over its label starts. */
const SUB_RIGHT = 8;
/** How far past its point's middle a label beside it starts, so a curve that jumps at the point never runs through it. */
const AT_DOT = 2;
const MARK_ROW = 16;
/** How far round a mark's point no label may stand (its 4.5 px dot and its 2 px ring, and air). */
const POINT_CLEAR = 7;
/** The least room between a mark's label and another label or the value axis's words. */
const LABEL_GAP = 4;
/** The furthest a drop's sentence may stand from its point, and how far along the axis it may move to clear the labels beside it. */
const NOTE_REACH = 110;
const NOTE_SLIDE = 90;
/** A label standing this close under another, under more than a quarter of the narrower one's width, is tucked under it: a drop's sentence never stands there. */
const TUCK = 2 * MARK_ROW;
const TUCK_OVER = 0.25;
/** A line of a mark's words above its first, and of a note. */
const LINE = 14;
/** Room over the plot: the zones' names and the value over the axis. */
const ZONE_ROW = 22;
/** Room under the plot for the amounts and the axis's name. */
const BOTTOM = 40;
/** The least room between two amounts written under the plot. */
const X_LABEL_GAP = 10;
/** The pixels a mouse must travel before a press is a drag. */
const DRAG = 4;

type Box = { left: number; right: number; top: number; bottom: number };
const meet = (a: Box, b: Box, gap: number) => a.left < b.right + gap && b.left < a.right + gap && a.top < b.bottom + gap && b.top < a.bottom + gap;

/** A line a label must not stand on: the curve's line (its height at a place, `y`), or a vertical one (`x`, from `top` down to `bottom`): a mark's dashed drop, the reader's line. */
export type LabelLine = { y: (x: number) => number } | { x: number; top: number; bottom: number };

/** Whether a line runs through a label's box (or within 2 px of it), the box sampled every 3 px along a curve. */
function crosses(b: Box, l: LabelLine): boolean {
  if ("x" in l) return l.x > b.left - 2 && l.x < b.right + 2 && l.top < b.bottom + 2 && b.top - 2 < l.bottom;
  for (let x = b.left; x <= b.right; x += 3) {
    const y = l.y(x);
    if (y > b.top - 2 && y < b.bottom + 2) return true;
  }
  return false;
}

/**
 * What a label on the plot is: a mark's words at its point (`mark`), a mark's words with a line over them (`sub`, the crossover's "כאן
 * הקבועים שווים לאחוזים"), or the sentence beside a drop (`note`).
 */
export type LabelKind = "mark" | "sub" | "note";

/** Where a label stands against its point: over it, or beside it to its right or its left. */
export type LabelSide = "over" | "right" | "left";

/**
 * Where each label stands, in the order given (charts.md, "Labels": a label sits at its mark, never on another label, on the axis's words or
 * on the chart's lines, and one that has no room gives way; no line joins a label to its point). A mark's words stand right at their point
 * (`cx`, `cy`; `half` the label's half width, `up` the room its lines above the first take): centred over it, or else just to its right or
 * just to its left; a mark with a line over its words (`sub`) tries above and to the right first. A drop's sentence (`note`) stands beside
 * its drop, after it along the axis, past any label already there, its bottom level with the point or rows higher; else before it; else,
 * where neither side has its width, over the drop, as far toward the larger amounts as the plot lets it. It never stands tucked under
 * another label. Each place is held inside the plot (from `plotL` to `plotR`) and past the value axis's words, and is
 * free where it meets no word of the axis, no mark's point, no label already placed, no line (`lines`) and nothing in `keepOut` (the
 * reader's point and its tag). `lx`, `by`: the label's middle and its last line's baseline; `side`, where it stands against its point, so
 * a label beside it lines its words up on the edge nearest the point. A label with no free place gives way (null); its point stays.
 */
export function markLabels(points: readonly { cx: number; cy: number; half: number; up?: number; kind?: LabelKind }[], axisWords: readonly { right: number; top: number; bottom: number }[], plotR: number, lines: readonly LabelLine[] = [], plotL = 0, keepOut: readonly Box[] = []): ({ lx: number; by: number; side: LabelSide } | null)[] {
  const axis: Box[] = axisWords.map((a) => ({ left: 0, right: a.right, top: a.top, bottom: a.bottom }));
  const dots: Box[] = points.filter((p) => p.kind !== "note").map((p) => ({ left: p.cx - POINT_CLEAR, right: p.cx + POINT_CLEAR, top: p.cy - POINT_CLEAR, bottom: p.cy + POINT_CLEAR }));
  const taken: Box[] = [];
  return points.map(({ cx, cy, half, up = 0, kind = "mark" }) => {
    const box = (lx: number, by: number): Box => ({ left: lx - half, right: lx + half, top: by - TEXT_UP - up, bottom: by + TEXT_DOWN });
    // a mark's own drop runs down from its point, under any place its label takes
    const others = lines.filter((l) => !("x" in l) || Math.abs(l.x - cx) > 0.5);
    const free = (b: Box) =>
      b.top >= 0 &&
      b.left >= plotL - 0.5 &&
      b.right <= plotR + 0.5 &&
      !axis.some((a) => meet(b, a, LABEL_GAP - 1)) &&
      !dots.some((d) => meet(b, d, 0)) &&
      !taken.some((t) => meet(b, t, LABEL_GAP)) &&
      !keepOut.some((k) => meet(b, k, LABEL_GAP)) &&
      !others.some((l) => crosses(b, l));
    const take = (b: Box, lx: number, by: number, side: LabelSide) => {
      taken.push(b);
      return { lx, by, side };
    };
    if (kind !== "note") {
      const by = cy - (kind === "sub" ? SUB_LABEL : MARK_LABEL);
      const centre = cx;
      const right = cx + (kind === "sub" ? SUB_RIGHT : AT_DOT) + half;
      const left = cx - AT_DOT - half;
      const sides: [number, LabelSide][] = kind === "sub" ? [[right, "right"], [centre, "over"], [left, "left"]] : [[centre, "over"], [right, "right"], [left, "left"]];
      for (const [x0, side] of sides) {
        // held inside the plot and past the axis's words, it still stands at its point: over it or touching its side
        let lx = Math.max(plotL + half, Math.min(plotR - half, x0));
        for (const a of axis) if (meet(box(lx, by), a, LABEL_GAP)) lx = a.right + LABEL_GAP + half;
        const b = box(lx, by);
        if (b.left > cx + SUB_RIGHT + 0.5 || b.right < cx - AT_DOT - 0.5) continue;
        if (free(b)) return take(b, lx, by, side);
      }
      return null;
    }
    // a drop's sentence: beside its drop, after it and then before it, sliding along the axis past the labels in its way
    const tucked = (b: Box) => taken.some((t) => Math.min(t.right, b.right) - Math.max(t.left, b.left) > TUCK_OVER * Math.min(t.right - t.left, b.right - b.left) && t.bottom <= b.top + 1 && b.top - t.bottom < TUCK);
    const rows = (each: (by: number) => { lx: number; by: number; side: LabelSide } | null) => {
      for (let row = 0; ; row++) {
        const by = cy - MARK_LABEL - row * MARK_ROW;
        if (cy - (by - TEXT_UP - up) > NOTE_REACH) return null;
        const got = each(by);
        if (got) return got;
      }
    };
    for (const after of [true, false]) {
      const got = rows((by) => {
        let edge = after ? cx + POINT_CLEAR + 2 : cx - POINT_CLEAR - 2;
        for (let k = 0; k < 4; k++) {
          const b = box(after ? edge + half : edge - half, by);
          const hit = taken.find((t) => meet(b, t, LABEL_GAP));
          if (!hit) break;
          edge = after ? hit.right + LABEL_GAP : hit.left - LABEL_GAP;
        }
        if (Math.abs(edge - cx) > NOTE_SLIDE) return null;
        const lx = after ? edge + half : edge - half;
        const b = box(lx, by);
        return free(b) && !tucked(b) ? take(b, lx, by, after ? "right" : "left") : null;
      });
      if (got) return got;
    }
    return rows((by) => {
      const lx = Math.max(plotL + half, plotR - half);
      const b = box(lx, by);
      return b.left <= cx && free(b) && !tucked(b) ? take(b, lx, by, "over") : null;
    });
  });
}

/** The value of a sampled curve at an amount, straight between two samples; at a jump (two samples at one amount), the one after it. */
export function shareAt(points: readonly SharePoint[], a: number, of: (p: SharePoint) => number = (p) => p.share): number {
  if (points.length === 0) return 0;
  // the first sample past the amount, by halving (the samples rise)
  let lo = 0;
  let hi = points.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (points[m]!.at > a) hi = m;
    else lo = m + 1;
  }
  const k = lo;
  if (k === points.length) return of(points.at(-1)!);
  if (k === 0) return of(points[0]!);
  const p = points[k - 1]!;
  const q = points[k]!;
  return of(p) + ((of(q) - of(p)) * (Math.log(a) - Math.log(p.at))) / (Math.log(q.at) - Math.log(p.at) || 1);
}

const pct = (v: number) => fmt.pct(v);

/** Narrower than this a chart is a phone's: no group names, no lines over a mark's label, the axis's short name, the point as a knob. */
const NARROW = 560;
/** A label's text box, its baseline to its top and bottom, with room round it: what a layer must hold along a group name's width. */
const NAME_ROOM = TEXT_UP + TEXT_DOWN + 8;
/** How far a group name stands from a mark's drop at its stretch's ends. */
const NAME_CLEAR = 8;
/** Two places whose room differs by less than this hold a group name equally well: the one nearer its stretch's middle is taken. */
const ROOM_TIE = 2;
/** The point's knob on the amount axis on a phone, its radius. */
const KNOB = 11;
/** How far from the reader's line a mark's label gives way to it and to the box of values beside it. */
const TIP_CLEAR = 40;

/**
 * Where a group's name stands (charts.md, "Labels"): inside one of the group's layers, its whole box clear of that layer's two edges along
 * its whole width, so it never sits on a line between two layers. It stands in a stretch between two of the marks' amounts (or the axis's
 * ends), clear of the drops at its ends: the stretch nearest the axis's middle that holds it, at the place there where a layer leaves it
 * the most room (a fixed sum's layer is thickest at its small amounts), and of places about as roomy, the one nearest the stretch's middle;
 * never where it would meet a box in `avoid` (the marks' words). `cuts`: those amounts in px, in order; `layers(px)`: each of the group's
 * layers' top and bottom in px there. Null where no stretch holds it.
 */
export function groupNameAt(cuts: readonly number[], wide: number, layers: (px: number) => readonly { top: number; bottom: number }[], avoid: readonly Box[] = []): { px: number; mid: number } | null {
  if (cuts.length < 2) return null;
  const middle = (cuts[0]! + cuts.at(-1)!) / 2;
  const stretches = cuts.slice(1).map((r, k) => ({ l: cuts[k]!, r }));
  const far = (s: { l: number; r: number }) => (middle >= s.l && middle <= s.r ? 0 : Math.min(Math.abs(middle - s.l), Math.abs(middle - s.r)));
  for (const s of [...stretches].sort((a, b) => far(a) - far(b))) {
    const from = s.l + (s.l > cuts[0]! ? NAME_CLEAR : 2) + wide / 2;
    const to = s.r - (s.r < cuts.at(-1)! ? NAME_CLEAR : 2) - wide / 2;
    if (to < from) continue;
    // each layer's edges along the stretch, a sample every 2 px
    const xs: number[] = [];
    for (let px = from - wide / 2; px <= to + wide / 2 + 2; px += 2) xs.push(px);
    const bands = xs.map((px) => layers(px));
    const n = bands[0]?.length ?? 0;
    const span = Math.ceil(wide / 2);
    const mid = (s.l + s.r) / 2;
    const fits: { px: number; mid: number; room: number }[] = [];
    for (let i = 0; i + span < xs.length; i++) {
      const c = xs[i]! + wide / 2;
      if (c > to + 0.5) break;
      for (let k = 0; k < n; k++) {
        let top = -Infinity;
        let bottom = Infinity;
        for (let j = i; j <= i + span; j++) {
          top = Math.max(top, bands[j]![k]!.top);
          bottom = Math.min(bottom, bands[j]![k]!.bottom);
        }
        const room = bottom - top;
        if (room < NAME_ROOM) continue;
        const m = (top + bottom) / 2;
        const box = { left: c - wide / 2, right: c + wide / 2, top: m - TEXT_UP + 4, bottom: m + TEXT_DOWN + 4 };
        if (avoid.some((a) => meet(box, a, LABEL_GAP))) continue;
        fits.push({ px: c, mid: m, room });
      }
    }
    if (fits.length === 0) continue;
    const most = Math.max(...fits.map((f) => f.room));
    const best = fits.filter((f) => f.room >= most - ROOM_TIE).sort((a, b) => Math.abs(a.px - mid) - Math.abs(b.px - mid))[0]!;
    return { px: best.px, mid: best.mid };
  }
  return null;
}

/** A chart by size and its lanes inside a `ShareStack`: the stack draws the reader's line, so neither draws its own. */
const StackCtx = createContext(false);

/**
 * A `ShareChart` and the `AmountLanes` under it on one amount axis, the reader's amount (`at`, inside `range`) drawn once as one unbroken
 * line from the top of the chart's plot down through the lanes to the last one, a part's bar or a quiet line, in the entered colour where the reader set
 * it (`entered`, the chart's point) and the pointer's colour where the pointer reads it.
 */
export function ShareStack({ range, at, entered = false, children, className }: { range: LogRange; at: number | null; entered?: boolean; children: ReactNode; className?: string }) {
  const [ref, w] = useWidth(560);
  const [span, setSpan] = useState<{ top: number; bottom: number } | null>(null);
  // the line's ends, read off what the stack holds: the chart's plot (`data-plot`) and the lanes' last bar (`data-lane-bar`)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const plot = el.querySelector("[data-plot]")?.getBoundingClientRect();
    const bars = el.querySelectorAll("[data-lane-bar]");
    const last = bars.length ? bars[bars.length - 1]!.getBoundingClientRect() : null;
    const next = plot ? { top: Math.round(plot.top - box.top), bottom: Math.round((last ?? plot).bottom - box.top) } : null;
    if (next?.top !== span?.top || next?.bottom !== span?.bottom) setSpan(next);
  });
  const shown = at !== null && span !== null && at >= range.lo * (1 - 1e-9) && at <= range.hi * (1 + 1e-9);
  const left = SHARE_PLOT.left + logAt(range, at ?? range.lo) * Math.max(0, w - SHARE_PLOT.left - SHARE_PLOT.right);
  return (
    <StackCtx.Provider value={true}>
      <div ref={ref} className={cx("relative flex flex-col gap-4", className)}>
        {children}
        {shown && <span aria-hidden="true" className={cx("pointer-events-none absolute z-[1] w-px", entered ? "bg-entered" : "bg-chart-crosshair")} style={{ left, top: span.top, height: Math.max(0, span.bottom - span.top) }} />}
      </div>
    </StackCtx.Provider>
  );
}

/** Whether a chart or its lanes stand in a `ShareStack`, which draws the reader's line for them. */
export const useInStack = () => useContext(StackCtx);

/**
 * `range`: the amounts the axis spans. `points`: the curve sampled over it, rising (two samples at one amount where it jumps). `top`: the
 * least the value axis reaches (its nice step at or above it is its top); the curve above it is cut at the top, and `over` is then written
 * over the value axis ("↑ 14.4% ב־1,000"), on a row of its own where the first zone's name would meet it. `layers` and `groups`: a layered
 * chart's layers bottom up, each sample's `layers` their shares; `strong`, a layer set apart (it turns near solid with an edge in its own
 * colour, `edge`, and the others step back), and `onStrong`, the layer under the pointer. `marks`, `zones`: as their types say.
 * `point`: the reader's amount and its tag, which a drag, a tap or the arrow keys move (`onPoint`); `spoken` names it; on a phone the tag
 * and the marks' words give way and the point is held by a large knob on the amount axis. Without a point, the pointer reads the amount
 * under it (`onRead`, null as it leaves; `boxed` where the chart shows `tip`'s box of values beside it, from 640 px), with a dot where its
 * line meets the curve, the amount read held to `snap` (a round amount); the drop's sentences, the group names it crosses and any mark's
 * words near the line give way to it, on a phone as on a computer. `onRange`, a mouse's drag across the plot, which shows only the range
 * and its two ends while it lasts. `xTitle` names the amount under the axis, `xShort` on a phone. `height`: the plot's, and
 * `narrowHeight` on a phone.
 */
export function ShareChart({
  range,
  points,
  top,
  over,
  layers,
  groups,
  strong = null,
  onStrong,
  marks = [],
  zones = [],
  point,
  onPoint,
  spoken,
  onRead,
  tip,
  onRange,
  xTitle,
  xShort,
  snap = (a: number) => a,
  height = 280,
  narrowHeight = 200,
  className,
}: {
  range: LogRange;
  points: SharePoint[];
  top: number;
  over?: string;
  layers?: ShareLayer[];
  groups?: ShareGroup[];
  strong?: string | null;
  onStrong?: (id: string | null) => void;
  marks?: ShareMark[];
  zones?: ShareZone[];
  point?: { at: number; tag: string };
  onPoint?: (at: number) => void;
  spoken?: string;
  onRead?: (at: number | null, boxed: boolean) => void;
  tip?: (at: number) => ReactNode;
  onRange?: (lo: number, hi: number) => void;
  xTitle: string;
  xShort?: string;
  snap?: (a: number) => number;
  height?: number;
  narrowHeight?: number;
  className?: string;
}) {
  const stacked = useInStack();
  const [ref, w] = useWidth(560);
  const [at, setAt] = useState<number | null>(null);
  const [brush, setBrush] = useState<{ a: number; b: number } | null>(null);
  const press = useRef<{ x: number; dragging: boolean; id: number } | null>(null);

  const narrow = w < NARROW;
  const plotH = narrow ? narrowHeight : height;
  // the box of values beside the pointer stands over the plot where the chart is wide enough; narrower, the page puts it under the chart
  const boxed = !!tip && w >= 640;
  const ticks = shareTicks(top);
  const yTop = ticks.at(-1) || 1;
  const plotL = SHARE_PLOT.left;
  const plotR = w - SHARE_PLOT.right;
  const x = (a: number) => plotL + logAt(range, a) * (plotR - plotL);
  const amountOf = (px: number) => amountAt(range, Math.max(0, Math.min(1, (px - plotL) / (plotR - plotL || 1))));

  // the zones' names above the plot, each at its zone's middle held inside the plot; one that would meet the name before it gives way
  let zoneEnd = -Infinity;
  const zoneNames = zones.map((z) => {
    const wide = chartTextWidth(z.label, CHART_TEXT_PX);
    const from = x(Math.max(z.from, range.lo));
    const to = x(Math.min(z.to, range.hi));
    const mid = Math.max(plotL + wide / 2, Math.min(plotR - wide / 2, (from + to) / 2));
    const shown = to > from && mid - wide / 2 >= zoneEnd + 8;
    if (shown) zoneEnd = mid + wide / 2;
    return { z, mid, wide, from, to, shown };
  });
  // the value over the axis shares the zones' row where it meets none of their names, else it takes a row of its own above them
  const overWide = over ? chartTextWidth(over, CHART_TEXT_PX) + 4 : 0;
  const overOwn = !!over && zoneNames.some((n) => n.shown && n.mid - n.wide / 2 < 2 + overWide + 8);
  const zoneY = ZONE_ROW - 4 + (overOwn ? MARK_ROW : 0);
  const plotT = ZONE_ROW + (zones.length || over ? 6 : 0) + (overOwn ? MARK_ROW : 0);
  const base = plotT + plotH;
  const H = base + BOTTOM;
  const y = (v: number) => base - (Math.min(v, yTop * 1.5) / yTop) * plotH;

  const path = (of: (p: SharePoint) => number) => points.map((p, i) => `${i ? "L" : "M"}${x(p.at).toFixed(1)} ${y(of(p)).toFixed(1)}`).join("");
  // each layer's top: the layers under it and it, added
  const tops = (layers ?? []).map((_, k) => (p: SharePoint) => (p.layers ?? []).slice(0, k + 1).reduce((s, v) => s + v, 0));
  const area = (k: number) => {
    const up = points.map((p) => `${x(p.at).toFixed(1)} ${y(tops[k]!(p)).toFixed(1)}`);
    const down = [...points].reverse().map((p) => `${x(p.at).toFixed(1)} ${(k ? y(tops[k - 1]!(p)) : base).toFixed(1)}`);
    return `M${up.join("L")}L${down.join("L")}Z`;
  };

  // the amounts under the plot: each one where its words clear the one written before it and the plot's ends
  const amounts = logTicks(range, narrow);
  const xSpan = (v: number): [number, number] => {
    const wide = chartTextWidth(amountTick(v), CHART_TEXT_PX);
    const c = x(v);
    const l = Math.max(plotL - 20, Math.min(c - wide / 2, plotR + 10 - wide));
    return [l, l + wide];
  };
  // on a phone an amount under the point's knob gives way to it
  const knobAt = point && narrow ? x(point.at) : null;
  const written: number[] = [];
  for (const v of amounts) {
    const before = written.length ? xSpan(written.at(-1)!)[1] : -Infinity;
    const [l, r] = xSpan(v);
    if (l >= before + X_LABEL_GAP && !(knobAt !== null && l < knobAt + KNOB + 2 && r > knobAt - KNOB - 2)) written.push(v);
  }

  // the reader's point and its tag over it, held inside the plot; on a phone no tag, and the knob on the amount axis holds it
  const tagged = !!point && !narrow;
  const pointY = point ? y(Math.min(shareAt(points, point.at), yTop)) : 0;
  const tagWide = point ? chartTextWidth(point.tag, CHART_TEXT_PX) + 20 : 0;
  const tagX = point ? Math.max(plotL, Math.min(plotR - tagWide, x(point.at) - tagWide / 2)) : 0;
  const tagY = Math.max(2, pointY - 38);
  const pointBoxes: Box[] = point
    ? [
        ...(tagged ? [{ left: tagX, right: tagX + tagWide, top: tagY, bottom: tagY + 22 }] : []),
        { left: x(point.at) - 8, right: x(point.at) + 8, top: pointY - 8, bottom: pointY + 8 },
      ]
    : [];

  // the amount the pointer reads, its dot on the curve and the box of values beside it; none while a range is dragged
  const reading = !point && !brush ? at : null;
  const readY = reading !== null ? y(Math.min(shareAt(points, reading), yTop)) : 0;
  const tipOpen = reading !== null && !!tip && boxed;

  // the reader's line: the point's, or the amount the pointer reads
  const line = point ? point.at : reading;
  const lineX = line !== null ? x(line) : null;
  const readLine: LabelLine[] = lineX !== null ? [{ x: lineX, top: plotT, bottom: base }] : [];

  // the marks' words at their points, clear of the axis's words, the curve, each other, the reader's point and line; on a phone a chart
  // with a point writes none (its point and its reading say the amount), and no mark carries a line over its label. While the pointer
  // reads an amount, the drops' sentences and the words of a mark near its line give way, on a phone as on a computer.
  const inRange = marks.filter((m) => m.at >= range.lo * (1 - 1e-9) && m.at <= range.hi * (1 + 1e-9)).sort((p, q) => p.at - q.at);
  const cy = (a: number) => y(shareAt(points, a * (1 + 1e-12)) > yTop ? yTop : shareAt(points, a * (1 - 1e-12)));
  const axisWords = ticks.filter((t) => t > 0).map((t) => ({ right: 2 + chartTextWidth(pct(t), CHART_TEXT_PX), top: y(t) - 4 - TEXT_UP, bottom: y(t) - 4 + TEXT_DOWN }));
  const curveLine: LabelLine = { y: (px: number) => y(shareAt(points, amountOf(px))) };
  const wordsOf = (m: ShareMark) => [narrow ? undefined : m.sub, m.label].filter((s): s is string => !!s);
  const entries = inRange.flatMap((m) => {
    const lines = wordsOf(m);
    const half = Math.max(...lines.map((s) => chartTextWidth(s, CHART_TEXT_PX))) / 2 + 2;
    const own = { m, note: false, kind: (lines.length > 1 ? "sub" : "mark") as LabelKind, cx: x(m.at), cy: cy(m.at), half, up: (lines.length - 1) * LINE };
    if (!m.note?.length) return [own];
    const nHalf = Math.max(...m.note.map((s) => chartTextWidth(s, CHART_TEXT_PX))) / 2 + 2;
    return [own, { m, note: true, kind: "note" as LabelKind, cx: own.cx, cy: own.cy, half: nHalf, up: (m.note.length - 1) * LINE }];
  });
  const worded = (e: (typeof entries)[number]) => !(point && narrow) && !(e.note && narrow) && !(reading !== null && (e.note || Math.abs(e.cx - x(reading)) < TIP_CLEAR));
  const drops: LabelLine[] = entries.filter((e) => !e.note).map((e) => ({ x: e.cx, top: e.cy, bottom: base }));
  const labelled = entries.filter(worded);
  const placedList = markLabels(
    labelled.map((e) => ({ cx: e.cx, cy: e.cy, half: e.half, up: e.up, kind: e.kind })),
    axisWords,
    plotR,
    [curveLine, ...drops, ...readLine],
    plotL,
    pointBoxes,
  );
  const placedOf = new Map(placedList.map((l, k) => [labelled[k]!, l] as const));
  const placed = entries.map((e) => placedOf.get(e) ?? null);
  const labelBoxes: Box[] = labelled.flatMap((e, k) => {
    const l = placedList[k];
    return l ? [{ left: l.lx - e.half, right: l.lx + e.half, top: l.by - TEXT_UP - e.up, bottom: l.by + TEXT_DOWN }] : [];
  });

  // the group names inside their layers (`groupNameAt`), between the marks' amounts and clear of their words; none on a phone, and a name
  // the reader's line crosses gives way
  const cuts = [x(range.lo), ...inRange.map((m) => x(m.at)).filter((px) => px > plotL + 1 && px < plotR - 1), x(range.hi)];
  const names = narrow
    ? []
    : (groups ?? []).flatMap((g) => {
        const ks = (layers ?? []).flatMap((l, k) => (l.group === g.id ? [k] : []));
        if (ks.length === 0) return [];
        const wide = chartTextWidth(g.label, CHART_TEXT_PX) + 8;
        const at = groupNameAt(
          cuts,
          wide,
          (px) => {
            const a = amountOf(px);
            return ks.map((k) => ({ top: Math.max(plotT, y(shareAt(points, a, tops[k]!))), bottom: Math.max(plotT, k ? y(shareAt(points, a, tops[k - 1]!)) : base) }));
          },
          labelBoxes,
        );
        if (!at || (lineX !== null && Math.abs(lineX - at.px) < wide / 2 + LABEL_GAP)) return [];
        return [{ g, ...at }];
      });

  // the pointer: a press on the plot moves the reader's point there; without a point, a mouse reads and drags a range, a finger taps to read
  const amountFrom = (e: PointerEvent<SVGSVGElement>) => amountOf(e.clientX - e.currentTarget.getBoundingClientRect().left);
  const layerAt = (a: number, e: PointerEvent<SVGSVGElement>) => {
    if (!layers?.length || !onStrong) return;
    const v = ((base - (e.clientY - e.currentTarget.getBoundingClientRect().top)) / plotH) * yTop;
    const k = tops.findIndex((t) => shareAt(points, a, t) >= v);
    onStrong(v >= 0 && k >= 0 ? layers[k]!.id : null);
  };
  const down = (e: PointerEvent<SVGSVGElement>) => {
    const a = amountFrom(e);
    press.current = { x: e.clientX, dragging: false, id: e.pointerId };
    if (point && onPoint) {
      e.currentTarget.setPointerCapture(e.pointerId);
      onPoint(a);
    } else if (e.pointerType !== "mouse") {
      setAt(snap(a));
      onRead?.(snap(a), boxed);
      layerAt(a, e);
    } else if (onRange) e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const a = amountFrom(e);
    const p = press.current;
    if (point && onPoint) {
      if (p) onPoint(a);
      return;
    }
    if (e.pointerType !== "mouse") return;
    if (p && onRange && (p.dragging || Math.abs(e.clientX - p.x) > DRAG)) {
      // a range being dragged shows alone: the reading, its line and the fee set apart let go
      if (!p.dragging) {
        setAt(null);
        onRead?.(null, boxed);
        onStrong?.(null);
      }
      p.dragging = true;
      setBrush({ a: amountOf(p.x - e.currentTarget.getBoundingClientRect().left), b: a });
      return;
    }
    setAt(snap(a));
    onRead?.(snap(a), boxed);
    layerAt(a, e);
  };
  const up = () => {
    const p = press.current;
    press.current = null;
    if (p?.dragging && brush && onRange) {
      const [lo, hi] = brush.a < brush.b ? [brush.a, brush.b] : [brush.b, brush.a];
      onRange(lo, hi);
    }
    setBrush(null);
  };
  const leave = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse" || press.current) return;
    setAt(null);
    onRead?.(null, boxed);
    onStrong?.(null);
  };
  // the arrow keys move the reader's point a tenth of a power of ten each, Home and End to the axis's ends
  const key = (e: KeyboardEvent<SVGGElement>) => {
    if (!point || !onPoint) return;
    const f = 10 ** 0.1;
    const to = { ArrowRight: point.at * f, ArrowUp: point.at * f, ArrowLeft: point.at / f, ArrowDown: point.at / f, Home: range.lo, End: range.hi }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    onPoint(Math.max(range.lo, Math.min(range.hi, to)));
  };

  // the layers in their fee colours a little under half over the card, so the group names in the foreground read on them at 4.5:1; the
  // layer set apart turns near solid and the others step back to under half of that
  const opacity = (id: string) => (!strong ? 0.45 : strong === id ? 0.8 : 0.2);
  const hot = strong ? (layers ?? []).findIndex((l) => l.id === strong) : -1;
  const clipId = `share-plot-${Math.round(w)}-${Math.round(plotH)}`;

  return (
    <div className={cx("flex flex-col", className)}>
      <div ref={ref} dir="ltr" className="relative select-none">
        <svg width={w} height={H} aria-hidden={point ? undefined : true} className="block touch-pan-y" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={leave}>
          <defs>
            <clipPath id={clipId}>
              <rect x={plotL} y={plotT} width={Math.max(0, plotR - plotL)} height={plotH} />
            </clipPath>
          </defs>
          <rect data-plot x={plotL} y={plotT} width={Math.max(0, plotR - plotL)} height={plotH} fill="none" pointerEvents="none" />
          {zoneNames.map((n, k) => (
            <rect key={`zone-${k}`} x={n.from} y={plotT} width={Math.max(0, n.to - n.from)} height={plotH} className={k % 2 ? "fill-muted/40" : "fill-muted/80"} />
          ))}
          {zoneNames.map(
            (n, k) =>
              n.shown && (
                <text key={`zone-name-${k}`} x={n.mid} y={zoneY} textAnchor="middle" direction="rtl" className="fill-chart-text text-xs">
                  {n.z.label}
                </text>
              ),
          )}
          {over && (
            <text x={2} y={ZONE_ROW - 4} textAnchor="start" className="fill-foreground text-xs font-semibold tabular-nums">
              {over}
            </text>
          )}
          {ticks.map((t) => (
            <g key={t}>
              <line x1={plotL} x2={plotR} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-chart-axis" : "stroke-chart-grid"} strokeWidth={1} />
              <text x={2} y={y(t) + 4} className="fill-chart-text text-xs tabular-nums">
                {pct(t)}
              </text>
            </g>
          ))}
          <g clipPath={`url(#${clipId})`}>
            {layers?.map((l, k) => <path key={l.id} d={area(k)} className={l.fill} fillOpacity={opacity(l.id)} data-mark="area" />)}
            {layers?.map((l, k) => <path key={`${l.id}:top`} d={path(tops[k]!)} fill="none" className="stroke-card" strokeWidth={1} />)}
            {hot >= 0 && layers![hot]!.edge && (
              <g fill="none" className={layers![hot]!.edge} strokeWidth={2}>
                <path d={path(tops[hot]!)} />
                <path d={hot ? path(tops[hot - 1]!) : `M${plotL} ${base}H${plotR}`} />
              </g>
            )}
            <path d={path((p) => p.share)} fill="none" className="stroke-foreground" strokeWidth={2} strokeLinejoin="round" />
          </g>
          {names.map((n) => (
            <text key={n.g.id} x={n.px} y={n.mid + 4} textAnchor="middle" direction="rtl" className="fill-foreground stroke-card text-xs font-semibold [paint-order:stroke]" strokeWidth={3}>
              {n.g.label}
            </text>
          ))}
          {written.map((v) => (
            <text key={v} x={(xSpan(v)[0] + xSpan(v)[1]) / 2} y={base + 18} textAnchor="middle" className="fill-chart-text text-xs tabular-nums">
              {amountTick(v)}
            </text>
          ))}
          {entries.map((e) => !e.note && <line key={`${e.m.id}:down`} x1={e.cx} x2={e.cx} y1={e.cy} y2={base} className="stroke-chart-marker" strokeWidth={1} strokeDasharray="3 4" />)}
          {entries.map((e) => !e.note && <circle key={`${e.m.id}:point`} cx={e.cx} cy={e.cy} r={4} className="fill-foreground stroke-card" strokeWidth={2} data-mark="point" />)}
          {entries.map((e, k) => {
            const l = placed[k];
            if (!l) return null;
            const lines = e.note ? e.m.note! : wordsOf(e.m);
            // a label beside its point lines its words up on its edge nearest the point (right to left: "end" is the left edge)
            const [tx, anchor]: [number, "start" | "middle" | "end"] = l.side === "right" ? [l.lx - e.half + 2, "end"] : l.side === "left" ? [l.lx + e.half - 2, "start"] : [l.lx, "middle"];
            return lines.map((s, j) => (
              <text
                key={`${e.m.id}:${e.note ? "note" : "label"}:${j}`}
                x={tx}
                y={l.by - (lines.length - 1 - j) * LINE}
                textAnchor={anchor}
                direction="rtl"
                className={cx("stroke-card text-xs tabular-nums [paint-order:stroke]", !e.note && j === lines.length - 1 ? "fill-foreground font-semibold" : "fill-chart-text")}
                strokeWidth={3}
              >
                {s}
              </text>
            ));
          })}
          {line !== null && !stacked && <line x1={x(line)} x2={x(line)} y1={plotT} y2={base} className={point ? "stroke-entered" : "stroke-chart-crosshair"} strokeWidth={1} />}
          {reading !== null && <circle cx={x(reading)} cy={readY} r={5} className="fill-foreground stroke-card" strokeWidth={2} />}
          {brush && (
            <g>
              <rect x={Math.min(x(brush.a), x(brush.b))} y={plotT} width={Math.abs(x(brush.b) - x(brush.a))} height={plotH} className="fill-entered/15 stroke-entered" strokeWidth={1} />
              {[Math.min(brush.a, brush.b), Math.max(brush.a, brush.b)].map((v, k) => (
                <text key={k} x={x(v) + (k ? -4 : 4)} y={plotT + 13} textAnchor={k ? "end" : "start"} className="fill-entered text-xs font-semibold tabular-nums">
                  {fmt.nisWhole(v)}
                </text>
              ))}
            </g>
          )}
          {point && (
            <g role="slider" tabIndex={0} aria-label={spoken} aria-valuemin={range.lo} aria-valuemax={range.hi} aria-valuenow={Math.round(point.at)} aria-valuetext={point.tag} onKeyDown={key} className="cursor-grab outline-none [&:focus-visible>circle]:stroke-ring">
              <circle cx={x(point.at)} cy={pointY} r={6} className="fill-entered stroke-card" strokeWidth={2} />
              {tagged ? (
                <>
                  <rect x={tagX} y={tagY} width={tagWide} height={22} rx={6} className="fill-entered" />
                  <text x={tagX + tagWide / 2} y={tagY + 15} textAnchor="middle" direction="rtl" className="fill-background text-xs font-semibold tabular-nums">
                    {point.tag}
                  </text>
                </>
              ) : (
                <circle cx={x(point.at)} cy={base} r={KNOB} className="fill-entered stroke-card" strokeWidth={3} />
              )}
            </g>
          )}
        </svg>
        {tipOpen && (
          <ChartTip x={x(reading!)} top={plotT} width={w} near={{ y: readY, bottom: base }}>
            {tip!(reading!)}
          </ChartTip>
        )}
      </div>
      <p className="-mt-4 text-center text-xs text-muted-foreground">{narrow && xShort ? xShort : xTitle}</p>
    </div>
  );
}
