// The rules front (synthesis §3.4, flows 6.14): the questions people ask with the rules that answer them, five shelves by the
// reader's question, what is about to change, the numbering as an index, and a filter over every rule. Light on purpose: the
// full cards live on the shelf pages. Everything but the filter paints without JavaScript.
import { useEffect, useMemo, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router";
import type { Route } from "./+types/rules";
import { provenance as provCopy, rulesFront as copy, site, sourceBlock, topicName } from "../copy";
import { IconSearch } from "../components/icons";
import { Num, NumberLegend, RuleRef, StrengthLabel } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Card, Disclosure, Tag } from "../components/ui";
import { fmt } from "../lib/format";
import { ruleTitle } from "../lib/rule-title";
import { shelfIds, shelfOf, isExperience, type ShelfId } from "../lib/rule-shelves";
import { ruleFigure, type SiteValue } from "../lib/value";

/** A rule's title for a list: the record's Hebrew title or text; never the English working title (the topic's Hebrew name stands in). */
function listTitle(r: Parameters<typeof ruleTitle>[0] & { il_finance_file: string }): string {
  const t = ruleTitle(r);
  return t.english ? topicName(r.il_finance_file) : t.text;
}

export async function loader() {
  const { loadChecklistRows, loadPinnedRules, loadRules, today } = await import("../lib/data.server");
  const { loadRuleUses, ruleScores } = await import("../lib/rule-uses.server");
  const rules = loadRules();
  const all = Object.values(rules);
  const now = today();
  const scores = ruleScores();
  const pinned = loadPinnedRules();

  const firstFigure = (id: string): SiteValue | null => {
    const r = rules[id];
    if (!r?.figures) return null;
    for (const name of Object.keys(r.figures)) {
      const v = ruleFigure(r, name, now);
      if (v) return { ...v, notes: "" };
    }
    return null;
  };
  const rows = pinned.rows.map((row) => ({
    question: row.question_he,
    rules: row.ids
      .filter((id) => rules[id])
      .map((id) => ({ id, title: listTitle(rules[id]!), strength: rules[id]!.strength, figure: firstFigure(id) })),
  }));
  const pinnedRules = Object.fromEntries(pinned.rows.flatMap((r) => r.ids).filter((id) => rules[id]).map((id) => [id, rules[id]!]));

  const byScore = (a: { id: string }, b: { id: string }) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0) || a.id.localeCompare(b.id);
  const shelves = shelfIds.map((shelf) => {
    const mine = all.filter((r) => shelfOf(r) === shelf);
    const teasers = mine
      .filter((r) => r.strength !== "open" && !isExperience(r.id) && (r.title_he || r.text_he))
      .sort(byScore)
      .slice(0, 3)
      .map((r) => ({ id: r.id, title: listTitle(r) }));
    return { id: shelf, count: mine.length, teasers };
  });

  const byMonth = new Map<string, { id: string; title: string; date: string; shelf: ShelfId }[]>();
  for (const r of all.slice().sort(byScore)) {
    if (!r.recheck_date) continue;
    const key = r.recheck_date.slice(0, 7);
    const list = byMonth.get(key) ?? [];
    list.push({ id: r.id, title: listTitle(r), date: r.recheck_date, shelf: shelfOf(r) });
    byMonth.set(key, list);
  }
  const changing = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([month, items]) => ({ month, items }));

  const prefixes = new Map<string, Map<ShelfId, number>>();
  for (const r of all) {
    const p = r.id.split("-")[0]!;
    const m = prefixes.get(p) ?? new Map<ShelfId, number>();
    const s = shelfOf(r);
    m.set(s, (m.get(s) ?? 0) + 1);
    prefixes.set(p, m);
  }
  const byNumber = [...prefixes.entries()]
    .map(([prefix, m]) => {
      const total = [...m.values()].reduce((a, b) => a + b, 0);
      const shelf = shelfIds.slice().sort((a, b) => (m.get(b) ?? 0) - (m.get(a) ?? 0))[0]!;
      return { prefix, count: total, shelf };
    })
    .sort((a, b) => b.count - a.count || a.prefix.localeCompare(b.prefix));

  const light = all.map((r) => ({ id: r.id, title: listTitle(r), shelf: shelfOf(r), strength: r.strength })).sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));

  return {
    pinned: { rows, provisional: !!pinned.provisional, rationale: pinned.rationale_he ?? null },
    shelves,
    changing,
    byNumber,
    light,
    rules: pinnedRules,
    ruleUses: loadRuleUses(Object.keys(pinnedRules)),
    dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])),
    today: now,
  };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

const norm = (s: string) => s.toLocaleLowerCase("he").replace(/\s+/g, " ").trim();

/** "{n} כללים" with the number isolated. */
function Count({ n }: { n: number }) {
  if (n === 1) return <>{copy.ruleCount.one}</>;
  const [a, b] = copy.ruleCount.many.split("{n}");
  return (
    <>
      {a}
      <bdi dir="ltr" className="tabular-nums">{fmt.number(n)}</bdi>
      {b}
    </>
  );
}

const monthName = (key: string) => {
  const [y, m] = key.split("-").map(Number) as [number, number];
  return new Intl.DateTimeFormat("he-IL", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
};

const rowLimit = 8;

export default function Rules() {
  const data = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const pd = { rules: data.rules, terms: {}, dimensions: data.dimensions, today: data.today, ruleUses: data.ruleUses };
  const [filter, setFilter] = useState("");
  const shelfById = useMemo(() => new Map(data.light.map((r) => [r.id, r.shelf])), [data.light]);
  const haystack = useMemo(() => data.light.map((r) => ({ r, h: norm(`${r.id} ${r.title}`) })), [data.light]);
  const q = norm(filter);
  const hits = q ? haystack.filter((x) => x.h.includes(q)).map((x) => x.r) : [];

  // `?q=` seeds the filter (not in the pre-rendered page, so it is read after the first paint)
  useEffect(() => {
    const seed = new URLSearchParams(window.location.search).get("q");
    if (seed) setFilter(seed);
  }, []);

  // an old address `/rules#TXS-01` moves to the shelf that holds the rule, once
  useEffect(() => {
    const land = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const shelf = id ? shelfById.get(id) : undefined;
      if (shelf) void navigate(`/rules/${shelf}#${id}`, { replace: true });
    };
    land();
    window.addEventListener("hashchange", land);
    return () => window.removeEventListener("hashchange", land);
  }, [shelfById, navigate]);

  return (
    <PageShell current="rules" data={pd}>
      <div className="pt-2 lg:pt-8 flex flex-col gap-section">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
          <NumberLegend />
          <p className="text-sm text-muted-foreground max-w-measure">{sourceBlock.legendLine}</p>
          <div className="flex flex-col gap-2 pt-2">
            <div className="field-box text-muted-foreground lg:max-w-md">
              <IconSearch size={18} />
              <label htmlFor="rules-front-filter" className="sr-only">
                {copy.filter}
              </label>
              <input id="rules-front-filter" dir="auto" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={copy.filter} className="field-input !text-start" autoComplete="off" />
            </div>
            {q && (
              <div role="status" className="flex flex-col gap-1 lg:max-w-md">
                {hits.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{copy.filterNone}</p>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {hits.length === 1 ? copy.filterOne : <><bdi dir="ltr" className="tabular-nums">{fmt.number(hits.length)}</bdi> {copy.filterMatching}</>}
                    </p>
                    <ul className="flex flex-col">
                      {hits.slice(0, 40).map((r) => (
                        <li key={r.id}>
                          <Link to={`/rules/${r.shelf}#${r.id}`} className="min-h-target flex flex-wrap items-center gap-x-2 py-1.5 border-b border-border hover:bg-accent">
                            <span className="text-sm">{r.title}</span>
                            <bdi dir="ltr" className="text-xs text-muted-foreground slashed-zero">{r.id}</bdi>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        <section aria-labelledby="pinned-h" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id="pinned-h" className="text-xl lg:text-2xl font-semibold">
              {copy.pinned.title}
            </h2>
            <Tag tone="parameter">{copy.pinned.tag}</Tag>
          </div>
          {data.pinned.provisional && (
            <Disclosure label={copy.pinned.provisional} className="text-sm text-muted-foreground max-w-measure">
              {data.pinned.rationale && <p className="text-sm max-w-measure">{data.pinned.rationale}</p>}
            </Disclosure>
          )}
          <ol className="flex flex-col lg:max-w-3xl">
            {data.pinned.rows.map((row) => (
              <li key={row.question} className="flex flex-col gap-1 py-3 border-b border-border">
                <h3 className="font-semibold">{row.question}</h3>
                <ul className="flex flex-col gap-1">
                  {row.rules.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                      <span className="min-w-0">{r.title}</span>
                      <RuleRef id={r.id} />
                      {r.figure && (
                        <span className="whitespace-nowrap">
                          <Num value={r.figure} />
                          {typeof r.figure.value === "number" && (provCopy.unit as Record<string, string>)[r.figure.unit] && ["months", "years", "days", "business_days", "usd", "eur"].includes(r.figure.unit) && <span className="text-muted-foreground"> {(provCopy.unit as Record<string, string>)[r.figure.unit]}</span>}
                        </span>
                      )}
                      {(r.strength === "institution" || r.strength === "secondary") && <StrengthLabel strength={r.strength} />}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="shelves-h" className="flex flex-col gap-3">
          <h2 id="shelves-h" className="text-xl lg:text-2xl font-semibold">
            {copy.shelvesTitle}
          </h2>
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.shelves.map((s) => {
              const name = copy.shelves[s.id]!;
              return (
                <Card as="li" key={s.id} className="p-0 md:p-0 min-w-0">
                  <Link to={`/rules/${s.id}`} className="flex flex-col gap-2 p-4 md:p-5 h-full min-h-target">
                    <span className="text-lg font-semibold">{name.name}</span>
                    <span className="text-sm text-muted-foreground">{name.line}</span>
                    <span className="text-sm">
                      <Count n={s.count} />
                    </span>
                    {s.teasers.length > 0 && (
                      <span className="flex flex-col gap-0.5 text-sm text-muted-foreground">
                        <span>{copy.teaser}</span>
                        {s.teasers.map((t) => (
                          <span key={t.id}>{t.title}</span>
                        ))}
                      </span>
                    )}
                    <span className="text-sm text-link mt-auto pt-1">{copy.toShelf}</span>
                  </Link>
                </Card>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="changing-h" className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="changing-h" className="text-xl lg:text-2xl font-semibold">
              {copy.changing.title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-measure">{copy.changing.line}</p>
          </div>
          <div className="flex flex-col lg:max-w-3xl">
            {data.changing.map((g, i) => (
              <details key={g.month} open={i < 2} className="group border-b border-border">
                <summary className="min-h-12 flex items-center justify-between gap-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h3 className="font-semibold">
                    {copy.changing.month.replace("{month}", monthName(g.month))} <bdi dir="ltr" className="tabular-nums">{g.month.slice(0, 4)}</bdi>
                    <span className="text-sm font-normal text-muted-foreground"> · <Count n={g.items.length} /></span>
                  </h3>
                </summary>
                <ul className="flex flex-col pb-2">
                  {g.items.slice(0, rowLimit).map((r) => (
                    <ChangingRow key={r.id} r={r} />
                  ))}
                </ul>
                {g.items.length > rowLimit && (
                  <Disclosure label={copy.changing.more.replace("{n}", fmt.number(g.items.length - rowLimit))} className="pb-2">
                    <ul className="flex flex-col">
                      {g.items.slice(rowLimit).map((r) => (
                        <ChangingRow key={r.id} r={r} />
                      ))}
                    </ul>
                  </Disclosure>
                )}
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="bynumber-h" className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="bynumber-h" className="text-xl lg:text-2xl font-semibold">
              {copy.byNumber.title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-measure">{copy.byNumber.line}</p>
          </div>
          <ul className="flex flex-wrap gap-2">
            {data.byNumber.map((p) => (
              <li key={p.prefix}>
                <Link to={`/rules/${p.shelf}?prefix=${p.prefix}`} className="min-h-target inline-flex items-center gap-1.5 px-3 rounded-md bg-secondary text-secondary-foreground hover:bg-accent text-sm">
                  <bdi dir="ltr" className="font-medium slashed-zero">{p.prefix}</bdi>
                  <bdi dir="ltr" className="tabular-nums text-muted-foreground">{fmt.number(p.count)}</bdi>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}

function ChangingRow({ r }: { r: { id: string; title: string; date: string; shelf: string } }) {
  return (
    <li>
      <Link to={`/rules/${r.shelf}#${r.id}`} className="min-h-target flex flex-wrap items-center gap-x-2 py-1.5 hover:bg-accent text-sm">
        <span className="min-w-0">{r.title}</span>
        <bdi dir="ltr" className="text-xs text-muted-foreground slashed-zero">{r.id}</bdi>
        <bdi dir="ltr" className="text-xs text-muted-foreground tabular-nums">{fmt.date(r.date)}</bdi>
      </Link>
    </li>
  );
}
