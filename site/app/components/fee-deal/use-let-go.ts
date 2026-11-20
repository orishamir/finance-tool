// What ends the hold on a toolbox card besides "ביטול" and a tap on the card again (places.ts `tapCard`): Escape anywhere, and a tap
// anywhere but on a place's round "+" (`data-add-here`), a toolbox card (`data-part`, whose tap is its own: another card is tapped in
// its turn) or the line that says the card is held (`data-tool-hold`). Escape is taken before the toolbox's card sees it, so it lets the
// card go rather than closing the toolbox. A tap is a click, so a finger that scrolls the page to reach a place keeps the card held.
// While a card is held, Tab and Shift+Tab go round the places' "+" and "ביטול" only; a click on another box or button lets the card go
// and leaves the focus there.
import { useEffect, useRef } from "react";

/** While `holding`, Escape or a tap elsewhere calls `letGo`, with whether the focus goes back to the card; Tab goes round the places. */
export function useLetGo(holding: boolean, letGo: (refocus: boolean) => void): void {
  const hand = useRef(letGo);
  hand.current = letGo;
  useEffect(() => {
    if (!holding) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      // Tab and Shift+Tab go round the "+" of each place and the hold line's "ביטול", the earliest price first, so the keyboard reaches
      // the places without walking the rest of the page
      if (e.key === "Tab") {
        const ring = [...document.querySelectorAll<HTMLElement>("button[data-add-here], [data-tool-hold] button")];
        if (!ring.length) return;
        e.preventDefault();
        const at = ring.indexOf(document.activeElement as HTMLElement);
        const next = at < 0 ? (e.shiftKey ? ring.length - 1 : 0) : (at + (e.shiftKey ? -1 : 1) + ring.length) % ring.length;
        ring[next]!.focus();
        return;
      }
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      hand.current(true);
    };
    const onClick = (e: MouseEvent) => {
      const at = e.target as Element | null;
      if (at?.closest?.("[data-add-here], [data-part], [data-tool-hold]")) return;
      // a click on a box or a button elsewhere lets go and leaves the focus where the click put it, so one tap does both
      hand.current(!at?.closest?.("input, select, textarea, button, a[href], [tabindex]"));
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [holding]);
}
