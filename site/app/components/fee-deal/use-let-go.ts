// What ends the hold on a toolbox card besides "ביטול" and a tap on the card again (places.ts `tapCard`): Escape anywhere, and a tap
// anywhere but on a place's round "+" (`data-add-here`), a toolbox card (`data-part`, whose tap is its own: another card is tapped in
// its turn) or the line that says the card is held (`data-tool-hold`). Escape is taken before the toolbox's card sees it, so it lets the
// card go rather than closing the toolbox. A tap is a click, so a finger that scrolls the page to reach a place keeps the card held.
import { useEffect, useRef } from "react";

/** While `holding`, Escape or a tap elsewhere calls `letGo`. */
export function useLetGo(holding: boolean, letGo: () => void): void {
  const hand = useRef(letGo);
  hand.current = letGo;
  useEffect(() => {
    if (!holding) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      e.preventDefault();
      e.stopPropagation();
      hand.current();
    };
    const onClick = (e: MouseEvent) => {
      const at = e.target as Element | null;
      if (at?.closest?.("[data-add-here], [data-part], [data-tool-hold]")) return;
      hand.current();
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("click", onClick, true);
    };
  }, [holding]);
}
