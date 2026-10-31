// The widths of a table's columns (founder, 2026-10-28, design-system 2.5a): every table of the site is `table-layout: fixed` with one
// of these, so no figure that changes moves a column. A width in rem for a column whose longest real content is known, "auto" for the
// columns that share the rest, "0" on a phone for a column the phone leaves out. A guard in guards.test.ts holds every <table> to it.
import type { CSSProperties } from "react";

export interface ColWidth {
  pc: string;
  /** The phone's width, when it differs from the computer's. */
  phone?: string;
}

export function TableCols({ widths }: { widths: (ColWidth | string)[] }) {
  return (
    <colgroup>
      {widths.map((c, i) => {
        const pc = typeof c === "string" ? c : c.pc;
        const phone = typeof c === "string" ? c : (c.phone ?? c.pc);
        return <col key={i} className="w-(--w-phone) md:w-(--w-pc)" style={{ "--w-pc": pc, "--w-phone": phone } as CSSProperties} />;
      })}
    </colgroup>
  );
}
