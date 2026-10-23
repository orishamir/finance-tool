// The "not covered yet" page (flows 6.13, product D2): the tier-2 instruments, what is known and that
// the rules behind each are still open.
import { useLoaderData } from "react-router";
import type { Route } from "./+types/not-covered";
import { notCovered as copy, site } from "../copy";
import { IconExternal } from "../components/icons";
import { RulesLine, StrengthLabel } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Callout, Card } from "../components/ui";
import { fmt } from "../lib/format";

export async function loader() {
  const { loadNotCovered, loadRules, today } = await import("../lib/data.server");
  const rows = loadNotCovered();
  const rules = loadRules();
  const cited = new Set(rows.flatMap((r) => r.ruleIds));
  return { rows, rules: Object.fromEntries(Object.values(rules).filter((r) => cited.has(r.id)).map((r) => [r.id, r])), today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function NotCovered() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="other" data={{ rules: data.rules, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-section pt-6 lg:pt-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
        </header>
        {data.rows.length === 0 ? (
          <p>{copy.empty}</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {data.rows.map((r) => (
              <Card as="li" key={r.he} className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold">
                  <bdi>{r.he}</bdi>
                </h2>
                {r.variants.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {copy.alsoCalled}: {r.variants.join(" · ")}
                  </p>
                )}
                <dl className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <dt className="text-sm text-muted-foreground">{copy.rows.known}</dt>
                    <dd>{r.explanation}</dd>
                    {r.source && (
                      <dd className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                        <a href={r.source.url} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-start gap-1 hover:underline">
                          <span>{r.source.title}</span>
                          <IconExternal size={16} className="shrink-0 mt-1" />
                        </a>
                        <bdi dir="ltr">{fmt.date(r.source.checked)}</bdi>
                        <StrengthLabel strength={r.source.strength} />
                      </dd>
                    )}
                    {r.ruleIds.length > 0 && (
                      <dd>
                        <RulesLine ids={r.ruleIds} />
                      </dd>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-sm text-muted-foreground">{copy.rows.open}</dt>
                    <dd>
                      <Callout tone="blocked">{copy.openLine}</Callout>
                    </dd>
                  </div>
                </dl>
              </Card>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
