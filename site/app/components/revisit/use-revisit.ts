// The revisit of the current goal's saved comparison (design-spec 21.5): runs when a page with the strip mounts and a
// saved comparison exists, once the comparison bundle is read, and is cached for the visit by the record's id and the
// data snapshot the bundle carries, so the strip does not recompute on every route.
import { useEffect, useState } from "react";
import { loadBundle } from "../../lib/bundle";
import { useGoals } from "../../lib/goal";
import { revisitSaved, type RevisitView } from "../../lib/revisit";
import { isoToday, isReadableSaved, useSavedComparisons, type CompareMode, type SavedComparisonRecord } from "../../lib/state";

const cache = new Map<string, RevisitView>();

export interface RevisitState {
  /** The saved record of the current goal for the mode asked (or the most recently saved one), as the device holds it. */
  saved: SavedComparisonRecord | undefined;
  view: RevisitView | null;
}

export function useRevisit(mode?: CompareMode): RevisitState {
  const { current } = useGoals();
  const { list, ready } = useSavedComparisons();
  const mine = ready && current ? list.filter((c) => (c as { goalId?: string }).goalId === current.id) : [];
  const saved = (mode ? mine.find((c) => c.mode === mode) : [...mine].sort((a, b) => String(b.savedOn).localeCompare(String(a.savedOn)))[0]) as SavedComparisonRecord | undefined;
  const key = saved ? `${saved.id ?? ""}|${saved.savedOn ?? ""}|${JSON.stringify(saved.choice ?? null)}` : "";
  const [view, setView] = useState<RevisitView | null>(null);
  useEffect(() => {
    setView(null);
    if (!saved) return;
    let cancelled = false;
    if (!isReadableSaved(saved)) {
      setView(revisitSaved(null, saved, isoToday()));
      return;
    }
    loadBundle()
      .then((bundle) => {
        if (cancelled) return;
        const ck = `${key}|${bundle.runDate}|${(bundle.dataFiles ?? []).length}`;
        const hit = cache.get(ck);
        if (hit) return setView(hit);
        // let the page paint before the re-run
        window.setTimeout(() => {
          if (cancelled) return;
          const v = revisitSaved(bundle, saved, isoToday());
          cache.set(ck, v);
          setView(v);
        }, 30);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return { saved, view };
}

/** A saved comparison was replaced: drop what was cached for the goal. */
export function forgetRevisit(): void {
  cache.clear();
}
