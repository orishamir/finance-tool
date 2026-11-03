// A company's page (founder, 2026-11-03: "a more similar UI to the one we have in /tracks"): the track browser's list over one company.
// What the company offers is the chips: "כל המוצרים" first, which shows every product's tracks under the product's heading, then each
// product, then its funds and its securities account, each of which is its own list. No kind filter (a company has one or two tracks of
// a kind; the founder: "its always 1") and no search (at most about twenty tracks of a product). The product and the order are in the
// address (`?product=`, `?sort=`), read once the page is in the browser, as on the tracks page.
import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { trackBrowser as t } from "../../copy";
import { fmt } from "../../lib/format";
import { HELP_TERMS, SORTS, buildProductView, defaultSort, feeRangeOf, inProductsPhrase, pressSort, sortInForce, sortTracks, sortWords, sortableIn, tracksPhrase, type ProductView, type SortId, type SortState, type TbData, type TbGroup } from "../../lib/track-browser";
import { FilterChip, LongestCase, SelectField, useFlip } from "../kit";
import { Term } from "../provenance";
import { FeeRange, TrackList } from "./list";

/** Something else the company offers (its funds of a kind, its securities account): a chip of its own, and a block under the tracks of "כל המוצרים". */
export interface CompanyExtra {
  id: string;
  name: string;
  /** The chip's number, and the words beside its heading ("5 קרנות"). */
  count?: number;
  countText?: string;
  content: ReactNode;
}

const ALL = "";
const ids = Object.keys(SORTS) as SortId[];
/** As on the tracks page: the first rows at once, the rest the moment after. */
const FIRST_ROWS = 12;
const EMPTY_PARAMS = new URLSearchParams();

/** One product: "16 מסלולים · דמי ניהול מהחיסכון: מ־0.54% עד 0.61%."; every product: "112 מסלולים ב־8 מוצרים." (no fee range across products). */
function CountLine({ view, products, today }: { view: ProductView | null; products: readonly ProductView[]; today: string }) {
  const fees = useMemo(() => (view ? feeRangeOf(view.tracks, today, { low: t.about.listLow, high: t.about.listHigh }) : null), [view, today]);
  if (!view) {
    const n = products.reduce((k, v) => k + v.tracks.length, 0);
    return <p className="text-sm text-muted-foreground">{`${tracksPhrase(n)} ${inProductsPhrase(products.length)}.`}</p>;
  }
  return (
    <p className="text-sm text-muted-foreground">
      <span className="whitespace-nowrap">{tracksPhrase(view.tracks.length)}</span>
      {" · "}
      <FeeRange fees={fees} />.
    </p>
  );
}

function orderLine(s: SortState, all: boolean): string {
  return `${all ? t.company.order : t.order.kind}${sortWords(s, "company")}.`;
}

export function CompanyTracks({ data, extras, defaults, foot }: { data: TbData; extras: readonly CompanyExtra[]; /** The tracks a new member joins. */ defaults: readonly number[]; /** The lines under a product's list ("" for every product). */ foot: (productId: string) => ReactNode }) {
  const views = useMemo(() => data.products.map((p) => buildProductView(data, p.id)!), [data]);
  // every product's tracks as one view, for the list of "כל המוצרים": its rows' cells are built once
  const all = useMemo<ProductView>(() => ({ id: ALL, name: t.company.all, dataset: views[0]?.dataset ?? "gemelnet", hasKinds: false, tracks: views.flatMap((v) => v.tracks), companies: [], kinds: [] }), [views]);
  const [search, setSearch] = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const sp = hydrated ? search : EMPTY_PARAMS;
  const asked = sp.get("product") ?? ALL;
  const view = views.find((v) => v.id === asked) ?? null;
  const extra = view ? null : (extras.find((e) => e.id === asked) ?? null);
  const productId = view?.id ?? extra?.id ?? ALL;
  const isAll = productId === ALL;
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
  const setSort = (s: SortState) => update({ sort: s.id === defaultSort.id && s.dir === 1 ? null : s.id, order: s.dir === -1 ? "reverse" : null });
  // a column sorts where it orders the tracks of some product shown
  const sortable = useMemo(() => {
    const out = new Set<SortId>();
    for (const v of view ? [view] : views) for (const id of sortableIn(v, "company")) out.add(id);
    return out;
  }, [view, views]);
  const sort = sortInForce(sortSet, sortable);
  const groups = useMemo<TbGroup[]>(
    () =>
      (view ? [view] : isAll ? views : []).map((v) => {
        const list = sortTracks(v.tracks, sort, "company");
        return { key: `p:${v.id}`, by: "company", title: v.name, tracks: list, total: v.tracks.length, assets: v.companies[0]?.assets ?? null, fees: feeRangeOf(list, data.today) };
      }),
    [view, views, isAll, sort, data.today],
  );
  const [grown, setGrown] = useState<string | null>(null);
  const limit = grown === productId ? Infinity : FIRST_ROWS;
  useEffect(() => {
    if (grown !== productId) startTransition(() => setGrown(productId));
  }, [grown, productId]);
  // another product or order: the rows that stay slide to their new places and the new ones fade in
  const list = useFlip<HTMLDivElement>(hydrated ? `${productId}|${sort.id}|${sort.dir}` : null);
  const pressHead = (id: SortId) => {
    setSort(pressSort(sort, id));
    const el = list.current;
    if (el && el.getBoundingClientRect().top < parseFloat(getComputedStyle(el).scrollMarginTop)) el.scrollIntoView({ block: "start", behavior: "instant" });
  };
  const feeYear = data.feeYear && typeof data.feeYear.value === "string" ? data.feeYear.value : null;
  const tracks = view || isAll ? groups.length > 0 : false;
  const longestOrder = ids.flatMap((id) => ([1, -1] as const).flatMap((dir) => [orderLine({ id, dir }, true), orderLine({ id, dir }, false)]));
  const allCount = all.tracks.length + extras.reduce((k, e) => k + (e.count ?? 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="hidden md:inline text-sm font-medium" id="cb-product">
          {t.controls.product}
        </span>
        <div role="group" aria-labelledby="cb-product" className="hidden md:flex flex-wrap gap-2">
          <FilterChip on={isAll} count={allCount} onClick={() => !isAll && update({ product: null })}>
            {t.company.all}
          </FilterChip>
          {views.map((v) => (
            <FilterChip key={v.id} on={v.id === productId} count={v.tracks.length} onClick={() => v.id !== productId && update({ product: v.id })}>
              {v.name}
            </FilterChip>
          ))}
          {extras.map((e) => (
            <FilterChip key={e.id} on={e.id === productId} count={e.count} onClick={() => e.id !== productId && update({ product: e.id })}>
              {e.name}
            </FilterChip>
          ))}
        </div>
        {/* a phone holds up to a dozen products in a select, as the tracks page holds its kinds */}
        <SelectField
          className="md:hidden"
          wide
          label={t.controls.product}
          none={`${t.company.all} (${fmt.number(allCount)})`}
          options={[...views.map((v) => ({ id: v.id, name: `${v.name} (${fmt.number(v.tracks.length)})` })), ...extras.map((e) => ({ id: e.id, name: e.count === undefined ? e.name : `${e.name} (${fmt.number(e.count)})` }))]}
          value={productId || null}
          onChange={(v) => (v ?? ALL) !== productId && update({ product: v })}
        />
        {view && !view.noPage && (
          <span className="flex flex-wrap gap-x-5 -mb-2">
            <Link to={`/guide/${view.id}`} className="text-sm text-link hover:underline inline-flex items-center min-h-target">
              {t.count.whatIs} {view.name}
            </Link>
            <Link to={`/tracks/${view.id}`} className="text-sm text-link hover:underline inline-flex items-center min-h-target">
              {t.guideLink.before}
              {view.name}
              {t.guideLink.after}
            </Link>
          </span>
        )}
      </div>

      {tracks && (
        <>
          <SelectField
            className="md:hidden"
            wide
            label={t.controls.sort}
            options={ids.filter((id) => sortable.has(id)).map((id) => ({ id, name: t.sorts[id].label }))}
            value={sort.id}
            onChange={(v) => v && setSort({ id: v as SortId, dir: 1 })}
          />
          <div className="flex flex-col gap-1 pt-1">
            <LongestCase cases={[<CountLine key="all" view={null} products={views} today={data.today} />, ...views.map((v) => <CountLine key={v.id} view={v} products={views} today={data.today} />)]}>
              <CountLine view={view} products={views} today={data.today} />
            </LongestCase>
            <LongestCase cases={longestOrder.map((line, i) => <p key={i} className="text-sm">{line}</p>)}>
              <p className="text-sm text-muted-foreground">{orderLine(sort, isAll)}</p>
            </LongestCase>
          </div>
          {/* the phone's rows have no column heads to hold the "?": one line opens the same cards */}
          <p className="md:hidden text-sm text-muted-foreground">
            {t.help.phoneLead} <Term id={HELP_TERMS.fee}>{t.help.fee}</Term> · <Term id={HELP_TERMS.exposure}>{t.help.exposure}</Term> · <Term id={HELP_TERMS.assets}>{t.help.assets}</Term>
          </p>
        </>
      )}
      <div ref={list} className="scroll-mt-14 lg:scroll-mt-16 flex flex-col gap-4">
        {tracks && (
          <>
            <TrackList view={view ?? all} groups={groups} by="company" sort={sort} sortable={sortable} onSort={pressHead} feeYear={feeYear} period={data.reportPeriod} limit={limit} fixed={!!view} defaults={defaults} foot={foot(productId)} />
            <p className="text-sm text-muted-foreground max-w-measure">{t.pastNote}</p>
          </>
        )}
        {extra?.content}
        {isAll &&
          extras.map((e) => (
            <section key={e.id} aria-labelledby={`cb-${e.id}`} className="flex flex-col gap-2 pt-4">
              <h3 id={`cb-${e.id}`} className="flex flex-wrap items-baseline gap-x-3 text-lg lg:text-xl font-semibold">
                {e.name}
                {e.countText && <span className="text-sm font-normal text-muted-foreground">{e.countText}</span>}
              </h3>
              {e.content}
            </section>
          ))}
      </div>
    </div>
  );
}
