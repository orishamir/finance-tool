// A tag a source stands behind: a short fact about a company in its own words, which changes no figure ("בטלפון בלבד"
// beside a house that sells a kind of fund only by phone). A tap opens its source in the sheet every value opens, so nothing hangs on
// hover; the 44 px target lies around the tag (tap-area) without making its line taller. Drawn as a label chip (an icon and the words, in
// the trade family's colour), so it reads as one of the labels beside it; the word carries the sourced underline, the site's sign that a
// tap shows where it comes from.
import { Phone } from "lucide-react";
import { numbers } from "../../copy";
import type { SiteValue } from "../../lib/value";
import { useOpen, valueItem } from "../provenance";
import { cx } from "./cx";
import { chipShape, familyClass } from "./label-chip";

export function SourcedTag({ value, children, className }: { /** The fact as a sourced text value: its source, `about` for the sheet's head line, `lead` for what it means. */ value: SiteValue; /** The tag's word, also the sheet's head. */ children: string; className?: string }) {
  const open = useOpen();
  return (
    <button
      type="button"
      aria-label={[children, numbers.legend.sourced, numbers.details].join(", ")}
      onClick={(e) => open(valueItem(value, children, false), e.currentTarget)}
      className={cx(
        chipShape,
        familyClass.trade,
        "tap-area w-fit align-middle hover:brightness-110 focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
    >
      <Phone size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0" />
      <span className="underline decoration-sourced underline-offset-[3px]">{children}</span>
    </button>
  );
}
