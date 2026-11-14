// A column that stands beside a longer one and stays in view as the page scrolls (the fee page's toolbox beside its fees): it sticks under
// the site's header, never under it, and where it is taller than the window under the header it scrolls inside itself, so every part of it
// is within reach wherever the page is scrolled to.
import { useEffect, type RefObject } from "react";

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
    place();
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("resize", place);
      for (const k of ["top", "maxHeight", "overflowY", "overscrollBehavior"] as const) el.style[k] = "";
    };
  }, [column, on]);
}
