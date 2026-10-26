// The rules page (founder, 2026-10-24 evening): every rule under /rules, one list, with filters; the common questions are
// presets of the filters. All filter state lives in the address (?shelf=&product=&prefix=&changing=1&ids=&q=), so a link can
// preset it. Light on purpose: the page ships a light list of all rules; the full records and their uses come per shelf from
// /rules-data/<shelf>.json, fetched when a group opens, a filter shows cards, or the address names a rule.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/rules";
import { rulesFront as copy, scopeWords, site, sourceBlock, system, topicName, ruleCardMore } from "../copy";
import { IconSearch } from "../components/icons";
import { NumberLegend, RuleCard, type RuleUses } from "../components/provenance";
import { PageShell } from "../components/shell";
import { Card, cx, Disclosure, FoldGroup, Tag } from "../components/kit";
import { fmt } from "../lib/format";
import { buildSections, emptyFilters, filtersToSearch, fullHaystack, isFiltering, lightHaystack, matchRules, norm, parseFilters, type Filters, type Group, type LightRule } from "../lib/rules-filter";
import { shelfIds, type ShelfId } from "../lib/rule-shelves";
import { ruleTitle } from "../lib/rule-title";
import type { RuleRecord } from "@finance-tool/schema";

/** A rule's title for a list: the record's Hebrew title or text; never the English working title (the topic's Hebrew name stands in). */
function listTitle(r: Parameters<typeof ruleTitle>[0] & { il_finance_file: string }): string {
  const t = ruleTitle(r);
  return t.english ? topicName(r.il_finance_file) : t.text;
}

export async function loader() {
  const { loadChecklistRows, loadPinnedRules, loadRules, loadWrappers, today } = await import("../lib/data.server");
  const { ruleProducts, ruleScores } = await import("../lib/rule-uses.server");
  const { shelfOf } = await import("../lib/rule-shelves");
  const rules = loadRules();
  // D30 (spec 2026-10-25-rules-scope §4): the rules page lists general rules only; a company's term is on that company's page
  const all = Object.values(rules).filter((r) => r.scope === "general");
  const now = today();
  const scores = ruleScores();
  const products = ruleProducts();
  const pinned = loadPinnedRules();

  const rows = pinned.rows.map((row) => ({ question: row.question_he, ids: row.ids.filter((id) => rules[id]) }));

  const light: LightRule[] = all
    .map((r) => ({
      id: r.id,
      title: listTitle(r),
      shelf: shelfOf(r),
      file: r.il_finance_file,
      strength: r.strength,
      likely_to_change: r.likely_to_change,
      recheck_date: r.recheck_date,
      score: scores[r.id] ?? 0,
      prefix: r.id.split("-")[0]!,
      products: products[r.id] ?? [],
    }))
    .sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));

  const productCounts = new Map<string, number>();
  for (const r of light) for (const p of r.products) productCounts.set(p, (productCounts.get(p) ?? 0) + 1);
  // the wrappers by how many rules they carry, the most first (on a phone the row scrolls sideways, so the first chips matter); the two catch-alls last
  const productChips = [
    ...loadWrappers()
      .filter((w) => productCounts.has(w.id))
      .map((w) => ({ id: w.id, name: w.names.he[0] ?? w.id, n: productCounts.get(w.id)! }))
      .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name, "he")),
    ...(productCounts.has("common") ? [{ id: "common", name: copy.products.common, n: productCounts.get("common")! }] : []),
    ...(productCounts.has("tier2") ? [{ id: "tier2", name: copy.products.tier2, n: productCounts.get("tier2")! }] : []),
  ];

  // an old address that names a company's term (/rules#CS-30) goes on to where that term is listed now (D30)
  const { companyLinks, ownDocuments } = await import("../lib/institutions.server");
  const { companyTermsHref } = await import("../lib/scope");
  const links = companyLinks();
  const ownDocs = ownDocuments(rules);
  const elsewhere = Object.fromEntries(Object.values(rules).filter((r) => r.scope !== "general").map((r) => [r.id, companyTermsHref(r, links, ownDocs)]));

  return {
    pinned: { rows },
    elsewhere,
    light,
    productChips,
    dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])),
    today: now,
  };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

// ---------------------------------------------------------------- shelf files (module-level cache)

interface ShelfBundle {
  rules: Record<string, RuleRecord>;
  ruleUses: Record<string, RuleUses>;
}

const shelfPromises = new Map<ShelfId, Promise<ShelfBundle>>();

function fetchShelf(shelf: ShelfId): Promise<ShelfBundle> {
  let p = shelfPromises.get(shelf);
  if (!p) {
    p = fetch(`${import.meta.env.BASE_URL}rules-data/${shelf}.json`).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<ShelfBundle>;
    });
    p.catch(() => shelfPromises.delete(shelf));
    shelfPromises.set(shelf, p);
  }
  return p;
}

// ---------------------------------------------------------------- small parts

/** A text with "{n}" and "{total}" slots: each number isolated. */
function WithNumber({ text, n, total }: { text: string; n?: number; total?: number }) {
  return (
    <>
      {text.split(/(\{n\}|\{total\})/).map((part, i) =>
        part === "{n}" || part === "{total}" ? (
          <bdi key={i} dir="ltr" className="tabular-nums">{fmt.number((part === "{n}" ? n : total) ?? 0)}</bdi>
        ) : (
          part
        ),
      )}
    </>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cx("min-h-target inline-flex items-center gap-1.5 px-3 rounded-md text-sm whitespace-nowrap", on ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent")}
    >
      {children}
    </button>
  );
}

const Num2 = ({ n }: { n: number }) => <bdi dir="ltr" className="tabular-nums opacity-80">{fmt.number(n)}</bdi>;

const monthName = (key: string) => {
  const [y, m] = key.split("-").map(Number) as [number, number];
  return new Intl.DateTimeFormat("he-IL", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
};

/** A filter that shows more than this many rules does not open every group by itself (it would paint hundreds of cards). */
const autoOpenLimit = 120;
const scrollMargin = "scroll-mt-[112px] lg:scroll-mt-[88px]";
const chipRow = "flex gap-2 overflow-x-auto scrollbar-none -mx-gutter px-gutter lg:mx-0 lg:px-0 lg:flex-wrap";

// ---------------------------------------------------------------- page

export default function Rules() {
  const data = useLoaderData<typeof loader>();
  const loc = useLocation();
  const [filters, setFiltersState] = useState<Filters>(emptyFilters);
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const [loaded, setLoaded] = useState<Partial<Record<ShelfId, ShelfBundle>>>({});
  const [failed, setFailed] = useState<Set<ShelfId>>(() => new Set());
  const [target, setTarget] = useState("");
  const requested = useRef(new Set<ShelfId>());
  const scrolledTo = useRef("");
  const landing = useRef<{ id: string; until: number } | null>(null);

  // the address is the state: read it after the first paint (the pre-rendered page has none), and again when a link moves here
  useEffect(() => {
    setFiltersState(parseFilters(window.location.search));
  }, [loc.search]);
  useEffect(() => {
    const land = () => {
      scrolledTo.current = "";
      landing.current = null;
      setTarget(decodeURIComponent(window.location.hash.slice(1)));
    };
    land();
    window.addEventListener("hashchange", land);
    return () => window.removeEventListener("hashchange", land);
  }, [loc.hash]);

  const setFilters = useCallback((patch: Partial<Filters>) => {
    setFiltersState((cur) => {
      const next = { ...cur, ...patch };
      // not a navigation: a router navigation here would reload the page's data on every keystroke
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${filtersToSearch(next)}${window.location.hash}`);
      return next;
    });
  }, []);

  const lightById = useMemo(() => new Map(data.light.map((r) => [r.id, r])), [data.light]);
  const lightHay = useMemo(() => new Map(data.light.map((r) => [r.id, lightHaystack(r)])), [data.light]);
  const rules = useMemo(() => Object.assign({}, ...Object.values(loaded).map((b) => b!.rules)) as Record<string, RuleRecord>, [loaded]);
  const ruleUses = useMemo(() => Object.assign({}, ...Object.values(loaded).map((b) => b!.ruleUses)) as Record<string, RuleUses>, [loaded]);
  const fullHay = useMemo(() => {
    const m = new Map<string, string>();
    for (const b of Object.values(loaded)) for (const r of Object.values(b!.rules)) if (lightById.has(r.id)) m.set(r.id, fullHaystack(r as Parameters<typeof fullHaystack>[0]));
    return m;
  }, [loaded, lightById]);

  const matches = useMemo(() => matchRules(data.light, filters, { light: lightHay, full: fullHay }), [data.light, filters, lightHay, fullHay]);
  const sections = useMemo(() => buildSections(matches, filters.changing), [matches, filters.changing]);
  const filtering = isFiltering(filters);
  const q = norm(filters.q);

  // a hash that names a company's term, which this page no longer lists (D30): on to where it is listed
  const navigate = useNavigate();
  useEffect(() => {
    const to = target ? data.elsewhere[target] : undefined;
    if (to) void navigate(to, { replace: true });
  }, [target, data.elsewhere, navigate]);

  // a hash that names a rule the filters hide (an old link carrying another shelf's filter): on landing, the rule wins and the filters go
  const landed = useRef("");
  useEffect(() => {
    if (!target || landed.current === target) return;
    landed.current = target;
    if (lightById.has(target) && filtering && !matches.some((r) => r.id === target)) {
      setFilters(emptyFilters);
      setOpened(new Set());
    }
  }, [target, lightById, filtering, matches, setFilters]);
  const autoOpen = filtering && matches.length <= autoOpenLimit;
  const isOpen = (g: Group) => autoOpen || opened.has(g.id) || (!!target && (g.id === target || g.ids.includes(target)));

  // which shelf files the page needs now: the shelves of the cards that show, the shelf of the rule the address names, all five for a text search
  const wanted = useMemo(() => {
    const s = new Set<ShelfId>();
    for (const sec of sections) for (const g of sec.groups) if (autoOpen || opened.has(g.id) || (!!target && (g.id === target || g.ids.includes(target)))) for (const id of g.ids) s.add(lightById.get(id)!.shelf);
    const t = lightById.get(target);
    if (t) s.add(t.shelf);
    if (q.length >= 2) for (const sh of shelfIds) s.add(sh);
    return shelfIds.filter((sh) => s.has(sh));
  }, [sections, autoOpen, opened, target, q, lightById]);
  const wantedKey = wanted.join(",");
  useEffect(() => {
    for (const shelf of wantedKey ? (wantedKey.split(",") as ShelfId[]) : []) {
      if (requested.current.has(shelf)) continue;
      requested.current.add(shelf);
      fetchShelf(shelf).then(
        (b) => setLoaded((l) => ({ ...l, [shelf]: b })),
        () => {
          requested.current.delete(shelf);
          setFailed((f) => new Set(f).add(shelf));
        },
      );
    }
  }, [wantedKey]);

  // an anchor to a group or a rule: scroll to it once its group is open and, for a card, its record has landed. Records that land
  // later in groups above it move it down, so the scroll repeats on every change for three seconds, until the reader scrolls or taps.
  useEffect(() => {
    if (!target || scrolledTo.current === target) return;
    const el = document.getElementById(target);
    if (!el) return;
    if (!landing.current) landing.current = { id: target, until: Date.now() + 3000 };
    if (landing.current.id !== target || Date.now() > landing.current.until) {
      scrolledTo.current = target;
      return;
    }
    requestAnimationFrame(() => el.scrollIntoView({ block: "start" }));
  }, [target, loaded, sections, opened]);
  useEffect(() => {
    const stop = () => {
      if (!landing.current) return;
      scrolledTo.current = landing.current.id;
      landing.current = null;
    };
    const events = ["wheel", "touchmove", "keydown", "pointerdown"];
    for (const ev of events) window.addEventListener(ev, stop, { passive: true });
    return () => {
      for (const ev of events) window.removeEventListener(ev, stop);
    };
  }, []);

  const pd = { rules, terms: {}, dimensions: data.dimensions, today: data.today, ruleUses };
  const presetRow = filters.ids.length > 0 ? data.pinned.rows.find((r) => r.ids.join(",") === filters.ids.join(",")) : undefined;

  const prefixes = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of data.light) m.set(r.prefix, (m.get(r.prefix) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [data.light]);
  const shelfCounts = useMemo(() => {
    const m = new Map<ShelfId, number>();
    for (const r of data.light) m.set(r.shelf, (m.get(r.shelf) ?? 0) + 1);
    return m;
  }, [data.light]);
  const changingCount = useMemo(() => data.light.filter((r) => r.recheck_date).length, [data.light]);

  return (
    <PageShell current="rules" data={pd}>
      <div className="pt-2 lg:pt-8 flex flex-col gap-section">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
          <NumberLegend />
          <p className="text-sm text-muted-foreground max-w-measure">{sourceBlock.legendLine}</p>
          <div className="field-box text-muted-foreground lg:max-w-md mt-2">
            <IconSearch size={18} />
            <label htmlFor="rules-filter" className="sr-only">
              {copy.filter}
            </label>
            <input id="rules-filter" dir="rtl" value={filters.q} onChange={(e) => setFilters({ q: e.target.value })} placeholder={copy.filter} className="field-input !text-start text-mixed" autoComplete="off" />
          </div>
          <p className="text-sm text-muted-foreground">
            {copy.questionsLine.before}{" "}
            <Link to="/questions" className="text-link hover:underline">
              {copy.questionsLine.link}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground max-w-measure">
            {scopeWords.rulesLine.before}{" "}
            <Link to="/companies" className="text-link hover:underline">
              {scopeWords.rulesLine.link}
            </Link>
          </p>
        </header>

        <section aria-label={copy.title} className="flex flex-col gap-section">
          <div id="rules-list" className={cx("flex flex-col gap-3", scrollMargin)}>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{copy.filters.shelfLabel}</p>
              <ul className={chipRow}>
                <li className="shrink-0">
                  <Chip on={!filters.shelf} onClick={() => setFilters({ shelf: null })}>
                    {copy.filters.all} <Num2 n={data.light.length} />
                  </Chip>
                </li>
                {shelfIds.map((s) => (
                  <li key={s} className="shrink-0">
                    <Chip on={filters.shelf === s} onClick={() => setFilters({ shelf: filters.shelf === s ? null : s })}>
                      {copy.shelves[s]!.name} <Num2 n={shelfCounts.get(s) ?? 0} />
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">{copy.filters.productLabel}</p>
              <ul className={chipRow}>
                {[{ id: "", name: copy.products.all, n: 0 }, ...data.productChips].map((c) => (
                  <li key={c.id || "all"} className="shrink-0">
                    <Chip on={(filters.product ?? "") === c.id} onClick={() => setFilters({ product: c.id || null })}>
                      {c.name}
                      {c.n > 0 && <Num2 n={c.n} />}
                    </Chip>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="flex flex-wrap gap-2">
              <li>
                <Chip on={filters.changing} onClick={() => setFilters({ changing: !filters.changing })}>
                  {copy.filters.changing} <Num2 n={changingCount} />
                </Chip>
              </li>
            </ul>
            <Disclosure
              key={filters.prefix ? "p" : "n"}
              defaultOpen={!!filters.prefix}
              className="text-sm"
              label={
                <span>
                  {copy.filters.prefixLabel}
                  {filters.prefix && (
                    <>
                      {": "}
                      <bdi dir="ltr" className="slashed-zero">{filters.prefix}</bdi>
                    </>
                  )}
                </span>
              }
            >
              <ul className="flex flex-wrap gap-2 pt-1 pb-2">
                {prefixes.map(([p, n]) => (
                  <li key={p}>
                    <Chip on={filters.prefix === p} onClick={() => setFilters({ prefix: filters.prefix === p ? null : p })}>
                      <bdi dir="ltr" className="font-medium slashed-zero">{p}</bdi>
                      <Num2 n={n} />
                    </Chip>
                  </li>
                ))}
              </ul>
            </Disclosure>
            {filters.ids.length > 0 && (
              <p className="text-sm flex flex-wrap items-center gap-x-2">
                <span className="text-muted-foreground">{copy.filters.preset}</span>
                {presetRow && <span className="font-medium">{presetRow.question}</span>}
                <button type="button" onClick={() => setFilters({ ids: [] })} className="text-link min-h-target inline-flex items-center hover:underline">
                  {copy.filters.presetAll}
                </button>
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-sm text-muted-foreground" role="status">
                {matches.length === 0 ? copy.filters.none : matches.length === 1 ? <WithNumber text={copy.filters.showingOne} total={data.light.length} /> : <WithNumber text={copy.filters.showing} n={matches.length} total={data.light.length} />}
              </p>
              {filtering && (
                <Chip on={false} onClick={() => setFilters(emptyFilters)}>
                  {copy.filters.clear}
                </Chip>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            {sections.map((sec) => {
              const name = sec.shelf ? copy.shelves[sec.shelf]! : null;
              return (
                <section key={sec.shelf ?? "changing"} aria-labelledby={`shelf-${sec.shelf ?? "changing"}`} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 id={`shelf-${sec.shelf ?? "changing"}`} className="text-xl lg:text-2xl font-semibold flex flex-wrap items-baseline gap-x-2">
                      {name ? name.name : copy.changing.title}
                      <span className="text-sm font-normal text-muted-foreground">
                        · <Num2 n={sec.count} />
                      </span>
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-measure">{name ? name.line : copy.changing.line}</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {sec.groups.map((g) => (
                      <GroupBlock
                        key={g.id}
                        g={g}
                        open={isOpen(g)}
                        onToggle={(now) => setOpened((o) => { if (now === o.has(g.id)) return o; const n = new Set(o); if (now) n.add(g.id); else n.delete(g.id); return n; })}
                        pd={pd}
                        failed={failed}
                        lightById={lightById}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function GroupBlock({ g, open, onToggle, pd, failed, lightById }: { g: Group; open: boolean; onToggle: (open: boolean) => void; pd: Parameters<typeof RuleCard>[0]["data"]; failed: Set<ShelfId>; lightById: Map<string, LightRule> }) {
  const title = g.kind === "experience" ? copy.experience.title : g.kind === "month" ? `${copy.changing.month.replace("{month}", monthName(g.month!))} ${g.month!.slice(0, 4)}` : (copy.subgroups[g.file!] ?? topicName(g.file!));
  const missing = open && g.ids.some((id) => !pd.rules[id]);
  const broken = missing && g.ids.some((id) => !pd.rules[id] && failed.has(lightById.get(id)!.shelf));
  return (
    <FoldGroup variant="section" id={g.id} className={scrollMargin} title={title} count={g.ids.length} open={open} onOpenChange={onToggle}>
      {open && (
        <>
          {g.kind === "experience" && (
            <p className="text-sm text-muted-foreground max-w-measure flex flex-wrap items-center gap-2 pb-1">
              <Tag tone="neutral">{ruleCardMore.experienceTag}</Tag>
              {copy.experience.line}
            </p>
          )}
          <ul className="grid gap-4 lg:grid-cols-2 pt-2">
            {g.ids.filter((id) => pd.rules[id]).map((id) => (
              <Card as="li" key={id} id={id} className={cx("min-w-0 [overflow-wrap:anywhere] flex flex-col", scrollMargin)}>
                <RuleCard id={id} data={pd} inline />
              </Card>
            ))}
          </ul>
          {missing && (
            <p className="text-sm text-muted-foreground py-2" role="status">
              {broken ? system.wentWrong.title : system.loading}
            </p>
          )}
        </>
      )}
    </FoldGroup>
  );
}
