// A compact row in a list where each item opens its whole record beside the list or on its own screen (the rules page's rules): the
// title and a short identifier at its end; under it small chips, a muted line cut to the row's width (a phone drops it) and a muted
// note of where it comes from, on one line from 768 px. The whole row is one button, at least 44 px, and the chosen row is marked by a filled background and a bar at its start edge.
// Rows of a group sit in one bordered box with hairlines between them (`RowList`), not as cards with gaps, under a `GroupHead`.
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cx } from "./cx";
import { RowArrow } from "./product-table";

/** A group's heading in a list: its name, a muted count, and a hairline from there to the end of the line, so groups read apart. */
export function GroupHead({ children, count, as: Tag = "h3", id, className, plain, nowrap }: { children: ReactNode; count?: ReactNode; as?: "h2" | "h3"; id?: string; className?: string; /** A small muted label alone, with no count and no hairline: over rows that stand between rules (`RowList plain`). */ plain?: boolean; /** A short name in a narrow column (the companies page's groups): the name never breaks; the hairline gives way first, then the count moves under it. */ nowrap?: boolean }) {
  if (plain)
    return (
      <Tag id={id} className={cx("text-sm font-normal text-muted-foreground", className)}>
        {children}
      </Tag>
    );
  return (
    <Tag id={id} className={cx("flex items-center gap-2 text-sm font-medium", nowrap && "flex-wrap", className)}>
      <span className={nowrap ? "shrink-0 whitespace-nowrap" : "min-w-0"}>{children}</span>
      {count != null && (
        <bdi dir="ltr" className="shrink-0 text-[13px] font-normal tabular-nums text-muted-foreground">
          {count}
        </bdi>
      )}
      <span aria-hidden="true" className={cx("flex-1 h-px bg-border", nowrap ? "min-w-0" : "min-w-4")} />
    </Tag>
  );
}

/** The chosen row's look, shared by every list of rows that marks one (`ListRow`, `ChooseRow`, `SideNav`): a filled background; the others light on hover. */
export const rowLook = (selected: boolean | undefined): string => cx("transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2", selected ? "bg-accent" : "hover:bg-accent/50");

/** The bar at the chosen row's start edge. */
export function RowMark() {
  return <span aria-hidden="true" className="absolute inset-y-0 start-0 w-[3px] bg-primary" />;
}

export function RowList({ children, className, label, plain }: { children: ReactNode; className?: string; label?: string; /** No box: the rows stand between hairlines, one over the first and one under the last (a company page's lists). */ plain?: boolean }) {
  return (
    <ul aria-label={label} className={cx(plain ? "border-y border-border divide-y divide-border" : "rounded-lg border border-border bg-card divide-y divide-border overflow-hidden", className)}>
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
        className={cx("relative w-full min-h-target text-start px-3 py-2 lg:px-4 flex flex-col gap-1 md:gap-0.5", rowLook(selected))}
      >
        {selected && <RowMark />}
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
      {chosen && <RowMark />}
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

/**
 * A row that opens a part of the page or another page (a bank's overview of its products, the designer's mocks): its name, a muted count,
 * one headline fact under a small label ("ריבית בשנה, מיום עד שנה" over "0.02% עד 2.05%"), a muted date and an arrow, in columns from
 * 768 px and one under the other on a phone. Figures that open their source lie above the row's link and keep their own tap. The whole
 * row is one link stretched under it. In a `RowList` (`plain`, between hairlines).
 */
export function OpenRow({ title, end, fact, date, to, label }: { title: ReactNode; /** Beside the name (a count). */ end?: ReactNode; /** The headline fact: a small muted label over its value (or over words, the parts of a product). */ fact?: { label: ReactNode; value: ReactNode; /** Words rather than a figure: said at the body's size, not large. */ words?: boolean }; /** Muted (an as-of date). */ date?: ReactNode; to: string; /** The link's spoken name. */ label: string }) {
  return (
    <li className={cx("relative flex items-stretch", LIFT, rowLook(false))}>
      <span className="flex-1 min-w-0 ps-1 pe-2 py-4 flex flex-col gap-1.5 md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,2.2fr)_minmax(9rem,1fr)] md:items-center md:gap-x-6">
        <span className="flex flex-wrap items-baseline gap-x-3 md:contents">
          <span className="text-lg font-semibold leading-snug">{title}</span>
          <span className="text-muted-foreground md:text-foreground">{end}</span>
        </span>
        <span className="flex flex-col gap-0.5 min-w-0">
          {fact && (
            <>
              <span className="text-xs text-muted-foreground">{fact.label}</span>
              <span className={cx("leading-snug", fact.words ? "text-base" : "text-lg font-semibold")}>{fact.value}</span>
            </>
          )}
        </span>
        <span className="text-sm text-muted-foreground">{date}</span>
      </span>
      <span aria-hidden="true" className="shrink-0 w-11 flex items-center justify-center">
        <RowArrow />
      </span>
      <Link to={to} preventScrollReset aria-label={label} data-choose-row className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-ring focus-visible:-outline-offset-2" />
    </li>
  );
}
