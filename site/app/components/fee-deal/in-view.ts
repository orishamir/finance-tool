// Bringing a part of the fee page into the room the reader sees: under the site's sticky header and, on a phone, above the toolbox sheet
// pinned to the foot of the screen, so a case just opened, a box that just took the focus or an undo line that just appeared is never
// under either.

/** Room kept between what is brought into view and the room's edges, in pixels. */
const GAP = 8;

/** The part of the window the page shows: from under the sticky header to above the pinned toolbox sheet, where one is pinned. */
function room(): { top: number; bottom: number } {
  const header = document.querySelector("[data-site-header]") ?? document.querySelector("header");
  const sheet = document.querySelector("[data-tool-sheet][data-docked]");
  return { top: Math.max(0, header?.getBoundingClientRect().bottom ?? 0), bottom: sheet ? sheet.getBoundingClientRect().top : window.innerHeight };
}

/**
 * Brings an element into the room the page shows where it is not wholly in it, gliding unless the device asks for less motion: one above
 * the room comes down to just under the header; one below it comes up to just above the room's foot, or, where it is taller than the room,
 * up to just under the header, so its start is read first. With `keep`, what was pressed to bring it (a table's cell that opened a case
 * under the table), the page stays where it is while the element's start already shows (its top in the room and its first field wholly
 * in it, or its first line where it has none), so a press never moves what it pressed to show what is already in sight; and it never
 * scrolls so far that `keep` leaves the room.
 */
export function bringIntoView(el: Element | null | undefined, keep?: Element | null) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const { top, bottom } = room();
  if (keep && startShows(el, r, top, bottom)) return;
  const fits = r.height <= bottom - top - 2 * GAP;
  let by = r.top < top ? r.top - top - GAP : r.bottom > bottom ? (fits ? r.bottom - bottom + GAP : r.top - top - GAP) : 0;
  // `keep`: what was pressed to bring it (a table's cell that opened a case under the table) stays in the room, its top under the header
  if (keep && by > 0) by = Math.min(by, Math.max(0, keep.getBoundingClientRect().top - top - GAP));
  if (Math.abs(by) < 1) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollBy({ top: by, behavior: still ? "auto" : "smooth" });
}

/** The height of an element's first line, where it has no field to read its start by, in pixels. */
const FIRST_LINE = 48;

/** Whether an element's start shows in the room: its top in it, and its first field (or, without one, its first line) wholly in it. */
function startShows(el: Element, r: DOMRect, top: number, bottom: number): boolean {
  if (r.top < top) return false;
  const first = el.querySelector("input, select, textarea")?.getBoundingClientRect();
  return (first ? first.bottom : Math.min(r.bottom, r.top + FIRST_LINE)) <= bottom;
}
