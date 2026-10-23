// The guide list (flows 6.4): where the money is held, what it is invested in, and the not-covered card.
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/guide-index";
import { guideIndex as copy, site } from "../copy";
import { IconDrillIn } from "../components/icons";
import { PageShell } from "../components/shell";
import { Card } from "../components/ui";

export async function loader() {
  const { loadTerms, loadWrappers, today } = await import("../lib/data.server");
  const terms = loadTerms();
  const line = (name: string) => terms.find((t) => t.he === name)?.explanation ?? null;
  const wrappers = loadWrappers().map((w) => ({ id: w.id, name: w.names.he[0]!, line: line(w.names.he[0]!) }));
  return { wrappers, exposures: [] as { id: string; name: string; line: string | null }[], today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

function InstrumentCard({ href, name, line, quiet }: { href: string; name: string; line: string | null; quiet?: boolean }) {
  return (
    <li>
      <Link to={href} className="block h-full">
        <Card className={`h-full flex items-center justify-between gap-4 hover:bg-accent/40 transition-colors duration-[var(--duration-fast)] ${quiet ? "bg-background" : ""}`}>
          <span className="flex flex-col gap-1">
            <span className="text-lg font-semibold">{name}</span>
            {line && <span className="text-sm text-muted-foreground">{line}</span>}
          </span>
          <IconDrillIn className="text-muted-foreground shrink-0" />
        </Card>
      </Link>
    </li>
  );
}

export default function GuideIndex() {
  const data = useLoaderData<typeof loader>();
  return (
    <PageShell current="guide" data={{ rules: {}, terms: {}, dimensions: {}, today: data.today }}>
      <div className="flex flex-col gap-section pt-6 lg:pt-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
        </header>
        <section aria-labelledby="g1" className="flex flex-col gap-4">
          <div>
            <h2 id="g1" className="text-xl lg:text-2xl font-semibold">
              {copy.group1.title}
            </h2>
            <p className="text-sm text-muted-foreground">{copy.group1.line}</p>
          </div>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.wrappers.map((w) => (
              <InstrumentCard key={w.id} href={`/guide/${w.id}`} name={w.name} line={w.line} />
            ))}
          </ul>
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
                <InstrumentCard key={e.id} href={`/guide/${e.id}`} name={e.name} line={e.line} />
              ))}
            </ul>
          </section>
        )}
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <InstrumentCard href={site.notCovered.href} name={copy.last.title} line={copy.last.line} quiet />
        </ul>
      </div>
    </PageShell>
  );
}
