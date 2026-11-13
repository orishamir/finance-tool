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

/** Whether an element stands wholly in the room the page shows. */
export function inView(el: Element): boolean {
  const r = el.getBoundingClientRect();
  const { top, bottom } = room();
  return r.top >= top && r.bottom <= bottom;
}

/**
 * Brings an element into the room the page shows where it is not wholly in it, gliding unless the device asks for less motion: one above
 * the room comes down to just under the header; one below it comes up to just above the room's foot, or, where it is taller than the room,
 * up to just under the header, so its start is read first.
 */
export function bringIntoView(el: Element | null | undefined) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const { top, bottom } = room();
  const fits = r.height <= bottom - top - 2 * GAP;
  const by = r.top < top ? r.top - top - GAP : r.bottom > bottom ? (fits ? r.bottom - bottom + GAP : r.top - top - GAP) : 0;
  if (Math.abs(by) < 1) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollBy({ top: by, behavior: still ? "auto" : "smooth" });
}
