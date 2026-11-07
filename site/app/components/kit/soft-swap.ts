// When what a block shows is replaced (another set of results, the next facts), the new content fades in rather than snaps. Opacity
// only: nothing moves. Follows the site's motion tokens, so a reader who asked for less motion gets none.
import { useEffect, useLayoutEffect, useRef } from "react";
import { cssMs } from "./chart-glide-math";

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

const DIM = 0.4;
const tokenMs = (name: string) => (typeof window === "undefined" ? 0 : cssMs(getComputedStyle(document.documentElement).getPropertyValue(name)));

/**
 * A switch that replaces most of a page (another index, D62, 2026-11-06): what lies below it may move, and it does not jump. On the tap
 * the block dims at once, the first answer inside 100 ms (the next index is laid out after the dim is painted, and that can take longer
 * on a phone); when the new content is in place it fades back in where it landed. Opacity only, on the motion tokens: a reader who asks
 * for less motion gets the dim and the return without the fades.
 * `ref` goes on the block below the switch, `key` says what it shows; `begin(go)` is called on the tap, with the switch itself.
 */
export function useSwapGlide<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);
  const shown = useRef(key);
  useLayoutEffect(() => {
    const el = ref.current;
    if (shown.current === key || !el) return;
    shown.current = key;
    const from = getComputedStyle(el).opacity;
    el.style.transition = "";
    el.style.opacity = "";
    const ms = tokenMs("--duration-fold");
    if (ms > 0 && el.animate) el.animate([{ opacity: Math.min(Number(from) || DIM, DIM) }, { opacity: 1 }], { duration: ms, easing: "cubic-bezier(0.2, 0, 0, 1)" });
  }, [key]);
  const begin = (go: () => void) => {
    const el = ref.current;
    if (!el) return go();
    const ms = tokenMs("--duration-fast");
    el.style.transition = ms > 0 ? `opacity ${Math.min(ms, 100)}ms linear` : "";
    el.style.opacity = String(DIM);
    // two frames: the dim is on the screen before the switch's own render starts
    requestAnimationFrame(() => requestAnimationFrame(go));
    // a switch to what is already shown changes no key: the block comes back by itself
    const at = shown.current;
    setTimeout(() => {
      if (shown.current === at && ref.current) {
        ref.current.style.transition = "";
        ref.current.style.opacity = "";
      }
    }, 1500);
  };
  return { ref, begin };
}
