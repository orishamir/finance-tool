// Screen: the exposure guide page (flows 6.6, design-spec 2 without the timeline): what the money is invested in,
// which products can hold it, risks, the dimension checklist for this exposure, and the words used for it.
import { Link, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/exposure";
import { exposurePage as copy, guide, guideIndex, site } from "../copy";
import { DimensionChecklist, GuideSection, SectionIndex, TermTable, useCurrentSection, type ChecklistRowView } from "../components/guide/sections";
import { IconDrillIn, IconLock } from "../components/icons";
import { NumberLegend, RuleRef } from "../components/provenance";
import { Breadcrumb, PageShell } from "../components/shell";
import { Card, Disclosure, Tag } from "../components/kit";
import { exposureContent } from "../content/exposure";
import { splitTerms } from "../lib/guide-nav";
import type { SiteValue } from "../lib/value";

export async function loader({ params }: Route.LoaderArgs) {
  // D6 (amended 2026-10-27): makam and the government bonds are the security's own page
  const { exposureFolds } = await import("../lib/instruments.server");
  const into = exposureFolds()[params.id];
  if (into) throw redirect(`/guide/${into}`);
  const { buildExposurePage } = await import("../lib/guide.server");
  const content = exposureContent[params.id];
  const data = buildExposurePage(params.id, content ? [...content.termIds] : []);
  if (!data) throw new Response("Not found", { status: 404 });
  return data;
}

export function meta({ loaderData: data }: Route.MetaArgs) {
  return [{ title: `${data?.name ?? guideIndex.title} · ${site.name}` }];
}

export default function ExposurePage() {
  const data = useLoaderData<typeof loader>();
  const { record, rules, today } = data;
  const content = exposureContent[record.id];
  const current = useCurrentSection(copy.sections.map((s) => s.id));
  const figure = (ruleId: string, name: string): SiteValue | null => {
    const r = rules[ruleId];
    if (!r) return null;
    const f = r.figures?.[name];
    if (!f || Array.isArray(f)) return null;
    const v = "by_tax_year" in f ? f.by_tax_year[today.slice(0, 4)] ?? Object.values(f.by_tax_year).at(-1) : f;
    return v ? { ...v, rule_ids: v.rule_ids ?? [ruleId] } : null;
  };
  const cp = { figure };
  const checklist: ChecklistRowView[] = data.checklist.map((row) => {
    const allWeak = row.rules.length > 0 && row.rules.every((id) => rules[id]?.strength === "institution" || rules[id]?.strength === "secondary");
    return {
      id: row.id,
      name: row.name,
      explanation: row.explanation,
      mark: row.mark,
      rules: row.rules,
      weak: allWeak ? (row.rules.some((id) => rules[id]?.strength === "secondary") ? "secondary" : "institution") : null,
    };
  });
  const provenance = { rules, pointed: data.pointed, terms: data.termsById, dimensions: data.dimensionNames, today };
  const kind = copy.kinds[record.kind] ?? record.kind;
  // audit A83: no terms table under three rows; the page's own terms first, the rest behind a toggle
  const terms = splitTerms(data.terms, content?.termIds ?? []);
  return (
    <PageShell current="guide" data={provenance}>
      <div className="lg:flex lg:gap-12 pt-2 lg:pt-8">
        <SectionIndex sections={copy.sections.filter((x) => x.id !== "terms" || !terms.hide)} current={current} />
        <div className="flex-1 min-w-0 flex flex-col gap-section">
          <header className="flex flex-col gap-3">
            <Breadcrumb parent={{ href: "/guide", label: guideIndex.title }} current={data.name} />
            <h1 className="text-2xl lg:text-3xl font-semibold">{data.name}</h1>
            {data.lede && <p className="text-lg text-muted-foreground max-w-measure">{data.lede}</p>}
            <p className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {record.kind !== "other" && (
                <Tag tone="neutral">
                  {copy.kindLabel}: {kind}
                </Tag>
              )}
              <Tag tone="neutral">
                {copy.currencyLabel}: <bdi dir="ltr">{copy.currencies[record.currency] ?? record.currency}</bdi>
              </Tag>
            </p>
            <NumberLegend term />
          </header>

          <GuideSection id="what" title={copy.sections[0].title} rulesToggle>
            {content ? content.what(cp) : <p className="text-muted-foreground max-w-measure">{copy.noProse}</p>}
          </GuideSection>

          <GuideSection id="hold" title={copy.sections[1].title}>
            {content?.holdNote?.(cp)}
            <p className="text-sm text-muted-foreground max-w-measure">{copy.holdLine}</p>
            {data.holders.length === 0 ? (
              <p className="text-muted-foreground">{copy.holdNone}</p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.holders.map((h) => (
                  <li key={h.id}>
                    <Card className="h-full flex flex-col gap-2 hover:bg-accent/40 transition-colors duration-[var(--duration-fast)]">
                      <Link to={`/guide/${h.id}`} className="flex items-center justify-between gap-4">
                        <span className="text-lg font-semibold">{h.name}</span>
                        <IconDrillIn className="text-muted-foreground shrink-0" />
                      </Link>
                      {/* audit A85: red only when the product's own exit tax is blocked; the shared open questions get a neutral tag */}
                      {h.blockedBy.length > 0 && (
                        <span className="flex flex-col gap-1.5">
                          <Tag tone="blocked" icon={<IconLock size={14} />}>
                            {copy.openTax}
                          </Tag>
                          <span className="flex flex-wrap gap-2">
                            {h.blockedBy.map((q) => (
                              <RuleRef key={q} id={q} />
                            ))}
                          </span>
                        </span>
                      )}
                      {h.openQuestions.length > 0 && (
                        <span className="flex flex-col gap-1.5">
                          <Tag tone="neutral">{copy.openDetails}</Tag>
                          <span className="flex flex-wrap gap-2">
                            {h.openQuestions.map((q) => (
                              <RuleRef key={q} id={q} />
                            ))}
                          </span>
                        </span>
                      )}
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </GuideSection>

          <GuideSection id="risk" title={copy.sections[2].title} rulesToggle>
            {content ? content.risks(cp) : <p className="text-muted-foreground max-w-measure">{copy.noProse}</p>}
          </GuideSection>

          <GuideSection id="check" title={copy.sections[3].title}>
            <DimensionChecklist rows={checklist} />
          </GuideSection>

          {!terms.hide && (
            <GuideSection id="terms" title={copy.sections[4].title}>
              <p className="text-sm text-muted-foreground">{guide.termsLine}</p>
              {terms.main.length > 0 && <TermTable terms={terms.main} />}
              {terms.rest.length > 0 && (
                <Disclosure label={<span className="text-link">{guide.termsShowAll}</span>} openLabel={<span className="text-link">{guide.termsHideAll}</span>} className="flex flex-col gap-2" summaryClassName="justify-start">
                  <TermTable terms={terms.rest} />
                </Disclosure>
              )}
            </GuideSection>
          )}
        </div>
      </div>
    </PageShell>
  );
}
