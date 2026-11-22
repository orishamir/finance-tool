// What the site found in the documents of companies that have no page here (D30; 8dd1f013:research/specs/2026-10-25-rules-scope/spec.md §4):
// on /documents, one fold per company (a company page lists its own entries by product, components/company/docs.tsx). Each item is the rule card (inline), which names the document, the
// date it was read and, for a rule not shown to hold everywhere, "אולי כך בכל החברות; לא מצאנו לזה מקור רשמי". A company's section
// holds only records from its own documents; what no section lists, the not-rules, has a section of its own at
// the end of /companies, "לא נכלל ככלל".
// Built from the kit's Section, FoldGroup (`variant="section"`, controlled) and Card and the provenance layer's RuleCard; a feature
// block of the company pages.
import { useEffect, useState } from "react";
import { scopeWords } from "../../copy";
import { companyTermsAnchor, noCompanyAnchor, noPageAnchor } from "../../lib/scope";
import { useProvenanceData } from "../provenance";
import { RuleCard } from "../provenance-sheets";
import { hashId } from "../../lib/address-hash";
import { Card, FoldGroup, Section, gershayim } from "../kit";

export interface TermGroup {
  key: string;
  title: string;
  ids: string[];
}

/** The id the address names (`#KH-09`, `#terms-msci`), read after the first paint: the pre-rendered page has none. */
function useHash(): string {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const read = () => setHash(hashId(window.location.hash));
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

/** `company`: the fold is that company's section (a company with no page of its own, on /companies), so its cards show its part only. */
function Cards({ ids, company }: { ids: readonly string[]; company?: string }) {
  const page = useProvenanceData();
  if (!page) return null;
  const data = company ? { ...page, company, pageCompanies: [company] } : page;
  return (
    <ul className="grid gap-4 lg:grid-cols-2 pt-2">
      {ids
        .filter((id) => data.rules[id])
        .map((id) => (
          <Card as="li" key={id} id={id} className="min-w-0 [overflow-wrap:anywhere] flex flex-col anchor-target">
            <RuleCard id={id} data={data} inline />
          </Card>
        ))}
    </ul>
  );
}

/**
 * /companies: the terms of the companies the site has no page for, a fold each; then, in a section of its own, what the site keeps but
 * does not show as a rule, which no company's section lists (the not-rules: a list, a count, a site's
 * terms, a company's tariff), its cards shown in full.
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
        <Section id={companyTermsAnchor} title={scopeWords.noPage.title}>
          <div className="flex flex-col gap-3">
            {companies.map((c) => (
              <FoldGroup key={c.id} variant="section" id={noPageAnchor(c.id)} className="anchor-target" title={<bdi>{gershayim(c.name)}</bdi>} count={c.ids.length} open={opened.has(c.id)} onOpenChange={toggle(c.id)}>
                <Cards ids={c.ids} company={c.id} />
              </FoldGroup>
            ))}
          </div>
        </Section>
      )}
      {none.length > 0 && (
        // a long run of cards beside the point of the page (what a company offers): folded, and opened by a link to it
        <Section id={noCompanyAnchor} title={scopeWords.noPage.none.title} lead={scopeWords.noPage.none.line}>
          <FoldGroup variant="section" title={scopeWords.noPage.none.fold} count={none.length} open={opened.has(noCompanyAnchor)} onOpenChange={toggle(noCompanyAnchor)}>
            <Cards ids={none} />
          </FoldGroup>
        </Section>
      )}
    </div>
  );
}
