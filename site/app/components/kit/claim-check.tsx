// A claim of a house's advertising set against its binding documents (D56, D57): the fee it is about and the verdict in
// words, then both sides in their own words, each with a link to where it stands. The advert's side is the page it was seen on; the
// binding side is the price list, the account terms, the fee annex or the promotion's terms. Never a figure of a ranking. Each link opens at
// the quoted words (a web page, by text fragment) or at the page (a PDF): `sourceHref`.
import type { AdvertisingEntry } from "@finance-tool/schema";
import { claims as copy } from "../../copy";
import { fmt, gershayim } from "../../lib/format";
import { cx } from "./cx";
import { isPdfUrl, sourceHref } from "../../lib/sources";
import { DocLink } from "./doc-link";
import { Tag } from "./tag";

function Side({ lead, words, href, title, when }: { lead: string; words?: string; href: string; title: string; when: string }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-xs text-muted-foreground">{lead}</span>
      {words && (
        <span className="text-sm [overflow-wrap:anywhere]">
          <bdi>{copy.quote(gershayim(words))}</bdi>
        </span>
      )}
      <span className="flex flex-wrap items-center gap-x-2 text-xs">
        <DocLink href={href}>{title}</DocLink>
        <span className="text-muted-foreground whitespace-nowrap">{when}</span>
      </span>
    </div>
  );
}

/** One claim: the fee and the verdict as a label, the advert's words, then the binding document's words (or that it does not say so). */
export function ClaimCheck({ entry, className }: { entry: AdvertisingEntry; className?: string }) {
  const b = entry.binding_source;
  return (
    <article className={cx("flex flex-col gap-2 py-3 border-b border-border last:border-b-0", className)}>
      <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
        {copy.fee[entry.fee]}
        <Tag tone={entry.verdict === "contradicted" ? "caution" : "neutral"}>{copy.verdict[entry.verdict]}</Tag>
      </span>
      <div className="grid gap-3 md:grid-cols-2">
        <Side lead={copy.ad} words={entry.claim_he} href={sourceHref(entry.claim_source)} title={entry.claim_source.title} when={copy.seen(fmt.date(entry.claim_source.seen))} />
        <Side
          lead={entry.verdict === "not_found" ? copy.notFound : copy.binding}
          words={entry.binding_he}
          href={sourceHref(b)}
          title={b.page && isPdfUrl(b.url) ? copy.atPage(b.title, b.page) : b.title}
          when={copy.dated(fmt.date(b.dated))}
        />
      </div>
    </article>
  );
}

/** A house's claims, one after another, ruled between. */
export function ClaimList({ entries, className }: { entries: readonly AdvertisingEntry[]; className?: string }) {
  return (
    <div className={cx("flex flex-col", className)}>
      {entries.map((e) => (
        <ClaimCheck key={`${e.fee}-${e.claim_he}`} entry={e} />
      ))}
    </div>
  );
}
