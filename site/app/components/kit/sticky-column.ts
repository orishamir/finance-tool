// A column that stands beside a longer one and stays in view as the page scrolls (the fee page's toolbox beside its fees): it sticks under
// the site's header where it fits the window, and where it is taller it sticks by its foot at the window's foot, so the page's own scroll
// shows all of it and nothing in it is cut at the window's height or scrolls inside it.
import { useEffect, type RefObject } from "react";

/** The room kept under the header and over the window's foot, in pixels. */
const ROOM = 16;

/** Keeps `column` (a `sticky` element) under the header or by its foot, as its height and the window's change, while `on`. */
export function useStickyColumn(column: RefObject<HTMLElement | null>, on: boolean) {
  useEffect(() => {
    const el = column.current;
    if (!on || !el) return;
    const place = () => {
      const header = document.querySelector("[data-site-header]")?.getBoundingClientRect().height ?? 64;
      el.style.top = `${Math.min(header + ROOM, window.innerHeight - el.offsetHeight - ROOM)}px`;
    };
    place();
    const sized = new ResizeObserver(place);
    sized.observe(el);
    window.addEventListener("resize", place);
    return () => {
      sized.disconnect();
      window.removeEventListener("resize", place);
      el.style.top = "";
    };
  }, [column, on]);
}
