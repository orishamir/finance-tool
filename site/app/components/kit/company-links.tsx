// A lead and the companies it is about, each a link to its page (D30, 2026-10-26): "תלוי בחברה: הראל, אלטשולר שחם" where a property
// is each company's own, "לכל מה שמצאנו אצל: …" under a company's term. Inline, so it can close a sentence or stand as its own line.
import { Link } from "react-router";
import { cx } from "./cx";

export interface CompanyLinkItem {
  /** The company's Hebrew name. */
  name: string;
  /** Its page, or its group on /companies. */
  href: string;
}

/**
 * The lead, a colon, then the companies as links separated by commas. `size` picks the text size of the surrounding line (`sm` under
 * a paragraph, `xs` in a checklist row or a card's foot). Nothing renders without companies.
 */
export function CompanyLinks({ lead, items, size = "sm", className }: { lead: string; items: readonly CompanyLinkItem[]; size?: "sm" | "xs"; className?: string }) {
  if (items.length === 0) return null;
  return (
    <span className={cx(size === "xs" ? "text-xs" : "text-sm", "text-muted-foreground", className)}>
      {lead}:{" "}
      {items.map((c, i) => (
        <span key={c.href + c.name}>
          {i > 0 && ", "}
          <Link to={c.href} className="text-link hover:underline">
            <bdi>{c.name}</bdi>
          </Link>
        </span>
      ))}
    </span>
  );
}
