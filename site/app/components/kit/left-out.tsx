// What a house's documents hold that its price leaves out (D106, lib/left-out): a line under the house's price whose words open the sheet
// (each thing that can change what some reader pays, its reason and the price list at its page; then the rest by name), and a quiet mark
// beside an account's name in a list, which opens the same sheet, so the reader sees it before choosing. Nothing on hover alone.
import { leftOut as c } from "../../copy";
import type { LeftOutView } from "../../lib/left-out";
import { IconFile } from "../icons";
import { Term } from "../provenance";
import { cx } from "./cx";

/** "לא נכלל במחיר: 2 דברים שיכולים לשנות אותו" (or, where the record marks nothing so, "7 דברים מהמסמכים"); null with nothing left out. */
export function LeftOutLine({ view, house, named = false, className }: { view: LeftOutView | null; house: string; /** The lead names the house, where the prices above it are not one house's alone (the fees page). */ named?: boolean; className?: string }) {
  if (!view) return null;
  return (
    // the words wrap as the line does: a term keeps itself on one line elsewhere
    <p className={cx("text-xs text-muted-foreground [&_.term]:whitespace-normal", className)} data-left-out={view.warn}>
      {named ? c.leadOf(house) : c.lead}{" "}
      <Term id={[]} name={c.title(house)} lead={view.lead} parts={view.parts}>
        {view.warn > 0 ? c.canChange(view.warn) : c.some(view.other)}
      </Term>
    </p>
  );
}

/** The mark beside an account's name: only where something left out can change what some reader pays; a tap opens the line's sheet. */
export function LeftOutMark({ view, house }: { view: LeftOutView | null; house: string }) {
  if (!view || view.warn === 0) return null;
  return (
    // the icon is 14 px: the padding (cancelled by the margins) makes the touch area 44 px wide, the term's own area 44 px tall
    <Term id={[]} name={c.title(house)} lead={view.lead} parts={view.parts} className="-mx-[11px] inline-flex px-[15px] text-muted-foreground no-underline">
      <IconFile size={14} />
      <span className="sr-only">{c.mark}</span>
    </Term>
  );
}
