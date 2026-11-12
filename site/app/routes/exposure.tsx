// Screen: the exposure guide page (flows 6.6, design-spec 2 without the timeline): what the money is invested in,
// which products can hold it, risks, and the words used for it.
import { Link, redirect, useLoaderData } from "react-router";
import { guidePath } from "../lib/site-paths";
import type { Route } from "./+types/exposure";
import { exposurePage as copy, guideIndex, invest, pagePreview } from "../copy";
import { pageMeta } from "../lib/page-meta";
import { GuideSection, GuideFrame, GuideHeader, useCurrentSection, type GlanceItem } from "../components/guide/sections";
import { IconLock } from "../components/icons";
import { NumberLegend, RuleRef } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Card, GoLink, RowArrow, Tag, gershayim } from "../components/kit";
import { exposureContent } from "../content/exposure";
import { ruleFigure, type SiteValue } from "../lib/value";

export async function loader({ params }: Route.LoaderArgs) {
  // D6: makam and the government bonds are the security's own page
  const { exposureFolds } = await import("../lib/instruments.server");
  const into = exposureFolds()[params.id];
  if (into) throw redirect(guidePath(into));
  const { buildExposurePage } = await import("../lib/guide.server");
  const content = exposureContent[params.id];
  const data = buildExposurePage(params.id, content ? [...content.termIds] : []);
  if (!data) throw new Response("Not found", { status: 404 });
  // an equity index has its own page on the indices page (D28), where its accounts and funds are compared
  const { indexPath } = await import("../lib/site-paths");
  return { ...data, indicesHref: data.record.kind === "equity_index" ? indexPath(data.record.id) : null };
}

export function meta({ loaderData: data, location }: Route.MetaArgs) {
  const name = data?.name ?? guideIndex.title;
  return pageMeta({ title: name, description: data?.lede ?? pagePreview.guide(name), location });
}

export default function ExposurePage() {
  const data = useLoaderData<typeof loader>();
  const { record, rules, today } = data;
  const content = exposureContent[record.id];
  const current = useCurrentSection(copy.sections.map((s) => s.id));
  const figure = (ruleId: string, name: string): SiteValue | null => (rules[ruleId] ? ruleFigure(rules[ruleId]!, name, today) : null);
  const cp = { figure };
  const provenance = { rules, pointed: data.pointed, terms: data.termsById, dimensions: data.dimensionNames, today };
  // the card beside the title: the page's own figures, then what the record says it is and its currency
  const glance: GlanceItem[] = [...(content?.glance?.(cp) ?? [])];
  if (record.kind !== "other") glance.push({ id: "kind", label: copy.kindLabel, value: copy.kinds[record.kind] ?? record.kind });
  glance.push({ id: "currency", label: copy.currencyLabel, value: invest.currencies[record.currency] ?? record.currency });
  return (
    <PageShell current="guide" data={provenance}>
      <GuideFrame sections={[...copy.sections]} current={current} foot={<NumberLegend term />}>
        <GuideHeader title={gershayim(data.name)} lede={data.lede && gershayim(data.lede)} glance={glance} />

        <GuideSection id="what" title={copy.sections[0].title}>
          {content ? content.what(cp) : <p className="text-muted-foreground max-w-measure">{copy.noProse}</p>}
        </GuideSection>

        <GuideSection id="hold" title={copy.sections[1].title}>
          {content?.holdNote?.(cp)}
          {data.indicesHref && <GoLink to={data.indicesHref}>{copy.toIndices}</GoLink>}
          <p className="text-sm text-muted-foreground max-w-measure">{copy.holdLine}</p>
          {data.holders.length === 0 ? (
            <p className="text-muted-foreground">{copy.holdNone}</p>
          ) : (
            <ul data-wide className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.holders.map((h) => (
                <li key={h.id}>
                  <Card className="h-full flex flex-col gap-2 hover:bg-accent/40 transition-colors duration-[var(--duration-fast)]">
                    <Link to={guidePath(h.id)} className="flex items-center justify-between gap-4">
                      <span className="text-lg font-semibold">{gershayim(h.name)}</span>
                      <RowArrow />
                    </Link>
                    {/* red only when the product's own exit tax is blocked; the shared open questions get a neutral tag */}
                    {/* the tag says what the questions leave open: the annuity's conversion factors on the pension products (how a
                        pension is taxed is known, TXP-14 to TXP-17), the tax only for a tax question (D105) */}
                    {h.blocks.map((g) => (
                      <span key={g.kind} className="flex flex-col gap-1.5">
                        <Tag tone="blocked" icon={<IconLock size={14} />} wrap>
                          {copy.openBlock[g.kind]}
                        </Tag>
                        <span className="flex flex-wrap gap-2">
                          {g.ids.map((q) => (
                            <RuleRef key={q} id={q} titled />
                          ))}
                        </span>
                      </span>
                    ))}
                    {h.openQuestions.length > 0 && (
                      <span className="flex flex-col gap-1.5">
                        <Tag tone="neutral">{copy.openDetails}</Tag>
                        <span className="flex flex-wrap gap-2">
                          {h.openQuestions.map((q) => (
                            <RuleRef key={q} id={q} titled />
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

        <GuideSection id="risk" title={copy.sections[2].title}>
          {content ? content.risks(cp) : <p className="text-muted-foreground max-w-measure">{copy.noProse}</p>}
        </GuideSection>

      </GuideFrame>
    </PageShell>
  );
}
