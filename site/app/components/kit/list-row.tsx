// A compact row in a list where each item opens its whole record beside the list or on its own screen (the rules page's rules): the
// title and a short identifier at its end; under it small chips, a muted line cut to the row's width (a phone drops it) and a muted
// note of where it comes from, on one line from 768 px. The whole row is one button, at least 44 px, and the chosen row is marked by a filled background and a bar at its start edge.
// Rows of a group sit in one bordered box with hairlines between them (`RowList`), not as cards with gaps, under a `GroupHead`.
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "./cx";
import { RowArrow } from "./product-table";

/** A group's heading in a list: its name, a muted count, and a hairline from there to the end of the line, so groups read apart. */
export function GroupHead({ children, count, as: Tag = "h3", id, className }: { children: ReactNode; count?: ReactNode; as?: "h2" | "h3"; id?: string; className?: string }) {
  return (
    <Tag id={id} className={cx("flex items-center gap-2 text-sm font-medium", className)}>
      <span className="min-w-0">{children}</span>
      {count != null && (
        <bdi dir="ltr" className="shrink-0 text-[13px] font-normal tabular-nums text-muted-foreground">
          {count}
        </bdi>
      )}
      <span aria-hidden="true" className="flex-1 min-w-4 h-px bg-border" />
    </Tag>
  );
}

export function RowList({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <ul aria-label={label} className={cx("rounded-lg border border-border bg-card divide-y divide-border overflow-hidden", className)}>
      {children}
    </ul>
  );
}

export function ListRow({ title, lead, chips, meta, end, selected, dim, onSelect, rowId, controls }: { title: ReactNode; /** One muted line, cut to the row's width; left out on a phone. */ lead?: ReactNode; chips?: ReactNode; meta?: ReactNode; /** The identifier, small and muted at the end of the title's line. */ end?: ReactNode; selected?: boolean; /** Dimmed in place: it does not match what is chosen, and stays where it is. */ dim?: boolean; onSelect: () => void; /** The row's element id (a link lands on it, and focus comes back to it). */ rowId?: string; /** The id of what the row opens. */ controls?: string }) {
  return (
    <li className={cx("transition-opacity duration-[var(--duration-base)]", dim && "opacity-45")}>
      <button
        type="button"
        id={rowId}
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        aria-controls={controls}
        className={cx(
          "relative w-full min-h-target text-start px-3 py-2 lg:px-4 flex flex-col gap-1 md:gap-0.5 transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2",
          selected ? "bg-accent" : "hover:bg-accent/50",
        )}
      >
        {selected && <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px] bg-primary" />}
        <span className="flex items-baseline gap-3 min-w-0">
          <span className="flex-1 min-w-0 font-semibold leading-snug md:leading-tight [overflow-wrap:anywhere]">{title}</span>
          {end && <span className="shrink-0 text-xs text-muted-foreground">{end}</span>}
        </span>
        {(chips || lead || meta) && (
          <span className="flex flex-wrap md:flex-nowrap items-center gap-x-2 gap-y-1 min-w-0 leading-tight">
            {chips && <span className="shrink-0 flex flex-wrap items-center gap-1.5">{chips}</span>}
            {lead && <span className="max-md:hidden min-w-0 flex-1 truncate text-[13px] text-muted-foreground">{lead}</span>}
            {meta && <span className={cx("text-xs text-muted-foreground md:shrink-0 md:whitespace-nowrap", !lead && "md:ms-auto")}>{meta}</span>}
          </span>
        )}
      </button>
    </li>
  );
}

// Links and figures inside a ChooseRow lie above the row's own button, so they keep working.
const LIFT = "[&_:is(a,button,[role=button]):not([data-choose-row])]:relative [&_:is(a,button,[role=button]):not([data-choose-row])]:z-10";

/**
 * A row that chooses something on its page (a filter: the companies page's products of the company in focus) and ends in an arrow that
 * goes somewhere else (the product on the company's own page). The whole row is one toggle button stretched under it, and the figures in its
 * quiet line and the arrow lie above it, so each keeps its own tap; nothing interactive sits inside a button. The chosen row is filled with
 * the bar at its start, as `ListRow`; a dimmed row stays where it is. In a `RowList`.
 */
export function ChooseRow({ title, end, line, chosen, dim, onChoose, label, link }: { title: ReactNode; /** Short and muted at the end of the title's line (a count). */ end?: ReactNode; /** A quieter second line; it may hold figures that open their source. */ line?: ReactNode; chosen: boolean; dim?: boolean; onChoose: () => void; /** The button's spoken name. */ label: string; /** The arrow at the end: where it goes and its spoken name. */ link?: { to: string; label: string } }) {
  return (
    <li className={cx("relative flex items-stretch transition-[background-color,opacity] duration-[var(--duration-base)]", LIFT, chosen ? "bg-accent" : "hover:bg-accent/50", dim && "opacity-45")}>
      {chosen && <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px] bg-primary" />}
      <span className="flex-1 min-w-0 ps-3 pe-2 py-2 lg:ps-4 flex flex-col gap-0.5">
        <span className="flex items-baseline gap-3 min-w-0">
          <span className="flex-1 min-w-0 font-medium leading-snug">{title}</span>
          {end && <span className="shrink-0 text-sm text-muted-foreground">{end}</span>}
        </span>
        {line && <span className="text-[13px] leading-snug text-muted-foreground">{line}</span>}
      </span>
      {link && (
        <Link to={link.to} aria-label={link.label} className="shrink-0 w-11 flex items-center justify-center hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2">
          <RowArrow />
        </Link>
      )}
      <button type="button" data-choose-row aria-pressed={chosen} aria-label={label} onClick={onChoose} className="absolute inset-0 w-full cursor-pointer focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2" />
    </li>
  );
}
