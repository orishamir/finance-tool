// A block whose rows can differ from one choice to the next (founder, 2026-10-28, "nothing moves when a number changes"): the tallest
// height it has had stays its least height, so what stands below it never moves back and forth. `key` starts over (another index).
import { useLayoutEffect, useRef } from "react";

export function useHeldHeight<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null);
  const held = useRef({ key, width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const width = window.innerWidth;
    if (held.current.key !== key || held.current.width !== width) {
      held.current = { key, width, height: 0 };
      el.style.minHeight = "";
    }
    const height = el.getBoundingClientRect().height;
    if (height > held.current.height) {
      held.current.height = height;
      el.style.minHeight = `${height}px`;
    }
  });
  return ref;
}
