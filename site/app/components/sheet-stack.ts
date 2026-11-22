// The open sheets, one shown at a time (guidelines/design.md, "A sheet"). A sheet opened while another is open (a term or a rule tapped
// inside it, a question it asks) takes its place: the one under it is closed as a dialog, so the browser's close request (Escape, the
// phone's Back) goes to the top sheet only, and it is kept as it was (its scroll too) until the top one closes. It then comes back as a
// modal dialog, with the focus on what opened the top one.

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

const layers: StackedSheet[] = [];
const watchers = new Set<() => void>();

const emit = () => {
  for (const w of watchers) w();
};

/** Watches the stack: what `isCovered` and `coversOther` say may have changed. */
export function watchSheets(onChange: () => void): () => void {
  watchers.add(onChange);
  return () => watchers.delete(onChange);
}

/** Whether a sheet is open, shown or covered. */
export const anySheet = (): boolean => layers.length > 0;

const at = (s: StackedSheet | null): number => (s === null ? -1 : layers.indexOf(s));

/** Whether `s` is open under another sheet, hidden until that one closes. */
export const isCovered = (s: StackedSheet | null): boolean => {
  const i = at(s);
  return i >= 0 && i < layers.length - 1;
};

/** Whether `s` is open over another sheet, so its back arrow goes back to that one. */
export const coversOther = (s: StackedSheet | null): boolean => at(s) > 0;

/** A sheet opens: the one shown until now is read for what it keeps and closed as a dialog, so it gets no close request while covered. */
export function pushSheet(s: StackedSheet): void {
  const under = layers.at(-1);
  if (under?.dialog.open) {
    under.onCover?.();
    under.dialog.close();
  }
  layers.push(s);
  emit();
}

/**
 * A close request reached `s` while it is already leaving (a second Escape or Back during its closing animation): it is meant for the sheet
 * under it, which closes too.
 */
export function closeUnder(s: StackedSheet): void {
  const i = at(s);
  if (i > 0) layers[i - 1]?.close();
}

/**
 * A sheet has closed (its X, Escape or the phone's Back, its backdrop, its owner) or left the page: it leaves the stack. Where it was
 * shown, the sheet it covered comes back as it was, and what opened it gets the focus. Where it was covered, the sheet over it takes its
 * opener in place of one inside it.
 */
export function dropSheet(s: StackedSheet): void {
  const i = at(s);
  if (i < 0) return;
  layers.splice(i, 1);
  const above = layers[i];
  if (above) {
    if (above.opener && s.dialog.contains(above.opener)) above.opener = s.opener;
  } else {
    const under = layers.at(-1);
    if (under && under.dialog.isConnected && !under.dialog.open) {
      under.dialog.showModal();
      under.onUncover?.();
    }
    if (s.opener?.isConnected) s.opener.focus({ preventScroll: true });
  }
  emit();
}
