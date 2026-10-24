// The guide list (flows 6.4): where the money is held, what it is invested in, and the not-covered card.
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/guide-index";
import { guideIndex as copy, site } from "../copy";
import { IconDrillIn } from "../components/icons";
import { SavedGoalStrip } from "../components/compare/strip";
import { PageShell } from "../components/shell";
import { GoalsProvider, type Presets } from "../lib/goal";
import { Card } from "../components/ui";
import { groupGuides } from "../lib/guide-nav";

export async function loader() {
  const { loadTerms, loadWrappers, today } = await import("../lib/data.server");
  const { loadExposures } = await import("../lib/instruments.server");
  const terms = loadTerms();
  const line = (name: string) => terms.find((t) => t.he === name)?.explanation ?? null;
  // a name that must be decoded also shows the plain name the product's own record carries (audit A44)
  const wrappers = loadWrappers().map((w) => ({ id: w.id, name: w.names.he[0]!, line: line(w.names.he[0]!), plain: (copy.plainSubtitleFor as readonly string[]).includes(w.id) ? (w.names.he[1] ?? null) : null }));
  const { goalContext } = await import("../lib/compare.server");
  return { wrappers, exposures: loadExposures().map((e) => ({ id: e.id, name: e.names.he[0] ?? e.id, line: e.one_line_he ?? line(e.names.he[0] ?? "") })), today: today(), goal: goalContext() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

function InstrumentCard({ href, name, line, plain, quiet }: { href: string; name: string; line: string | null; plain?: string | null; quiet?: boolean }) {
  return (
    <li>
      <Link to={href} className="block h-full">
        <Card className={`h-full flex items-start justify-between gap-4 hover:bg-accent/40 transition-colors duration-[var(--duration-fast)] ${quiet ? "bg-background" : ""}`}>
          <span className="flex flex-col gap-1">
            <span className="text-lg font-semibold">{name}</span>
            {plain && (
              <span className="text-sm">
                {copy.alsoCalled} <bdi>{plain}</bdi>
              </span>
            )}
            {line && <span className="text-sm text-muted-foreground">{line}</span>}
          </span>
          <IconDrillIn className="text-muted-foreground shrink-0 mt-1" />
        </Card>
      </Link>
    </li>
  );
}

export default function GuideIndex() {
  const data = useLoaderData<typeof loader>();
  return (
    <GoalsProvider presets={data.goal.presets as Presets}>
    <PageShell current="guide" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-section pt-6 lg:pt-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
          <SavedGoalStrip variant="compact" presets={data.goal.presets as Presets} meta={data.goal.meta} today={data.today} />
        </header>
        <section aria-labelledby="explainer" className="flex flex-col gap-3 max-w-measure">
          <h2 id="explainer" className="text-xl font-semibold">
            {copy.explainer.title}
          </h2>
          <dl className="flex flex-col gap-2">
            <div>
              <dt className="inline font-medium">{copy.explainer.product.term}: </dt>
              <dd className="inline">{copy.explainer.product.line}</dd>
            </div>
            <div>
              <dt className="inline font-medium">{copy.explainer.exposure.term}: </dt>
              <dd className="inline">{copy.explainer.exposure.line}</dd>
            </div>
          </dl>
          <p className="text-sm text-muted-foreground">{copy.explainer.link}</p>
        </section>
        <section aria-labelledby="start" className="flex flex-col gap-2">
          <h2 id="start" className="text-xl font-semibold">
            {copy.start.title}
          </h2>
          <ul className="flex flex-col">
            {copy.start.items.map((it) => {
              const w = data.wrappers.find((x) => x.id === it.id);
              return w ? (
                <li key={it.id}>
                  <Link to={`/guide/${w.id}`} className="inline-flex flex-wrap items-center gap-x-2 min-h-target hover:underline">
                    <span>{it.lead}</span>
                    <span className="text-link font-medium">{w.name}</span>
                    <IconDrillIn size={16} className="text-muted-foreground" />
                  </Link>
                </li>
              ) : null;
            })}
          </ul>
        </section>
        <section aria-labelledby="g1" className="flex flex-col gap-6">
          <div>
            <h2 id="g1" className="text-xl lg:text-2xl font-semibold">
              {copy.group1.title}
            </h2>
            <p className="text-sm text-muted-foreground">{copy.group1.line}</p>
          </div>
          {groupGuides(data.wrappers.map((w) => w.id)).map((g) => (
            <div key={g.id} className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">{copy.purposeGroups[g.id] ?? g.id}</h3>
              <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {g.ids.map((id) => {
                  const w = data.wrappers.find((x) => x.id === id)!;
                  return <InstrumentCard key={w.id} href={`/guide/${w.id}`} name={w.name} line={w.line} plain={w.plain} />;
                })}
              </ul>
            </div>
          ))}
        </section>
        {data.exposures.length > 0 && (
          <section aria-labelledby="g2" className="flex flex-col gap-4">
            <div>
              <h2 id="g2" className="text-xl lg:text-2xl font-semibold">
                {copy.group2.title}
              </h2>
              <p className="text-sm text-muted-foreground">{copy.group2.line}</p>
            </div>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.exposures.map((e) => (
                <InstrumentCard key={e.id} href={`/exposure/${e.id}`} name={e.name} line={e.line} />
              ))}
            </ul>
          </section>
        )}
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <InstrumentCard href={site.notCovered.href} name={copy.last.title} line={copy.last.line} quiet />
        </ul>
      </div>
    </PageShell>
    </GoalsProvider>
  );
}
