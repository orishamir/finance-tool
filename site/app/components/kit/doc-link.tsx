// A link out to a document where a word or a figure stands (2026-11-04): a price list's page, a promotion's terms, the page an advert
// was seen on. It opens in a new tab, ends in the outward arrow, and keeps a 44 px target; long Hebrew titles wrap anywhere. Its `href`
// comes from `sourceHref` (lib/sources.ts), which opens a PDF at its page and a web page at the quoted words.
import type { ReactNode } from "react";
import { IconExternal } from "../icons";
import { cx } from "./cx";
import { gershayim } from "./name";


export function DocLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx("text-link hover:underline inline-flex items-center gap-1 min-h-target [overflow-wrap:anywhere]", className)}>
      {/* a document's title from the data spells בע"מ with a straight quote: drawn with the gershayim (copy.md 10.4) */}
      <bdi>{typeof children === "string" ? gershayim(children) : children}</bdi>
      <IconExternal size={14} className="shrink-0" />
    </a>
  );
}
