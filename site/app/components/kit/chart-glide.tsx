// How a chart moves when its numbers change (design-system V7). Every line, scale and axis follows its goal from
// wherever it stands now, so a slider that keeps moving never makes a chart restart or snap back; the rounded ends of an axis move, not
// the numbers under them, and its labels fade in and out. Only marks move: nothing here touches the layout. No motion for someone who asked
// for none (--duration-chart is 0 there).
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { alignLine, cssMs, follow, mergeTicks, sameSeries, type GlideSeries, type GlideTick } from "./chart-glide-math";
import { cx } from "./cx";

export { valueOn, type GlidePoint, type GlideSeries, type GlideTick } from "./chart-glide-math";

/** The most time one frame adds to a glide, in ms, so a slow render does not use the motion up. */
const MAX_STEP = 50;

/** How long a chart's motion lasts, in ms: 0 for someone who asked for none, and on the server. */
export function durationChart(): number {
  if (typeof window === "undefined") return 0;
  return cssMs(getComputedStyle(document.documentElement).getPropertyValue("--duration-chart"));
}

/** The lines to draw on the way to `target`. A line's points may be more than the target's during the glide; at rest they are exactly its. */
export function useGlidingSeries(target: GlideSeries): GlideSeries {
  const stable = useRef(target);
  if (!sameSeries(stable.current, target)) stable.current = target;
  const goal = stable.current;
  const [shown, setShown] = useState(goal);
  const cur = useRef(goal);
  useEffect(() => {
    if (cur.current === goal) return;
    const ms = durationChart();
    const settle = () => {
      cur.current = goal;
      setShown(goal);
    };
    if (ms === 0) return settle();
    const from = cur.current;
    const lines = Object.entries(goal).map(([id, pts]) => ({ id, ...alignLine(from[id], pts) }));
    // an even chase: about 99% of the way in the chart's duration, and most of it in the first frames, so the hand feels answered at once
    const tau = ms / 5;
    let last = performance.now();
    let spent = 0;
    let raf = 0;
    const tick = () => {
      // The clock, not the frame's own time stamp: that can stand before this effect, and a negative step blew the scales up for a frame.
      const now = performance.now();
      const step = Math.min(MAX_STEP, now - last);
      last = now;
      spent += step;
      if (spent >= ms) return settle();
      const k = 1 - Math.exp(-step / tau);
      const next: GlideSeries = {};
      for (const l of lines) {
        l.now = l.now.map((v, i) => follow(v, l.goal[i]!, k));
        next[l.id] = l.years.map((year, i) => ({ year, v: l.now[i]! }));
      }
      cur.current = next;
      setShown(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [goal]);
  return shown;
}

/** Numbers that glide together, such as the two ends of an axis. */
export function useGlidingNumbers(target: readonly number[]): number[] {
  const shown = useGlidingSeries({ n: target.map((v, year) => ({ year, v })) });
  return target.map((v, i) => shown.n?.[i]?.v ?? v);
}

/** Rows of a year with several numbers, gliding: `keys` are the numeric fields. */
export function useGlidingRows<R extends { year: number }>(rows: readonly R[], keys: readonly (keyof R & string)[]): R[] {
  const series: GlideSeries = {};
  for (const k of keys) series[k] = rows.map((r) => ({ year: r.year, v: r[k] as number }));
  const shown = useGlidingSeries(series);
  const first = shown[keys[0]!] ?? [];
  return first.map((p, i) => {
    const row: Record<string, number> = { year: p.year };
    for (const k of keys) row[k] = shown[k]?.[i]?.v ?? 0;
    return row as unknown as R;
  });
}

/** An axis's ticks with a phase, for `tickFade`: ticks that go stay a moment and fade while the scale still carries them. */
export function useFadingTicks(values: readonly number[]): GlideTick[] {
  const key = values.join();
  const [list, setList] = useState<GlideTick[]>(() => values.map((value) => ({ value, phase: "still" })));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setList((prev) => mergeTicks(prev, values));
    const t = setTimeout(() => setList((prev) => prev.filter((p) => p.phase !== "out")), durationChart());
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return list;
}

/** The ticks inside the plot now: while an axis glides, some stand past its ends for a moment. `ends` are the plot's two ends in px. */
export function ticksOn(ticks: GlideTick[], y: (v: number) => number, ends: readonly number[]): GlideTick[] {
  return ticks.filter((t) => y(t.value) >= Math.min(...ends) - 1 && y(t.value) <= Math.max(...ends) + 1);
}

/** The class that fades a tick in or out (app.css). */
export const tickFade = (t: GlideTick) => (t.phase === "in" ? "chart-tick-in" : t.phase === "out" ? "chart-tick-out" : undefined);

/**
 * The years under a plot. Each label stays centred on its year and stops at the plot's edge, so it never flips from one anchor to another as
 * the axis glides. `word` writes a year ("היום" for 0); `y` is the text's baseline; `left` and `right` are the plot's edges in px.
 */
export function YearLabels({ ticks, x, y, left, right, word = String }: { ticks: GlideTick[]; x: (year: number) => number; y: number; left: number; right: number; word?: (year: number) => string }) {
  return (
    <>
      {ticks.map((t) => {
        const label = word(t.value);
        const half = label.length * 3.6 + 1;
        const at = x(t.value);
        if (at < left - 1 || at > right + 1) return null;
        return (
          <text key={t.value} x={Math.min(right - half, Math.max(left + half, at))} y={y} textAnchor="middle" direction="ltr" className={cx("text-xs fill-chart-text", tickFade(t))} data-scale>
            {label}
          </text>
        );
      })}
    </>
  );
}

type FlipKey = string | Element;

/** A list's rows: each `[data-flip]` (named by its id), and each child of a `[data-flip-list]` (named by itself: React keeps a kept row's
 *  element). A row that is not shown (folded away, the other screen size's layout) is left out. */
function flipRows(root: HTMLElement): { el: HTMLElement; key: FlipKey; box: Element }[] {
  const named = [...root.querySelectorAll<HTMLElement>("[data-flip]")].map((el) => ({ el, key: el.dataset.flip! as FlipKey, box: root as Element }));
  const children = [...root.querySelectorAll<HTMLElement>("[data-flip-list]")].flatMap((list) => [...list.children].map((el) => ({ el: el as HTMLElement, key: el as FlipKey, box: list })));
  return [...named, ...children].filter((r) => r.el.offsetParent);
}

/** Each row's top on the screen, from the list's top, with its slide where it is in one: scrolling between two changes moves nothing. */
function flipPlaces(root: HTMLElement): Map<FlipKey, number> {
  const top = root.getBoundingClientRect().top;
  return new Map(flipRows(root).map((r) => [r.key, r.el.getBoundingClientRect().top - top]));
}

const sliding = new WeakMap<Element, Animation>();

/**
 * Rows slide to their new places when the order changes, and a row new to the list fades in, rather than the list snapping
 * (a sort that redraws everything loses the reader's place). The rows are each `[data-flip]` with an id, and the
 * children of a `[data-flip-list]` (ProductTable's body and its phone card); the ref goes on the block around them. Where each row stands is
 * read while the new order renders, before it is written to the page, so a fold, a resize or a scroll since the last change moves nothing;
 * a change during a slide carries on from where the row stands. `held()` names a row the page keeps in place on the screen (a tapped row):
 * it does not slide, and the others slide around it. A row far off the screen before and after does not slide, and one that would slide in
 * from outside its list's new box fades in where it stands. Transform and opacity only: nothing around the list moves. `order` is `null`
 * while the page has no order of its own yet (one read from the address once the page is in the browser): nothing moves on that change.
 */
export function useFlip<E extends HTMLElement = HTMLOListElement>(order: string | null, held?: () => string | null | undefined) {
  const ref = useRef<E>(null);
  const shown = useRef(order);
  const reading = useRef<{ order: string | null; places: Map<FlipKey, number> } | null>(null);
  // read once per new order: a render that is thrown away and done again keeps the first reading
  if (order !== shown.current && shown.current !== null && reading.current?.order !== order && ref.current) reading.current = { order, places: flipPlaces(ref.current) };
  useLayoutEffect(() => {
    if (shown.current === order) return;
    shown.current = order;
    const before = reading.current?.order === order ? reading.current.places : null;
    reading.current = null;
    const list = ref.current;
    const ms = durationChart();
    if (!list || !before || ms === 0) return;
    const rows = flipRows(list);
    for (const r of rows) {
      sliding.get(r.el)?.cancel();
      r.el.classList.remove("flip-moving");
    }
    const top = list.getBoundingClientRect().top;
    const next = new Map(rows.map((r) => [r.key, r.el.getBoundingClientRect().top - top]));
    const anchor = held?.();
    const shift = anchor ? (before.get(anchor) ?? next.get(anchor) ?? 0) - (next.get(anchor) ?? 0) : 0;
    const screen = window.innerHeight;
    const timing = { duration: ms, easing: "cubic-bezier(0.2, 0, 0, 1)" };
    for (const r of rows) {
      const now = r.el.getBoundingClientRect();
      const was = before.get(r.key);
      const from = was === undefined ? null : was - next.get(r.key)! - shift;
      if (from === null) {
        if (now.bottom > 0 && now.top < screen) sliding.set(r.el, r.el.animate([{ opacity: 0 }, { opacity: 1 }], timing));
        continue;
      }
      if (Math.abs(from) <= 1) continue;
      const box = r.box.getBoundingClientRect();
      // off the screen where it was and where it is: nobody sees it
      if ((now.bottom < 0 || now.top > screen) && (now.bottom + from < 0 || now.top + from > screen)) continue;
      const inside = Math.abs(from) < screen && now.top + from >= box.top - 1 && now.bottom + from <= box.bottom + 1;
      const slide = r.el.animate(inside ? [{ transform: `translateY(${from}px)` }, { transform: "none" }] : [{ opacity: 0 }, { opacity: 1 }], timing);
      sliding.set(r.el, slide);
      // a list's own row (a table's, a phone card's) has no surface of its own: it gets one while it slides
      if (inside && r.box !== list) {
        r.el.classList.add("flip-moving");
        const done = () => sliding.get(r.el) === slide && r.el.classList.remove("flip-moving");
        slide.onfinish = slide.oncancel = done;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);
  return ref;
}
