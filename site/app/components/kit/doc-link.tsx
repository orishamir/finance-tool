// A link out of the site: to a document where a word or a figure stands (a price list's page, a promotion's terms, the page an advert
// was seen on), or to another site's page. It opens in a new tab, ends in the outward arrow, and keeps a 44 px target; long Hebrew titles
// wrap anywhere. Give it the cited place as `source` and it builds the address with `sourceHref` (lib/sources.ts), which opens a PDF at its
// page and a web page at the quoted words; `href` is for an address that is not a cited place, or one built already. `look="inline"` is
// for a link inside a line of text (a price list's title in the line under a product's heading): no height of its own, so the line keeps
// its height.
import type { ReactNode } from "react";
import { sourceHref, type CitedPlace } from "../../lib/sources";
import { IconExternal } from "../icons";
import { cx } from "./cx";
import { gershayim } from "./name";

type Target = { source: CitedPlace; href?: never } | { href: string; source?: never };

export function DocLink({ children, className, look = "line", ...to }: Target & { children: ReactNode; className?: string; look?: "line" | "inline" }) {
  const href = to.source ? sourceHref(to.source) : to.href;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx("text-link hover:underline inline-flex items-center gap-1 [overflow-wrap:anywhere]", look === "line" && "min-h-target", className)}>
      {/* a document's title from the data spells בע"מ with a straight quote: drawn with the gershayim (copy.md 10.4) */}
      <bdi>{typeof children === "string" ? gershayim(children) : children}</bdi>
      <IconExternal size={14} className="shrink-0" />
    </a>
  );
}
