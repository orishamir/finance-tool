// What ends the hold on a toolbox card besides "ביטול" and a tap on the card again (places.ts `tapCard`): Escape anywhere, a tap
// anywhere but on a place's round "+" (`data-add-here`), a toolbox card (`data-part`, whose tap is its own: another card is tapped in
// its turn) or the line that says the card is held (`data-tool-hold`), and a drag starting, whose own "+" the places then show. Escape is
// taken before the toolbox's card sees it, so it lets the card go rather than closing the toolbox. A tap is a click, so a finger that
// scrolls the page to reach a place keeps the card held. While a card is held, Tab and Shift+Tab go round the places' "+" and "ביטול"
// only; a click on another box or button lets the card go and leaves the focus there. What a key or a click does is pure (`holdKey`,
// `holdClick`), so it is tested without a page.
import { useEffect, useRef } from "react";
import { useCarried } from "../kit";

/** The ring Tab goes round while a card is held: each place's round "+", then the hold line's "ביטול". */
export const HOLD_RING = "button[data-add-here], [data-tool-hold] button";
/** What a click may land on and keep the card held: a place's "+", a toolbox card, the hold line. */
export const KEEPS_HOLD = "[data-add-here], [data-part], [data-tool-hold]";
/** What takes the focus where a click lands: a box or a button, which keeps it as the card is let go. */
export const TAKES_FOCUS = "input, select, textarea, button, a[href], [tabindex]";

/** What a key does while a card is held: the focus to member `to` of the ring (Tab), the card let go with the focus back on it (Escape), or nothing. */
export type HoldKey = { k: "ring"; to: number } | { k: "letGo" } | null;

/**
 * Key `key` (with Shift: `back`) while a card is held, the ring `ring` members long with the focus on member `at` (-1: none of them): Tab
 * goes on round the ring, Shift+Tab back, from outside it to its first or its last; Escape lets go; any other key does nothing.
 */
export function holdKey(key: string, back: boolean, ring: number, at: number): HoldKey {
  if (key === "Escape") return { k: "letGo" };
  if (key !== "Tab" || ring === 0) return null;
  return { k: "ring", to: at < 0 ? (back ? ring - 1 : 0) : (at + (back ? -1 : 1) + ring) % ring };
}

/** What a click lands on, as far as the hold asks: whether it or something around it matches a selector. */
export interface Landed {
  closest: (selectors: string) => unknown;
}

/** What a click does while a card is held: nothing (`keep`), or the card let go, the focus back on it (`refocus`) or left where the click put it (`stay`). */
export function holdClick(at: Landed | null): "keep" | "refocus" | "stay" {
  if (at?.closest(KEEPS_HOLD)) return "keep";
  return at?.closest(TAKES_FOCUS) ? "stay" : "refocus";
}

/** While `holding`, Escape, a tap elsewhere or a drag starting calls `letGo`, with whether the focus goes back to the card; Tab goes round the places. */
export function useLetGo(holding: boolean, letGo: (refocus: boolean) => void): void {
  const hand = useRef(letGo);
  hand.current = letGo;
  // a drag starting lets the held card go, the focus left alone: the places then show the dragged card's "+"
  const carrying = useCarried() !== null;
  useEffect(() => {
    if (holding && carrying) hand.current(false);
  }, [holding, carrying]);
  useEffect(() => {
    if (!holding) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const ring = [...document.querySelectorAll<HTMLElement>(HOLD_RING)];
      const k = holdKey(e.key, e.shiftKey, ring.length, ring.indexOf(document.activeElement as HTMLElement));
      if (!k) return;
      e.preventDefault();
      if (k.k === "ring") return ring[k.to]!.focus();
      e.stopPropagation();
      hand.current(true);
    };
    const onClick = (e: MouseEvent) => {
      const at = e.target as Element | null;
      const c = holdClick(at && typeof at.closest === "function" ? at : null);
      if (c !== "keep") hand.current(c === "refocus");
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [holding]);
}
