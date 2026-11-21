// A column that stands beside a longer one and stays in view as the page scrolls (the fee page's toolbox beside its fees): it sticks under
// the site's header, never under it, and where it is taller than the window under the header it scrolls inside itself, so every part of it
// is within reach wherever the page is scrolled to. It draws no scrollbar; while more of it is below, its foot fades out (`data-more-below`,
// app.css), and the fade goes once its last line is in view.
import { useEffect, useState, type RefObject } from "react";

/** The room kept under the header and over the window's foot, in pixels. */
const ROOM = 16;

/** Keeps `column` (a `sticky` element) under the header, no taller than the window below it, scrolling inside where it is taller, while `on`. */
export function useStickyColumn(column: RefObject<HTMLElement | null>, on: boolean) {
  useEffect(() => {
    const el = column.current;
    if (!on || !el) return;
    const place = () => {
      const header = document.querySelector("[data-site-header]")?.getBoundingClientRect().height ?? 64;
      const top = header + ROOM;
      el.style.top = `${top}px`;
      el.style.maxHeight = `${window.innerHeight - top - ROOM}px`;
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
    return () => {
      window.removeEventListener("resize", placeAndMark);
      el.removeEventListener("scroll", mark);
      grows.disconnect();
      el.removeAttribute("data-more-below");
      for (const k of ["top", "maxHeight", "overflowY", "overscrollBehavior"] as const) el.style[k] = "";
    };
  }, [column, on]);
}

/**
 * The room a `sticky` block at the top of a scrolling box takes past the box's own top padding, plus 8px, in pixels, while `on`, and null
 * before it is measured: where a second sticky column inside the same box starts, so it sticks below the block, not behind it (the
 * indices page's deal popup sets it as `--toolbox-top`). `el` is the block; `key` changes when another element takes its place.
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
    const read = () => setRoom(top.offsetHeight - parseFloat(getComputedStyle(box).paddingTop) + 8);
    read();
    const grows = new ResizeObserver(read);
    grows.observe(top);
    return () => grows.disconnect();
  }, [el, on, key]);
  return room;
}
