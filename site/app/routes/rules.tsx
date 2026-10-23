// The rules page (flows 6.9, 6.14): every rule the site uses, grouped by topic, each card an anchor target.
import { useLoaderData } from "react-router";
import type { Route } from "./+types/rules";
import { rulesPage as copy, site } from "../copy";
import { SectionIndex, useCurrentSection } from "../components/guide/sections";
import { RuleCard } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Card } from "../components/ui";

export async function loader() {
  const { loadChecklistRows, loadRules, today } = await import("../lib/data.server");
  const rules = loadRules();
  const files = [...new Set(Object.values(rules).map((r) => r.il_finance_file))].sort((a, b) => (copy.groups[a] ?? a).localeCompare(copy.groups[b] ?? b, "he"));
  const groups = files.map((file) => ({ id: file.replace(/\.md$/, ""), file, title: copy.groups[file] ?? file, ids: Object.values(rules).filter((r) => r.il_finance_file === file).map((r) => r.id).sort() }));
  return { rules, groups, dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])), today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

export default function Rules() {
  const data = useLoaderData<typeof loader>();
  const sections = data.groups.map((g) => ({ id: g.id, title: g.title }));
  const current = useCurrentSection(sections.map((s) => s.id));
  const pd = { rules: data.rules, terms: {}, dimensions: data.dimensions, today: data.today };
  return (
    <PageShell current="rules" data={pd}>
      <div className="lg:flex lg:gap-12 pt-2 lg:pt-8">
        <SectionIndex sections={sections} current={current} />
        <div className="flex-1 min-w-0 flex flex-col gap-section">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
            <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
          </header>
          {data.groups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="flex flex-col gap-4 scroll-mt-[112px] lg:scroll-mt-[88px]">
              <h2 id={`${g.id}-h`} className="text-xl lg:text-2xl font-semibold">
                {g.title}
              </h2>
              <ul className="grid gap-4 lg:grid-cols-2">
                {g.ids.map((id) => (
                  <Card as="li" key={id} id={id} className="scroll-mt-[112px] lg:scroll-mt-[88px]">
                    <RuleCard id={id} data={pd} inline />
                  </Card>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
