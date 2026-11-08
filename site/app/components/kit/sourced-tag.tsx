// A tag a source stands behind (2026-11-08): a short fact about a company in its own words, which changes no figure ("בטלפון בלבד"
// beside a house that sells a kind of fund only by phone). A tap opens its source in the sheet every value opens, so nothing hangs on
// hover; the 44 px target lies around the tag (tap-area) without making its line taller. The word carries the sourced underline, the
// site's sign that a tap shows where it comes from.
import { numbers } from "../../copy";
import type { SiteValue } from "../../lib/value";
import { useOpen, valueItem } from "../provenance";
import { cx } from "./cx";

export function SourcedTag({ value, children, className }: { /** The fact as a sourced text value: its source, `about` for the sheet's head line, `lead` for what it means. */ value: SiteValue; /** The tag's word, also the sheet's head. */ children: string; className?: string }) {
  const open = useOpen();
  return (
    <button
      type="button"
      aria-label={[children, numbers.legend.sourced, numbers.details].join(", ")}
      onClick={(e) => open(valueItem(value, children, false), e.currentTarget)}
      className={cx(
        "tap-area inline-flex w-fit items-center whitespace-nowrap rounded-sm bg-muted px-1.5 py-px align-middle text-xs font-medium text-foreground",
        "underline decoration-sourced underline-offset-[3px] hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring transition-colors duration-[var(--duration-fast)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
