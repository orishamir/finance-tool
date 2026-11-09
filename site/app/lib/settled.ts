import { useEffect, useState, type DependencyList } from "react";

/**
 * The value once it has stopped changing for `ms`: a slider being dragged gives a new value on every move, and work too slow for
 * each move (pricing every account and fund on the index page, about 200 ms) waits for the hand to rest.
 */
export function useSettled<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    if (Object.is(value, settled)) return;
    const t = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(t);
  }, [value, settled, ms]);
  return settled;
}

/**
 * Work too slow for the render, run just after it. The last answer stays on the page until the next is ready, so the block never empties
 * and comes back; it is null only before the first answer, and when there is no work (`work` null) or the work failed.
 */
export function useAfterRender<T>(work: (() => T | null) | null, deps: DependencyList, ms = 80): T | null {
  const [answer, setAnswer] = useState<T | null>(null);
  useEffect(() => {
    if (!work) {
      setAnswer(null);
      return;
    }
    const t = window.setTimeout(() => {
      try {
        setAnswer(work());
      } catch {
        setAnswer(null);
      }
    }, ms);
    return () => window.clearTimeout(t);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return answer;
}
