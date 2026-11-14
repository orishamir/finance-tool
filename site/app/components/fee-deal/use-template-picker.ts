// The fee page's template picker (method §10.6): each house's plans and each track that fit the deal's kind, the picker open at the button
// it was opened from, what each price list leaves out of a deal of this kind, and what the template the deal was filled from left out.
import { useMemo, useState } from "react";
import { newDeal, type FeeDeal } from "../../lib/fee-deal/model";
import { averagesOfFees, dealFromTemplate, leftOfFees, pickTrack, templateOf, templateOptions, type LeftOut } from "../../lib/fee-deal/templates";
import type { FeesData } from "../../lib/fee-page-data";

/**
 * The picker for the deal on screen. `from` says which step opened it, and outlives the sheet's closing: the price list step's (a pick
 * opens a new deal, `onNew`) or the track step's (a pick sets the track on this deal, `onTrack`). A pick that gives no deal does nothing.
 */
export function useTemplatePicker({ deal, data, today, onTrack, onNew }: { deal: FeeDeal; data: FeesData; today: string; onTrack: (next: FeeDeal) => void; onNew: (next: FeeDeal, id: string) => void }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [from, setFrom] = useState<"new" | "track">("new");
  const open = (step: "new" | "track") => (at: HTMLElement) => {
    setFrom(step);
    setAnchor(at);
  };
  // each house's plans are its ways to buy what the deal holds
  const options = useMemo(() => templateOptions(deal.kind, data, today), [deal.kind, data, today]);
  const onPick = (id: string) => {
    setAnchor(null);
    if (from === "track") {
      const next = pickTrack(deal, id, data, today);
      if (next) onTrack(next);
      return;
    }
    const next = dealFromTemplate(deal, id, data, today);
    if (next) onNew(next, id);
  };
  // what each price list leaves out of a deal of this kind and holding, for the picker; a track's the new deal says
  const left = useMemo(() => {
    const m = new Map<string, LeftOut[]>();
    if (!anchor) return m;
    const probe: FeeDeal = newDeal(deal.kind);
    for (const o of options) if (o.source === "house") m.set(o.id, templateOf(probe, o.id, data, today)?.left ?? []);
    return m;
  }, [anchor, options, deal.kind, data, today]);
  // what the template left out, what a house's record says its price leaves out (D106), and what the house charged on average (F-122),
  // only where it filled the deal's fees: a track set on a deal whose fees it kept left nothing out of them
  const filled = useMemo(() => {
    const t = deal.template && !deal.template.feesKept ? templateOf(deal, deal.template.id, data, today) : null;
    // each fee by its own list: a fee copied from another house brings that house's lines of its kind in place of the template's, and takes the template's averages of its kind away
    if (!t) return null;
    const averages = averagesOfFees(deal, t.averages);
    return { left: leftOfFees(deal, t.left, data), leftOut: t.leftOut ?? null, ...(averages ? { averages } : {}) };
  }, [deal, data, today]);
  return {
    anchor,
    /** Whether a pick opens a new deal (the price list step's). */
    newDeal: from === "new",
    options,
    left,
    filled,
    /** Opens the track picker from the button tapped, where the deal's kind has tracks; null where it has none. */
    onPickTrack: options.some((o) => o.source === "track") ? open("track") : null,
    /** Opens the price lists from the button tapped, where a house has plans for the deal's kind; null where none has. */
    onTemplates: options.some((o) => o.source === "house") ? open("new") : null,
    onPick,
    onClose: () => setAnchor(null),
  };
}
