// A list of products of one kind (founder, 2026-10-27, design-system 11 "Lists of products"): one table on a desktop, one row per
// product on a phone, never a stack of cards. The company page's tracks and a brand's funds are built on it. A group of rows can
// carry a caution banner (tracks that share a name). The cells and the phone rows are the caller's; the shell, the banner and the
// widths are here.
import { Fragment, useId, type ReactNode } from "react";
import { IconAlert } from "../icons";
import { Card } from "./card";
import { cx } from "./cx";

export interface ProductColumn {
  id: string;
  head: ReactNode;
  /** As wide as its content (a number, a link, figures); the columns without it share the rest. */
  fit?: boolean;
  headClassName?: string;
  cellClassName?: string;
}

export interface ProductRow {
  key: string;
  /** One cell per column, in the columns' order. */
  cells: ReactNode[];
  /** The phone's row: a `ProductPhoneRow`. */
  phone: ReactNode;
}

export interface ProductGroup {
  key: string;
  rows: ProductRow[];
  /** A caution line over rows that belong together, with the alert icon (tracks that share a name). */
  banner?: ReactNode;
}

export function ProductTable({ columns, groups, foot }: { columns: ProductColumn[]; groups: ProductGroup[]; foot?: (place: "phone" | "table") => ReactNode }) {
  const bannerId = useId();
  return (
    <>
      <Card className="md:hidden p-0 md:p-0 overflow-hidden flex flex-col">
        {groups.map((g) =>
          g.banner ? (
            <div key={g.key} role="group" aria-labelledby={`${bannerId}-${g.key}`} className="dup">
              <div id={`${bannerId}-${g.key}`} className="dup-banner">
                <IconAlert size={16} className="text-caution shrink-0" />
                {g.banner}
              </div>
              {g.rows.map((r) => (
                <Fragment key={r.key}>{r.phone}</Fragment>
              ))}
            </div>
          ) : (
            g.rows.map((r) => <Fragment key={r.key}>{r.phone}</Fragment>)
          ),
        )}
        {foot?.("phone")}
      </Card>
      <Card className="hidden md:block p-0 md:p-0 overflow-x-auto overflow-y-hidden">
        <table className="tbl">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.id} scope="col" className={cx(c.fit && "w-px", c.headClassName)}>
                  {c.head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.flatMap((g) => [
              ...(g.banner
                ? [
                    <tr key={`${g.key}-banner`} className="dup-row">
                      <td colSpan={columns.length} className="!pb-1 !border-b-0 border-s-[3px] border-s-caution">
                        <span className="dup-banner !p-0">
                          <IconAlert size={16} className="text-caution shrink-0" />
                          {g.banner}
                        </span>
                      </td>
                    </tr>,
                  ]
                : []),
              ...g.rows.map((r) => (
                <tr key={r.key} className={cx(g.banner ? "dup-row" : null)}>
                  {r.cells.map((cell, i) => (
                    <td key={columns[i]?.id ?? i} className={cx(i === 0 && g.banner ? "border-s-[3px] border-s-caution" : null, columns[i]?.fit && "whitespace-nowrap", columns[i]?.cellClassName)}>
                      {cell}
                    </td>
                  ))}
                </tr>
              )),
            ])}
          </tbody>
        </table>
        {foot?.("table")}
      </Card>
    </>
  );
}

/** One product on a phone: a row of the list card. `stacked` when lines (fees, figures, labels) sit under the name. */
export function ProductPhoneRow({ stacked, className, children }: { stacked?: boolean; className?: string; children: ReactNode }) {
  return <div className={cx("track", stacked && "!flex-col !items-stretch !gap-1", className)}>{children}</div>;
}
