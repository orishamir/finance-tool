// What something costs as a share of an amount, the amount on a log axis (the deal's charts by size, method F-112 and F-123). Its curve is
// either one line (what one action costs) or layers stacked from zero with their total as a line on top (what a year of holding costs, the
// layers a fee each, named by group on the plot where a group's band holds the name). Over the plot it may carry zones named above it (which
// part decides), the amounts where the cost changes behaviour as points with their words (charts.md, "Labels"), and where the curve leaves
// the top of the axis, its value at the axis's start written over the value axis. A point the reader drags reads one amount (an action's
// size); on a chart without one, the pointer reads the amount under it with a box of its values beside it, a tap on a phone, and a drag
// with a mouse picks a range to zoom to. On a phone the chart says less: no group names, a mark's label without the line over it, and on a
// chart with a point no labels and no tag, the point held by a knob on the amount axis.
// The lanes under the chart (`AmountLanes`) stand on the same plot: both keep `SHARE_PLOT`'s room at the sides. Own SVG.
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
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
/** Over a mark's point, its label's baseline; a label with something in its way stands a row higher, up to `MARK_ROWS` rows. */
const MARK_LABEL = 10;
const MARK_ROW = 16;
const MARK_ROWS = 4;
/** How far round a mark's point no label may stand (its 4.5 px dot and its 2 px ring, and air). */
const POINT_CLEAR = 7;
/** The least room between a mark's label and another label or the value axis's words. */
const LABEL_GAP = 4;
/** The furthest a mark's label may stand from its point, joined to it by a line; further, it gives way. */
const JOIN_MAX = 40;
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

/** A line a mark's label must not stand on: the curve's line (its height at a place, `y`), or a mark's dashed drop (`x`, from `top` down to `bottom`). */
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
 * Where each mark's label stands, in the order of the marks along the plot (charts.md, "Labels": labels are never stacked on each other,
 * on the axis's words or on the chart's lines; a label that cannot stand at its mark is joined to it by a short line, or gives way). Its
 * places, nearest first: over its point (`cx`, `cy`; `half` its half width, `up` the room its lines above the first take) or beside it,
 * after it along the line, each a row higher in turn, up to `MARK_ROWS` rows and never above the chart's top; then beside it before it,
 * row by row. Each is held inside the plot (from `plotL` to `plotR`) and moved past the end of the value axis's words where it would meet
 * one. A place is free where the label meets no word of the axis, no mark's point, no label already placed and no line (`lines`), and
 * stands no further than its `reach` (`JOIN_MAX`) from its point, and meets nothing in `keepOut` (the reader's point and its tag). `lx`, `by`: the label's middle and its first line's baseline; one not
 * right at its point is `joined` to it by a line. A label with no free place gives way (null): its point stays. So does a label that
 * `yields` where its place over its point meets a label placed before it: two marks close together keep the earlier one's words, never a
 * second label stacked over the first.
 */
export function markLabels(points: readonly { cx: number; cy: number; half: number; up?: number; reach?: number; yields?: boolean }[], axisWords: readonly { right: number; top: number; bottom: number }[], plotR: number, lines: readonly LabelLine[] = [], plotL = 0, keepOut: readonly Box[] = []): ({ lx: number; by: number; joined: boolean } | null)[] {
  const axis: Box[] = axisWords.map((a) => ({ left: 0, right: a.right, top: a.top, bottom: a.bottom }));
  const dots: Box[] = points.map((p) => ({ left: p.cx - POINT_CLEAR, right: p.cx + POINT_CLEAR, top: p.cy - POINT_CLEAR, bottom: p.cy + POINT_CLEAR }));
  const taken: Box[] = [];
  return points.map(({ cx, cy, half, up = 0, reach = JOIN_MAX, yields = false }) => {
    const box = (lx: number, by: number): Box => ({ left: lx - half, right: lx + half, top: by - TEXT_UP - up, bottom: by + TEXT_DOWN });
    if (yields && taken.some((t) => meet(box(Math.max(plotL + half, Math.min(plotR - half, cx)), cy - MARK_LABEL), t, LABEL_GAP))) return null;
    // how far a label's box stands from its point: nothing where the point is under it or at its side
    const away = (b: Box) => Math.hypot(Math.max(0, b.left - cx, cx - b.right), Math.max(0, b.top - cy, cy - b.bottom));
    // a mark's own drop runs down from its point, under any place its label takes
    const others = lines.filter((l) => !("x" in l) || Math.abs(l.x - cx) > 0.5);
    const rows = Math.max(MARK_ROWS, Math.ceil(reach / MARK_ROW) + 1);
    const tries = (row: number, before: boolean): (readonly [number, number])[] =>
      before
        ? [[cx - POINT_CLEAR - 2 - half, cy + 4 - row * MARK_ROW]]
        : [
            [cx, cy - MARK_LABEL - row * MARK_ROW],
            [cx + POINT_CLEAR + 2 + half, cy + 4 - row * MARK_ROW],
          ];
    for (const before of [false, true])
      for (let row = 0; row < rows; row++) {
        for (const [x0, by] of tries(row, before)) {
          if (by - TEXT_UP - up < 0) continue;
          let lx = Math.max(plotL + half, Math.min(plotR - half, x0));
          for (const a of axis) if (meet(box(lx, by), a, LABEL_GAP)) lx = a.right + LABEL_GAP + half;
          const b = box(lx, by);
          if (b.right > plotR || away(b) > reach) continue;
          if (axis.some((a) => meet(b, a, LABEL_GAP - 1)) || dots.some((d) => meet(b, d, 0)) || taken.some((t) => meet(b, t, LABEL_GAP)) || keepOut.some((k) => meet(b, k, LABEL_GAP)) || others.some((l) => crosses(b, l))) continue;
          taken.push(b);
          // a label right over its point or level beside it needs no line; one higher, or moved along the line off its point, is joined to it
          return { lx, by, joined: away(b) > MARK_LABEL };
        }
      }
    return null;
  });
}

/** The value of a sampled curve at an amount, straight between two samples; at a jump (two samples at one amount), the one after it. */
export function shareAt(points: readonly SharePoint[], a: number, of: (p: SharePoint) => number = (p) => p.share): number {
  if (points.length === 0) return 0;
  let k = points.findIndex((p) => p.at > a);
  if (k === -1) return of(points.at(-1)!);
  if (k === 0) return of(points[0]!);
  const p = points[k - 1]!;
  const q = points[k]!;
  return of(p) + ((of(q) - of(p)) * (Math.log(a) - Math.log(p.at))) / (Math.log(q.at) - Math.log(p.at) || 1);
}

const pct = (v: number) => fmt.pct(v);

/** Narrower than this a chart is a phone's: no group names, no lines over a mark's label, the axis's short name, the point as a knob. */
const NARROW = 560;
/** A label's text box, its baseline to its top and bottom, with room round it: what a group's band must hold along the name's width. */
const NAME_ROOM = TEXT_UP + TEXT_DOWN + 8;
/** The point's knob on the amount axis on a phone, its radius. */
const KNOB = 11;
/** How far from the pointer's line a mark's label gives way to the box of values beside it. */
const TIP_CLEAR = 40;

/**
 * Where a group's name stands on its band (charts.md, "Labels"): in a stretch between two of the marks' amounts (or the axis's ends), the
 * one nearest the axis's middle whose band holds the name's whole box along its whole width, clear of the band's edges and the curve on
 * top, centred in the stretch. `cuts`: those amounts in px, in order; `band(px)`: the band's top and bottom in px there. Null where no
 * stretch holds it.
 */
export function groupNameAt(cuts: readonly number[], wide: number, band: (px: number) => { top: number; bottom: number }): { px: number; mid: number } | null {
  if (cuts.length < 2) return null;
  const middle = (cuts[0]! + cuts.at(-1)!) / 2;
  const stretches = cuts.slice(1).map((r, k) => ({ l: cuts[k]!, r }));
  const far = (s: { l: number; r: number }) => (middle >= s.l && middle <= s.r ? 0 : Math.min(Math.abs(middle - s.l), Math.abs(middle - s.r)));
  for (const s of [...stretches].sort((a, b) => far(a) - far(b))) {
    if (s.r - s.l < wide + 8) continue;
    const c = (s.l + s.r) / 2;
    let top = -Infinity;
    let bottom = Infinity;
    for (let px = c - wide / 2; px <= c + wide / 2; px += 3) {
      const b = band(px);
      top = Math.max(top, b.top);
      bottom = Math.min(bottom, b.bottom);
    }
    if (bottom - top >= NAME_ROOM) return { px: c, mid: (top + bottom) / 2 };
  }
  return null;
}

/**
 * `range`: the amounts the axis spans. `points`: the curve sampled over it, rising (two samples at one amount where it jumps). `top`: the
 * least the value axis reaches (its nice step at or above it is its top); the curve above it is cut at the top, and `over` is then written
 * over the value axis ("↑ 14.4% ב־1,000"), on a row of its own where the first zone's name would meet it. `layers` and `groups`: a layered
 * chart's layers bottom up, each sample's `layers` their shares; `strong`, a layer set apart (it turns near solid with an edge in its own
 * colour, `edge`, and the others step back), and `onStrong`, the layer under the pointer. `marks`, `zones`: as their types say.
 * `point`: the reader's amount and its tag, which a drag, a tap or the arrow keys move (`onPoint`); `spoken` names it; on a phone the tag
 * and the marks' words give way and the point is held by a large knob on the amount axis. Without a point, the pointer reads the amount
 * under it (`onRead`, null as it leaves; `boxed` where the chart shows `tip`'s box of values beside it, from 640 px), with a dot where its
 * line meets the curve; the drop's sentence and any mark's words near the line give way to the box. `onRange`, a mouse's drag across the
 * plot, which shows only the range and its two ends while it lasts. `xTitle` names the amount under the axis, `xShort` on a phone.
 * `height`: the plot's.
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
  height = 280,
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
  height?: number;
  className?: string;
}) {
  const [ref, w] = useWidth(560);
  const [at, setAt] = useState<number | null>(null);
  const [brush, setBrush] = useState<{ a: number; b: number } | null>(null);
  const press = useRef<{ x: number; dragging: boolean; id: number } | null>(null);

  const narrow = w < NARROW;
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
  const base = plotT + height;
  const H = base + BOTTOM;
  const y = (v: number) => base - (Math.min(v, yTop * 1.5) / yTop) * height;

  const path = (of: (p: SharePoint) => number) => points.map((p, i) => `${i ? "L" : "M"}${x(p.at).toFixed(1)} ${y(of(p)).toFixed(1)}`).join("");
  // each layer's top: the layers under it and it, added
  const tops = (layers ?? []).map((_, k) => (p: SharePoint) => (p.layers ?? []).slice(0, k + 1).reduce((s, v) => s + v, 0));
  const area = (k: number) => {
    const up = points.map((p) => `${x(p.at).toFixed(1)} ${y(tops[k]!(p)).toFixed(1)}`);
    const down = [...points].reverse().map((p) => `${x(p.at).toFixed(1)} ${(k ? y(tops[k - 1]!(p)) : base).toFixed(1)}`);
    return `M${up.join("L")}L${down.join("L")}Z`;
  };

  // the amounts under the plot: each one where its words clear the one written before it and the plot's ends
  const amounts = logTicks(range);
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

  // the marks' words over their points, clear of the axis's words, the curve, each other and the reader's point; on a phone a chart with a
  // point writes none (its point and its reading say the amount), and no mark carries a line over its label
  const inRange = marks.filter((m) => m.at >= range.lo * (1 - 1e-9) && m.at <= range.hi * (1 + 1e-9)).sort((p, q) => p.at - q.at);
  const cy = (a: number) => y(shareAt(points, a * (1 + 1e-12)) > yTop ? yTop : shareAt(points, a * (1 - 1e-12)));
  const axisWords = ticks.filter((t) => t > 0).map((t) => ({ right: 2 + chartTextWidth(pct(t), CHART_TEXT_PX), top: y(t) - 4 - TEXT_UP, bottom: y(t) - 4 + TEXT_DOWN }));
  const curveLine: LabelLine = { y: (px: number) => y(shareAt(points, amountOf(px))) };
  const wordsOf = (m: ShareMark) => [narrow ? undefined : m.sub, m.label].filter((s): s is string => !!s);
  const entries = inRange.flatMap((m) => {
    const lines = wordsOf(m);
    const half = Math.max(...lines.map((s) => chartTextWidth(s, CHART_TEXT_PX))) / 2 + 2;
    const own = { m, note: false, cx: x(m.at), cy: cy(m.at), half, up: (lines.length - 1) * LINE, reach: JOIN_MAX };
    if (!m.note?.length) return [own];
    const nHalf = Math.max(...m.note.map((s) => chartTextWidth(s, CHART_TEXT_PX))) / 2 + 2;
    return [own, { m, note: true, cx: own.cx, cy: own.cy, half: nHalf, up: (m.note.length - 1) * LINE, reach: 110 }];
  });
  const worded = (e: (typeof entries)[number]) => !(point && narrow) && !(e.note && narrow) && !(tipOpen && (e.note || Math.abs(e.cx - x(reading!)) < TIP_CLEAR));
  const drops: LabelLine[] = entries.filter((e) => !e.note).map((e) => ({ x: e.cx, top: e.cy, bottom: base }));
  const labelled = entries.filter(worded);
  const placedOf = new Map(
    markLabels(
      labelled.map((e) => ({ cx: e.cx, cy: e.cy, half: e.half, up: e.up, reach: e.reach, yields: !e.note })),
      axisWords,
      plotR,
      [curveLine, ...drops],
      plotL,
      pointBoxes,
    ).map((l, k) => [labelled[k]!, l] as const),
  );
  const placed = entries.map((e) => placedOf.get(e) ?? null);

  // the group names on their bands (`groupNameAt`), between the marks' amounts; none on a phone
  const cuts = [x(range.lo), ...inRange.map((m) => x(m.at)).filter((px) => px > plotL + 1 && px < plotR - 1), x(range.hi)];
  const names = narrow
    ? []
    : (groups ?? []).flatMap((g) => {
        const ks = (layers ?? []).flatMap((l, k) => (l.group === g.id ? [k] : []));
        if (ks.length === 0) return [];
        const lo = Math.min(...ks);
        const hi = Math.max(...ks);
        const wide = chartTextWidth(g.label, CHART_TEXT_PX) + 8;
        const at = groupNameAt(cuts, wide, (px) => {
          const a = amountOf(px);
          return { top: Math.max(plotT, y(shareAt(points, a, tops[hi]!))), bottom: lo ? y(shareAt(points, a, tops[lo - 1]!)) : base };
        });
        return at ? [{ g, ...at }] : [];
      });

  // the pointer: a press on the plot moves the reader's point there; without a point, a mouse reads and drags a range, a finger taps to read
  const amountFrom = (e: PointerEvent<SVGSVGElement>) => amountOf(e.clientX - e.currentTarget.getBoundingClientRect().left);
  const layerAt = (a: number, e: PointerEvent<SVGSVGElement>) => {
    if (!layers?.length || !onStrong) return;
    const v = ((base - (e.clientY - e.currentTarget.getBoundingClientRect().top)) / height) * yTop;
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
      setAt(a);
      onRead?.(a, boxed);
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
    setAt(a);
    onRead?.(a, boxed);
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

  const line = point ? point.at : reading;
  // the layers in their fee colours a little under half over the card, so the group names in the foreground read on them at 4.5:1; the
  // layer set apart turns near solid and the others step back to under half of that
  const opacity = (id: string) => (!strong ? 0.45 : strong === id ? 0.8 : 0.2);
  const hot = strong ? (layers ?? []).findIndex((l) => l.id === strong) : -1;
  const clipId = `share-plot-${Math.round(w)}-${Math.round(height)}`;

  return (
    <div className={cx("flex flex-col", className)}>
      <div ref={ref} dir="ltr" className="relative select-none">
        <svg width={w} height={H} aria-hidden={point ? undefined : true} className="block touch-pan-y" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={leave}>
          <defs>
            <clipPath id={clipId}>
              <rect x={plotL} y={plotT} width={Math.max(0, plotR - plotL)} height={height} />
            </clipPath>
          </defs>
          {zoneNames.map((n, k) => (
            <rect key={`zone-${k}`} x={n.from} y={plotT} width={Math.max(0, n.to - n.from)} height={height} className={k % 2 ? "fill-muted/40" : "fill-muted/80"} />
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
          {entries.map((e, k) => {
            const l = placed[k];
            return !e.note && l?.joined ? <line key={`${e.m.id}:join`} x1={e.cx} y1={e.cy - 5} x2={l.lx} y2={l.by + TEXT_DOWN + 1} className="stroke-chart-text" strokeWidth={1} /> : null;
          })}
          {entries.map((e) => !e.note && <circle key={`${e.m.id}:point`} cx={e.cx} cy={e.cy} r={4} className="fill-foreground stroke-card" strokeWidth={2} data-mark="point" />)}
          {entries.map((e, k) => {
            const l = placed[k];
            if (!l) return null;
            const lines = e.note ? e.m.note! : wordsOf(e.m);
            return lines.map((s, j) => (
              <text
                key={`${e.m.id}:${e.note ? "note" : "label"}:${j}`}
                x={l.lx}
                y={l.by - (lines.length - 1 - j) * LINE}
                textAnchor="middle"
                direction="rtl"
                className={cx("stroke-card text-xs tabular-nums [paint-order:stroke]", !e.note && j === lines.length - 1 ? "fill-foreground font-semibold" : "fill-chart-text")}
                strokeWidth={3}
              >
                {s}
              </text>
            ));
          })}
          {line !== null && <line x1={x(line)} x2={x(line)} y1={plotT} y2={base} className={point ? "stroke-entered" : "stroke-chart-crosshair"} strokeWidth={1} />}
          {reading !== null && <circle cx={x(reading)} cy={readY} r={5} className="fill-foreground stroke-card" strokeWidth={2} />}
          {brush && (
            <g>
              <rect x={Math.min(x(brush.a), x(brush.b))} y={plotT} width={Math.abs(x(brush.b) - x(brush.a))} height={height} className="fill-entered/15 stroke-entered" strokeWidth={1} />
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
