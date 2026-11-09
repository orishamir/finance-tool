// The widths of a table's columns (design-system 2.5a): every table of the site is `table-layout: fixed` with one
// of these, so no figure that changes moves a column. A width in rem for a column whose longest real content is known, "auto" for the
// columns that share the rest, "0" on a phone for a column the phone leaves out. A guard in guards.test.ts holds every <table> to it.
// A column left out on a phone leaves the table's grid, its <col> with its cells (`PHONE_GONE` on each): a <col> kept at width 0 while
// its cells were hidden took the next cell into it, and on the indices page two figures of the hedge table were drawn over each other
// (390 px; the rules page's documents table had the same fault, hidden by the empty column beside it).
import type { CSSProperties } from "react";

export interface ColWidth {
  pc: string;
  /** The phone's width, when it differs from the computer's. */
  phone?: string;
}

/** The class of a cell (th or td) of a column whose phone width is "0". */
export const PHONE_GONE = "max-md:hidden";

export function TableCols({ widths }: { widths: (ColWidth | string)[] }) {
  return (
    <colgroup>
      {widths.map((c, i) => {
        const pc = typeof c === "string" ? c : c.pc;
        const phone = typeof c === "string" ? c : (c.phone ?? c.pc);
        return <col key={i} className={phone === "0" ? "max-md:hidden md:w-(--w-pc)" : "w-(--w-phone) md:w-(--w-pc)"} style={{ "--w-pc": pc, "--w-phone": phone } as CSSProperties} />;
      })}
    </colgroup>
  );
}
