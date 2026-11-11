// The line that joins the chosen row of one list to the chosen row of the list beside it (the index page's accounts and funds): from the
// start list's row to the end list's, bent at the middle of the gap when the rows stand at different heights, a dot at each end. It
// follows the rows as they slide after a re-sort and as the box changes size, and stands only while the lists are side by side (it hides
// itself when the two chosen rows overlap across, as when the lists stack). Decoration: hidden from screen readers, never in the way of a tap.
import { useCallback, useLayoutEffect, useRef } from "react";
import { cx } from "./cx";

/** How long the line follows the rows after what it watches changes: the rows' slide (the kit's FLIP) lasts less. */
const FOLLOW_MS = 900;

/**
 * Put it in the element that holds both lists, positioned (`relative`): the line is drawn in its parent, read when it lays out (a ref
 * the parent passed would still be empty on the first layout, a child's effects running before its parent's refs are set). `rows`: what
 * marks a chosen row, the start list's first in the document (in a right-to-left page, the list on the right). `watch`: what moves the
 * chosen rows inside the box (the picks, the plan the lists are sorted on, the lists' sizes): when it changes, the line follows the rows'
 * slide frame by frame for a moment; a change of the box's size redraws it once (a ResizeObserver). Nothing runs on a render that changes
 * neither, so a slider's moves above the lists start no loop. `className`: when the line may show at all (a container query, so it shows
 * only while the lists stand side by side) and its colour (`text-…`).
 */
export function LinkLine({ rows = "[data-pick-key][aria-checked=true]", watch, className }: { rows?: string; watch: string; className?: string }) {
  const svg = useRef<SVGSVGElement>(null);
  const draw = useCallback(() => {
    const el = svg.current;
    const root = el?.parentElement;
    if (!el || !root) return;
    const [a, b] = root.querySelectorAll<HTMLElement>(rows);
    const rb = root.getBoundingClientRect();
    const ra = a?.getBoundingClientRect();
    const rf = b?.getBoundingClientRect();
    // side by side, the start list on the right: the line runs from the start row's left edge to the end row's right edge
    if (!ra || !rf || ra.width === 0 || rf.width === 0 || ra.left < rf.right) {
      el.style.display = "none";
      return;
    }
    const pad = 5;
    const x1 = ra.left - rb.left, x2 = rf.right - rb.left;
    const y1 = ra.top + ra.height / 2 - rb.top, y2 = rf.top + rf.height / 2 - rb.top;
    const top = Math.min(y1, y2) - pad, left = x2 - pad;
    el.style.display = "";
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    el.setAttribute("width", String(x1 - x2 + 2 * pad));
    el.setAttribute("height", String(Math.abs(y1 - y2) + 2 * pad));
    const ax = x1 - left, ay = y1 - top, bx = x2 - left, by = y2 - top, mx = (ax + bx) / 2;
    el.querySelector("path")!.setAttribute("d", Math.abs(ay - by) < 1 ? `M${ax} ${ay}H${bx}` : `M${ax} ${ay}H${mx}V${by}H${bx}`);
    const [d1, d2] = el.querySelectorAll("circle");
    d1!.setAttribute("cx", String(ax));
    d1!.setAttribute("cy", String(ay));
    d2!.setAttribute("cx", String(bx));
    d2!.setAttribute("cy", String(by));
  }, [rows]);
  // the box changes size (a held height, the window): drawn again once
  useLayoutEffect(() => {
    const root = svg.current?.parentElement;
    if (!root) return;
    const ro = new ResizeObserver(draw);
    ro.observe(root);
    return () => ro.disconnect();
  }, [draw]);
  // the rows slide to their new places after a pick or a re-sort: the line follows them frame by frame for a moment
  useLayoutEffect(() => {
    draw();
    let frame = 0;
    const until = performance.now() + FOLLOW_MS;
    const follow = () => {
      draw();
      if (performance.now() < until) frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, [draw, watch]);
  // the svg is the gap's width and the rows' height apart, so it is never read as a chart
  return (
    <svg ref={svg} aria-hidden="true" className={cx("pointer-events-none absolute overflow-visible", className)} style={{ display: "none" }}>
      <path fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" />
      <circle r={3.5} fill="currentColor" />
      <circle r={3.5} fill="currentColor" />
    </svg>
  );
}
