// The room kept at the document's foot for a sheet pinned to the window's foot (the fee page's docked toolbox, kit/toolbox.tsx), so
// nothing stays under the sheet: padding under the document and the window's scroll padding, both on the document's root; and who hears
// it change (the "back to the top" button steps aside from a pinned sheet, shell.tsx). On the root, never the body: the toolbox sets the
// room from a ResizeObserver on its sheet, and a change it made to the body's size there would reach the body's own observers only a
// frame later (Chrome reports that as a ResizeObserver loop).

const listeners = new Set<() => void>();

/** Keeps `px` of room at the document's foot, or none. */
export function setDockRoom(px: number | null): void {
  const h = px === null ? "" : `${px}px`;
  const root = document.documentElement.style;
  root.paddingBottom = h;
  root.scrollPaddingBottom = h;
  for (const on of listeners) on();
}

/** Hears the room change; returns what stops it. */
export function onDockRoom(on: () => void): () => void {
  listeners.add(on);
  return () => void listeners.delete(on);
}
