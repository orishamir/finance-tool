// The track browser (D54, 2026-11-03; issue 173): the controls and the list for one product. The product is in the address
// (`/tracks/<id>`), so the back button and a shared link work; the kind, the search and the sort are the person's state on the page.
// No kind chosen, the tracks stand under their companies; a kind chosen, its tracks of every company are one list (founder, 2026-11-03). The loader's data covers the six products, so choosing another keeps the page and fetches nothing.
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { trackBrowser as t } from "../../copy";
import { fmt } from "../../lib/format";
import { HELP_TERMS, SORTS, sortInForce, sortableIn, buildGroups, buildProductView, companiesIn, companiesPhrase, defaultProduct, defaultSort, feeRangeOf, filterTracks, pressSort, sortTracks, sortWords, tracksPhrase, type GroupBy, type ProductView, type SortId, type SortState, type TbData, type TbGroup } from "../../lib/track-browser";
import { FilterChip, LongestCase, SelectField, TextField } from "../kit";
import { Term } from "../provenance";
import { FeeRange, TrackList } from "./list";

const ids = Object.keys(SORTS) as SortId[];

/** The rows drawn at once when the list is new (a product, a kind): the first screens. The rest are drawn the moment after, in a transition, so a click is answered at once. */
const FIRST_ROWS = 12;

const EMPTY_PARAMS = new URLSearchParams();

/** The address's query for another product: the sort carries over, the kind does not (each product has its own). */
function keepFor(search: URLSearchParams): string {
  const next = new URLSearchParams(search);
  next.delete("kind");
  const s = next.toString();
  return s ? `?${s}` : "";
}

/** "143 מסלולים של 12 חברות (מתוך 143) · דמי ניהול מהחיסכון: מ־0.10% עד 0.90%." then the guide's link and, on the pension products, why no kind can be chosen. */
function CountLine({ view, shown, companies, fees, noteFor }: { view: ProductView; shown: number; companies: number; fees: TbGroup["fees"]; noteFor?: boolean }) {
  const total = view.tracks.length;
  return (
    <p className="text-sm text-muted-foreground">
      {shown === 0 ? t.count.tracksNone : `${tracksPhrase(shown)} ${t.count.of} ${companiesPhrase(companies)}`}
      {shown < total && ` (${t.count.outOf} ${fmt.number(total)})`}
      {shown > 0 && (
        <>
          {" · "}
          <FeeRange fees={fees} />
        </>
      )}
      .{" "}
      <Link to={`/guide/${view.id}`} className="text-link hover:underline inline-flex items-center min-h-target">
        {t.count.whatIs} {view.name}
      </Link>
      {(noteFor ?? !view.hasKinds) && ` · ${t.count.noKinds}`}
    </p>
  );
}

export function TrackBrowser({ data }: { data: TbData }) {
  const params = useParams();
  const navigate = useNavigate();
  const productId = data.products.some((p) => p.id === params.product) ? params.product! : (data.products.find((p) => p.id === defaultProduct) ?? data.products[0]!).id;
  // every product's view is built once: a switch of product then only redraws, and the count line can hold the longest of them
  const views = useMemo(() => data.products.map((p) => buildProductView(data, p.id)!), [data]);
  const view = views.find((v) => v.id === productId)!;
  // each product's whole fee range, for the count line's longest case
  const allFees = useMemo(() => new Map(views.map((v) => [v.id, feeRangeOf(v.tracks, data.today, { low: t.about.listLow, high: t.about.listHigh })])), [views, data.today]);
  // the kind and the sort live in the address (founder, 2026-11-03), so a link opens the same list:
  // ?kind=מניות&sort=assets&order=reverse; the defaults are left out. The page is pre-rendered without them, so they are
  // read once the page is in the browser (reading them while hydrating would not match the pre-rendered page).
  const [search, setSearch] = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const sp = hydrated ? search : EMPTY_PARAMS;
  const kindParam = sp.get("kind") ?? "";
  const kind = view.kinds.some((k) => k.sub === kindParam) ? kindParam : "";
  const sortParam = sp.get("sort");
  const sortSet: SortState = sortParam && sortParam in SORTS ? { id: sortParam as SortId, dir: sp.get("order") === "reverse" ? -1 : 1 } : defaultSort;
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(search);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    setSearch(next, { replace: true, preventScrollReset: true });
  };
  const setKind = (sub: string) => update({ kind: sub || null });
  const setSort = (s: SortState) => update({ sort: s.id === defaultSort.id && s.dir === 1 ? null : s.id, order: s.dir === -1 ? "reverse" : null });
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  // a kind holds at most one track of most companies, so under the companies' headings its sort would move nothing: it is one list
  const by: GroupBy = kind ? "kind" : "company";
  const sortable = useMemo(() => sortableIn(view, by), [view, by]);
  const sort = sortInForce(sortSet, sortable);

  const shown = useMemo(() => filterTracks(view, { kind, q: dq }), [view, kind, dq]);
  const sorted = useMemo(() => sortTracks(shown, sort, by), [shown, sort, by]);
  const groups = useMemo(() => buildGroups(view, sorted, by, data.today), [view, sorted, by, data.today]);
  const fees = useMemo(() => feeRangeOf(shown, data.today, { low: t.about.listLow, high: t.about.listHigh }), [shown, data.today]);
  const listKey = `${productId}|${kind}`;
  const [grown, setGrown] = useState("");
  const limit = grown === listKey ? Infinity : FIRST_ROWS;
  useEffect(() => {
    if (grown !== listKey) startTransition(() => setGrown(listKey));
  }, [grown, listKey]);
  const feeYear = data.feeYear && typeof data.feeYear.value === "string" ? data.feeYear.value : null;
  const product = data.products.find((p) => p.id === productId)!;

  const longestOrder = ids.flatMap((id) => ([1, -1] as const).flatMap((dir) => (["company", "kind"] as const).map((mode) => orderLine(view, { id, dir }, mode))));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium" id="tb-product">
          {t.controls.product}
        </span>
        <div role="group" aria-labelledby="tb-product" className="flex flex-wrap gap-2">
          {data.products.map((p) => (
            <FilterChip key={p.id} on={p.id === productId} count={p.rows.length} onClick={() => p.id !== productId && navigate(`/tracks/${p.id}${keepFor(search)}`, { preventScrollReset: true })}>
              {p.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <LongestCase cases={views.flatMap((v) => [<CountLine key={`${v.id}a`} view={v} shown={v.tracks.length} companies={v.companies.length} fees={allFees.get(v.id)!} noteFor />, <CountLine key={`${v.id}b`} view={v} shown={v.tracks.length - 1} companies={v.companies.length} fees={allFees.get(v.id)!} noteFor />])}>
        <CountLine view={view} shown={shown.length} companies={companiesIn(shown)} fees={fees} />
      </LongestCase>

      <div className="grid md:grid-cols-[minmax(0,22rem)]">
        <TextField label={t.controls.search} value={q} onChange={setQ} placeholder={t.controls.searchPlaceholder} />
      </div>

      {view.hasKinds && (
        <>
          <div className="hidden md:flex flex-col gap-1.5">
            <span className="text-sm font-medium" id="tb-kind">
              {t.controls.kind}
            </span>
            <div role="group" aria-labelledby="tb-kind" className="flex flex-wrap gap-2">
              <FilterChip on={kind === ""} count={view.tracks.length} onClick={() => setKind("")}>
                {t.controls.kindAll}
              </FilterChip>
              {view.kinds.map((k) => (
                <FilterChip key={k.sub} on={kind === k.sub} count={k.count} onClick={() => setKind(k.sub)}>
                  {k.sub}
                </FilterChip>
              ))}
            </div>
          </div>
          <SelectField
            className="md:hidden !max-w-none"
            label={t.controls.kind}
            none={`${t.controls.kindAll} (${fmt.number(view.tracks.length)})`}
            options={view.kinds.map((k) => ({ id: k.sub, name: `${k.sub} (${fmt.number(k.count)})` }))}
            value={kind || null}
            onChange={(v) => setKind(v ?? "")}
          />
        </>
      )}
      <SelectField
        className="md:hidden !max-w-none"
        label={t.controls.sort}
        options={ids.filter((id) => sortable.has(id)).map((id) => ({ id, name: t.sorts[id].label }))}
        value={sort.id}
        onChange={(v) => v && setSort({ id: v as SortId, dir: 1 })}
      />

      <LongestCase cases={longestOrder.map((line, i) => <p key={i} className="text-sm">{line}</p>)}>
        <p className="text-sm text-muted-foreground">{orderLine(view, sort, by)}</p>
      </LongestCase>

      {/* the phone's rows have no column heads to hold the "?": one line opens the same cards */}
      <p className="md:hidden text-sm text-muted-foreground">
        {t.help.phoneLead} <Term id={HELP_TERMS.fee}>{t.help.fee}</Term> · <Term id={HELP_TERMS.exposure}>{t.help.exposure}</Term> · <Term id={HELP_TERMS.assets}>{t.help.assets}</Term>
      </p>
      {groups.length === 0 ? (
        <p className="py-6 text-muted-foreground">
          {t.noResult.before}
          {q.trim()}
          {t.noResult.after}
        </p>
      ) : (
        <TrackList view={view} groups={groups} by={by} sort={sort} sortable={sortable} onSort={(id) => setSort(pressSort(sort, id))} feeYear={feeYear} period={product.period} limit={limit} />
      )}
      <p className="text-sm text-muted-foreground max-w-measure">{t.pastNote}</p>
    </div>
  );
}

function orderLine(view: ProductView, sort: SortState, by: GroupBy): string {
  return by === "company" ? `${t.order.company.before}${view.name}${t.order.company.mid}${sortWords(sort, by)}.` : `${t.order.kind.before}${sortWords(sort, by)}.`;
}
