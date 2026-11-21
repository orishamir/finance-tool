// A column that stands beside a longer one and stays in view as it scrolls (the fee page's toolbox beside its fees): on a page it sticks
// under the site's header, never under it; inside a box that scrolls by itself (the indices page's deal popup) it sticks under what that
// box keeps at its top (`--toolbox-top`). Where it is taller than the room left under that top it scrolls inside itself, so every part of
// it is within reach wherever the page or the box is scrolled to. It draws no scrollbar; while more of it is below, its foot fades out
// (`data-more-below`, app.css), and the fade goes once its last line is in view.
import { useEffect, useState, type RefObject } from "react";

/** The room kept under the header and over the window's foot, in pixels. */
const ROOM = 16;

/** The room kept under what a scrolling box keeps at its top, and over the box's foot, in pixels. */
const BOX_ROOM = 8;

/** The nearest box around `el` that scrolls by itself (overflow auto or scroll), or null where only the page scrolls it. */
function scrollingBox(el: HTMLElement): HTMLElement | null {
  for (let x = el.parentElement; x && x !== document.body; x = x.parentElement) {
    const y = getComputedStyle(x).overflowY;
    if (y === "auto" || y === "scroll") return x;
  }
  return null;
}

/**
 * Keeps `column` (a `sticky` element) in view, no taller than the room below its top, scrolling inside where it is taller, while `on`: on a
 * page under the site's header; in a box that scrolls by itself, under the box's `--toolbox-top` (what the box keeps at its top, measured by
 * `useStuckRoom`), or at its top where it keeps nothing there. A sticky offset counts from inside the box's padding.
 */
export function useStickyColumn(column: RefObject<HTMLElement | null>, on: boolean) {
  useEffect(() => {
    const el = column.current;
    if (!on || !el) return;
    const box = scrollingBox(el);
    const place = () => {
      if (box) {
        const s = getComputedStyle(box);
        const inner = box.clientHeight - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom);
        // the custom property itself, so the column follows what stays at the box's top as it grows or shrinks
        const top = `var(--toolbox-top, ${BOX_ROOM}px)`;
        el.style.top = top;
        el.style.maxHeight = `calc(${inner - BOX_ROOM}px - ${top})`;
      } else {
        const header = document.querySelector("[data-site-header]")?.getBoundingClientRect().height ?? 64;
        const top = header + ROOM;
        el.style.top = `${top}px`;
        el.style.maxHeight = `${window.innerHeight - top - ROOM}px`;
      }
      el.style.overflowY = "auto";
      el.style.overscrollBehavior = "contain";
    };
    const mark = () => el.toggleAttribute("data-more-below", el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    const placeAndMark = () => {
      place();
      mark();
    };
    placeAndMark();
    window.addEventListener("resize", placeAndMark);
    el.addEventListener("scroll", mark, { passive: true });
    const grows = new ResizeObserver(mark);
    grows.observe(el);
    for (const child of el.children) grows.observe(child);
    const boxGrows = box ? new ResizeObserver(placeAndMark) : null;
    if (box) boxGrows!.observe(box);
    return () => {
      window.removeEventListener("resize", placeAndMark);
      el.removeEventListener("scroll", mark);
      grows.disconnect();
      boxGrows?.disconnect();
      el.removeAttribute("data-more-below");
      for (const k of ["top", "maxHeight", "overflowY", "overscrollBehavior"] as const) el.style[k] = "";
    };
  }, [column, on]);
}

/**
 * The room a `sticky` block at the top of a scrolling box takes past the box's own top padding, plus the room kept under it, in pixels,
 * while `on`, and null before it is measured: where a second sticky column inside the same box starts, so it sticks below the block, not
 * behind it (the indices page's deal popup sets it as `--toolbox-top`, which `useStickyColumn` reads). `el` is the block; `key` changes
 * when another element takes its place.
 */
export function useStuckRoom(el: RefObject<HTMLElement | null>, on: boolean, key: unknown): number | null {
  const [room, setRoom] = useState<number | null>(null);
  useEffect(() => {
    const top = el.current;
    const box = top?.parentElement?.closest<HTMLElement>(".sheet-body") ?? null;
    if (!on || !top || !box) {
      setRoom(null);
      return;
    }
    const read = () => setRoom(top.offsetHeight - parseFloat(getComputedStyle(box).paddingTop) + BOX_ROOM);
    read();
    const grows = new ResizeObserver(read);
    grows.observe(top);
    return () => grows.disconnect();
  }, [el, on, key]);
  return room;
}
