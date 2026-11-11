// Folds (design-system 3.9). Native details/summary, so they work before the scripts; the label and the chevron follow the fold's own
// open state, kept in React. The earlier CSS `group-open:` variant matched any open ancestor, so a fold inside an open fold read as
// open while closed; no fold in the site may use it (a test guards that).
import { useState, type ReactNode, type Ref } from "react";
import { IconChevronDown } from "../icons";
import { fmt } from "../../lib/format";
import { cx } from "./cx";

const SUMMARY_BASE = "cursor-pointer list-none [&::-webkit-details-marker]:hidden";

export interface DisclosureProps {
  /** What the closed fold says (a text, or a heading when `as` is set). */
  label: ReactNode;
  /** What the open fold says instead; the closed label by default. */
  openLabel?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Starts open. Read once; to re-open when something changes, give the fold a `key`. */
  defaultOpen?: boolean;
  /** Controlled: the parent owns the state (a hash link opens a group). Pair with `onOpenChange`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The anchor of an in-page link; add the scroll margin with `className`. */
  id?: string;
  /** Chevron at the far end of the row (a list-group header); the default keeps it beside the label. */
  spread?: boolean;
  /** Height of the summary: 44 px (`target`, the default) or 48 px (`field`, a group header). */
  size?: "target" | "field";
  /** Render the label as this element instead of a span, so a group's heading is a heading. */
  as?: "h2" | "h3" | "h4";
  /** Classes of the label element (with `as`). */
  labelClassName?: string;
  summaryClassName?: string;
  /** A footnote fold: the native marker, no chevron, no minimum height. */
  plain?: boolean;
  detailsRef?: Ref<HTMLDetailsElement>;
}

/** A fold. The default for anything the reader may open: a table, a longer note, a list group. */
export function Disclosure({ label, openLabel, children, className, defaultOpen, open: controlled, onOpenChange, id, spread, size = "target", as, labelClassName, summaryClassName, plain, detailsRef }: DisclosureProps) {
  const [inner, setInner] = useState(!!defaultOpen);
  const open = controlled ?? inner;
  const shown = open ? (openLabel ?? label) : label;
  return (
    <details
      ref={detailsRef}
      id={id}
      className={className}
      open={open}
      onToggle={(e) => {
        const next = e.currentTarget.open;
        if (controlled === undefined) setInner(next);
        onOpenChange?.(next);
      }}
    >
      {plain ? (
        <summary className={cx("cursor-pointer", summaryClassName)}>{shown}</summary>
      ) : (
        <summary className={cx("flex items-center", spread ? "justify-between gap-3" : "gap-2", size === "field" ? "min-h-12" : "min-h-target", SUMMARY_BASE, "select-none rounded-md", summaryClassName)}>
          {as ? <LabelAs as={as} className={labelClassName}>{shown}</LabelAs> : <span className={labelClassName}>{shown}</span>}
          <IconChevronDown className={cx("text-muted-foreground shrink-0 transition-transform duration-[var(--duration-fold)] ease-standard", open && "rotate-180")} />
        </summary>
      )}
      {children}
    </details>
  );
}

function LabelAs({ as: H, className, children }: { as: "h2" | "h3" | "h4"; className?: string; children: ReactNode }) {
  return <H className={className}>{children}</H>;
}

export interface FoldGroupProps {
  title: ReactNode;
  /** The number of rows or cards in the group, after the title. */
  count?: number;
  /** The heading's level: 2 for a page's own topics under its title (the documents page's kinds of document), 3 by default. */
  level?: 2 | 3 | 4;
  /** Starts open (uncontrolled). */
  defaultOpen?: boolean;
  /** Controlled: the parent owns the state (an address names a card inside, a filter opens the group). Pair with `onOpenChange`. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The anchor of an in-page link; add the scroll margin with `className`. */
  id?: string;
  /**
   * `list` (the default): a group inside a coverage list, a medium heading with "(3)". `section`: a topic of cards on a page (the
   * rules page's groups, a company's terms), a larger heading with "· 3", the chevron at the far end of a 48 px row.
   */
  variant?: "list" | "section";
  children: ReactNode;
  className?: string;
}

/** A group header with its count and a chevron; the rows (or cards) are the children. */
export function FoldGroup({ title, count, level = 3, defaultOpen, open, onOpenChange, id, variant = "list", children, className }: FoldGroupProps) {
  const section = variant === "section";
  const counted =
    count === undefined ? null : section ? (
      <span className="text-sm font-normal text-muted-foreground">
        · <bdi dir="ltr" className="tabular-nums">{fmt.number(count)}</bdi>
      </span>
    ) : (
      <>
        {" "}
        <span className="text-muted-foreground font-normal">
          (<bdi dir="ltr">{count}</bdi>)
        </span>
      </>
    );
  return (
    <Disclosure
      id={id}
      className={cx(section && "flex flex-col", className)}
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      as={level === 2 ? "h2" : level === 3 ? "h3" : "h4"}
      spread={section}
      size={section ? "field" : "target"}
      labelClassName={section ? "text-lg font-semibold flex flex-wrap items-baseline gap-x-2" : "font-medium"}
      label={
        <>
          {title}
          {counted}
        </>
      }
    >
      {children}
    </Disclosure>
  );
}
