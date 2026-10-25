// Folds (design-system 3.9). Native details/summary, so they work before the scripts; the label and the chevron follow the fold's own
// open state, kept in React. The earlier CSS `group-open:` variant matched any open ancestor, so a fold inside an open fold read as
// open while closed (2026-10-25); no fold in the site may use it (a test guards that).
import { useState, type ReactNode, type Ref } from "react";
import { IconChevronDown } from "../icons";
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
          <IconChevronDown className={cx("text-muted-foreground shrink-0 transition-transform duration-[var(--duration-fast)]", open && "rotate-180")} />
        </summary>
      )}
      {children}
    </details>
  );
}

function LabelAs({ as: H, className, children }: { as: "h2" | "h3" | "h4"; className?: string; children: ReactNode }) {
  return <H className={className}>{children}</H>;
}

/** A group header inside a coverage list: a heading with its count and a chevron; the rows are the children. */
export function FoldGroup({ title, count, level = 3, defaultOpen, children, className }: { title: ReactNode; count?: number; level?: 3 | 4; defaultOpen?: boolean; children: ReactNode; className?: string }) {
  return (
    <Disclosure
      className={className}
      defaultOpen={defaultOpen}
      as={level === 3 ? "h3" : "h4"}
      labelClassName="font-medium"
      label={
        <>
          {title}
          {count !== undefined && (
            <>
              {" "}
              <span className="text-muted-foreground font-normal">
                (<bdi dir="ltr">{count}</bdi>)
              </span>
            </>
          )}
        </>
      }
    >
      {children}
    </Disclosure>
  );
}

/**
 * The coverage card: a lead sentence (the counts), a "show / hide the list" line with a chevron, and the list under a rule. Used where
 * every option must be accounted for once (compare, idle cash, the workbenches, the exposure page).
 */
export function CoverageFold({ lead, openLabel, closeLabel, children, defaultOpen, pad = "default", bodyPad = "default", bodyClassName, className }: { lead: ReactNode; openLabel: ReactNode; closeLabel: ReactNode; children: ReactNode; defaultOpen?: boolean; /** `default` p-4 md:p-6, `snug` p-4 md:p-5. */ pad?: "default" | "snug"; /** Space between the rule and the list: `default` 16 px, `snug` 12 px. */ bodyPad?: "default" | "snug"; bodyClassName?: string; className?: string }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <details className={cx("bg-card border border-border rounded-lg", pad === "snug" ? "p-4 md:p-5" : "p-4 md:p-6", className)} open={open} onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className={cx("flex items-start", SUMMARY_BASE)}>
        <span className="flex flex-col gap-1">
          <span>{lead}</span>
          <span className="text-sm text-link flex items-center gap-1 min-h-9">
            {open ? closeLabel : openLabel}
            <IconChevronDown size={16} className={cx("transition-transform duration-[var(--duration-fast)]", open && "rotate-180")} />
          </span>
        </span>
      </summary>
      <div className={cx("mt-4 border-t border-border", bodyPad === "snug" ? "pt-3" : "pt-4", bodyClassName)}>{children}</div>
    </details>
  );
}
