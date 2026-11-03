// The guide page on funds of every kind (D55, 2026-11-03): prose only, no product id and no comparison option. It explains what a fund is
// under the law and the kinds the money-market guides and the indices page build on.
import { useLoaderData } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { guideIndex, invest, limitedBondFund, mutualFunds as copy, site } from "../copy";
import { Cost, Kinds, Safety, Tax, Trade, What, termIds } from "../content/guide/mutual-funds";
import { GuideSection, RelatedProducts, SectionIndex, useCurrentSection } from "../components/guide/sections";
import { NumberLegend } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { INDICES_PATH } from "../lib/invest";
import { ruleFigure } from "../lib/value";

const ruleIds = [
  "MF-01", "MF-02", "MF-03", "MF-04", "MF-05", "MF-07", "MF-09", "MF-10", "MF-11", "MF-13", "MF-15", "MF-16", "MF-17", "MF-20", "MF-21", "MF-27",
  "ETF-01", "ETF-04", "ETF-05", "ETF-06", "ETF-13", "ETF-14", "ETF-18", "ETF-61", "ETF-67",
  "REG-07", "REG-10", "REG-11", "BANK-18", "BRK-17",
  "TXS-07", "TXS-09", "TXS-11", "TXS-13", "TXS-21", "TXS-22", "TXS-24",
];
/** The guides this page leads on to: the money-market funds, the limited-period bond fund and the account the units are held in. */
const relatedIds = ["money-market-fund-daily", "money-market-fund-renewable", "brokerage-account"];

export async function loader() {
  const { loadChecklistRows, loadProducts, loadRules, loadTerms, pointedRecords, today } = await import("../lib/data.server");
  const { loadRuleUses } = await import("../lib/rule-uses.server");
  const all = loadRules();
  const rules = Object.fromEntries(ruleIds.filter((id) => all[id]).map((id) => [id, all[id]!]));
  // a word can carry another sense in another product: the funds' own sense (the securities account's page) wins, as on a guide page
  const terms: Record<string, ReturnType<typeof loadTerms>[number]> = {};
  const rows = loadTerms().filter((t) => (termIds as readonly string[]).includes(t.he));
  const ownSense = (t: (typeof rows)[number]) => Number(t.wrapperIds.includes("brokerage-account"));
  for (const t of [...rows].sort((a, b) => ownSense(b) - ownSense(a))) if (!terms[t.he]) terms[t.he] = t;
  // the rules the term cards cite ship with the page too
  for (const t of Object.values(terms)) for (const id of t.ruleIds) if (!rules[id] && all[id]) rules[id] = all[id]!;
  const products = loadProducts();
  // the daily money-market fund's first name is the kind's ("קרן כספית"); its second says which of the two it is
  const nameOf = (id: string) => {
    const names = products.find((p) => p.id === id)?.names.he ?? [id];
    return (id === "money-market-fund-daily" ? names[1] : names[0]) ?? id;
  };
  const related = relatedIds.map((id) => ({ href: `/guide/${id}`, label: nameOf(id) }));
  return { rules, pointed: pointedRecords(rules, all), terms, related, ruleUses: loadRuleUses(Object.keys(rules)), dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])), today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function GuideMutualFunds() {
  const data = useLoaderData<typeof loader>();
  const rules = data.rules as Record<string, RuleRecord>;
  const figure = (id: string, name: string) => (rules[id] ? ruleFigure(rules[id]!, name, data.today) : null);
  const pd = { rules, pointed: data.pointed as Record<string, RuleRecord>, terms: data.terms, dimensions: data.dimensions, today: data.today, ruleUses: data.ruleUses };
  const current = useCurrentSection(copy.sections.map((s) => s.id));
  const body = { what: <What />, kinds: <Kinds figure={figure} />, trade: <Trade figure={figure} />, cost: <Cost figure={figure} />, safety: <Safety figure={figure} />, tax: <Tax figure={figure} /> };
  const related = [...data.related.slice(0, 2), { href: "/guide/limited-bond-fund", label: limitedBondFund.title }, ...data.related.slice(2), { href: INDICES_PATH, label: invest.nav }];
  return (
    <PageShell current="guide" data={pd}>
      <div className="lg:flex lg:gap-12 pt-2 lg:pt-8">
        <SectionIndex sections={copy.sections} current={current} />
        <div className="flex-1 min-w-0 flex flex-col gap-section">
          <header className="flex flex-col gap-3">
            <Breadcrumb parent={{ href: "/guide", label: guideIndex.title }} current={copy.title} />
            <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
            <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
            <NumberLegend term />
          </header>
          {copy.sections.map((s) => (
            <GuideSection key={s.id} id={s.id} title={s.title}>
              {body[s.id as keyof typeof body]}
            </GuideSection>
          ))}
          <RelatedProducts items={related} />
        </div>
      </div>
    </PageShell>
  );
}
