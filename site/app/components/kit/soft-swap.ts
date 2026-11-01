// When what a block shows is replaced (another set of results, the next facts), the new content fades in rather than snaps. Opacity
// only: nothing moves. Follows the site's motion tokens, so a reader who asked for less motion gets none.
import { useEffect, useRef } from "react";

/** Attach the ref to the block; `key` says what it shows. Nothing runs on the first paint. */
export function useSoftSwap<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);
  const shown = useRef(key);
  useEffect(() => {
    if (shown.current === key) return;
    shown.current = key;
    const el = ref.current;
    if (!el?.animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate([{ opacity: 0.25 }, { opacity: 1 }], { duration: 260, easing: "cubic-bezier(0.2, 0, 0, 1)" });
  }, [key]);
  return ref;
}
