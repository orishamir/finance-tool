// The rules page: every general rule as a compact row, and a rule's whole record opened from its row. Nothing typed: the products (a
// list beside the rules on a computer, a button that opens it on a phone), the five questions as tabs, and each question's rules by the
// rule-base file they come from; "הידעת?" below them. Something typed: the closest match drawn larger, the other rules as rows, and what
// each company wrote in a tab of its own; a rule's id typed is its match. A rule opens beside the list on a computer and on a screen of
// its own below 1280 px, with a way back to where the list was. The address holds the state (?product=&shelf=&changing=1&q=, and the
// open rule as #ID), so a link presets it. The page ships a light list of every rule (what a row shows); the full records and their uses
// come per shelf from /rules-data/<shelf>.json, fetched for the rule that is open and the search's top match.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import { rulesFront as copy, scopeWords, site, sourceBlock, system, topicName } from "../copy";
import { NumberLegend, RuleCard, RuleDetail, SlottedText, StrengthLabel, TopMatch, type RuleUses } from "../components/provenance";
import { useSearchIndex } from "../components/search";
import { PageShell } from "../components/shell";
import { Sheet } from "../components/Sheet";
import { IconAll, IconArrowBack, IconChevronDown } from "../components/icons";
import { AskField, Button, Card, CheckField, cx, gershayim, DidYouKnow, FilterChip, FoldGroup, GroupHead, InlineSelect, ListRow, PHONE_GONE, RowList, SelectField, TabStrip, TableCols, Tag, When, panelId, tabId, type FactItem } from "../components/kit";
import { claimTopics, docGroup, docGroups, docsForTopics, editionText, pageHref, type CompanyDoc, type DocGroup } from "../lib/company-docs";
import { fmt } from "../lib/format";
import { emptyFilters, facetCounts, filtersToSearch, groupProducts, idInField, parseFilters, passesFilters, shelfGroups, shownShelf, type Filters, type LightRule } from "../lib/rules-filter";
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
  const { loadChecklistRows, loadPinnedRules, loadPublishersHe, loadRules, loadProducts, today } = await import("../lib/data.server");
  const { ruleProducts, ruleScores } = await import("../lib/rule-uses.server");
  const { shelfOf } = await import("../lib/rule-shelves");
  const { firstSentence, rowPills, rowSource } = await import("../lib/rule-row");
  const { loadCompanyDocRows } = await import("../lib/documents.server");
  const rules = loadRules();
  // D30: the list holds general rules only; a company's term is on that company's page, and a search finds it, named
  const all = Object.values(rules).filter((r) => r.scope === "general");
  const now = today();
  const year = Number(now.slice(0, 4));
  const scores = ruleScores();
  const products = ruleProducts();
  const pinned = loadPinnedRules();
  const publishersHe = loadPublishersHe();

  const light: LightRule[] = all
    .map((r) => {
      const src = rowSource(r as unknown as SourcedRule, publishersHe);
      return {
        id: r.id,
        title: listTitle(r),
        shelf: shelfOf(r),
        file: r.il_finance_file,
        strength: r.strength,
        likely_to_change: r.likely_to_change,
        recheck_date: r.recheck_date,
        score: scores[r.id] ?? 0,
        products: products[r.id] ?? [],
        lead: firstSentence(r.text_he),
        pills: rowPills(r, year),
        authority: src.authority,
        sources: src.count,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));

  const has = new Set(light.flatMap((r) => r.products));
  const productNames = [
    ...loadProducts()
      .filter((w) => has.has(w.id))
      .map((w) => ({ id: w.id, name: w.names.he[0] ?? w.id })),
    ...(has.has("common") ? [{ id: "common", name: copy.products.common }] : []),
    ...(has.has("tier2") ? [{ id: "tier2", name: copy.products.tier2 }] : []),
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
    elsewhere,
    light,
    productNames,
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

/** A text with "{n}" slots: each number isolated. */
function WithNumber({ text, n }: { text: string; n: number }) {
  return (
    <>
      {text.split(/(\{n\})/).map((part, i) =>
        part === "{n}" ? (
          <bdi key={i} dir="ltr" className="tabular-nums">
            {fmt.number(n)}
          </bdi>
        ) : (
          part
        ),
      )}
    </>
  );
}

const countWords = (n: number) => (n === 1 ? copy.nav.countOne : <WithNumber text={copy.nav.count} n={n} />);

/** While a record file is on its way, or if it failed. */
const RecordsStatus = ({ broken }: { broken: boolean }) => (
  <p className="text-sm text-muted-foreground py-2" role="status">
    {broken ? system.wentWrong.title : system.loading}
  </p>
);

/** How many rows a search shows under its closest match before "all of them". */
const claimFirst = 9;
/** How many of the companies' own terms a search shows. */
const companyFirst = 6;
/** The field's text reaches the search when the hand rests this long. */
const claimRest = 150;
/** At this width and wider the rule opens beside the list; narrower, on a screen of its own. */
const WIDE = "(min-width: 1280px)";
const isWide = () => typeof window !== "undefined" && window.matchMedia(WIDE).matches;
const DETAIL = "rule-detail";
const DETAIL_HEAD = "rule-detail-head";
const rowId = (id: string) => `row-${id}`;

/** One rule as a row: its title, its first sentence, its own numbers, its first source and how many, when it will be checked again, its id. */
function RuleRow({ r, selected, onOpen }: { r: LightRule; selected: boolean; onOpen: (id: string) => void }) {
  const pills = r.pills.slice(0, 2);
  const more = r.pills.length - pills.length;
  const chips =
    r.strength === "open" || pills.length > 0 ? (
      <>
        {r.strength === "open" && <StrengthLabel strength="open" />}
        {pills.map((p, i) => (
          <Tag key={i} tone="neutral" className="tabular-nums">
            <bdi dir="ltr">{p.text}</bdi>
            {p.word}
          </Tag>
        ))}
        {more > 0 && <span className="text-xs text-muted-foreground">{copy.row.more.replace("{n}", String(more))}</span>}
      </>
    ) : undefined;
  return (
    <ListRow
      rowId={rowId(r.id)}
      controls={DETAIL}
      title={gershayim(r.title)}
      lead={gershayim(r.lead)}
      end={<bdi dir="ltr" className="tabular-nums slashed-zero">{r.id}</bdi>}
      chips={chips}
      meta={
        <>
          {gershayim(r.authority)}
          {r.sources > 0 && <span className="max-md:hidden"> · {r.sources === 1 ? copy.row.sourceOne : <WithNumber text={copy.row.sources} n={r.sources} />}</span>}
          {r.recheck_date && (
            <span className="text-caution-foreground">
              {" · "}
              <When iso={r.recheck_date} lead={`${copy.row.recheck} `} />
            </span>
          )}
        </>
      }
      selected={selected}
      onSelect={() => onOpen(r.id)}
    />
  );
}

/** A question's rules, by the rule-base file they come from: each group's name and count, then its rows in one box. */
function RuleGroups({ rules, shelf, lightById, selected, onOpen }: { rules: LightRule[]; shelf: ShelfId; lightById: Map<string, LightRule>; selected: string; onOpen: (id: string) => void }) {
  const groups = shelfGroups(rules, shelf);
  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => {
        const name = copy.subgroups[g.file] ?? topicName(g.file);
        return (
          <section key={g.id} aria-label={name} className="flex flex-col gap-2">
            <GroupHead count={fmt.number(g.ids.length)}>{name}</GroupHead>
            <RowList>
              {g.ids.map((id) => (
                <RuleRow key={id} r={lightById.get(id)!} selected={selected === id} onOpen={onOpen} />
              ))}
            </RowList>
          </section>
        );
      })}
    </div>
  );
}

/** The products by group: "כל המוצרים" first, marked apart by an icon, each line with how many rules it holds; the chosen one filled and bold with a bar at its start. */
function ProductList({ names, counts, total, current, onPick }: { names: Map<string, string>; counts: Map<string, number>; total: number; current: string | null; onPick: (id: string | null) => void }) {
  const groups = groupProducts([...names.keys()]);
  const line = (id: string | null, name: string, n: number, all = false) => (
    <button
      key={id ?? "all"}
      type="button"
      aria-pressed={current === id}
      onClick={() => onPick(id)}
      className={cx("relative w-full min-h-target xl:tap-area flex", all ? "xl:min-h-11" : "xl:min-h-9", "items-center justify-between gap-3 px-3 rounded-md text-start text-sm transition-colors duration-[var(--duration-fast)]", current === id ? "bg-accent font-semibold" : "hover:bg-accent/50")}
    >
      {current === id && <span aria-hidden="true" className="absolute inset-y-1.5 start-0 w-[3px] rounded-full bg-primary" />}
      <span className={cx("min-w-0", all && "flex items-center gap-2.5 font-medium")}>
        {all && (
          <span className={cx("grid place-items-center size-7 rounded-md text-primary shrink-0", current === null ? "bg-background" : "bg-accent")}>
            <IconAll size={16} />
          </span>
        )}
        {gershayim(name)}
      </span>
      <bdi dir="ltr" className="shrink-0 text-[13px] font-normal tabular-nums text-muted-foreground">
        {fmt.number(n)}
      </bdi>
    </button>
  );
  return (
    <div className="flex flex-col gap-5">
      {line(null, copy.products.all, total, true)}
      {groups.map((g) => (
        <div key={g.id} role="group" aria-labelledby={`products-${g.id}`} className="flex flex-col gap-0.5">
          <GroupHead id={`products-${g.id}`} className="ps-3 pb-1">
            {copy.nav.groups[g.id] ?? g.id}
          </GroupHead>
          {g.ids.map((id) => line(id, names.get(id) ?? id, counts.get(id) ?? 0))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- page

export default function Rules() {
  const data = useLoaderData<typeof loader>();
  const loc = useLocation();
  const navigate = useNavigate();
  const [filters, setFiltersState] = useState<Filters>(emptyFilters);
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [lawAll, setLawAll] = useState(false);
  const [claimTab, setClaimTab] = useState<"law" | "companies">("law");
  const [picker, setPicker] = useState(false);
  const [filterSheet, setFilterSheet] = useState(false);
  const [target, setTarget] = useState("");
  const [loaded, setLoaded] = useState<Partial<Record<BundleId, ShelfBundle>>>({});
  const [failed, setFailed] = useState<Set<BundleId>>(() => new Set());
  const requested = useRef(new Set<BundleId>());
  const typing = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /** The search the field last gave the page: a newer one may be in the field already, and must not be overwritten. */
  const committed = useRef("");
  /** The product, question and checkbox before a search began: clearing the field goes back to them. */
  const browsing = useRef<Pick<Filters, "product" | "shelf" | "changing">>({ product: null, shelf: null, changing: false });
  /** On a narrow screen: where the list was scrolled when a rule opened, which rule, and whether opening it added a history step. */
  const back = useRef<{ y: number; id: string; pushed: boolean } | null>(null);
  /** A rule the address named: its row is brought into view once the list shows it. */
  const landing = useRef("");
  /** A rule opened by a press: focus moves into it once it shows. */
  const focusing = useRef("");

  const lightById = useMemo(() => new Map(data.light.map((r) => [r.id, r])), [data.light]);
  const names = useMemo(() => new Map(data.productNames.map((p) => [p.id, p.name])), [data.productNames]);

  // the address is the state: read it after the first paint (the pre-rendered page has none), and again when a link moves here
  useEffect(() => {
    const f = parseFilters(window.location.search);
    committed.current = f.q;
    setText(f.q);
    setFiltersState(f);
  }, [loc.search]);

  const readHash = useCallback(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    setTarget((cur) => {
      if (id && id !== cur) landing.current = id;
      return id;
    });
  }, []);
  useEffect(() => {
    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("popstate", readHash);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("popstate", readHash);
    };
  }, [readHash, loc.hash]);

  // a hash that names a company's term, which this page no longer lists (D30): on to where it is listed
  useEffect(() => {
    const to = target ? data.elsewhere[target] : undefined;
    if (to) void navigate(to, { replace: true });
  }, [target, data.elsewhere, navigate]);

  const setFilters = useCallback((patch: Partial<Filters>) => {
    setFiltersState((cur) => {
      const next = { ...cur, ...patch };
      // not a navigation: a router navigation here would reload the page's data on every keystroke
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${filtersToSearch(next)}${window.location.hash}`);
      return next;
    });
  }, []);

  // the field answers at once; the search waits until the hand rests. A search begun from the list starts over every product and
  // question; clearing it goes back to the list as it was.
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
        const was = committed.current;
        committed.current = value;
        setClaimTab("law");
        setFiltersState((cur) => {
          let next: Filters = { ...cur, q: value };
          if (!was.trim() && value.trim()) {
            browsing.current = { product: cur.product, shelf: cur.shelf, changing: cur.changing };
            next = { ...next, product: null, shelf: null };
          } else if (was.trim() && !value.trim()) next = { ...next, ...browsing.current };
          window.history.replaceState(window.history.state, "", `${window.location.pathname}${filtersToSearch(next)}${window.location.hash}`);
          return next;
        });
      };
      if (now || !value) commit();
      else typing.current = setTimeout(commit, claimRest);
    },
    [],
  );
  useEffect(() => () => clearTimeout(typing.current), []);

  // ---- what a search found
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
  // a rule's id typed is its own closest match
  const idHit = useMemo(() => {
    const id = idInField(claim);
    return id && lightById.has(id) ? id : null;
  }, [claim, lightById]);
  const pool = useMemo(() => {
    if (!claim) return data.light;
    const law = (found?.law ?? []).map((id) => lightById.get(id)).filter((r): r is LightRule => !!r);
    return idHit ? [lightById.get(idHit)!, ...law.filter((r) => r.id !== idHit)] : law;
  }, [claim, found, idHit, lightById, data.light]);

  // ---- browse: the product, the checkbox, the question
  const browseFilters = useMemo(() => ({ ...filters, shelf: null }), [filters]);
  const counts = useMemo(() => facetCounts(data.light, browseFilters), [data.light, browseFilters]);
  const matches = useMemo(() => data.light.filter((r) => passesFilters(r, browseFilters)), [data.light, browseFilters]);
  const tab = shownShelf(filters.shelf, counts.shelf);

  // ---- search: the product and the question are filters of the results
  const claimFilters = useMemo(() => ({ ...filters, changing: false }), [filters]);
  const claimCounts = useMemo(() => facetCounts(pool, claimFilters), [pool, claimFilters]);
  const results = useMemo(() => (claim ? pool.filter((r) => passesFilters(r, claimFilters)) : []), [claim, pool, claimFilters]);
  const top = results[0]?.id ?? "";

  /** The rule the detail shows: the one opened, or on a computer the search's closest match. */
  const selected = target || top;

  // which record files the page needs now: the open rule's shelf and the top match's, and the companies' terms when a search found some
  const wanted = useMemo(() => {
    const s = new Set<BundleId>();
    for (const id of [selected, top]) {
      const r = lightById.get(id);
      if (r) s.add(r.shelf);
    }
    if (claim && found && found.company.length > 0) s.add("companies");
    return [...shelfIds, "companies" as const].filter((sh) => s.has(sh));
  }, [selected, top, lightById, claim, found]);
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
  const rules = useMemo(() => Object.assign({}, ...Object.values(loaded).map((b) => b!.rules)) as Record<string, RuleRecord>, [loaded]);
  const ruleUses = useMemo(() => Object.assign({}, ...Object.values(loaded).map((b) => b!.ruleUses)) as Record<string, RuleUses>, [loaded]);
  const pd = { rules, terms: {}, dimensions: data.dimensions, today: data.today, ruleUses };

  // ---- opening and closing a rule
  const url = (hash: string) => `${window.location.pathname}${window.location.search}${hash ? `#${encodeURIComponent(hash)}` : ""}`;
  const openRule = useCallback((id: string) => {
    landing.current = "";
    if (isWide()) {
      window.history.replaceState(window.history.state, "", url(id));
      back.current = null;
    } else {
      // a screen of its own: the phone's back gesture closes it, and the list comes back where it was
      const pushed = !back.current;
      if (pushed) window.history.pushState(window.history.state, "", url(id));
      else window.history.replaceState(window.history.state, "", url(id));
      back.current = { y: back.current?.y ?? window.scrollY, id, pushed: back.current?.pushed ?? pushed };
    }
    setTarget(id);
    focusing.current = id;
    requestAnimationFrame(() => {
      if (!isWide()) window.scrollTo(0, 0);
    });
  }, []);
  // focus goes into the rule once its record is on the page (it may still be on its way when the row is pressed)
  useEffect(() => {
    if (!focusing.current || focusing.current !== target || !rules[target]) return;
    focusing.current = "";
    requestAnimationFrame(() => document.getElementById(DETAIL_HEAD)?.focus({ preventScroll: isWide() }));
  }, [target, rules]);
  const closeRule = useCallback(() => {
    if (back.current?.pushed) {
      window.history.back();
      return;
    }
    window.history.replaceState(window.history.state, "", url(""));
    setTarget("");
  }, []);
  // when the rule closes on a narrow screen: the list where it was, and focus on the rule's row
  const wasTarget = useRef("");
  useLayoutEffect(() => {
    const was = wasTarget.current;
    wasTarget.current = target;
    if (!was || target) return;
    const b = back.current;
    back.current = null;
    if (isWide()) return;
    const row = document.getElementById(rowId(b?.id ?? was));
    if (b) window.scrollTo(0, b.y);
    else row?.scrollIntoView({ block: "center" });
    row?.focus({ preventScroll: true });
  }, [target]);

  // a rule the address named: the list shows its product, question and row (the filters that hide it go), its row comes into view
  useEffect(() => {
    const id = landing.current;
    if (!id || id !== target) return;
    const r = lightById.get(id);
    if (!r) return;
    if (!claim) {
      const patch: Partial<Filters> = {};
      if (filters.product && !r.products.includes(filters.product)) patch.product = null;
      if (filters.changing && !r.recheck_date) patch.changing = false;
      if (tab !== r.shelf) patch.shelf = r.shelf;
      if (Object.keys(patch).length > 0) {
        setFilters(patch);
        return;
      }
    }
    landing.current = "";
    if (isWide()) requestAnimationFrame(() => document.getElementById(rowId(id))?.scrollIntoView({ block: "center" }));
    else window.scrollTo(0, 0);
  }, [target, lightById, claim, filters.product, filters.changing, tab, setFilters]);

  // Escape inside the rule: on a narrow screen it closes; on a computer focus goes back to its row
  const onDetailKey = (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !selected) return;
    if (isWide()) document.getElementById(rowId(selected))?.focus();
    else if (target) closeRule();
  };

  // ---- the facts
  const facts = useMemo(() => {
    const fits = (id: string) => {
      const r = lightById.get(id);
      return !!r && passesFilters(r, browseFilters);
    };
    return [...data.facts.filter((f) => fits(f.id)), ...data.facts.filter((f) => !fits(f.id))];
  }, [data.facts, browseFilters, lightById]);
  const factItems: FactItem[] = facts.map((f) => ({
    id: f.id,
    body: <SlottedText text={f.text} rules={data.factRules as Record<string, RuleRecord>} today={data.today} />,
    source: f.source,
    action: (
      <Button variant="quiet" className="!px-0 text-start" onClick={() => openRule(f.id)}>
        <bdi dir="ltr" className="font-medium tabular-nums slashed-zero">{f.id}</bdi>
        <span>· {copy.facts.toRule}</span>
      </Button>
    ),
  }));

  const open = !!target;
  const hideWhenOpen = open && "max-xl:hidden";
  const productName = filters.product ? (names.get(filters.product) ?? filters.product) : copy.products.all;
  const nothing = !!claim && !!found && !idHit && found.law.length + found.company.length + found.docs.length === 0;

  const examples = (
    <p className="text-sm text-muted-foreground flex items-center gap-x-4 max-lg:overflow-x-auto max-lg:whitespace-nowrap scrollbar-none max-lg:-mx-gutter max-lg:px-gutter lg:flex-wrap">
      <span className="shrink-0">{copy.ask.examplesLead}</span>
      {copy.ask.examples.map((e) => (
        <Button key={e} variant="quiet" className="!px-0 shrink-0 text-start lg:min-h-7 lg:tap-area" onClick={() => typed(e, true)}>
          {e}
        </Button>
      ))}
    </p>
  );

  const detail = (
    <div onKeyDown={onDetailKey} className={cx("min-w-0 flex flex-col gap-2 xl:sticky xl:top-[80px]", !open && "max-xl:hidden")}>
      {open && (
        <Button variant="quiet" className="xl:hidden !px-0 self-start gap-1.5" onClick={closeRule}>
          <IconArrowBack size={18} />
          {copy.detail.back}
        </Button>
      )}
      <Card as="aside" pad="aside" id={DETAIL} aria-labelledby={selected ? DETAIL_HEAD : undefined} className="min-w-0 xl:max-h-[calc(100dvh-96px)] xl:overflow-y-auto xl:overscroll-contain">
      {!selected ? (
        <p className="text-sm text-muted-foreground">{copy.detail.empty}</p>
      ) : !lightById.has(selected) || rules[selected] ? (
        <RuleDetail
          id={selected}
          data={pd}
          headId={DETAIL_HEAD}
          products={(lightById.get(selected)?.products ?? []).map((p) => names.get(p) ?? p)}
          after={
            claim && found && found.docs.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setClaimTab("companies");
                  if (target && !isWide()) closeRule();
                  requestAnimationFrame(() => document.getElementById(tabId("claim", "companies"))?.focus());
                }}
                className="min-h-target flex items-center justify-between gap-3 rounded-md border border-border px-3 text-start text-sm text-link hover:underline"
              >
                <span>
                  {copy.detail.companies} · {found.docs.length === 1 ? copy.detail.companiesDocOne : <WithNumber text={copy.detail.companiesDocs} n={found.docs.length} />}
                </span>
                <IconArrowBack size={16} className="rotate-180 shrink-0" />
              </button>
            ) : undefined
          }
        />
      ) : (
        <RecordsStatus broken={failed.has(lightById.get(selected)!.shelf)} />
      )}
      </Card>
    </div>
  );

  return (
    <PageShell current="rules" data={pd}>
      <div className="pt-3 lg:pt-5 flex flex-col gap-5 xl:gap-6">
        <header className={cx("flex flex-col gap-2 lg:gap-1.5 pb-4 xl:pb-5 border-b border-border", hideWhenOpen)}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
            <div className="flex-1 min-w-[16rem] max-w-3xl">
              <AskField value={text} onChange={(v) => typed(v)} onFocus={() => setFocused(true)} label={copy.ask.label} placeholder={copy.ask.placeholder} clearLabel={copy.ask.clear} compact />
            </div>
          </div>
          {!claim && (
            <div className="flex flex-col gap-1.5 xl:flex-row xl:flex-wrap xl:items-baseline xl:gap-x-6 xl:gap-y-0">
              <p className="text-sm lg:text-base xl:text-sm text-muted-foreground max-w-measure xl:max-w-none">{copy.lede}</p>
              {examples}
            </div>
          )}
        </header>

        {claim ? (
          <div className="xl:grid xl:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] xl:gap-6 items-start">
            <section className={cx("min-w-0 flex flex-col gap-4", hideWhenOpen)} aria-label={copy.title}>
              <TabStrip
                idBase="claim"
                ariaLabel={copy.title}
                current={claimTab}
                onChange={(k) => setClaimTab(k as "law" | "companies")}
                tabs={[
                  { key: "law", label: copy.claim.tabs.law, count: found ? results.length : undefined },
                  { key: "companies", label: copy.claim.tabs.companies, count: found ? found.company.length + found.docs.length : undefined },
                ]}
                end={
                  claimTab === "law" && (
                    <>
                      <span className="max-md:hidden flex items-center gap-3">
                        <InlineSelect label={copy.claim.product} all={copy.claim.all} value={filters.product} onChange={(v) => setFilters({ product: v })} options={data.productNames.filter((p) => (claimCounts.product.get(p.id) ?? 0) > 0 || p.id === filters.product).map((p) => ({ id: p.id, name: gershayim(p.name) }))} />
                        <InlineSelect label={copy.claim.question} all={copy.claim.all} value={filters.shelf} onChange={(v) => setFilters({ shelf: v as ShelfId | null })} options={shelfIds.filter((s) => (claimCounts.shelf.get(s) ?? 0) > 0 || s === filters.shelf).map((s) => ({ id: s, name: copy.shelves[s]!.name }))} />
                      </span>
                      <Button variant="quiet" className="md:hidden !px-1" onClick={() => setFilterSheet(true)} aria-haspopup="dialog">
                        {copy.claim.filter}
                        {(filters.product || filters.shelf) && <span aria-hidden="true">·</span>}
                      </Button>
                    </>
                  )
                }
              />
              <div id={panelId("claim")} role="tabpanel" aria-labelledby={tabId("claim", claimTab)} className="flex flex-col gap-4 min-w-0">
                {!found && !idHit ? (
                  <RecordsStatus broken={false} />
                ) : nothing ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground" role="status">{copy.claim.nothing}</p>
                    {examples}
                  </div>
                ) : claimTab === "law" ? (
                  <>
                    {found?.near && <p className="text-sm text-muted-foreground">{copy.claim.near}</p>}
                    {results.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{copy.claim.lawNone}</p>
                    ) : rules[top] ? (
                      <TopMatch id={top} data={pd} label={copy.claim.top} lead={gershayim(lightById.get(top)!.lead)} onOpen={() => openRule(top)} />
                    ) : (
                      <RecordsStatus broken={failed.has(lightById.get(top)!.shelf)} />
                    )}
                    {results.length > 1 && (
                      <section className="flex flex-col gap-2" aria-label={copy.claim.tabs.law}>
                        <GroupHead as="h2">{results.length === 2 ? copy.claim.moreOne : <WithNumber text={copy.claim.more} n={results.length - 1} />}</GroupHead>
                        <RowList>
                          {(lawAll ? results.slice(1) : results.slice(1, 1 + claimFirst)).map((r) => (
                            <RuleRow key={r.id} r={r} selected={selected === r.id} onOpen={openRule} />
                          ))}
                        </RowList>
                        {results.length - 1 > claimFirst && !lawAll && (
                          <Button variant="quiet" className="!px-0 self-start" onClick={() => setLawAll(true)}>
                            <WithNumber text={copy.claim.lawAll} n={results.length} />
                          </Button>
                        )}
                      </section>
                    )}
                  </>
                ) : (
                  found && <CompanyResults company={found.company} names={found.names} docs={found.docs} pd={pd} failed={failed} />
                )}
              </div>
            </section>
            {detail}
          </div>
        ) : (
          <div className="xl:grid xl:grid-cols-[250px_minmax(0,1fr)] xl:gap-8 items-start">
            <nav aria-label={copy.nav.label} className="max-xl:hidden sticky top-[80px] max-h-[calc(100dvh-96px)] overflow-y-auto overscroll-contain scrollbar-none -ms-3">
              <ProductList names={names} counts={counts.product} total={counts.all} current={filters.product} onPick={(id) => setFilters({ product: id })} />
            </nav>
            <div className="min-w-0 xl:grid xl:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] xl:gap-6 items-start">
              <section className={cx("min-w-0 flex flex-col gap-4", hideWhenOpen)} aria-labelledby="rules-product">
                <button type="button" onClick={() => setPicker(true)} aria-haspopup="dialog" className="xl:hidden w-full min-h-14 rounded-md border border-input bg-card px-4 py-2 flex items-center justify-between gap-3 text-start hover:bg-accent/50">
                  <span className="flex flex-col min-w-0">
                    <span className="text-xs text-muted-foreground">{copy.nav.label}</span>
                    <span className="font-semibold">{gershayim(productName)}</span>
                  </span>
                  <span className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                    {countWords(matches.length)}
                    <IconChevronDown size={18} />
                  </span>
                </button>
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
                  <h2 id="rules-product" className="max-xl:hidden text-2xl font-semibold flex flex-wrap items-baseline gap-x-3">
                    {gershayim(productName)}
                    <span className="text-sm font-normal text-muted-foreground">{countWords(matches.length)}</span>
                  </h2>
                  <CheckField label={<span className="text-sm">{copy.changingOnly}</span>} checked={filters.changing} onChange={(v) => setFilters({ changing: v })} />
                </div>
                {tab ? (
                  <>
                    <TabStrip wrap idBase="shelf" ariaLabel={copy.questions} current={tab} onChange={(k) => setFilters({ shelf: k as ShelfId })} tabs={shelfIds.filter((s) => (counts.shelf.get(s) ?? 0) > 0).map((s) => ({ key: s, label: copy.shelves[s]!.name, count: counts.shelf.get(s) }))} />
                    <div id={panelId("shelf")} role="tabpanel" aria-labelledby={tabId("shelf", tab)} className="pt-1">
                      <RuleGroups rules={matches} shelf={tab} lightById={lightById} selected={selected} onOpen={openRule} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{copy.none}</p>
                )}
                <DidYouKnow title={copy.facts.title} items={factItems} more={copy.facts.more} orderKey={facts[0]?.id ?? ""} className="mt-6" />
              </section>
              {detail}
            </div>
          </div>
        )}

        <footer className={cx("flex flex-col gap-2 border-t border-border pt-3 text-[13px] text-muted-foreground max-w-measure", hideWhenOpen)}>
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

      <Sheet open={picker} onClose={() => setPicker(false)} pc="center" height={80} labelledBy="product-sheet-head">
        <div className="flex flex-col gap-3 pb-4">
          <h2 id="product-sheet-head" className="text-lg font-semibold">{copy.nav.title}</h2>
          <ProductList
            names={names}
            counts={counts.product}
            total={counts.all}
            current={filters.product}
            onPick={(id) => {
              setFilters({ product: id });
              setPicker(false);
            }}
          />
        </div>
      </Sheet>
      <Sheet open={filterSheet} onClose={() => setFilterSheet(false)} pc="center" height={70} labelledBy="filter-sheet-head">
        <div className="flex flex-col gap-4 pb-4">
          <h2 id="filter-sheet-head" className="text-lg font-semibold">{copy.claim.filter}</h2>
          <SelectField wide label={copy.claim.product} none={copy.claim.all} value={filters.product} onChange={(v) => setFilters({ product: v })} options={data.productNames.filter((p) => (claimCounts.product.get(p.id) ?? 0) > 0 || p.id === filters.product).map((p) => ({ id: p.id, name: gershayim(p.name) }))} />
          <SelectField wide label={copy.claim.question} none={copy.claim.all} value={filters.shelf} onChange={(v) => setFilters({ shelf: v as ShelfId | null })} options={shelfIds.filter((s) => (claimCounts.shelf.get(s) ?? 0) > 0 || s === filters.shelf).map((s) => ({ id: s, name: copy.shelves[s]!.name }))} />
        </div>
      </Sheet>
    </PageShell>
  );
}

type PageData = Parameters<typeof RuleCard>[0]["data"];

/** What each company wrote: the documents where the subject appears, by kind of company, then each company's own terms the site read (D30). */
function CompanyResults({ company, names, docs, pd, failed }: { company: string[]; names: Map<string, string>; docs: ReturnType<typeof docsForTopics>; pd: PageData; failed: Set<BundleId> }) {
  const words = copy.claim;
  const [picked, setPicked] = useState<DocGroup>("bank");
  const countOf = (g: DocGroup) => docs.filter((d) => d.group === g).length;
  const group = countOf(picked) > 0 ? picked : (docGroups.find((g) => countOf(g) > 0) ?? picked);
  const shown: ReactNode = docs.length === 0 ? (
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
                    <a key={p} href={pageHref(d.url, p)} target="_blank" rel="noreferrer" className="text-link hover:underline whitespace-nowrap min-h-target lg:min-h-0 lg:tap-area inline-flex items-center gap-1">
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
  );
  return (
    <section className="flex flex-col gap-2.5">
      {shown}
      {company.length > 0 && (
        <>
          <h3 className="font-semibold mt-1.5">{words.companyRead}</h3>
          <div className="flex flex-col gap-2">
            {company.slice(0, companyFirst).map((id) => (
              <FoldGroup key={id} variant="section" level={4} title={<span className="text-base font-medium"><bdi dir="ltr" className="tabular-nums slashed-zero">{id}</bdi> · {names.get(id)}</span>}>
                {pd.rules[id] ? <RuleCard id={id} data={pd} inline /> : <RecordsStatus broken={failed.has("companies")} />}
              </FoldGroup>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
