// The open sheets, one shown at a time (guidelines/design.md, "A sheet"). A sheet opened while another is open (a term or a rule tapped
// inside it, a question it asks) takes its place: the one under it is hidden, kept as it was (its scroll too), and comes back when the new
// one closes, with the focus on what opened the new one.
//
// Each open sheet opened by a press holds a history entry of its own, so the phone's Back closes the top sheet rather than leaving the
// page; a sheet closed any other way takes its entry back off the history. The entries are the router's own state with a mark added (how
// many of the stack's entries were on the history with it), and the stack answers a Back only where it lands on the entry right under the
// top sheet's: the mark one less, and the router's key the one under the sheet when it opened. Any other Back (one after a page put its
// own entry over the sheets') is the router's, and the sheets close. The stack hears a popstate before the router does because it starts
// listening as this module loads, before the router hydrates (the window calls its listeners in the order they were added, capture or
// not), and it keeps the router from seeing the Back presses it answers, so nothing on the page moves or loads for them.
//
// A page that writes its address in place (`replaceAddress`) while a sheet holds an entry writes it on the sheet's entry; the stack writes
// it again on the entry under it once it steps back there. A link inside a sheet gives the sheets' entries to the page it opens
// (`leaveFromSheet`), so one Back from that page comes straight back to the page under the sheets.

/** An open sheet as the stack knows it. */
export interface StackedSheet {
  dialog: HTMLDialogElement;
  /** Closes it as its X does (its owner's `onClose`). */
  close: () => void;
  /** What had the focus, or what the sheet opened from, when it opened: it gets the focus back when the sheet closes. */
  opener: HTMLElement | null;
  /** Another sheet is about to cover it: what it must keep while hidden (its scroll) is read now. */
  onCover?: () => void;
  /** It shows again, uncovered: what it kept is put back. */
  onUncover?: () => void;
}

/** A sheet in the stack, and the history entry it holds: the router's key of the entry under it, or null where it holds none. */
interface Layer {
  sheet: StackedSheet;
  entry: { under: unknown } | null;
}

const MARK = "sheetEntry";

const layers: Layer[] = [];
const watchers = new Set<() => void>();
/** The stack's history entries still on top of the history (none once a page put its own over them). */
let entries = 0;
/** The stack's own step back, under way: the mark of the entry it lands on, and what waits for it to land. */
let own: { mark: number; after: (() => void)[] } | null = null;
/** Entries to take off at the end of this task: sheets that closed without the Back button. */
let pending = 0;
/** The sheets the Back button closed: their entries are already gone. */
const backed = new Set<StackedSheet>();
/** The address a page wrote while the stack's entries were on the history: written again on each entry the stack steps back to. */
let address: string | null = null;

const emit = () => {
  for (const w of watchers) w();
};

/** Watches the stack: what `isCovered` and `coversOther` say may have changed. */
export function watchSheets(onChange: () => void): () => void {
  watchers.add(onChange);
  return () => watchers.delete(onChange);
}

const at = (s: StackedSheet | null): number => (s === null ? -1 : layers.findIndex((l) => l.sheet === s));

/** Whether `s` is open under another sheet, hidden until that one closes. */
export const isCovered = (s: StackedSheet | null): boolean => {
  const i = at(s);
  return i >= 0 && i < layers.length - 1;
};

/** Whether `s` is open over another sheet, so its back arrow goes back to that one. */
export const coversOther = (s: StackedSheet | null): boolean => at(s) > 0;

const field = (state: unknown, name: string): unknown => (state !== null && typeof state === "object" ? (state as Record<string, unknown>)[name] : undefined);
/** How many of the stack's entries were on the history with this one: 0 for an entry of the page's own. */
const markOf = (state: unknown): number => {
  const m = field(state, MARK);
  return typeof m === "number" ? m : 0;
};

/** Runs `f` once the stack's own step back has landed, or now. */
function whenSettled(f: () => void) {
  if (own) own.after.push(f);
  else f();
}

/** The stack stepped back to an entry of its own or the page's: the address the page last wrote goes on it too. */
function landed() {
  if (address === null) return;
  window.history.replaceState(window.history.state, "", address);
  if (entries === 0) address = null;
}

/** The entry the history is on is the page's now: a sheet's mark left on it would count it as the stack's. */
function unmark() {
  const state: unknown = window.history.state;
  if (markOf(state) === 0 || state === null || typeof state !== "object") return;
  const { [MARK]: _, ...rest } = state as Record<string, unknown>;
  window.history.replaceState(rest, "");
}

/** The history moved where the stack did not expect: its entries are no longer its own, and the sheets close. */
function letGo() {
  unmark();
  entries = 0;
  address = null;
  for (const l of layers) l.entry = null;
  for (const l of [...layers].reverse()) l.sheet.close();
}

/** The phone's Back with a sheet open closes the top one; the stack's own steps back are its own; any other step is the router's. */
function onPop(e: Event) {
  const state: unknown = window.history.state;
  const mark = markOf(state);
  if (own) {
    const o = own;
    own = null;
    if (mark === o.mark) {
      e.stopImmediatePropagation();
      landed();
      for (const f of o.after) f();
      if (pending > 0) takeEntriesBack();
      return;
    }
  }
  const top = layers.findLastIndex((l) => l.entry !== null);
  if (entries === 0 || top < 0) {
    // a step onto an entry a sheet left behind (its page went on without taking it back)
    unmark();
    return;
  }
  if (mark !== entries - 1 || field(state, "key") !== layers[top]!.entry!.under) {
    letGo();
    return;
  }
  e.stopImmediatePropagation();
  entries--;
  landed();
  // the top sheet with an entry, and any opened over it without one
  for (const l of layers.slice(top).reverse()) {
    if (l.entry) backed.add(l.sheet);
    l.sheet.close();
  }
}

if (typeof window !== "undefined") window.addEventListener("popstate", onPop, true);

/** Takes the entries of the sheets closed in this task off the history, once, where they are still on top of it. */
function takeEntriesBack() {
  // the step back under way lands first; this runs again then
  if (own) return;
  const n = Math.min(pending, entries);
  pending = 0;
  if (n === 0) return;
  if (markOf(window.history.state) !== entries) {
    // a page put its own entry over the stack's: they stay where they are
    entries = 0;
    address = null;
    return;
  }
  entries -= n;
  own = { mark: entries, after: [] };
  window.history.go(-n);
}

/** A sheet opens: the one shown until now is hidden, kept as it is, and the new one gets a history entry where a press opened it. */
export function pushSheet(s: StackedSheet): void {
  const under = layers[layers.length - 1]?.sheet;
  if (under?.dialog.open) {
    under.onCover?.();
    under.dialog.close();
  }
  const layer: Layer = { sheet: s, entry: null };
  layers.push(layer);
  // a browser skips an entry pushed without a press when Back is pressed: such a sheet holds none
  const pressed = typeof navigator === "undefined" || (navigator as { userActivation?: { isActive: boolean } }).userActivation?.isActive !== false;
  if (pressed)
    whenSettled(() => {
      if (!layers.includes(layer)) return;
      const state: unknown = window.history.state;
      layer.entry = { under: field(state, "key") };
      entries++;
      window.history.pushState({ ...(state !== null && typeof state === "object" ? state : {}), [MARK]: entries }, "");
    });
  emit();
}

/**
 * A sheet has closed (its X, Escape, its backdrop, its owner, or the Back button) or left the page: it leaves the stack and its history
 * entry goes. Where it was shown, the sheet it covered comes back as it was, and what opened it gets the focus.
 */
export function dropSheet(s: StackedSheet): void {
  const i = at(s);
  if (i < 0) return;
  const [layer] = layers.splice(i, 1);
  const shown = i === layers.length;
  if (backed.delete(s)) {
    // its entry went with the Back button
  } else if (layer!.entry && pending++ === 0) queueMicrotask(takeEntriesBack);
  if (shown) {
    const under = layers[layers.length - 1]?.sheet;
    if (under && under.dialog.isConnected && !under.dialog.open) {
      under.dialog.showModal();
      under.onUncover?.();
    }
    if (s.opener?.isConnected) s.opener.focus({ preventScroll: true });
  }
  emit();
}

/**
 * Writes the page's address in place (a filter or a search kept in it), as `history.replaceState` would; with a sheet's entry on the
 * history, the stack writes it again on the entry it steps back to.
 */
export function replaceAddress(url: string): void {
  if (entries > 0 || own) address = url;
  window.history.replaceState(window.history.state, "", url);
}

/**
 * A link inside a sheet opens a page: the sheets' entries go to it. `go` navigates, replacing the entry it stands on when told to: the
 * lowest sheet's, once the entries above it are taken back; with no entry of the stack's on top of the history, it pushes a new one.
 */
export function leaveFromSheet(go: (replace: boolean) => void): void {
  if (own) {
    own.after.push(() => leaveFromSheet(go));
    return;
  }
  const n = entries;
  const ours = n > 0 && markOf(window.history.state) === n;
  entries = 0;
  address = null;
  for (const l of layers) l.entry = null;
  if (!ours) go(false);
  else if (n === 1) go(true);
  else {
    own = { mark: 1, after: [() => go(true)] };
    window.history.go(-(n - 1));
  }
}
