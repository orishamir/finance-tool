import { useEffect, useState } from "react";

/**
 * The value once it has stopped changing for `ms`: a slider being dragged gives a new value on every move, and work too slow for
 * each move (pricing every account and fund on the index page, about 200 ms) waits for the hand to rest (2026-10-28).
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
