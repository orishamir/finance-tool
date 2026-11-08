// The guide page of a bond fund with a limited period: prose only for now, no product id and no comparison option.
import { useLoaderData } from "react-router";
import type { RuleRecord } from "@finance-tool/schema";
import { guideIndex, limitedBondFund as copy, site } from "../copy";
import { End, Compare, Risks, Tax, What, Who, termIds } from "../content/guide/limited-bond-fund";
import { GuideSection, SectionIndex, useCurrentSection } from "../components/guide/sections";
import { NumberLegend } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { ruleFigure } from "../lib/value";

const ruleIds = ["MF-05", "MF-10", "MF-11", "MF-16", "MF-20", "MF-27", "MF-59", "MF-60", "MF-61", "MF-62", "MF-63", "MF-64", "MF-65", "MF-66", "ETF-79", "ETF-80", "ETF-81", "CORP-01", "CORP-23", "CORP-26", "TX2-06", "TXS-09", "TXS-33", "TXS-34", "TXS-35", "TXS-36", "TXS-37"];

export async function loader() {
  const { loadChecklistRows, loadRules, loadTerms, pointedRecords, today } = await import("../lib/data.server");
  const { loadRuleUses } = await import("../lib/rule-uses.server");
  const all = loadRules();
  const rules = Object.fromEntries(ruleIds.filter((id) => all[id]).map((id) => [id, all[id]!]));
  // the glossary cards the prose opens (2026-11-07): a word with a sense in several products takes the funds' own (the securities account's), as on the funds page
  const terms: Record<string, ReturnType<typeof loadTerms>[number]> = {};
  const rows = loadTerms().filter((t) => (termIds as readonly string[]).includes(t.he));
  const ownSense = (t: (typeof rows)[number]) => Number(t.wrapperIds.includes("brokerage-account"));
  for (const t of [...rows].sort((a, b) => ownSense(b) - ownSense(a))) if (!terms[t.he]) terms[t.he] = t;
  for (const t of Object.values(terms)) for (const id of t.ruleIds) if (!rules[id] && all[id]) rules[id] = all[id]!;
  return { rules, pointed: pointedRecords(rules, all), terms, ruleUses: loadRuleUses(Object.keys(rules)), dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])), today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function GuideLimitedBondFund() {
  const data = useLoaderData<typeof loader>();
  const rules = data.rules as Record<string, RuleRecord>;
  const figure = (id: string, name: string) => (rules[id] ? ruleFigure(rules[id]!, name, data.today) : null);
  const pd = { rules, pointed: data.pointed as Record<string, RuleRecord>, terms: data.terms, dimensions: data.dimensions, today: data.today, ruleUses: data.ruleUses };
  const current = useCurrentSection(copy.sections.map((s) => s.id));
  const body = { what: <What />, compare: <Compare />, who: <Who figure={figure} />, end: <End figure={figure} />, tax: <Tax figure={figure} />, risks: <Risks figure={figure} /> };
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
        </div>
      </div>
    </PageShell>
  );
}
