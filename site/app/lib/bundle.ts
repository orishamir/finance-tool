// The comparison bundle (lib/compare.server.ts, served as /compare-bundle.json), fetched once per visit and shared
// by the comparison result and the idle-cash screen.
import type { CompareBundle } from "./compare";

let bundlePromise: Promise<CompareBundle> | null = null;

export function loadBundle(): Promise<CompareBundle> {
  if (!bundlePromise) bundlePromise = fetch(`${import.meta.env.BASE_URL}compare-bundle.json`).then((r) => r.json() as Promise<CompareBundle>);
  return bundlePromise;
}
