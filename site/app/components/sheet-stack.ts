// The open sheets, one shown at a time (guidelines/design.md, "A sheet"). A sheet opened while another is open (a term or a rule tapped
// inside it, a question it asks) takes its place: the one under it is hidden, kept as it was, and comes back when the new one closes, with
// the focus on what opened the new one. Each open sheet holds a history entry of its own, so the phone's Back closes the top sheet rather
// than leaving the page; a sheet closed any other way takes its entry back off the history. The entries are the router's own state with a
// mark added, and the stack keeps the router from seeing the Back presses it answers, so nothing on the page moves for them.

/** An open sheet as the stack knows it. */
export interface StackedSheet {
  dialog: HTMLDialogElement;
  /** Closes it as its X does (its owner's `onClose`). */
  close: () => void;
  /** What had the focus, or what the sheet opened from, when it opened: it gets the focus back when the sheet closes. */
  opener: HTMLElement | null;
}

/** The mark on a sheet's history entry: how many of the stack's entries were on the history with it. */
const MARK = "sheetEntry";

const stack: StackedSheet[] = [];
const watchers = new Set<() => void>();
/** The stack's history entries still on top of the history (none once a page opened from a sheet put its own over them). */
let entries = 0;
/** Popstates still to come from the stack's own `history.go`, which no one else must see. */
let ownPops = 0;
/** Entries to take off at the end of this task: sheets that closed without the Back button. */
let pending = 0;
/** The sheet the Back button is closing: its entry is already gone. */
let backed: StackedSheet | null = null;
let listening = false;

const emit = () => {
  for (const w of watchers) w();
};

/** Watches the stack: what `isCovered` and `coversOther` say may have changed. */
export function watchSheets(onChange: () => void): () => void {
  watchers.add(onChange);
  return () => watchers.delete(onChange);
}

/** Whether `s` is open under another sheet, hidden until that one closes. */
export const isCovered = (s: StackedSheet | null): boolean => s !== null && stack.includes(s) && stack[stack.length - 1] !== s;

/** Whether `s` is open over another sheet, so its back arrow goes back to that one. */
export const coversOther = (s: StackedSheet | null): boolean => s !== null && stack.indexOf(s) > 0;

const markOf = (state: unknown): unknown => (state !== null && typeof state === "object" ? (state as Record<string, unknown>)[MARK] : undefined);

/** The phone's Back with a sheet open closes the top one; the stack's own steps back are its own. Runs before the router's listener. */
function onPop(e: PopStateEvent) {
  if (ownPops > 0) {
    ownPops--;
    e.stopImmediatePropagation();
    return;
  }
  const top = stack[stack.length - 1];
  if (entries === 0 || !top) return;
  e.stopImmediatePropagation();
  entries--;
  backed = top;
  top.close();
}

/** Takes the entries of the sheets closed in this task off the history, once, where they are still on top of it. */
function takeEntriesBack() {
  const n = Math.min(pending, entries);
  pending = 0;
  if (n === 0) return;
  if (markOf(window.history.state) !== entries) {
    // a page opened from a sheet put its own entry over the stack's: they stay where they are
    entries = 0;
    return;
  }
  entries -= n;
  ownPops++;
  window.history.go(-n);
}

/** A sheet opens: the one shown until now is hidden, kept as it is, and the new one gets a history entry. */
export function pushSheet(s: StackedSheet): void {
  if (!listening) {
    // capture on the window runs before the router's own listener there
    window.addEventListener("popstate", onPop, true);
    listening = true;
  }
  const under = stack[stack.length - 1];
  if (under?.dialog.open) under.dialog.close();
  stack.push(s);
  entries++;
  const state: unknown = window.history.state;
  window.history.pushState({ ...(state !== null && typeof state === "object" ? state : {}), [MARK]: entries }, "");
  emit();
}

/**
 * A sheet has closed (its X, Escape, its backdrop, its owner, or the Back button) or left the page: it leaves the stack and its history
 * entry goes. Where it was shown, the sheet it covered comes back, and what opened it gets the focus.
 */
export function dropSheet(s: StackedSheet): void {
  const at = stack.indexOf(s);
  if (at < 0) return;
  const shown = at === stack.length - 1;
  stack.splice(at, 1);
  if (backed === s) backed = null;
  else if (pending++ === 0) queueMicrotask(takeEntriesBack);
  if (shown) {
    const under = stack[stack.length - 1];
    if (under && !under.dialog.open) under.dialog.showModal();
    if (s.opener?.isConnected) s.opener.focus({ preventScroll: true });
  }
  emit();
}
