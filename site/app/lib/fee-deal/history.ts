// The fee page's history of one deal's changes (Ctrl+Z and Ctrl+Shift+Z): each step is the deal as it stood before a change, with the fee
// chosen then, kept in memory for the session, at most `HISTORY_MAX` steps back. A change made drops the steps ahead. The changes typed
// into one field while it keeps the focus (a name, a figure that changes the deal as it is typed) are one step, so a step back puts the
// whole word or number back, not one keystroke. Pure.
import { sameContent, type FeeDeal } from "./model";

/** The deal as it stood, and the fee chosen then. */
export interface Step {
  deal: FeeDeal;
  chosen: string | null;
}

/** The steps back (the latest last) and ahead (the next last); `typing`, the field the latest step was typed into, while it keeps the focus. */
export interface History {
  back: Step[];
  ahead: Step[];
  typing: string | null;
}

/** How many steps back the page keeps for a deal. */
export const HISTORY_MAX = 100;

export const emptyHistory: History = { back: [], ahead: [], typing: null };

/**
 * The history once a change from `before` to `next` is made, typed into field `typing` (one focus of one field; null: not typed): `before`
 * becomes the latest step back (the oldest falls off past `max`), and the steps ahead go. A change that leaves the deal as it was is no
 * step; one typed into the field the step before was typed into, still focused, joins that step.
 */
export function recorded(h: History, before: Step, next: FeeDeal, typing: string | null = null, max = HISTORY_MAX): History {
  if (sameContent({ ...before.deal, saved: undefined }, { ...next, saved: undefined })) return h;
  if (typing !== null && typing === h.typing && h.back.length > 0) return { ...h, ahead: [] };
  return { back: [...h.back, before].slice(-max), ahead: [], typing };
}

/** One step back from `now`: the step it goes to, and the history after it (`now` the next step ahead); null where there is none. */
export function stepBack(h: History, now: Step): { to: Step; h: History } | null {
  const to = h.back.at(-1);
  if (!to) return null;
  return { to, h: { back: h.back.slice(0, -1), ahead: [...h.ahead, now], typing: null } };
}

/** One step ahead from `now`, after a step back: the step it goes to, and the history after it; null where there is none. */
export function stepAhead(h: History, now: Step): { to: Step; h: History } | null {
  const to = h.ahead.at(-1);
  if (!to) return null;
  return { to, h: { back: [...h.back, now], ahead: h.ahead.slice(0, -1), typing: null } };
}

/** What a key press asks of the history: Ctrl+Z (or ⌘Z) a step back; Ctrl+Shift+Z or Ctrl+Y a step ahead; null for any other key. */
export function historyKey(e: { code: string; key: string; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean }): "back" | "ahead" | null {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return null;
  // by the key's place, so a Hebrew layout (ז, ט) asks the same
  const z = e.code === "KeyZ" || e.key.toLowerCase() === "z";
  const y = e.code === "KeyY" || e.key.toLowerCase() === "y";
  if (z) return e.shiftKey ? "ahead" : "back";
  if (y && !e.shiftKey) return "ahead";
  return null;
}
