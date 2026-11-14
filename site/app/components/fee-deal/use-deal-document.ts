// The deal on screen as a document (method §10.6): the deal the page opens with (from the address, a saved one, or a new one), the deal
// as it changes, kept on this device once it is worth saving, the fee chosen in it, where the focus goes after a change, the saved deals
// opened, renamed and deleted, and the one undo line of the last change that lost something (lib/fee-deal/undo.ts, use-undo.ts), its
// words and the place each kind of change puts it. A change that would pass what a deal may hold (lib/fee-deal/limits.ts) is refused,
// and the refusal says why. The deal on screen follows the saved deals as another tab changes them, and a tab saves only its own deal:
// one deleted in another tab is not saved again until the person keeps it. Each deal keeps its history for the session (lib/fee-deal/
// history.ts): Ctrl+Z steps back through its changes and Ctrl+Shift+Z (or Ctrl+Y) forward again, outside a text field, whose own undo
// those keys keep; the undo line is the shortcut to the last step, so while its change is the last one made, "ביטול" is that step back.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { feeDeal as copy } from "../../copy";
import { copiedHouse } from "../../lib/fee-deal/deal-read";
import { kindById } from "../../lib/fee-deal/kinds";
import { houseName } from "../../lib/fee-deal/templates";
import { dealBreach, LIMITS, takeRefusal, type Limit } from "../../lib/fee-deal/limits";
import type { AddressDeal } from "../../lib/fee-deal/link";
import { NAME_MAX, newDeal, type FeeDeal } from "../../lib/fee-deal/model";
import { dealStore, lastOpenId, rememberOpen, reopened, sameDeal, savedIfWorth, savedTwin, savedWith, worthSaving } from "../../lib/fee-deal/store";
import { changeFormKept, deleteDealKept, formBack, freedCurrency, standing, undo, undoDelete, undoWords as feeUndoWords, type KindUndo, type MaybeUndoable, type Undo } from "../../lib/fee-deal/undo";
import type { PartId } from "../../lib/fee-deal/offers/parts";
import type { FeesData } from "../../lib/fee-page-data";
import { dealLabel } from "./bar-end";
import type { FeeFocus } from "./builder";
import { undoLines, useUndo, type AnyUndo } from "./use-undo";
import { emptyHistory, historyKey, recorded, stepAhead, stepBack, type History, type Step } from "../../lib/fee-deal/history";
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
  // each deal's history for the session, by its id, and the deal right after the change the undo line stands for: while the deal on
  // screen is still that one, the line's change is the last step
  const histories = useRef(new Map<string, History>());
  const lineAfter = useRef<{ u: AnyUndo; deal: FeeDeal } | null>(null);
  const historyOf = (id: string) => histories.current.get(id) ?? emptyHistory;
  // each focus of a field is one run of typing: what it changes while it keeps the focus is one step
  const focusRun = useRef(0);
  useEffect(() => {
    const onFocus = () => void focusRun.current++;
    window.addEventListener("focusin", onFocus);
    return () => window.removeEventListener("focusin", onFocus);
  }, []);
  /** The field a change is typed into now, as one focus of it; null where the focus is in none. */
  const typingIn = (): string | null => {
    const el = document.activeElement;
    return el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && !["checkbox", "radio", "button"].includes(el.type)) ? `field:${focusRun.current}` : null;
  };

  // the deal on screen is the one a reload opens
  useEffect(() => rememberOpen(deal.id), [deal.id]);
  // another tab saved the deal on screen: it follows; another tab deleted it: the page says so and saves it no more
  useEffect(() => {
    const stored = saved.find((d) => d.id === deal.id);
    if (stored) {
      wasSaved.current = deal.id;
      if (deletedElsewhere) setDeletedElsewhere(false);
      if (!sameDeal(stored, deal)) {
        // another tab changed it: the steps this tab kept would put back over that change
        histories.current.delete(deal.id);
        setDeal(stored);
        if (chosen !== null && !stored.fees.some((f) => f.id === chosen)) setChosen(stored.fees[0]?.id ?? null);
      }
    } else if (wasSaved.current === deal.id) {
      wasSaved.current = null;
      setDeletedElsewhere(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved]);

  /**
   * Puts `next` on screen and saves it where it is worth saving, the deal before it kept as a step of its history (`record` false: a step
   * back or ahead itself); false, with the refusal said, where it passes a limit.
   */
  const keep = (next: FeeDeal, record = true): boolean => {
    const no = refusalOf(deal, next);
    if (no) {
      setRefusal(no);
      return false;
    }
    setRefusal(null);
    if (record && next.id === deal.id) histories.current.set(deal.id, recorded(historyOf(deal.id), { deal, chosen }, next, typingIn()));
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
    lineAfter.current = { u: r.undo, deal: r.deal };
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
   * under the fee's block without taking the focus; the focus goes to the new price's box, so typing goes on there, except a free price,
   * which has none: the focus stays on "חינם" in the toolbox. False where nothing changed.
   */
  const changeForm = (feeId: string, part: PartId, caseId: string | null, at?: number): boolean => {
    // a form chosen again right after "חינם" puts the price back as it was, with its parts
    if (undoing && "dealId" in undoing && formBack(undoing, deal, feeId, part, caseId ?? undefined)) {
      onUndo();
      setFocus({ fee: feeId, on: "box" });
      return true;
    }
    const r = changeFormKept(deal, feeId, part, chosen, caseId ?? undefined, at, undoing && "dealId" in undoing ? freedCurrency(undoing, deal, feeId, caseId ?? undefined) : undefined);
    if (!r) return false;
    if (r.undo) {
      if (!keep(r.deal)) return false;
      setUndoing(r.undo);
      lineAfter.current = { u: r.undo, deal: r.deal };
    } else change(r.deal);
    if (part !== "free") setFocus({ fee: feeId, on: "box" });
    return true;
  };
  // the fee put back takes the focus on its card; a fill's and a chain's lines hand it on themselves; a deleted deal put back that was on
  // screen comes back on screen
  const onUndo = () => {
    if (!undoing) return;
    const u = undoing;
    // the line's change is the last one made: "ביטול" is the history's step back, so a step ahead makes it again
    if (lineAfter.current?.u === u && lineAfter.current.deal === deal) {
      if (historyMove("back") && "dealId" in u && u.what.kind === "remove") setFocus({ fee: u.what.feeId, on: "card" });
      return;
    }
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
  /**
   * One step back or ahead in the deal's history: the deal as it stood then, with the fee chosen then where it still has it. The undo line
   * of the change stepped back over goes; any other stays while what it would put back still has its place. False where there is no step.
   */
  const historyMove = (way: "back" | "ahead"): boolean => {
    const h = historyOf(deal.id);
    const now: Step = { deal, chosen };
    const r = way === "back" ? stepBack(h, now) : stepAhead(h, now);
    if (!r || !keep(r.to.deal, false)) return false;
    histories.current.set(deal.id, r.h);
    setChosen(r.to.chosen !== null && r.to.deal.fees.some((f) => f.id === r.to.chosen) ? r.to.chosen : (r.to.deal.fees[0]?.id ?? null));
    if (undoing && "dealId" in undoing && (lineAfter.current?.deal === deal || !standing(undoing, r.to.deal))) setUndoing(null);
    lineAfter.current = null;
    return true;
  };
  // the history's keys, outside a text field (whose own undo they keep) and while no menu, sheet or carried thing is open; while a saved
  // deal's deletion has its undo line, Ctrl+Z is that line's "ביטול"
  const latest = useRef({ historyMove, onUndo, undoing });
  latest.current = { historyMove, onUndo, undoing };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const way = historyKey(e);
      if (!way || e.defaultPrevented) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable]:not([contenteditable=false])")) return;
      if (document.querySelector("dialog[open], [data-lift-ghost], [data-reach-frame]")) return;
      const l = latest.current;
      e.preventDefault();
      if (way === "back" && l.undoing && !("dealId" in l.undoing)) return l.onUndo();
      l.historyMove(way);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
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
    // a fee named as its card names it: one copied from another house's list says the house after its name
    return feeUndoWords(u, (f) => feeName(f.kind, f.name, copiedHouse(deal, f, (id) => houseName(id, data))), data);
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
    historyMove,
    rename,
    remove,
    /** The undo line on screen, its words, and each place's line (`undoLines`, `chosen` the fee the toolbox shows). */
    undo: { shown, words, lines: undoLines(shown, words, chosen, { onUndo, onHold: setHolding, take }), take, setHolding },
  };
}
