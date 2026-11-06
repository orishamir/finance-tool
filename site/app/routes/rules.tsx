// The rules page (founder, 2026-10-24 evening; rebuilt 2026-11-01): a field that takes what a person was told or read, and every rule
// under /rules, one list, with filters. Nothing typed: the filters, the groups and the "הידעת?" block. A claim typed: what the law and
// the rules say, then what each company wrote, named. All state lives in the address (?shelf=&product=&prefix=&changing=1&ids=&q=), so
// a link can preset it. Light on purpose: the page ships a light list of all rules; the full records and their uses come per shelf from
// /rules-data/<shelf>.json, fetched when a group opens, a filter or a claim shows cards, or the address names a rule.
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/rules";
import { rulesFront as copy, scopeWords, site, sourceBlock, system, topicName, ruleCardMore } from "../copy";
import { NumberLegend, RuleCard, SlottedText, type RuleUses } from "../components/provenance";
import { useSearchIndex } from "../components/search";
import { PageShell } from "../components/shell";
import { AskField, Button, Card, cx, DidYouKnow, Disclosure, FilterChip, FoldGroup, PHONE_GONE, TableCols, Tag, useSoftSwap, type FactItem } from "../components/kit";
import { claimTopics, docGroup, docGroups, docsForTopics, editionText, pageHref, type CompanyDoc, type DocGroup } from "../lib/company-docs";
import { fmt } from "../lib/format";
import { buildSections, emptyFilters, facetCounts, filtersToSearch, isFiltering, isNarrowing, matchRules, parseFilters, passesFilters, type Filters, type Group, type LightRule } from "../lib/rules-filter";
import { shelfIds, type ShelfId } from "../lib/rule-shelves";
import { ruleTitle } from "../lib/rule-title";
import { analyze, isRuleKind, relaxedHits, searchEntries } from "../lib/search";
import { pickSources, type SourcedRule } from "../lib/sources";
import type { RuleRecord } from "@finance-tool/schema";

/** A rule's title for a list: the record's Hebrew title or text; never the English working title (the topic's Hebrew name stands in). */
function listTitle(r: Parameters<typeof ruleTitle>[0] & { il_finance_file: string }): string {
  const t = ruleTitle(r);
  return t.english ? topicName(r.il_finance_file) : t.text;
}

export async function loader() {
  const { loadChecklistRows, loadPinnedRules, loadRules, loadProducts, today } = await import("../lib/data.server");
  const { ruleProducts, ruleScores } = await import("../lib/rule-uses.server");
  const { shelfOf } = await import("../lib/rule-shelves");
  const { loadCompanyDocRows } = await import("../lib/documents.server");
  const rules = loadRules();
  // D30 (spec 2026-10-25-rules-scope §4): the list holds general rules only; a company's term is on that company's page, and a claim finds it, named
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
    ...loadProducts()
      .filter((w) => productCounts.has(w.id))
      .map((w) => ({ id: w.id, name: w.names.he[0] ?? w.id }))
      .sort((a, b) => productCounts.get(b.id)! - productCounts.get(a.id)! || a.name.localeCompare(b.name, "he")),
    ...(productCounts.has("common") ? [{ id: "common", name: copy.products.common }] : []),
    ...(productCounts.has("tier2") ? [{ id: "tier2", name: copy.products.tier2 }] : []),
  ];

  // an old address that names a company's term (/rules#CS-30) goes on to where that term is listed now (D30)
  const { companyLinks, ownDocuments } = await import("../lib/institutions.server");
  const { companyTermsHref } = await import("../lib/scope");
  const links = companyLinks();
  const ownDocs = ownDocuments(rules);
  const elsewhere = Object.fromEntries(Object.values(rules).filter((r) => r.scope !== "general").map((r) => [r.id, companyTermsHref(r, links, ownDocs)]));

  // the facts: the sentence, where it comes from, and the record of a rule whose figure fills a slot
  const facts = pinned.facts.map((f) => {
    const source = pickSources(rules[f.id] as unknown as SourcedRule)[0];
    return { id: f.id, text: f.text_he, source: source?.publisher_he ?? source?.publisher ?? "" };
  });
  const factRules = Object.fromEntries(pinned.facts.filter((f) => f.text_he.includes("{")).map((f) => [f.id, rules[f.id]!]));

  const companyDocs: CompanyDoc[] = loadCompanyDocRows().map((d) => ({ id: d.id, company: d.publisher_he, title: d.title_he, version: d.version ?? null, url: d.official_url, group: docGroup(d.publisher_he, d.doc_kind), topics: d.topics }));

  return {
    pinned: { rows },
    elsewhere,
    light,
    productChips,
    facts,
    factRules,
    companyDocs: companyDocs.sort((a, b) => a.company.localeCompare(b.company, "he")),
    dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])),
    today: now,
  };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

// ---------------------------------------------------------------- record files (module-level cache)

interface ShelfBundle {
  rules: Record<string, RuleRecord>;
  ruleUses: Record<string, RuleUses>;
}

/** A shelf of general rules, or the file of the companies' terms. */
type BundleId = ShelfId | "companies";

const shelfPromises = new Map<BundleId, Promise<ShelfBundle>>();

function fetchShelf(shelf: BundleId): Promise<ShelfBundle> {
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

/** A text with "{n}", "{c}" and "{total}" slots: each number isolated. */
function WithNumber({ text, n, c, total }: { text: string; n?: number; c?: number; total?: number }) {
  return (
    <>
      {text.split(/(\{n\}|\{c\}|\{total\})/).map((part, i) =>
        part === "{n}" || part === "{c}" || part === "{total}" ? (
          <bdi key={i} dir="ltr" className="tabular-nums">{fmt.number((part === "{n}" ? n : part === "{c}" ? c : total) ?? 0)}</bdi>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** While a record file is on its way, or if it failed. */
const RecordsStatus = ({ broken }: { broken: boolean }) => (
  <p className="text-sm text-muted-foreground py-2" role="status">
    {broken ? system.wentWrong.title : system.loading}
  </p>
);

const Num2 = ({ n }: { n: number }) => <bdi dir="ltr" className="tabular-nums opacity-80">{fmt.number(n)}</bdi>;

const monthName = (key: string) => {
  const [y, m] = key.split("-").map(Number) as [number, number];
  return new Intl.DateTimeFormat("he-IL", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
};

/** A filter that shows more than this many rules does not open every group by itself (it would paint hundreds of cards). */
const autoOpenLimit = 120;
/** How many cards a claim shows before "all of them": the first are what it is about. */
const claimFirst = 6;
/** The field's text reaches the search when the hand rests this long. */
const claimRest = 150;
const scrollMargin = "scroll-mt-[112px] lg:scroll-mt-[88px]";
const chipRow = "flex gap-2 overflow-x-auto scrollbar-none -mx-gutter px-gutter lg:mx-0 lg:px-0 lg:flex-wrap";

// ---------------------------------------------------------------- page

export default function Rules() {
  const data = useLoaderData<typeof loader>();
  const loc = useLocation();
  const [filters, setFiltersState] = useState<Filters>(emptyFilters);
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [lawAll, setLawAll] = useState(false);
  const [prefixOpen, setPrefixOpen] = useState(false);
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const [shut, setShut] = useState<Set<string>>(() => new Set());
  const [loaded, setLoaded] = useState<Partial<Record<BundleId, ShelfBundle>>>({});
  const [failed, setFailed] = useState<Set<BundleId>>(() => new Set());
  const [target, setTarget] = useState("");
  const requested = useRef(new Set<BundleId>());
  const scrolledTo = useRef("");
  const landing = useRef<{ id: string; until: number } | null>(null);
  const typing = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /** The claim the field last gave the search: a newer one may be in the field already, and must not be overwritten. */
  const committed = useRef("");

  // the address is the state: read it after the first paint (the pre-rendered page has none), and again when a link moves here
  useEffect(() => {
    if (loc.hash && !loc.search) return; // a link to a rule on this page keeps the filters; if they hide it, the landing below drops them
    committed.current = parseFilters(window.location.search).q;
    setText(committed.current);
    setFiltersState(parseFilters(window.location.search));
  }, [loc.key, loc.hash, loc.search]);
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
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${filtersToSearch(next)}${next.q ? "" : window.location.hash}`);
      return next;
    });
  }, []);

  // the field answers at once; the search and its cards wait until the hand rests. Whatever else changes the claim (the address, a landing) writes the field.
  useEffect(() => {
    if (filters.q === committed.current) return;
    committed.current = filters.q;
    setText(filters.q);
  }, [filters.q]);
  const typed = useCallback(
    (value: string, now = false) => {
      setText(value);
      setLawAll(false);
      clearTimeout(typing.current);
      const commit = () => {
        committed.current = value;
        setTarget("");
        setFilters({ q: value });
      };
      if (now || !value) commit();
      else typing.current = setTimeout(commit, claimRest);
    },
    [setFilters],
  );
  useEffect(() => () => clearTimeout(typing.current), []);

  useEffect(() => {
    if (filters.prefix) setPrefixOpen(true);
  }, [filters.prefix]);

  const claim = filters.q.trim();
  const { index, texts } = useSearchIndex(focused || !!claim, claim);
  const found = useMemo(() => {
    if (!claim || !index) return null;
    let hits = searchEntries(index, claim, texts).filter((h) => isRuleKind(h.entry.kind));
    let near = false;
    if (hits.length === 0) {
      hits = relaxedHits(index, texts, analyze(claim), 8).filter((h) => isRuleKind(h.entry.kind));
      near = hits.length > 0;
    }
    const keys = (kind: string) => [...new Set(hits.filter((h) => h.entry.kind === kind).map((h) => h.entry.key ?? ""))].filter(Boolean);
    const names = new Map(hits.map((h) => [h.entry.key ?? "", h.entry.name]));
    return { law: keys("rule"), company: keys("companyRule"), names, near, docs: docsForTopics(data.companyDocs, claimTopics(claim)) };
  }, [claim, index, texts, data.companyDocs]);

  const lightById = useMemo(() => new Map(data.light.map((r) => [r.id, r])), [data.light]);
  const rules = useMemo(() => Object.assign({}, ...Object.values(loaded).map((b) => b!.rules)) as Record<string, RuleRecord>, [loaded]);
  const ruleUses = useMemo(() => Object.assign({}, ...Object.values(loaded).map((b) => b!.ruleUses)) as Record<string, RuleUses>, [loaded]);

  // the rules a chip counts: all of them, or those the claim found
  const pool = useMemo(() => (found ? found.law.map((id) => lightById.get(id)).filter((r): r is LightRule => !!r) : data.light), [found, lightById, data.light]);
  const counts = useMemo(() => facetCounts(pool, filters), [pool, filters]);
  // the chips answer at once; the list and its cards, which can be hundreds, follow when the browser is free
  const listFilters = useDeferredValue(filters);
  const matches = useMemo(() => (claim ? pool.filter((r) => passesFilters(r, listFilters)) : matchRules(data.light, { ...listFilters, q: "" }, { light: new Map(), full: new Map() })), [claim, pool, listFilters, data.light]);
  const shownLaw = useMemo(() => (claim ? (lawAll ? matches : matches.slice(0, claimFirst)) : []), [claim, lawAll, matches]);
  const sections = useMemo(() => (claim ? [] : buildSections(matches, listFilters.changing)), [claim, matches, listFilters.changing]);
  const filtering = isFiltering(filters);
  const narrowing = isNarrowing(filters);

  // a hash that names a company's term, which this page no longer lists (D30): on to where it is listed
  const navigate = useNavigate();
  useEffect(() => {
    const to = target ? data.elsewhere[target] : undefined;
    if (to) void navigate(to, { replace: true });
  }, [target, data.elsewhere, navigate]);

  // a hash that names a rule the filters hide (an old link carrying another shelf's filter), or a rule's chip inside a claim's results: on landing, the rule wins and the filters go
  const landed = useRef("");
  useEffect(() => {
    if (!target || landed.current === target) return;
    landed.current = target;
    const rule = lightById.get(target);
    if (rule && filtering && (!!claim || !passesFilters(rule, filters))) {
      setFilters(emptyFilters);
      setOpened(new Set());
    }
  }, [target, lightById, filtering, claim, filters, setFilters]);
  const autoOpen = isNarrowing(listFilters) && matches.length <= autoOpenLimit;
  // a filter's opening is not the reader's: only a press the page did not already show counts, and a fold the reader shut stays shut until the filters or the target change
  const isOpen = (g: Group) => !shut.has(g.id) && (autoOpen || opened.has(g.id) || (!!target && (g.id === target || g.ids.includes(target))));
  const toggled = (g: Group, now: boolean) => {
    if (now === isOpen(g)) return;
    setOpened((o) => {
      const n = new Set(o);
      if (now) n.add(g.id);
      else n.delete(g.id);
      return n;
    });
    setShut((o) => {
      const n = new Set(o);
      if (now) n.delete(g.id);
      else n.add(g.id);
      return n;
    });
  };
  useEffect(() => setShut(new Set()), [listFilters, target]);

  // which record files the page needs now: the shelves of the cards that show, the shelf of the rule the address names, the companies' terms when a claim found some
  const wanted = useMemo(() => {
    const s = new Set<BundleId>();
    for (const sec of sections) for (const g of sec.groups) if (autoOpen || opened.has(g.id) || (!!target && (g.id === target || g.ids.includes(target)))) for (const id of g.ids) s.add(lightById.get(id)!.shelf);
    for (const r of shownLaw) s.add(r.shelf);
    const t = lightById.get(target);
    if (t) s.add(t.shelf);
    if (claim && found && found.company.length > 0) s.add("companies");
    return [...shelfIds, "companies" as const].filter((sh) => s.has(sh));
  }, [sections, autoOpen, opened, target, lightById, shownLaw, claim, found]);
  const wantedKey = wanted.join(",");
  useEffect(() => {
    for (const shelf of wantedKey ? (wantedKey.split(",") as BundleId[]) : []) {
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
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([p]) => p);
  }, [data.light]);

  // the facts that fit the filters come first, and three always show
  const facts = useMemo(() => {
    const fits = (id: string) => {
      const r = lightById.get(id);
      return !!r && passesFilters(r, { ...filters, ids: [] });
    };
    return [...data.facts.filter((f) => fits(f.id)), ...data.facts.filter((f) => !fits(f.id))];
  }, [data.facts, filters, lightById]);
  const factItems: FactItem[] = facts.map((f) => ({
    id: f.id,
    body: <SlottedText text={f.text} rules={data.factRules as Record<string, RuleRecord>} today={data.today} />,
    source: f.source,
    action: (
      <Button
        variant="quiet"
        className="!px-0 text-start"
        onClick={() => {
          setFilters({ ...emptyFilters, ids: [f.id] });
          requestAnimationFrame(() => document.getElementById("rules-status")?.scrollIntoView({ block: "start", behavior: "smooth" }));
        }}
      >
        <bdi dir="ltr" className="font-medium tabular-nums slashed-zero">{f.id}</bdi>
        <span>· {copy.facts.toRule}</span>
      </Button>
    ),
  }));

  const statusLine = claim ? (
    !found ? (
      system.loading
    ) : found.law.length + found.company.length + found.docs.length === 0 ? (
      copy.claim.nothing
    ) : (
      <>
        {found.near && copy.claim.near}
        <WithNumber text={matches.length === 0 ? copy.claim.foundNone : matches.length === 1 ? copy.claim.foundOne : copy.claim.found} n={matches.length} />
        {found.company.length + found.docs.length > 0 && <WithNumber text={copy.claim.atCompanies} c={found.company.length + found.docs.length} />}
      </>
    )
  ) : matches.length === 0 ? (
    copy.filters.none
  ) : matches.length === 1 ? (
    <WithNumber text={copy.filters.showingOne} total={data.light.length} />
  ) : (
    <WithNumber text={copy.filters.showing} n={matches.length} total={data.light.length} />
  );

  const filterRows = (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{copy.filters.shelfLabel}</p>
        <ul className={chipRow}>
          <li className="shrink-0">
            <FilterChip on={!filters.shelf} count={counts.all} onClick={() => setFilters({ shelf: null, ids: [] })}>
              {copy.filters.all}
            </FilterChip>
          </li>
          {shelfIds.map((s) => (
            <li key={s} className="shrink-0">
              <FilterChip on={filters.shelf === s} count={counts.shelf.get(s) ?? 0} onClick={() => setFilters({ shelf: filters.shelf === s ? null : s, ids: [] })}>
                {copy.shelves[s]!.name}
              </FilterChip>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">{copy.filters.productLabel}</p>
        <ul className={chipRow}>
          <li className="shrink-0">
            <FilterChip on={!filters.product} onClick={() => setFilters({ product: null, ids: [] })}>
              {copy.products.all}
            </FilterChip>
          </li>
          {data.productChips.map((c) => (
            <li key={c.id} className="shrink-0">
              <FilterChip on={filters.product === c.id} count={counts.product.get(c.id) ?? 0} onClick={() => setFilters({ product: filters.product === c.id ? null : c.id, ids: [] })}>
                {c.name}
              </FilterChip>
            </li>
          ))}
        </ul>
      </div>
      <ul className="flex flex-wrap gap-2">
        <li>
          <FilterChip on={filters.changing} count={counts.changing} onClick={() => setFilters({ changing: !filters.changing, ids: [] })}>
            {copy.filters.changing}
          </FilterChip>
        </li>
      </ul>
      <Disclosure
        open={prefixOpen}
        onOpenChange={setPrefixOpen}
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
          {prefixes.map((p) => (
            <li key={p}>
              <FilterChip on={filters.prefix === p} count={counts.prefix.get(p) ?? 0} onClick={() => setFilters({ prefix: filters.prefix === p ? null : p, ids: [] })}>
                <bdi dir="ltr" className="font-medium slashed-zero">{p}</bdi>
              </FilterChip>
            </li>
          ))}
        </ul>
      </Disclosure>
    </div>
  );

  const swap = useSoftSwap<HTMLDivElement>(claim ? `q:${claim}:${matches.length}` : filtersToSearch(listFilters));

  return (
    <PageShell current="rules" data={pd}>
      <div className="pt-2 lg:pt-8 flex flex-col gap-5">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
          <p className="text-base lg:text-lg text-muted-foreground max-w-measure">{copy.lede}</p>
          <div className="mt-1.5">
            <AskField value={text} onChange={(v) => typed(v)} onFocus={() => setFocused(true)} label={copy.ask.label} placeholder={copy.ask.placeholder} clearLabel={copy.ask.clear} />
          </div>
          {!text && (
            <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3.5">
              <span>{copy.ask.examplesLead}</span>
              {copy.ask.examples.map((e) => (
                <Button key={e} variant="quiet" className="!px-0 max-lg:text-start" onClick={() => typed(e, true)}>
                  {e}
                </Button>
              ))}
            </p>
          )}
        </header>

        <div className="flex flex-col gap-2.5">
          {claim ? <Disclosure key="claim-filters" defaultOpen={narrowing} label={<span className="text-sm">{copy.claim.filters}</span>}>{filterRows}</Disclosure> : filterRows}
          {presetRow && (
            <p className="text-sm flex flex-wrap items-center gap-x-2">
              <span className="text-muted-foreground">{copy.filters.preset}</span>
              <span className="font-medium">{presetRow.question}</span>
            </p>
          )}
          <div id="rules-status" className={cx("flex flex-wrap items-center gap-x-3 gap-y-1 min-h-target", scrollMargin)}>
            <p className="text-sm text-muted-foreground" role="status">
              {statusLine}
            </p>
            <span className={cx("transition-opacity duration-[var(--duration-base)] ease-standard", !narrowing && "invisible opacity-0")}>
              <FilterChip on={false} onClick={() => setFilters({ ...emptyFilters, q: filters.q })}>
                {copy.filters.clear}
              </FilterChip>
            </span>
          </div>
        </div>

        <div className={cx("grid gap-6 items-start grid-cols-[minmax(0,1fr)]", !claim && "lg:grid-cols-[minmax(0,1fr)_320px]")}>
          <div ref={swap} className="@container flex flex-col gap-7 min-w-0">
            {claim ? (
              found && (
                <ClaimResults
                  law={matches}
                  shown={shownLaw}
                  onAll={() => setLawAll(true)}
                  company={found.company}
                  names={found.names}
                  docs={found.docs}
                  pd={pd}
                  failed={failed}
                  lightById={lightById}
                />
              )
            ) : (
              sections.map((sec) => {
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
                          onToggle={(now) => toggled(g, now)}
                          pd={pd}
                          failed={failed}
                          lightById={lightById}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>
          {!claim && <DidYouKnow title={copy.facts.title} items={factItems} more={copy.facts.more} orderKey={facts[0]?.id ?? ""} className="max-lg:order-first lg:sticky lg:top-[72px]" />}
        </div>

        <footer className="flex flex-col gap-2 border-t border-border pt-3 text-[13px] text-muted-foreground max-w-measure">
          <NumberLegend />
          <p>{sourceBlock.legendLine}</p>
          <p>
            {scopeWords.rulesLine.before}{" "}
            <Link to="/companies" className="text-link hover:underline">
              {scopeWords.rulesLine.link}
            </Link>
          </p>
        </footer>
      </div>
    </PageShell>
  );
}

type PageData = Parameters<typeof RuleCard>[0]["data"];

/** What a claim found: the law and the rules first, then each company's own words, named and never as a fact in general (D30). */
function ClaimResults({ law, shown, onAll, company, names, docs, pd, failed, lightById }: { law: LightRule[]; shown: LightRule[]; onAll: () => void; company: string[]; names: Map<string, string>; docs: ReturnType<typeof docsForTopics>; pd: PageData; failed: Set<BundleId>; lightById: Map<string, LightRule> }) {
  const words = copy.claim;
  const [picked, setPicked] = useState<DocGroup>("bank");
  const countOf = (g: DocGroup) => docs.filter((d) => d.group === g).length;
  const group = countOf(picked) > 0 ? picked : (docGroups.find((g) => countOf(g) > 0) ?? picked);
  const missing = shown.some((r) => !pd.rules[r.id]);
  const broken = missing && shown.some((r) => !pd.rules[r.id] && failed.has(lightById.get(r.id)!.shelf));
  return (
    <>
      <section className="flex flex-col gap-2.5">
        <h2 className="text-xl font-semibold flex flex-wrap items-baseline gap-x-2">
          {words.lawTitle}
          <span className="text-sm font-normal text-muted-foreground">
            · <Num2 n={law.length} />
          </span>
        </h2>
        {law.length === 0 && <p className="text-sm text-muted-foreground">{words.lawNone}</p>}
        <ul className="grid gap-3 @3xl:grid-cols-2 items-start">
          {shown.filter((r) => pd.rules[r.id]).map((r) => (
            <Card as="li" key={r.id} id={r.id} className={cx("min-w-0 [overflow-wrap:anywhere] flex flex-col", scrollMargin)}>
              <RuleCard id={r.id} data={pd} inline />
            </Card>
          ))}
        </ul>
        {missing && (
          <RecordsStatus broken={broken} />
        )}
        {law.length > shown.length && (
          <Button variant="quiet" className="!px-0 self-start" onClick={onAll}>
            <WithNumber text={words.lawAll} n={law.length} />
          </Button>
        )}
      </section>
      <section className="flex flex-col gap-2.5">
        <h2 className="text-xl font-semibold">{words.companiesTitle}</h2>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{words.companiesNone}</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground max-w-measure">{words.companiesLine}</p>
            <ul className="flex flex-wrap gap-2">
              {docGroups.map((g) => (
                <li key={g}>
                  <FilterChip on={group === g} count={countOf(g)} onClick={() => setPicked(g)}>
                    {words.groups[g]}
                  </FilterChip>
                </li>
              ))}
            </ul>
            <table className="tbl text-sm">
              <TableCols widths={[{ pc: "24%", phone: "auto" }, { pc: "auto", phone: "0" }, { pc: "92px", phone: "0" }, { pc: "150px", phone: "112px" }]} />
              <thead>
                <tr>
                  <th scope="col">{words.cols.company}</th>
                  <th scope="col" className={PHONE_GONE}>{words.cols.document}</th>
                  <th scope="col" className={PHONE_GONE}>{words.cols.edition}</th>
                  <th scope="col">{words.cols.where}</th>
                </tr>
              </thead>
              <tbody>
                {docs.filter((d) => d.group === group).map((d) => (
                  <tr key={d.id}>
                    <th scope="row" className="font-medium align-top">
                      <bdi>{d.company}</bdi>
                      <span className="md:hidden block font-normal text-[13px] text-muted-foreground">{d.title}</span>
                    </th>
                    <td className={cx(PHONE_GONE, "align-top")}>{d.title}</td>
                    <td className={cx(PHONE_GONE, "align-top tabular-nums")}>{editionText(d.version) ?? words.noEdition}</td>
                    <td className="align-top">
                      <span className="flex flex-col lg:flex-row lg:flex-wrap lg:gap-x-2">
                        {d.pages.map((p) => (
                          <a key={p} href={pageHref(d.url, p)} target="_blank" rel="noreferrer" className="text-link hover:underline whitespace-nowrap min-h-target lg:min-h-0 inline-flex items-center gap-1">
                            <WithNumber text={words.page} n={p} />
                            <span className="text-[13px]" aria-hidden="true">↗</span>
                          </a>
                        ))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {company.length > 0 && (
          <>
            <h3 className="font-semibold mt-1.5">{words.companyRead}</h3>
            <div className="flex flex-col gap-2">
              {company.slice(0, claimFirst).map((id) => (
                <FoldGroup key={id} variant="section" level={4} title={<span className="text-base font-medium"><bdi dir="ltr" className="tabular-nums slashed-zero">{id}</bdi> · {names.get(id)}</span>}>
                  {pd.rules[id] ? <RuleCard id={id} data={pd} inline /> : <RecordsStatus broken={failed.has("companies")} />}
                </FoldGroup>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

function GroupBlock({ g, open, onToggle, pd, failed, lightById }: { g: Group; open: boolean; onToggle: (open: boolean) => void; pd: PageData; failed: Set<BundleId>; lightById: Map<string, LightRule> }) {
  const title = g.kind === "experience" ? copy.experience.title : g.kind === "month" ? `${copy.changing.month.replace("{month}", monthName(g.month!))} ${g.month!.slice(0, 4)}` : (copy.subgroups[g.file!] ?? topicName(g.file!));
  const missing = open && g.ids.some((id) => !pd.rules[id]);
  const broken = missing && g.ids.some((id) => !pd.rules[id] && failed.has(lightById.get(id)!.shelf));
  // once opened, the cards stay in the page, so the fold can close by height
  const wasOpen = useRef(false);
  wasOpen.current ||= open;
  return (
    <FoldGroup variant="section" id={g.id} className={scrollMargin} title={title} count={g.ids.length} open={open} onOpenChange={onToggle}>
      {wasOpen.current && (
        <>
          {g.kind === "experience" && (
            <p className="text-sm text-muted-foreground max-w-measure flex flex-wrap items-center gap-2 pb-1">
              <Tag tone="neutral">{ruleCardMore.experienceTag}</Tag>
              {copy.experience.line}
            </p>
          )}
          <ul className="grid gap-4 @3xl:grid-cols-2 pt-2">
            {g.ids.filter((id) => pd.rules[id]).map((id) => (
              <Card as="li" key={id} id={id} className={cx("min-w-0 [overflow-wrap:anywhere] flex flex-col", scrollMargin)}>
                <RuleCard id={id} data={pd} inline />
              </Card>
            ))}
          </ul>
          {missing && (
            <RecordsStatus broken={broken} />
          )}
        </>
      )}
    </FoldGroup>
  );
}
