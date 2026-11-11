// A receipt (the index page's): a sheet of paper with a torn bottom edge, lines of a name and an amount joined by a dotted leader, a line's
// parts indented under it behind a thin edge in its colour, and rules between the blocks: a double one before the total, a dashed one
// before what follows from it. The amounts and their marks are the caller's; the receipt lays them out so they read down one edge.
import type { ReactNode } from "react";
import { cx } from "./cx";

export function ReceiptPaper({ children, className, label }: { children: ReactNode; className?: string; /** The paper's spoken name, for a region. */ label?: string }) {
  return (
    // the shadow sits on a wrapper: the torn edge's mask would clip the paper's own
    <div className={cx("drop-shadow-md", className)}>
      <section aria-label={label} className="receipt-edge flex flex-col gap-3 rounded-t-lg bg-popover px-5 pt-5 text-popover-foreground">
        {children}
      </section>
    </div>
  );
}

/**
 * One line: a colour mark (`swatch`, a `bg-` class) when the line is a part of a bar under it, the name, a dotted leader, the amount.
 * `sub`: under the line, quieter (a rate in words, a fund's fees). `parts`: the line's own lines, indented behind an edge in `edge`'s colour.
 */
export function ReceiptLine({ label, value, swatch, sub, parts, edge, size = "base", strong = false }: {
  label: ReactNode;
  value: ReactNode;
  swatch?: string;
  sub?: ReactNode;
  parts?: ReactNode;
  /** The indented parts' edge colour, a `border-` class. */
  edge?: string;
  /** `base` (16 px) for a line of the receipt, `sm` (14 px) for a part of one. */
  size?: "base" | "sm";
  strong?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className={cx("flex items-baseline gap-2", size === "sm" ? "text-sm" : "text-base", strong && "font-semibold")}>
        {swatch && <span aria-hidden="true" className={cx("inline-block size-2.5 shrink-0 self-center rounded-[2px]", swatch)} />}
        <span className="min-w-0">{label}</span>
        <span aria-hidden="true" className="min-w-4 flex-1 border-b border-dotted border-muted-foreground/50" />
        <span className="shrink-0 tabular-nums whitespace-nowrap">{value}</span>
      </div>
      {sub && <div className={cx("text-xs text-muted-foreground", swatch && "ps-[1.125rem]")}>{sub}</div>}
      {parts && <div className={cx("ms-1 mt-1 flex flex-col gap-2 border-s-2 ps-3", edge ?? "border-border")}>{parts}</div>}
    </div>
  );
}

export function ReceiptRule({ kind }: { kind: "double" | "dashed" }) {
  return <hr aria-hidden="true" className={cx("border-0", kind === "double" ? "h-[5px] border-y border-muted-foreground/60" : "border-t border-dashed border-muted-foreground/50")} />;
}
