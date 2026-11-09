// Small React hooks shared across pages and the kit.
import { useEffect, useLayoutEffect, useState } from "react";
import { useSearchParams } from "react-router";

/** useLayoutEffect in the browser, useEffect while pre-rendering (where a layout effect only warns). */
export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** False on the pre-rendered page and the hydrating render, true from the first effect on: reading browser-only state before then would not match the HTML. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

const EMPTY = new URLSearchParams();

/**
 * The page's address parameters, empty until hydrated (a page is pre-rendered without them), and `update`, which sets each given key (null or "" removes it) on the live
 * address, replacing the history entry without scrolling.
 */
export function useAddressParams(): { params: URLSearchParams; update: (changes: Record<string, string | null>) => void; hydrated: boolean } {
  const [search, setSearch] = useSearchParams();
  const hydrated = useHydrated();
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(search);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setSearch(next, { replace: true, preventScrollReset: true });
  };
  return { params: hydrated ? search : EMPTY, update, hydrated };
}
