// A link out to a document where a word or a figure stands (2026-11-04): a price list's page, a promotion's terms, the page an advert
// was seen on. It opens in a new tab, ends in the outward arrow, and keeps a 44 px target; long Hebrew titles wrap anywhere.
import type { ReactNode } from "react";
import { IconExternal } from "../icons";
import { cx } from "./cx";

/** A PDF's address that opens at a page; any other address is left as it is. */
export const atPdfPage = (url: string, page?: number) => (page && /\.pdf/i.test(url) && !url.includes("#") ? `${url}#page=${page}` : url);

export function DocLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cx("text-link hover:underline inline-flex items-center gap-1 min-h-target [overflow-wrap:anywhere]", className)}>
      <bdi>{children}</bdi>
      <IconExternal size={14} className="shrink-0" />
    </a>
  );
}
