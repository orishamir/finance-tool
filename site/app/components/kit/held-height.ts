// A block whose rows can differ from one choice to the next: the tallest
// height it has had stays its least height, so what stands below it never moves back and forth. `key` starts over (another index).
import { useLayoutEffect, useRef } from "react";

export function useHeldHeight<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);
  const held = useRef({ key, width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const width = window.innerWidth;
    const fresh = held.current.key !== key || held.current.width !== width;
    if (fresh) {
      held.current = { key, width, height: 0 };
      el.style.minHeight = "";
    }
    const hold = () => {
      const height = el.getBoundingClientRect().height;
      if (height > held.current.height) {
        held.current.height = height;
        el.style.minHeight = `${height}px`;
      }
    };
    // a fresh hold waits a frame: the first layout comes before a child measures itself (a chart drawn at its default width, scaled to the
    // card's), and holding that would leave a blank under the chart
    if (!fresh) return hold();
    const frame = requestAnimationFrame(hold);
    return () => cancelAnimationFrame(frame);
  });
  return ref;
}
