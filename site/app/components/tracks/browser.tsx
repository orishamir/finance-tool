// The track browser (D54, 2026-11-03; issue 173): the controls and the list for one product. The product is in the address
// (`/tracks/<id>`), so the back button and a shared link work; the grouping, the kind, the search and the sort are the person's state on
// the page. The loader's data covers the six products, so choosing another keeps the page and fetches nothing.
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { trackBrowser as t } from "../../copy";
import { fmt } from "../../lib/format";
import { SORTS, buildGroups, buildProductView, companiesIn, companiesPhrase, defaultProduct, defaultSort, filterTracks, pressSort, sortTracks, sortWords, tracksPhrase, type GroupBy, type ProductView, type SortId, type SortState, type TbData } from "../../lib/track-browser";
import { FilterChip, LongestCase, SegmentedControl, SelectField, TextField } from "../kit";
import { TrackList } from "./list";

const ids = Object.keys(SORTS) as SortId[];

/** The rows drawn at once when the list is new (a product, a grouping): the first screens. The rest are drawn the moment after, in a transition, so a click is answered at once. */
const FIRST_ROWS = 12;

/** "143 מסלולים של 12 חברות (מתוך 143)." then the guide's link and, on the pension products, why there is no grouping by kind. */
function CountLine({ view, shown, companies, noteFor }: { view: ProductView; shown: number; companies: number; noteFor?: boolean }) {
  const total = view.tracks.length;
  return (
    <p className="text-sm text-muted-foreground">
      {shown === 0 ? t.count.tracksNone : `${tracksPhrase(shown)} ${t.count.of} ${companiesPhrase(companies)}`}
      {shown < total && ` (${t.count.outOf} ${fmt.number(total)})`}.{" "}
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
  const [group, setGroup] = useState<GroupBy>("company");
  // the kind belongs to the product it was chosen in: another product starts with every kind
  const [kindIn, setKindIn] = useState<{ product: string; sub: string }>({ product: productId, sub: "" });
  const kind = kindIn.product === productId && view.kinds.some((k) => k.sub === kindIn.sub) ? kindIn.sub : "";
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const [sortSet, setSort] = useState<SortState>(defaultSort);
  // a product whose fee from deposits is the same on every track has no such sort: it falls back to the fee from savings
  const sort = sortSet.id === "dep" && !view.depSorts ? defaultSort : sortSet;
  const by: GroupBy = view.hasKinds ? group : "company";

  const shown = useMemo(() => filterTracks(view, { kind, q: dq }), [view, kind, dq]);
  const sorted = useMemo(() => sortTracks(shown, sort, by), [shown, sort, by]);
  const groups = useMemo(() => buildGroups(view, sorted, by, data.today), [view, sorted, by, data.today]);
  const listKey = `${productId}|${by}`;
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
            <FilterChip key={p.id} on={p.id === productId} count={p.rows.length} onClick={() => p.id !== productId && navigate(`/tracks/${p.id}`, { preventScrollReset: true })}>
              {p.name}
            </FilterChip>
          ))}
        </div>
      </div>

      <LongestCase cases={views.flatMap((v) => [<CountLine key={`${v.id}a`} view={v} shown={v.tracks.length} companies={v.companies.length} noteFor />, <CountLine key={`${v.id}b`} view={v} shown={v.tracks.length - 1} companies={v.companies.length} noteFor />])}>
        <CountLine view={view} shown={shown.length} companies={companiesIn(shown)} />
      </LongestCase>

      <div className="grid gap-4 md:grid-cols-[minmax(0,22rem)_minmax(0,22rem)] md:items-end">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" id="tb-group">
            {t.controls.group}
          </span>
          <SegmentedControl<GroupBy>
            labelledBy="tb-group"
            value={by}
            onChange={setGroup}
            options={[
              { value: "company", label: t.controls.groupCompany },
              { value: "kind", label: t.controls.groupKind, disabled: !view.hasKinds },
            ]}
          />
        </div>
        <TextField label={t.controls.search} value={q} onChange={setQ} placeholder={t.controls.searchPlaceholder} />
      </div>

      {view.hasKinds && (
        <>
          <div className="hidden md:flex flex-col gap-1.5">
            <span className="text-sm font-medium" id="tb-kind">
              {t.controls.kind}
            </span>
            <div role="group" aria-labelledby="tb-kind" className="flex flex-wrap gap-2">
              <FilterChip on={kind === ""} count={view.tracks.length} onClick={() => setKindIn({ product: productId, sub: "" })}>
                {t.controls.kindAll}
              </FilterChip>
              {view.kinds.map((k) => (
                <FilterChip key={k.sub} on={kind === k.sub} count={k.count} onClick={() => setKindIn({ product: productId, sub: k.sub })}>
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
            onChange={(v) => setKindIn({ product: productId, sub: v ?? "" })}
          />
        </>
      )}
      <SelectField
        className="md:hidden !max-w-none"
        label={t.controls.sort}
        options={ids.filter((id) => id !== "dep" || view.depSorts).map((id) => ({ id, name: t.sorts[id].label }))}
        value={sort.id}
        onChange={(v) => v && setSort({ id: v as SortId, dir: 1 })}
      />

      <LongestCase cases={longestOrder.map((line, i) => <p key={i} className="text-sm">{line}</p>)}>
        <p className="text-sm text-muted-foreground">{orderLine(view, sort, by)}</p>
      </LongestCase>

      {groups.length === 0 ? (
        <p className="py-6 text-muted-foreground">
          {t.noResult.before}
          {q.trim()}
          {t.noResult.after}
        </p>
      ) : (
        <TrackList view={view} groups={groups} by={by} sort={sort} onSort={(id) => setSort((s) => pressSort(s, id))} feeYear={feeYear} period={product.period} limit={limit} />
      )}
      <p className="text-sm text-muted-foreground max-w-measure">{t.pastNote}</p>
    </div>
  );
}

function orderLine(view: ProductView, sort: SortState, by: GroupBy): string {
  return by === "company" ? `${t.order.company.before}${view.name}${t.order.company.mid}${sortWords(sort, by)}.` : `${t.order.kind.before}${sortWords(sort, by)}.`;
}
