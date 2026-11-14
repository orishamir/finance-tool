// The deal on screen as a document (method §10.6): the deal the page opens with (from the address, a saved one, or a new one), the deal
// as it changes, kept on this device once it is worth saving, the fee chosen in it, where the focus goes after a change, the saved deals
// opened, renamed and deleted, and the one undo line of the last change that lost something (lib/fee-deal/undo.ts, use-undo.ts), its
// words and the place each kind of change puts it. A change that would pass what a deal may hold (lib/fee-deal/limits.ts) is refused,
// and the refusal says why. The deal on screen follows the saved deals as another tab changes them, and a tab saves only its own deal:
// one deleted in another tab is not saved again until the person keeps it.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { feeDeal as copy } from "../../copy";
import { kindById } from "../../lib/fee-deal/kinds";
import { dealBreach, LIMITS, takeRefusal, type Limit } from "../../lib/fee-deal/limits";
import type { AddressDeal } from "../../lib/fee-deal/link";
import { NAME_MAX, newDeal, type FeeDeal } from "../../lib/fee-deal/model";
import { dealStore, lastOpenId, rememberOpen, reopened, sameDeal, savedIfWorth, savedTwin, savedWith, worthSaving } from "../../lib/fee-deal/store";
import { changeFormKept, deleteDealKept, formBack, standing, undo, undoDelete, undoWords as feeUndoWords, type KindUndo, type MaybeUndoable, type Undo } from "../../lib/fee-deal/undo";
import type { PartId } from "../../lib/fee-deal/offers/parts";
import type { FeesData } from "../../lib/fee-page-data";
import { dealLabel } from "./bar-end";
import type { FeeFocus } from "./builder";
import { undoLines, useUndo, type AnyUndo } from "./use-undo";
import { feeName } from "./words";

/** A change that may keep what it took for the undo: the deal after it, the fee chosen after it, and what it took (null for none). */
export type KeptChange = (Omit<MaybeUndoable, "undo"> & { undo: Undo | KindUndo | null }) | null;

/** A change refused because the deal would pass a limit: the fee it was made on (null: the deal's fees as a whole), and its words. */
export interface Refusal {
  feeId: string | null;
  words: string;
}

/** A refusal's words, with the limit's number. */
export const refusalWords = (limit: Limit): string => copy.limits[limit]!(LIMITS[limit]);

/** Why a change from `before` to `next` is refused: an edit that met a limit on a fee it handed back unchanged, or a limit `next` passes. */
function refusalOf(before: FeeDeal, next: FeeDeal): Refusal | null {
  for (const f of next.fees) {
    const limit = before.fees.includes(f) ? takeRefusal(f) : null;
    if (limit) return { feeId: f.id, words: refusalWords(limit) };
  }
  const breach = dealBreach(next);
  return breach && !dealBreach(before) ? { feeId: breach.feeId, words: refusalWords(breach.limit) } : null;
}

/**
 * The deal the page opens with, decided once, when the page has what it needs: later changes to the address (the page clears it) do not
 * reopen it. A link whose deal is a saved one already opens the saved one; else the address's deal, else the deal last on screen on this
 * device, else the deal last saved, else an empty deal. A deal the address gave is saved at once where it is worth saving, as a typed
 * deal is (a kind alone waits for its first fee or name), and the address is cleared, so a reload opens the deal as it is now, not the
 * link again; the empty deal a broken or unknown address opens is a new deal like any other.
 */
export function useOpenedDeal(address: AddressDeal | null, saved: readonly FeeDeal[], today: string): FeeDeal {
  const navigate = useNavigate();
  const opened = useRef<{ deal: FeeDeal; fromAddress: boolean; given: boolean } | null>(null);
  if (!opened.current) {
    const twin = address?.given ? savedTwin(address.deal, saved) : undefined;
    opened.current = { deal: twin ?? address?.deal ?? reopened(saved, lastOpenId()) ?? newDeal(null), fromAddress: address !== null, given: !!address?.given && !twin };
  }
  useEffect(() => {
    if (!opened.current?.fromAddress) return;
    const given = opened.current.given ? opened.current.deal : null;
    if (given) dealStore.update((ds) => savedIfWorth(ds, given, today) ?? ds);
    navigate({ search: "", hash: "" }, { replace: true, preventScrollReset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return opened.current.deal;
}

/**
 * The deal on screen, from `first`: `change` a change to it (an undo line stays through it, and goes by itself where the change touched
 * the part it would put back into); `kept` a change that keeps what it took for the undo, in place of any undo before it (one that took
 * nothing the person gave is a plain change); `show` another deal on screen, its first fee chosen and the undo line gone; `openGiven` a
 * deal an address gave, opened as a fresh load opens it. `onUndo` puts back what the undo line took, `remove` deletes a saved deal
 * (asking nothing, and undoable). A change past a limit is refused (`refusal` says why, until the next change or another deal). Whenever
 * another deal comes on screen, by any of them, `onShown` is told, so the page can drop what belonged to the deal before.
 */
export function useDealDocument({ first, saved, today, data, onShown }: { first: FeeDeal; saved: readonly FeeDeal[]; today: string; data: FeesData; onShown: () => void }) {
  const [deal, setDeal] = useState<FeeDeal>(first);
  const [chosen, setChosen] = useState<string | null>(first.fees[0]?.id ?? null);
  const [focus, setFocus] = useState<FeeFocus | null>(null);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  // the deal on screen was saved, and another tab has deleted it since: it is not saved again until the person keeps it
  const [deletedElsewhere, setDeletedElsewhere] = useState(false);
  // the id of the deal on screen while it is among the saved deals, so its leaving them is seen
  const wasSaved = useRef<string | null>(null);
  // the last change that lost something, while it can be undone (use-undo.ts)
  const { undoing, setUndoing, made, take, setHolding } = useUndo();

  // the deal on screen is the one a reload opens
  useEffect(() => rememberOpen(deal.id), [deal.id]);
  // another tab saved the deal on screen: it follows; another tab deleted it: the page says so and saves it no more
  useEffect(() => {
    const stored = saved.find((d) => d.id === deal.id);
    if (stored) {
      wasSaved.current = deal.id;
      if (deletedElsewhere) setDeletedElsewhere(false);
      if (!sameDeal(stored, deal)) {
        setDeal(stored);
        if (chosen !== null && !stored.fees.some((f) => f.id === chosen)) setChosen(stored.fees[0]?.id ?? null);
      }
    } else if (wasSaved.current === deal.id) {
      wasSaved.current = null;
      setDeletedElsewhere(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  /** Puts `next` on screen and saves it where it is worth saving; false, with the refusal said, where it passes a limit. */
  const keep = (next: FeeDeal): boolean => {
    const no = refusalOf(deal, next);
    if (no) {
      setRefusal(no);
      return false;
    }
    setRefusal(null);
    setDeal(next);
    if (!deletedElsewhere && worthSaving(next, saved)) {
      wasSaved.current = next.id;
      dealStore.update((ds) => savedWith(ds, next, today));
    }
    return true;
  };
  const change = (next: FeeDeal) => {
    if (!keep(next)) return;
    if (undoing && "dealId" in undoing && !standing(undoing, next)) setUndoing(null);
  };
  const kept = (r: KeptChange) => {
    if (!r) return;
    if (!r.undo) return change(r.deal);
    if (!keep(r.deal)) return;
    setChosen(r.chosen);
    made(r.undo);
  };
  const show = (next: FeeDeal) => {
    setDeal(next);
    setChosen(next.fees[0]?.id ?? null);
    setUndoing(null);
    setRefusal(null);
    setDeletedElsewhere(false);
    wasSaved.current = saved.some((d) => d.id === next.id) ? next.id : null;
    onShown();
  };
  /** A deal an address gave, opened as a fresh load opens it (`useOpenedDeal`): the saved twin of a link's deal, else the deal, saved where it is worth saving. */
  const openGiven = (a: AddressDeal) => {
    const twin = a.given ? savedTwin(a.deal, saved) : undefined;
    const next = twin ?? a.deal;
    if (a.given && !twin) dealStore.update((ds) => savedIfWorth(ds, next, today) ?? ds);
    show(next);
    if (a.given && !twin && worthSaving(next, saved)) wasSaved.current = next.id;
  };
  /** The deal on screen, deleted in another tab, saved again. */
  const keepAnyway = () => {
    setDeletedElsewhere(false);
    wasSaved.current = deal.id;
    dealStore.update((ds) => savedWith(ds, deal, today));
  };
  /**
   * A form of the price from the toolbox: what carries over carries, and the price it replaces is kept for the undo, whose line stands
   * under the fee's block without taking the focus; the focus goes to the new price's box, so typing goes on there. False where nothing
   * changed.
   */
  const changeForm = (feeId: string, part: PartId, caseId: string | null, at?: number): boolean => {
    // a form chosen again right after "חינם" puts the price back as it was, with its parts
    if (undoing && "dealId" in undoing && formBack(undoing, deal, feeId, part, caseId ?? undefined)) {
      onUndo();
      setFocus({ fee: feeId, on: "box" });
      return true;
    }
    const r = changeFormKept(deal, feeId, part, chosen, caseId ?? undefined, at);
    if (!r) return false;
    if (r.undo) {
      if (!keep(r.deal)) return false;
      setUndoing(r.undo);
    } else change(r.deal);
    setFocus({ fee: feeId, on: "box" });
    return true;
  };
  // the fee put back takes the focus on its card; a fill's and a chain's lines hand it on themselves; a deleted deal put back that was on
  // screen comes back on screen
  const onUndo = () => {
    if (!undoing) return;
    const u = undoing;
    setUndoing(null);
    if (!("dealId" in u)) {
      const back = undoDelete(saved, u);
      if (!back) return;
      dealStore.update(() => back);
      if (u.shown) show(u.deal);
      return;
    }
    const back = undo(deal, u, chosen);
    if (!back || !keep(back.deal)) return;
    setChosen(back.chosen);
    if (u.what.kind === "remove") setFocus({ fee: u.what.feeId, on: "card" });
  };
  // a name no longer than a deal's name may be (`NAME_MAX`), so the deal opens again
  const rename = (id: string, typed: string) => {
    const name = typed.slice(0, NAME_MAX);
    if (id === deal.id) return change({ ...deal, name });
    const d = saved.find((x) => x.id === id);
    if (d) dealStore.update((ds) => ds.map((x) => (x.id === id ? { ...d, name } : x)));
  };
  // the deal on screen deleted opens the next saved deal, or a new one
  const remove = (id: string) => {
    const r = deleteDealKept(saved, id, deal.id);
    if (!r) return;
    if (id === deal.id) wasSaved.current = null;
    dealStore.update(() => r.deals);
    if (r.undo.shown) show(r.deals[0] ?? newDeal(null));
    made(r.undo);
  };
  // the undo on screen: a deal's change only while what it took has a place on the deal on screen; its words, which the live region says too
  const shown = undoing && ("dealId" in undoing ? standing(undoing, deal) : true) ? undoing : null;
  const undoWords = (u: AnyUndo): string => {
    if (!("dealId" in u)) return `${copy.end.deleted}${dealLabel(u.deal, kindById(data.kinds, u.deal.kind)?.name ?? null)}.`;
    return feeUndoWords(u, (f) => feeName(f.kind, f.name), data);
  };
  const words = shown ? undoWords(shown) : null;
  return {
    deal,
    chosen,
    setChosen,
    focus,
    setFocus,
    change,
    kept,
    show,
    openGiven,
    refusal,
    setRefusal,
    deletedElsewhere,
    keepAnyway,
    changeForm,
    onUndo,
    rename,
    remove,
    /** The undo line on screen, its words, and each place's line (`undoLines`, `chosen` the fee the toolbox shows). */
    undo: { shown, words, lines: undoLines(shown, words, chosen, { onUndo, onHold: setHolding, take }), take, setHolding },
  };
}
