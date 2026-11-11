// A small raised tile of facts about one thing (the index page's chosen pair: the account, the fund): a heading line with a link at its
// end, a name, then key and value rows at 13 px, its start edge in the colour of what the thing charges, so the tile reads with the
// receipt's line of the same colour. Two tiles side by side are joined by `TileJoin`, a round "+" on the seam.
import type { ReactNode } from "react";
import { cx } from "./cx";

export function FactTile({ edge, head, link, name, children, foot, className }: {
  /** The start edge's colour, a `border-` class (`border-chart-by-account`). */
  edge: string;
  head: ReactNode;
  /** At the heading line's end (the price list, the fund's document). */
  link?: ReactNode;
  name: ReactNode;
  /** The facts: `KeyValue`s (size `xs`), with a hairline between them. */
  children?: ReactNode;
  /** Under the facts: a line that is not a fact (a note, a link to act on). */
  foot?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cx("flex min-w-0 flex-col gap-2 rounded-lg border-s-[3px] bg-muted p-4", edge, className)}>
      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span>{head}</span>
        {link}
      </div>
      <div className="text-base font-semibold">{name}</div>
      {children && <dl className="flex flex-col divide-y divide-border [&>div]:py-1.5">{children}</dl>}
      {foot && <div className="flex flex-col items-start gap-1.5">{foot}</div>}
    </section>
  );
}

/** The "+" between two tiles: a round mark on their seam, under the first on a phone, between them where they stand side by side. */
export function TileJoin() {
  return (
    <span aria-hidden="true" className="z-[1] mx-auto -my-3 grid size-7 shrink-0 place-items-center self-center rounded-full border border-border bg-card text-base text-muted-foreground">
      +
    </span>
  );
}
