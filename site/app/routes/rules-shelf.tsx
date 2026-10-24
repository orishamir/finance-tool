// A shelf of the rules pages (synthesis §3.4, flows 6.14): the rules of one reader's question, grouped by topic in collapsible
// groups, each card an anchor target, with a product filter and a text filter. Only this shelf's cards are in the HTML.
import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/rules-shelf";
import { rulesFront as copy, rulesPage as pageCopy, ruleCardMore, site, sourceBlock, topicName } from "../copy";
import { SectionIndex, useCurrentSection } from "../components/guide/sections";
import { IconChevronDown, IconSearch } from "../components/icons";
import { NumberLegend, RuleCard } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Card, cx, Tag } from "../components/ui";
import { fmt } from "../lib/format";
import { ruleTitle } from "../lib/rule-title";
import { fileRank, isExperience, shelfIds, shelfOf, type ShelfId } from "../lib/rule-shelves";

/** Files that are one product's page of rules: the wrappers whose chip they belong under. */
const fileProducts: Record<string, string[]> = {
  "bank-current-account-deposits.md": ["current-account", "bank-deposit", "savings-plan"],
  "mutual-funds-and-money-market-funds.md": ["money-market-fund-daily", "money-market-fund-renewable"],
  "kupat-gemel-lehashkaa.md": ["kupat-gemel-lehashkaa"],
  "keren-hishtalmut.md": ["keren-hishtalmut"],
  "pension-and-gemel-lekitzba.md": ["pension-comprehensive", "pension-general", "provident-for-annuity"],
  "brokerage-account.md": ["brokerage-account"],
  "government-bonds-and-makam.md": ["government-bond", "makam"],
  "child-savings.md": ["child-savings-provident", "child-savings-bank"],
  "ira-self-directed.md": ["ira-hishtalmut", "ira-provident"],
};
const commonFile = "provident-family-common.md";
const tier2Files = new Set(["tax-insurance-and-amendment-190.md", "tax-tier2-other.md", "savings-policies-and-executive-insurance.md", "corporate-bonds.md", "fx-and-structured-deposits.md", "managed-and-robo-portfolios.md", "reits-and-gold-funds.md"]);

type Sourced = { sources?: { publisher_he?: string; title_he?: string }[]; derived_from?: string[] };

export async function loader({ params }: Route.LoaderArgs) {
  const shelf = params.shelf as ShelfId;
  if (!shelfIds.includes(shelf)) throw new Response("Not found", { status: 404 });
  const { loadChecklistRows, loadRules, loadWrappers, root, today } = await import("../lib/data.server");
  const { loadRuleUses, ruleScores } = await import("../lib/rule-uses.server");
  const all = loadRules();
  const scores = ruleScores();
  const mine = Object.values(all).filter((r) => shelfOf(r) === shelf);
  const ids = new Set(mine.map((r) => r.id));

  // products: the wrappers whose record cites the rule, the wrapper behind the file, "common" and "tier 2"
  const wrappers = loadWrappers();
  const { readFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const productsOf: Record<string, string[]> = {};
  const add = (id: string, p: string) => ((productsOf[id] ??= []).includes(p) ? 0 : productsOf[id]!.push(p));
  for (const w of wrappers) {
    const text = readFileSync(join(root, "data/instruments/wrappers", `${w.id}.json`), "utf8");
    for (const m of text.matchAll(/"([A-Z][A-Z0-9]*-[A-Z0-9]+)"/g)) if (ids.has(m[1]!)) add(m[1]!, w.id);
  }
  for (const r of mine) {
    for (const w of fileProducts[r.il_finance_file] ?? []) add(r.id, w);
    if (r.il_finance_file === commonFile) add(r.id, "common");
    if (tier2Files.has(r.il_finance_file)) add(r.id, "tier2");
  }
  const used = new Set(Object.values(productsOf).flat());
  const chips = [
    ...wrappers.filter((w) => used.has(w.id)).map((w) => ({ id: w.id, name: w.names.he[0] ?? w.id })),
    ...(used.has("common") ? [{ id: "common", name: copy.products.common }] : []),
    ...(used.has("tier2") ? [{ id: "tier2", name: copy.products.tier2 }] : []),
  ];

  const byScore = (a: { id: string }, b: { id: string }) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0) || a.id.localeCompare(b.id, "en", { numeric: true });
  const files = [...new Set(mine.filter((r) => !isExperience(r.id)).map((r) => r.il_finance_file))].sort((a, b) => fileRank(a) - fileRank(b));
  const groups = files.map((file) => ({
    id: file.replace(/\.md$/, ""),
    title: copy.subgroups[file] ?? topicName(file),
    ids: mine.filter((r) => r.il_finance_file === file && !isExperience(r.id)).sort(byScore).map((r) => r.id),
  }));
  const experience = mine.filter((r) => isExperience(r.id)).sort(byScore).map((r) => r.id);

  const rules = Object.fromEntries(mine.map((r) => [r.id, r]));
  // rules a card points at (derived_from) may live on another shelf: their records travel too, so the chip opens them
  for (const r of mine) for (const d of (r as Sourced).derived_from ?? []) if (all[d] && !rules[d]) rules[d] = all[d]!;

  return {
    shelf,
    groups,
    experience,
    chips,
    productsOf,
    rules,
    ruleUses: loadRuleUses(mine.map((r) => r.id)),
    dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])),
    today: today(),
  };
}

export function meta({ params }: Route.MetaArgs) {
  const name = copy.shelves[params.shelf ?? ""]?.name ?? copy.title;
  return [{ title: `${name} · ${copy.title} · ${site.name}` }];
}

const norm = (s: string) => s.toLocaleLowerCase("he").replace(/\s+/g, " ").trim();

function Count({ n }: { n: number }) {
  if (n === 1) return <>{pageCopy.ruleCount.one}</>;
  const [a, b] = copy.ruleCount.many.split("{n}");
  return (
    <>
      {a}
      <bdi dir="ltr" className="tabular-nums">{fmt.number(n)}</bdi>
      {b}
    </>
  );
}

export default function RulesShelf() {
  const data = useLoaderData<typeof loader>();
  const name = copy.shelves[data.shelf]!;
  const pd = { rules: data.rules, terms: {}, dimensions: data.dimensions, today: data.today, ruleUses: data.ruleUses };
  const allGroups = useMemo(
    () => [...data.groups, ...(data.experience.length > 0 ? [{ id: "experience", title: copy.experience.title, ids: data.experience }] : [])],
    [data.groups, data.experience],
  );
  const sections = allGroups.map((g) => ({ id: g.id, title: g.title }));
  const current = useCurrentSection(sections.map((s) => s.id));
  const [filter, setFilter] = useState("");
  const [product, setProduct] = useState<string | null>(null);
  const [prefix, setPrefix] = useState<string | null>(null);
  const [opened, setOpened] = useState<Set<string>>(() => new Set());

  const groupOf = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of allGroups) {
      m.set(g.id, g.id);
      for (const id of g.ids) m.set(id, g.id);
    }
    return m;
  }, [allGroups]);

  // the text each rule is searched in: id, titles, Hebrew text, and the publisher and document of its sources when the record has them
  const haystack = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of Object.values(data.rules)) {
      const s = (r as Sourced).sources ?? [];
      m.set(r.id, norm([r.id, r.title, r.title_he ?? "", ruleTitle(r).text, r.text_he ?? "", ...s.flatMap((x) => [x.publisher_he ?? "", x.title_he ?? ""])].join(" ")));
    }
    return m;
  }, [data.rules]);

  const q = norm(filter);
  const visible = (id: string) =>
    (!q || haystack.get(id)?.includes(q)) &&
    (!product || (data.productsOf[id] ?? []).includes(product)) &&
    (!prefix || id.startsWith(`${prefix}-`));
  const filtering = !!q || !!product || !!prefix;

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const seed = p.get("q");
    if (seed) setFilter(seed);
    const px = p.get("prefix");
    if (px) setPrefix(px.toUpperCase());
  }, []);

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

  const shown = allGroups.map((g) => ({ g, ids: g.ids.filter(visible) }));
  const total = shown.reduce((n, x) => n + x.ids.length, 0);
  const all = allGroups.reduce((n, g) => n + g.ids.length, 0);

  return (
    <PageShell current="rules" data={pd}>
      <div className="lg:flex lg:gap-12 pt-2 lg:pt-8">
        <SectionIndex sections={sections} current={current} />
        <div className="flex-1 min-w-0 flex flex-col gap-6 lg:gap-8">
          <header className="flex flex-col gap-2">
            <Link to="/rules" className="text-sm text-link min-h-target inline-flex items-center hover:underline self-start">
              {copy.back}
            </Link>
            <h1 className="text-2xl lg:text-3xl font-semibold">{name.name}</h1>
            <p className="text-lg text-muted-foreground max-w-measure">
              {name.line} · <Count n={all} />
            </p>
            <NumberLegend />
            <p className="text-sm text-muted-foreground max-w-measure">{sourceBlock.legendLine}</p>
          </header>
          <div className="flex flex-col gap-3">
            <div className="field-box text-muted-foreground lg:max-w-md">
              <IconSearch size={18} />
              <label htmlFor="rules-filter" className="sr-only">
                {copy.filter}
              </label>
              <input id="rules-filter" dir="auto" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={copy.filter} className="field-input !text-start" autoComplete="off" />
            </div>
            {data.chips.length > 1 && (
              <ul className="flex gap-2 overflow-x-auto scrollbar-none -mx-gutter px-gutter lg:mx-0 lg:px-0 lg:flex-wrap">
                {[{ id: "", name: copy.products.all }, ...data.chips].map((c) => {
                  const on = (product ?? "") === c.id;
                  return (
                    <li key={c.id || "all"} className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => setProduct(c.id || null)}
                        className={cx("min-h-target inline-flex items-center px-3 rounded-md text-sm", on ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent")}
                      >
                        {c.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {prefix && (
              <p className="text-sm flex flex-wrap items-center gap-2">
                <Tag tone="neutral">
                  <bdi dir="ltr" className="slashed-zero">{prefix}</bdi>
                </Tag>
                <Link to={`/rules/${data.shelf}`} onClick={() => setPrefix(null)} className="text-link min-h-target inline-flex items-center hover:underline">
                  {copy.toShelf}
                </Link>
              </p>
            )}
            {filtering && (
              <p className="text-sm text-muted-foreground" role="status">
                {total === 0 ? copy.filterNone : total === 1 ? copy.filterOne : <><bdi dir="ltr" className="tabular-nums">{fmt.number(total)}</bdi> {copy.filterMatching}</>}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {shown.map(({ g, ids }) => {
              if (filtering && ids.length === 0) return null;
              const isOpen = filtering || opened.has(g.id);
              const experience = g.id === "experience";
              return (
                <details
                  key={g.id}
                  id={g.id}
                  open={isOpen}
                  onToggle={(e) => {
                    const now = e.currentTarget.open;
                    if (!filtering && now !== opened.has(g.id)) setOpened((o) => { const n = new Set(o); if (now) n.add(g.id); else n.delete(g.id); return n; });
                  }}
                  className="group scroll-mt-[112px] lg:scroll-mt-[88px] flex flex-col"
                >
                  <summary className="min-h-12 flex items-center justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden rounded-md">
                    <h2 id={`${g.id}-h`} className="text-xl lg:text-2xl font-semibold flex flex-wrap items-baseline gap-x-2">
                      {g.title}
                      <span className="text-sm font-normal text-muted-foreground">
                        · <Count n={ids.length} />
                      </span>
                    </h2>
                    <IconChevronDown className="text-muted-foreground shrink-0 transition-transform duration-[var(--duration-fast)] group-open:rotate-180" />
                  </summary>
                  {experience && (
                    <p className="text-sm text-muted-foreground max-w-measure flex flex-wrap items-center gap-2 pb-1">
                      <Tag tone="neutral">{ruleCardMore.experienceTag}</Tag>
                      {copy.experience.line}
                    </p>
                  )}
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
