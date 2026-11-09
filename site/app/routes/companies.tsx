// The companies page: every company at once beside one company in focus (lib/company-focus.ts). A search and a two-level filter (a kind of
// product, then one product of it) dim the companies that don't match, in place: nothing moves, reorders, leaves or re-wraps. The company in
// focus and the filter are the address (`?company=&type=&product=&q=`, written with `history.replaceState`, never a navigation), and the last
// company focused is kept on the device for the next visit. Below lg the list is the page and the company opens as a sheet over it.
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { companies as copy, companyFocus as w, site } from "../copy";
import { IconSearch } from "../components/icons";
import { PageShell } from "../components/shell";
import { CompanyTabs } from "../components/decoder/company-tabs";
import { CompanyList, FocusPane } from "../components/companies/focus";
import { Sheet } from "../components/Sheet";
import { Card, ChoiceChips, ChoiceTray, HoldTallest, PhoneFold } from "../components/kit";
import { chooseProduct, chooseType, companyGroups, productTypes, searchFocus, searchToState, stateToSearch, statusLine, toggleFromPane, typeCounts, type FocusFigures, type FocusState, type TypeChoice } from "../lib/company-focus";
import { deviceStore } from "../lib/device-store";

export async function loader() {
  const { buildCompanyFocus } = await import("../lib/company-focus.server");
  const { loadChecklistRows, loadRules, pointedRecords, today } = await import("../lib/data.server");
  const { latestSnapshots } = await import("../lib/institutions.server");
  const { accountSections } = await import("../components/decoder/institutions/sections");
  const { data: built, figures, accounts } = buildCompanyFocus();
  // the sections of each securities account's card, named here since two of them depend on the house's advertising and group prices, which
  // the page shows beside its prices and no calculation reads (D57), as the company page's own loader does
  const snaps = latestSnapshots();
  const data = {
    ...built,
    companies: built.companies.map((c) => {
      const a = accounts[c.id];
      if (!a) return c;
      const snap = snaps.find((x) => x.id === a.house);
      return { ...c, sections: accountSections({ fees: a.fees, canBuy: a.canBuy, claims: (snap?.advertising ?? []).length > 0, groups: !!snap?.groups }) };
    }),
  };
  // the rules the figures' sheets name (the tracks' sourced values cite them), shipped with the page since the figures come later
  const ids = new Set<string>();
  JSON.stringify(figures, (k, v) => {
    if (k === "rule_ids" && Array.isArray(v)) for (const id of v) ids.add(id as string);
    return v;
  });
  const all = loadRules();
  const rules = Object.fromEntries([...ids].filter((id) => all[id]).map((id) => [id, all[id]!]));
  return { focus: data, today: today(), rules, pointed: pointedRecords(rules, all), dimensions: Object.fromEntries(loadChecklistRows().map((r) => [r.id, r.name])) };
}

export function meta() {
  return [{ title: `${copy.title} · ${site.name}` }];
}

/** The last company the person focused, kept on this device. */
const lastFocus = deviceStore<string | null>("mekor.companies.focus", null, (raw) => (typeof raw === "string" ? raw : null), (v) => v);

/** From lg the company stands beside the list; below it, it opens as a sheet over the list. */
const isWide = () => typeof window !== "undefined" && window.matchMedia("(min-width: 64rem)").matches;

/** The figures' sourced values, fetched once per visit. */
let figuresPromise: Promise<FocusFigures> | null = null;
function fetchFigures(): Promise<FocusFigures> {
  if (!figuresPromise) {
    figuresPromise = fetch(`${import.meta.env.BASE_URL}company-figures.json`).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<FocusFigures>;
    });
    figuresPromise.catch(() => (figuresPromise = null));
  }
  return figuresPromise;
}

export default function Companies() {
  const { focus: data, today, rules, pointed, dimensions } = useLoaderData<typeof loader>();
  // on a first visit the first company of the first group is in focus
  const first = useMemo(() => data.companies.find((c) => c.group === companyGroups[0])!.id, [data]);
  const [s, setS] = useState<FocusState>({ type: "all", product: null, q: "", focus: first });
  const [figures, setFigures] = useState<FocusFigures | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const anchor = useRef<HTMLElement | null>(null);
  const saved = lastFocus.use();
  const ready = useRef(false);
  const sheetHead = useId();

  // the address first, then the device's last company; once, after hydration
  useEffect(() => {
    if (!saved.ready || ready.current) return;
    ready.current = true;
    const asked = searchToState(window.location.search, data);
    const kept = saved.value && data.companies.some((c) => c.id === saved.value) ? saved.value : null;
    setS((x) => ({ ...x, ...asked, focus: asked.focus ?? kept ?? x.focus }));
  }, [saved, data]);

  // the state is the address, replaced rather than pushed: a link or the back button returns to the same view
  useEffect(() => {
    if (!ready.current) return;
    const next = `${window.location.pathname}${stateToSearch(s, first)}${window.location.hash}`;
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) window.history.replaceState(window.history.state, "", next);
  }, [s, first]);

  useEffect(() => {
    let live = true;
    fetchFigures().then((f) => live && setFigures(f), () => undefined);
    return () => void (live = false);
  }, []);

  const focusOn = useCallback((id: string, el: HTMLElement | null) => {
    setS((x) => ({ ...x, focus: id }));
    lastFocus.set(id);
    if (!isWide()) {
      anchor.current = el;
      setSheetOpen(true);
    }
  }, []);

  const setQ = (q: string) =>
    setS((x) => {
      const next = { ...x, q };
      const hit = searchFocus(data.kinds, data.companies, next);
      if (hit) lastFocus.set(hit);
      return hit ? { ...next, focus: hit } : next;
    });

  const counts = useMemo(() => typeCounts(data.kinds, data.companies), [data]);
  const typeIds: TypeChoice[] = ["all", ...productTypes.filter((t) => counts[t] > 0)];
  const typeKinds = s.type === "all" ? [] : data.kinds.filter((k) => k.type === s.type);
  const focused = data.companies.find((c) => c.id === s.focus) ?? data.companies[0]!;
  const status = statusLine(data.kinds, data.companies, s);
  const choose = (id: string) => setS((x) => ({ ...x, ...toggleFromPane(data.kinds, x, id) }));
  const pane = (id?: string) => <FocusPane company={focused} data={data} state={s} figures={figures} onChoose={choose} headId={id} />;
  // what the phone's folded filters say is chosen
  const summary = [s.product ? data.kinds.find((k) => k.id === s.product)?.name : w.types[s.type], s.q.trim() ? w.quoted(s.q.trim()) : null].filter(Boolean).join(" · ");

  return (
    <PageShell current="decoder" data={{ rules, pointed, terms: {}, dimensions, today }}>
      <div className="flex flex-col gap-6 pt-2 lg:pt-8">
        <CompanyTabs current="company" />
        <h1 className="text-2xl lg:text-3xl font-semibold">{copy.title}</h1>
        <div className="flex flex-col gap-3">
          <PhoneFold summary={summary} more={w.fold.more} less={w.fold.less}>
            <div className="flex flex-col gap-1">
              <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
                <div className="flex flex-col gap-2 md:w-72 shrink-0">
                  <label htmlFor="company-filter" className="text-sm font-medium">
                    {w.search}
                  </label>
                  <div className="field-box text-muted-foreground">
                    <IconSearch size={18} />
                    <input id="company-filter" type="search" dir="rtl" value={s.q} onChange={(e) => setQ(e.target.value)} className="field-input !text-start text-mixed" autoComplete="off" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 min-w-0">
                  <span id="type-label" className="text-sm font-medium">
                    {w.typeLabel}
                  </span>
                  <ChoiceChips ids={typeIds} labels={w.types} value={s.type} counts={counts} onChange={(t) => setS((x) => ({ ...x, ...chooseType(data.kinds, t) }))} ariaLabel={w.typeLabel} />
                </div>
              </div>
              <ChoiceTray label={w.productLabel} hint={w.trayHint}>
                {typeKinds.length > 1 && <ChoiceChips ids={typeKinds.map((k) => k.id)} labels={Object.fromEntries(typeKinds.map((k) => [k.id, k.name]))} value={s.product} onChange={(id) => setS((x) => ({ ...x, ...chooseProduct(data.kinds, x, id) }))} ariaLabel={w.productLabel} line bleed="" />}
              </ChoiceTray>
            </div>
          </PhoneFold>
          {/* one line, one height: the numbers change, nothing else */}
          <p role="status" className="h-6 truncate text-sm text-muted-foreground">
            {status}
          </p>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="lg:w-[510px] shrink-0 min-w-0">
            <CompanyList data={data} state={s} onFocus={focusOn} />
          </div>
          {/* the pane holds the height of its tallest company, so focusing another moves nothing below it */}
          <Card as="aside" pad="roomy" className="max-lg:hidden flex-1 min-w-0" aria-label={focused.name}>
            <HoldTallest id="companies" cases={() => data.companies.map((c) => <FocusPane key={c.id} company={c} data={data} state={s} figures={null} onChoose={() => undefined} />)}>
              {pane()}
            </HoldTallest>
          </Card>
        </div>
        <Link to="/documents#company-terms" className="self-start inline-flex items-center min-h-target text-link hover:underline">
          {w.documents}
        </Link>
      </div>
      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} anchor={anchor.current} height={80} labelledBy={sheetHead}>
        {pane(sheetHead)}
      </Sheet>
    </PageShell>
  );
}
