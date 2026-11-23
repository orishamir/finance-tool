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
import { useHash } from "../../lib/address";
import { Card, FoldGroup, Section, MixedName } from "../kit";

/** Scrolls to the element the address names once it exists (its fold opened after the first paint). */
function useScrollToHash(hash: string, ready: boolean) {
  useEffect(() => {
    if (!hash || !ready) return;
    const el = document.getElementById(hash);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
  }, [hash, ready]);
}

/**
 * `company`: the fold is that company's section (a company with no page of its own, on /companies), so its cards show its part only.
 * `idOf`: a card's element id, the rule's own unless the card stands under another company too (one id names one element).
 */
function Cards({ ids, company, idOf = (id) => id }: { ids: readonly string[]; company?: string; idOf?: (id: string) => string }) {
  const page = useProvenanceData();
  if (!page) return null;
  const data = company ? { ...page, company, pageCompanies: [company] } : page;
  return (
    <ul className="grid gap-4 lg:grid-cols-2 pt-2">
      {ids
        .filter((id) => data.rules[id])
        .map((id) => (
          <Card as="li" key={id} id={idOf(id)} className="min-w-0 [overflow-wrap:anywhere] flex flex-col anchor-target">
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
  // a record from the documents of two companies (TXF-49: BlackRock's and Invesco's) stands under each; its own id names its card under
  // the first of them, where an address of it (#TXF-49) lands, and the other card's id is its company's (`terms-<company>-TXF-49`)
  const firstUnder = new Map<string, string>();
  for (const c of companies) for (const id of c.ids) if (!firstUnder.has(id)) firstUnder.set(id, c.id);
  const cardId = (company: string) => (id: string) => (firstUnder.get(id) === company ? id : `${noPageAnchor(company)}-${id}`);
  // the fold an address names: its own, or the one whose card it names, which opens so the card is there to land on
  const named = hash === noCompanyAnchor || none.includes(hash) ? noCompanyAnchor : (companies.find((c) => noPageAnchor(c.id) === hash)?.id ?? firstUnder.get(hash) ?? companies.find((c) => hash.startsWith(`${noPageAnchor(c.id)}-`))?.id);
  // a fold the address comes to name opens, once each time it is named; the person may close it again
  const [namedBefore, setNamedBefore] = useState<string | undefined>(undefined);
  if (named !== namedBefore) {
    setNamedBefore(named);
    if (named && !opened.has(named)) setOpened(new Set(opened).add(named));
  }
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
              <FoldGroup key={c.id} variant="section" id={noPageAnchor(c.id)} className="anchor-target" title={<MixedName>{c.name}</MixedName>} count={c.ids.length} open={opened.has(c.id)} onOpenChange={toggle(c.id)}>
                <Cards ids={c.ids} company={c.id} idOf={cardId(c.id)} />
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
