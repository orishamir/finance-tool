// The address bar as a store for React: the id its fragment names and its query, read through `useSyncExternalStore`, so the
// pre-rendered page and the render that hydrates it see an empty address and the browser's own follows at once. Both change on the
// browser's Back and Forward (`popstate`), on a typed or linked `#` (`hashchange`), and on `moveAddress`, which a page that keeps its state in
// the address without a router navigation writes through. A router navigation fires no event: a component that also reads `useLocation`
// renders again on it, and these read the new address then.
import { useSyncExternalStore } from "react";
import { hashId } from "./address-hash";

const moved = new Set<() => void>();

function subscribe(on: () => void): () => void {
  window.addEventListener("popstate", on);
  window.addEventListener("hashchange", on);
  moved.add(on);
  return () => {
    window.removeEventListener("popstate", on);
    window.removeEventListener("hashchange", on);
    moved.delete(on);
  };
}

const hashNow = () => hashId(window.location.hash);
const searchNow = () => window.location.search;
const none = () => "";

/** The element id the address's fragment names (`#KH-09` → "KH-09", decoded; `hashId`), "" where it names none or before hydration. */
export function useHash(): string {
  return useSyncExternalStore(subscribe, hashNow, none);
}

/** The address's query with its "?" (`window.location.search`), "" where it has none or before hydration. */
export function useAddressSearch(): string {
  return useSyncExternalStore(subscribe, searchNow, none);
}

/**
 * Moves the address to `url` without a router navigation (nothing reloads, nothing scrolls), as a new history step or in place of this
 * one, and tells `useHash` and `useAddressSearch`. The history entry keeps the router's state, so Back still works with the router.
 */
export function moveAddress(url: string, how: "push" | "replace"): void {
  if (how === "push") window.history.pushState(window.history.state, "", url);
  else window.history.replaceState(window.history.state, "", url);
  for (const on of moved) on();
}
