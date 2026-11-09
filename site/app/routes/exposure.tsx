// Screen: the exposure guide page (flows 6.6, design-spec 2 without the timeline): what the money is invested in,
// which products can hold it, risks, and the words used for it.
import { Link, redirect, useLoaderData } from "react-router";
import type { Route } from "./+types/exposure";
import { exposurePage as copy, guideIndex, site } from "../copy";
import { GuideSection, GuideFrame, GuideHeader, useCurrentSection } from "../components/guide/sections";
import { IconLock } from "../components/icons";
import { NumberLegend, RuleRef } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Card, RowArrow, Tag } from "../components/kit";
import { exposureContent } from "../content/exposure";
import { ruleFigure, type SiteValue } from "../lib/value";

export async function loader({ params }: Route.LoaderArgs) {
  // D6: makam and the government bonds are the security's own page
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
  const figure = (ruleId: string, name: string): SiteValue | null => (rules[ruleId] ? ruleFigure(rules[ruleId]!, name, today) : null);
  const cp = { figure };
  const provenance = { rules, pointed: data.pointed, terms: data.termsById, dimensions: data.dimensionNames, today };
  const kind = copy.kinds[record.kind] ?? record.kind;
  return (
    <PageShell current="guide" data={provenance}>
      <GuideFrame sections={[...copy.sections]} current={current}>
        <GuideHeader title={data.name}>
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
        </GuideHeader>

        <GuideSection id="what" title={copy.sections[0].title}>
          {content ? content.what(cp) : <p className="text-muted-foreground max-w-measure">{copy.noProse}</p>}
        </GuideSection>

        <GuideSection id="hold" title={copy.sections[1].title}>
          {content?.holdNote?.(cp)}
          <p className="text-sm text-muted-foreground max-w-measure">{copy.holdLine}</p>
          {data.holders.length === 0 ? (
            <p className="text-muted-foreground">{copy.holdNone}</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.holders.map((h) => (
                <li key={h.id}>
                  <Card className="h-full flex flex-col gap-2 hover:bg-accent/40 transition-colors duration-[var(--duration-fast)]">
                    <Link to={`/guide/${h.id}`} className="flex items-center justify-between gap-4">
                      <span className="text-lg font-semibold">{h.name}</span>
                      <RowArrow />
                    </Link>
                    {/* red only when the product's own exit tax is blocked; the shared open questions get a neutral tag */}
                    {h.blockedBy.length > 0 && (
                      <span className="flex flex-col gap-1.5">
                        <Tag tone="blocked" icon={<IconLock size={14} />} wrap>
                          {copy.openTax}
                        </Tag>
                        <span className="flex flex-wrap gap-2">
                          {h.blockedBy.map((q) => (
                            <RuleRef key={q} id={q} titled />
                          ))}
                        </span>
                      </span>
                    )}
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
