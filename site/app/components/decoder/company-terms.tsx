// What the site found in a company's own documents (D30; research/specs/2026-10-25-rules-scope/spec.md §4, 2026-10-26): on a managing
// company's page and on a bank's or broker's page, "מה כתוב במסמכים של {company}", grouped by topic; and on /companies the same for
// the companies the site has no page for, one fold per company. Each item is the rule card (inline), which names the document, the
// date it was read and, for a rule not shown to hold everywhere, "אולי כך בכל החברות; לא מצאנו לזה מקור רשמי". A company's section
// holds only records from its own documents (review, 2026-10-26); what no section lists, the not-rules, has a section of its own at
// the end of /companies, "לא נכלל ככלל".
// Built from the kit's Section, FoldGroup (`variant="section"`, controlled) and Card and the provenance layer's RuleCard; a feature
// block of the company pages.
import { useEffect, useState } from "react";
import { scopeWords } from "../../copy";
import { companyTermsAnchor, noCompanyAnchor, noPageAnchor } from "../../lib/scope";
import { RuleCard, useProvenanceData } from "../provenance";
import { Card, FoldGroup, Section, cx } from "../kit";

export interface TermGroup {
  key: string;
  title: string;
  ids: string[];
}

/** A fold holds this many cards or fewer: every group starts open. Above it only the first does, and the one an address names. */
const openAllUpTo = 6;
const scrollMargin = "scroll-mt-[112px] lg:scroll-mt-[88px]";

/** The id the address names (`#KH-09`, `#terms-msci`), read after the first paint: the pre-rendered page has none. */
function useHash(): string {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const read = () => setHash(decodeURIComponent(window.location.hash.slice(1)));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  return hash;
}

/** Scrolls to the element the address names once it exists (its fold opened after the first paint). */
function useScrollToHash(hash: string, ready: boolean) {
  useEffect(() => {
    if (!hash || !ready) return;
    const el = document.getElementById(hash);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
  }, [hash, ready]);
}

function Cards({ ids }: { ids: readonly string[] }) {
  const data = useProvenanceData();
  if (!data) return null;
  return (
    <ul className="grid gap-4 lg:grid-cols-2 pt-2">
      {ids
        .filter((id) => data.rules[id])
        .map((id) => (
          <Card as="li" key={id} id={id} className={cx("min-w-0 [overflow-wrap:anywhere] flex flex-col", scrollMargin)}>
            <RuleCard id={id} data={data} inline />
          </Card>
        ))}
    </ul>
  );
}

/** One company's section: its terms by topic. Nothing renders when the site found none. */
export function CompanyTerms({ name, groups }: { name: string; groups: readonly TermGroup[] }) {
  const hash = useHash();
  const total = groups.reduce((n, g) => n + g.ids.length, 0);
  const [opened, setOpened] = useState<Set<string>>(() => new Set(groups.slice(0, 1).map((g) => g.key)));
  const named = groups.find((g) => g.ids.includes(hash))?.key;
  useEffect(() => {
    if (named) setOpened((o) => (o.has(named) ? o : new Set(o).add(named)));
  }, [named]);
  useScrollToHash(hash, !!named && opened.has(named));
  if (total === 0) return null;
  return (
    <Section id={companyTermsAnchor} title={scopeWords.section.title.replace("{name}", name)} lead={scopeWords.section.line}>
      <div className="flex flex-col gap-3">
        {groups.map((g) => (
          <FoldGroup
            key={g.key}
            variant="section"
            title={g.title}
            count={g.ids.length}
            open={total <= openAllUpTo || opened.has(g.key)}
            onOpenChange={(now) => setOpened((o) => { const n = new Set(o); if (now) n.add(g.key); else n.delete(g.key); return n; })}
          >
            <Cards ids={g.ids} />
          </FoldGroup>
        ))}
      </div>
    </Section>
  );
}

/**
 * /companies: the terms of the companies the site has no page for, a fold each; then, in a section of its own, what the site keeps but
 * does not show as a rule, which no company's section lists (the not-rules: a forum post, a press report, a list, a count, a site's
 * terms, a company's tariff; review, 2026-10-26), its cards shown in full.
 */
export function NoPageCompanyTerms({ companies, none }: { companies: readonly { id: string; name: string; ids: string[] }[]; none: readonly string[] }) {
  const hash = useHash();
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const named = hash === noCompanyAnchor ? noCompanyAnchor : companies.find((c) => noPageAnchor(c.id) === hash)?.id;
  useEffect(() => {
    if (named) setOpened((o) => (o.has(named) ? o : new Set(o).add(named)));
  }, [named]);
  useScrollToHash(hash, !!named && (named === noCompanyAnchor || opened.has(named)));
  if (companies.length === 0 && none.length === 0) return null;
  const toggle = (key: string) => (now: boolean) => setOpened((o) => { const n = new Set(o); if (now) n.add(key); else n.delete(key); return n; });
  // two sections one after the other: the page's section gap between them
  return (
    <div className="flex flex-col gap-section">
      {companies.length > 0 && (
        <Section id={companyTermsAnchor} title={scopeWords.noPage.title} lead={scopeWords.noPage.line}>
          <div className="flex flex-col gap-3">
            {companies.map((c) => (
              <FoldGroup key={c.id} variant="section" id={noPageAnchor(c.id)} className={scrollMargin} title={<bdi>{c.name}</bdi>} count={c.ids.length} open={opened.has(c.id)} onOpenChange={toggle(c.id)}>
                <Cards ids={c.ids} />
              </FoldGroup>
            ))}
          </div>
        </Section>
      )}
      {none.length > 0 && (
        <Section id={noCompanyAnchor} title={scopeWords.noPage.none.title} lead={scopeWords.noPage.none.line}>
          <Cards ids={none} />
        </Section>
      )}
    </div>
  );
}
