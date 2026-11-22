// Small React hooks shared across pages and the kit.
import { useCallback, useEffect, useLayoutEffect, useState, useSyncExternalStore, type RefObject } from "react";
import { useSearchParams } from "react-router";

/** useLayoutEffect in the browser, useEffect while pre-rendering (where a layout effect only warns). */
export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const noSubscription = () => () => {};

/**
 * False on the pre-rendered page and the render that hydrates it, true after (and at once on a page drawn in the browser): reading
 * browser-only state before then would not match the HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noSubscription, () => true, () => false);
}

/**
 * The site's widths by name, the stylesheet's own breakpoints (`md`, `lg`, `xl`): a page or a kit piece that asks the width asks it with
 * these, so a hook and a class switch at the same pixel.
 */
export const MQ = { md: "(min-width: 48rem)", lg: "(min-width: 64rem)", xl: "(min-width: 80rem)" } as const;

/**
 * Whether a media query matches, following it as the window changes. The pre-rendered page and the render that hydrates it cannot know
 * the screen, so they take `serverValue` (false unless given) and the browser's answer follows at once. Give `true` where the computer's
 * layout is the pre-rendered one, and `null` where the caller draws both until it knows (a list built for the screen it is on). Where the
 * page renders only in the browser (the index page's body), the first render already has the answer and nothing moves after it.
 */
export function useMedia<S extends boolean | null = false>(query: string, serverValue: S = false as S): boolean | S {
  const subscribe = useCallback(
    (on: () => void) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", on);
      return () => m.removeEventListener("change", on);
    },
    [query],
  );
  return useSyncExternalStore<boolean | S>(subscribe, () => window.matchMedia(query).matches, () => serverValue);
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

/**
 * Whether the element `ref` holds is at least `minPx` wide, following it as it resizes: a piece that sits in hosts of different widths (a
 * page, a popup) lays itself out by the room its host gives it, not by the window. The first render takes `guess` (the window's answer,
 * say), and the element's own width replaces it before the first paint.
 */
export function useWiderThan(ref: RefObject<HTMLElement | null>, minPx: number, guess: () => boolean): boolean {
  const [wide, setWide] = useState(() => (typeof window === "undefined" ? false : guess()));
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setWide(el.getBoundingClientRect().width >= minPx);
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, minPx]);
  return wide;
}
