// The rules page (flows 6.9, 6.14): every rule the site uses, grouped by topic in collapsible groups, each card an anchor target.
// A filter field narrows by rule id, title or text. Every card is in the pre-rendered HTML; a closed group paints nothing.
import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/rules";
import { rulesPage as copy, site, topicName } from "../copy";
import { SectionIndex, useCurrentSection } from "../components/guide/sections";
import { IconChevronDown, IconSearch } from "../components/icons";
import { NumberLegend, RuleCard } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Card, cx } from "../components/ui";
import { fmt } from "../lib/format";
import { ruleTitle } from "../lib/rule-title";

export async function loader() {
  const { loadChecklistRows, loadRules, today } = await import("../lib/data.server");
  const rules = loadRules();
  const files = [...new Set(Object.values(rules).map((r) => r.il_finance_file))].sort((a, b) => topicName(a).localeCompare(topicName(b), "he"));
  const groups = files.map((file) => ({ id: file.replace(/\.md$/, ""), file, title: topicName(file), ids: Object.values(rules).filter((r) => r.il_finance_file === file).map((r) => r.id).sort() }));
  return { rules, groups, dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])), today: today() };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

const norm = (s: string) => s.toLocaleLowerCase("he").replace(/\s+/g, " ").trim();

export default function Rules() {
  const data = useLoaderData<typeof loader>();
  const sections = data.groups.map((g) => ({ id: g.id, title: g.title }));
  const current = useCurrentSection(sections.map((s) => s.id));
  const pd = { rules: data.rules, terms: {}, dimensions: data.dimensions, today: data.today };
  const [filter, setFilter] = useState("");
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const groupOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of data.groups) {
      m.set(g.id, g.id);
      for (const id of g.ids) m.set(id, g.id);
    }
    return m;
  }, [data.groups]);
  // the text each rule is searched in: its id, its titles and its Hebrew text
  const haystack = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of Object.values(data.rules)) m.set(r.id, norm([r.id, r.title, r.title_he ?? "", ruleTitle(r).text, r.text_he ?? ""].join(" ")));
    return m;
  }, [data.rules]);
  const q = norm(filter);
  const visible = (id: string) => !q || haystack.get(id)?.includes(q);

  // an anchor to a group or to a rule opens its group, then scrolls to it (the browser could not: the card was hidden)
  useEffect(() => {
    const land = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const group = id ? groupOf.get(id) : undefined;
      if (!group) return;
      setOpened((o) => (o.has(group) ? o : new Set(o).add(group)));
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    };
    land();
    window.addEventListener("hashchange", land);
    return () => window.removeEventListener("hashchange", land);
  }, [groupOf]);

  const shown = data.groups.map((g) => ({ g, ids: g.ids.filter(visible) }));
  const total = shown.reduce((n, x) => n + x.ids.length, 0);
  return (
    <PageShell current="rules" data={pd}>
      <div className="lg:flex lg:gap-12 pt-2 lg:pt-8">
        <SectionIndex sections={sections} current={current} />
        <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
            <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
            <NumberLegend />
          </header>
          <div className="flex flex-col gap-2">
            <div className="field-box text-muted-foreground lg:max-w-md">
              <IconSearch size={18} />
              <label htmlFor="rules-filter" className="sr-only">
                {copy.filter}
              </label>
              <input id="rules-filter" dir="auto" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={copy.filter} className="field-input !text-start" autoComplete="off" />
            </div>
            {q && (
              <p className="text-sm text-muted-foreground" role="status">
                {total === 0 ? copy.filterNone : <><bdi dir="ltr" className="tabular-nums">{fmt.number(total)}</bdi> {copy.filterMatching}</>}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {shown.map(({ g, ids }) => {
              if (q && ids.length === 0) return null;
              const isOpen = !!q || opened.has(g.id);
              return (
                <details
                  key={g.id}
                  id={g.id}
                  open={isOpen}
                  onToggle={(e) => {
                    const now = e.currentTarget.open;
                    if (!q && now !== opened.has(g.id)) setOpened((o) => { const n = new Set(o); if (now) n.add(g.id); else n.delete(g.id); return n; });
                  }}
                  className="group scroll-mt-[112px] lg:scroll-mt-[88px] flex flex-col"
                >
                  <summary className="min-h-12 flex items-center justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden rounded-md">
                    <h2 id={`${g.id}-h`} className="text-xl lg:text-2xl font-semibold flex flex-wrap items-baseline gap-x-2">
                      {g.title}
                      <span className="text-sm font-normal text-muted-foreground">
                        · {ids.length === 1 ? copy.ruleCount.one : <><bdi dir="ltr" className="tabular-nums">{fmt.number(ids.length)}</bdi> {copy.ruleCount.many}</>}
                      </span>
                    </h2>
                    <IconChevronDown className={cx("text-muted-foreground shrink-0 transition-transform duration-[var(--duration-fast)] group-open:rotate-180")} />
                  </summary>
                  <ul className="grid gap-4 lg:grid-cols-2 pt-2">
                    {ids.map((id) => (
                      <Card as="li" key={id} id={id} className="scroll-mt-[112px] lg:scroll-mt-[88px] min-w-0 [overflow-wrap:anywhere]">
                        <RuleCard id={id} data={pd} inline />
                      </Card>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
