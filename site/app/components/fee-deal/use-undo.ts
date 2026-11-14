// The fee page's one undo line (lib/fee-deal/undo.ts): the last change that lost something, while it can be undone; its clock, which runs
// while neither the focus nor the pointer is on the line and keeps what is left while one is; whether the line takes the focus as it
// appears (only the undo just made does); and where each kind of change puts its line.
import { useEffect, useRef, useState } from "react";
import type { DealUndo, KindUndo, Undo } from "../../lib/fee-deal/undo";
import type { CaseUndoLine, FeeUndoLine, KindUndoLine } from "./builder";
import type { FillUndoLine } from "./toolbox";

/** How long the undo line stays while neither the focus nor the pointer is on it, in milliseconds. */
export const UNDO_MS = 10_000;

/** Any change the page keeps for its undo: one of a deal's fees, the deal's kind, or a saved deal deleted. */
export type AnyUndo = Undo | KindUndo | DealUndo;

/**
 * The undo line's state: the change it stands for (`undoing`, null where none), `made` for a change just made (its line takes the focus as
 * it appears, `take`), and `setHolding` for the focus or the pointer on the line, which stops its clock.
 */
export function useUndo() {
  const [undoing, setUndoing] = useState<AnyUndo | null>(null);
  // the undo just made, whose line takes the focus when it appears; a line drawn again later (its fee's panel opened again) does not
  const fresh = useRef<AnyUndo | null>(null);
  const take = (u: AnyUndo) => () => {
    if (fresh.current !== u) return false;
    fresh.current = null;
    return true;
  };
  const made = (u: AnyUndo) => {
    fresh.current = u;
    setUndoing(u);
  };
  const [holding, setHolding] = useState(false);
  // the line's time left: it runs while the line is not held, and stops, keeping what is left, while it is
  const clock = useRef<{ u: AnyUndo | null; left: number }>({ u: null, left: UNDO_MS });
  useEffect(() => {
    if (!undoing || holding) return;
    if (clock.current.u !== undoing) clock.current = { u: undoing, left: UNDO_MS };
    const start = Date.now();
    const t = window.setTimeout(() => setUndoing(null), clock.current.left);
    return () => {
      window.clearTimeout(t);
      clock.current.left -= Date.now() - start;
    };
  }, [undoing, holding]);
  return { undoing, setUndoing, made, take, setHolding };
}

/** Where the undo line stands, by what its change did: each place's line, or null where it stands elsewhere or none stands. */
export interface UndoLines {
  /** A fee taken away: in its place among the fees. */
  fee: FeeUndoLine | null;
  /** Another kind that took fees away: under the kind. */
  kind: KindUndoLine | null;
  /** A fee filled from a price list: in the toolbox's foot, while the toolbox shows that fee. */
  fill: FillUndoLine | null;
  /** A price, a form, a case or a thing taken away: under its fee's block (a form's in its open case). */
  case: CaseUndoLine | null;
  /** A saved deal deleted: its words, under the bar. */
  deal: string | null;
}

/** The undo line `shown` (with its `words`) in the place its change puts it; `chosen` is the fee the toolbox shows. */
export function undoLines(shown: AnyUndo | null, words: string | null, chosen: string | null, line: { onUndo: () => void; onHold: (held: boolean) => void; take: (u: AnyUndo) => () => boolean }): UndoLines {
  const none: UndoLines = { fee: null, kind: null, fill: null, case: null, deal: null };
  if (!shown || !words) return none;
  if (!("dealId" in shown)) return { ...none, deal: words };
  const base = { words, onUndo: line.onUndo, onHold: line.onHold, take: line.take(shown) };
  const what = shown.what;
  switch (what.kind) {
    case "remove":
      return { ...none, fee: { ...base, what, fee: (shown as Undo).before } };
    case "product":
      return { ...none, kind: base };
    case "fill":
      return what.feeId === chosen ? { ...none, fill: base } : none;
    case "chain":
    case "case":
    case "by":
    case "form":
    case "said":
      return { ...none, case: { ...base, feeId: what.feeId, ...(what.kind === "form" ? { inCase: { caseId: what.caseId ?? null } } : {}), ...(what.kind === "by" ? { thing: what.t } : {}) } };
  }
}
