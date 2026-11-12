// The comparison bundle (lib/compare.server.ts, served as /compare-bundle.json), fetched once per visit by the indices page,
// and the preload links of the data files a page fetches after it starts.
import type { CompareBundle } from "./compare";

let bundlePromise: Promise<CompareBundle> | null = null;

export function loadBundle(): Promise<CompareBundle> {
  if (!bundlePromise) bundlePromise = fetch(`${import.meta.env.BASE_URL}compare-bundle.json`).then((r) => r.json() as Promise<CompareBundle>);
  return bundlePromise;
}

/** `<link rel=preload as=fetch>` for the static data files a page fetches after it starts: the
 * request goes out with the HTML instead of after the scripts have run. Used from a route's `links()`. */
export function bundleLinks(...files: ("compare-bundle.json" | "deal-data.json" | "indices-bundle.json")[]) {
  return files.map((f) => ({ rel: "preload", as: "fetch", href: `${import.meta.env.BASE_URL}${f}`, crossOrigin: "anonymous" as const }));
}
