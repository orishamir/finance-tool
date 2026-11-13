// The track browser (D54): the controls and the list for one product. The product is in the address
// (`/tracks/<id>`), so the back button and a shared link work; the kind, the search and the sort are the person's state on the page.
// No kind chosen, the tracks stand under their companies; a kind chosen, its tracks of every company are one list. The loader's data covers the six products, so choosing another keeps the page and fetches nothing.
// With no kind and no search the list opens folded: each company one row with its count and its money, the first open, and on a phone each
// track one line that opens in place; on a computer the companies fold the same way and the table keeps its rows.
// The product, the kind and the sort stand first; on a phone they fold into one line that says what is chosen (`PhoneFold`), and the
// search stays open under them. The count and the order are said right over the list.
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { guidePath, trackBrowserPath } from "../../lib/site-paths";
import { useNavigate, useParams } from "react-router";
import { trackBrowser as t } from "../../copy";
import { fmt } from "../../lib/format";
import { HELP_TERMS, SORT_IDS, sortInForce, sortableIn, buildGroups, buildProductView, companiesIn, companiesPhrase, defaultProduct, defaultSort, filterTracks, sortTracks, sortWords, tracksPhrase, type GroupBy, type ProductView, type SortId, type SortState, type TbData } from "../../lib/track-browser";
import { useAddressSort } from "../../lib/list-sort";
import { useAddressParams } from "../../lib/hooks";
import { normName } from "../../lib/track-names";
import { ChoicePair, LongestCase, PhoneFold, SelectField, TextField, TextLink, useFlip } from "../kit";

/** The kind chip that stands for every kind (the regulator never names a kind so). */
const ALL_KINDS = "*";
import { Term } from "../provenance";
import { TrackList } from "./list";

/** The rows drawn at once when the list is new (a product, a kind): the first screens. The rest are drawn the moment after, in a transition, so a click is answered at once. */
const FIRST_ROWS = 12;

/** The address's query for another product: the sort carries over, the kind does not (each product has its own). */
function keepFor(search: URLSearchParams): string {
  const next = new URLSearchParams(search);
  next.delete("kind");
  const s = next.toString();
  return s ? `?${s}` : "";
}

/** "143 מסלולים של 12 חברות (מתוך 143)." No fee range: the table's cells show the fees. */
function CountLine({ view, shown, companies }: { view: ProductView; shown: number; companies: number }) {
  const total = view.tracks.length;
  return (
    <p className="text-sm text-muted-foreground">
      <span className="whitespace-nowrap">
        {shown === 0 ? t.count.tracksNone : `${tracksPhrase(shown)} ${t.count.of} ${companiesPhrase(companies)}`}
        {shown < total && ` (${t.count.outOf} ${fmt.number(total)})`}
      </span>
      .
    </p>
  );
}

export function TrackBrowser({ data }: { data: TbData }) {
  const params = useParams();
  const navigate = useNavigate();
  const productId = data.products.some((p) => p.id === params.product) ? params.product! : (data.products.find((p) => p.id === defaultProduct) ?? data.products[0]!).id;
  // every product's view is built once: a switch of product then only redraws
  const views = useMemo(() => data.products.map((p) => buildProductView(data, p.id)!), [data]);
  const view = views.find((v) => v.id === productId)!;
  // the kind and the sort live in the address, so a link opens the same list:
  // ?kind=מניות&sort=assets&order=reverse; the defaults are left out. The page is pre-rendered without them, so they are
  // read once the page is in the browser (reading them while hydrating would not match the pre-rendered page).
  const { params: sp, update, hydrated } = useAddressParams();
  const { chosen: sortSet, set: setSort, press } = useAddressSort(SORT_IDS, defaultSort);
  // an address written before a kind's spelling was mended ("s&p" for "S&P") still opens it
  const kindParam = normName(sp.get("kind") ?? "");
  const kind = (kindParam && view.kinds.find((k) => normName(k.sub) === kindParam)?.sub) || "";
  const setKind = (sub: string) => update({ kind: sub || null });
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  // a kind holds at most one track of most companies, so under the companies' headings its sort would move nothing: it is one list
  const by: GroupBy = kind ? "kind" : "company";
  const sortable = useMemo(() => sortableIn(view, by), [view, by]);
  const sort = sortInForce(sortSet, sortable);

  const shown = useMemo(() => filterTracks(view, { kind, q: dq }), [view, kind, dq]);
  const sorted = useMemo(() => sortTracks(shown, sort, by), [shown, sort, by]);
  const groups = useMemo(() => buildGroups(view, sorted, by, data.today), [view, sorted, by, data.today]);
  const listKey = `${productId}|${kind}`;
  const [grown, setGrown] = useState("");
  const limit = grown === listKey ? Infinity : FIRST_ROWS;
  useEffect(() => {
    if (grown !== listKey) startTransition(() => setGrown(listKey));
  }, [grown, listKey]);
  const feeYear = data.feeYear && typeof data.feeYear.value === "string" ? data.feeYear.value : null;
  const product = data.products.find((p) => p.id === productId)!;
  // With no kind and no search, each company is one folded row with its count and its money, the first open so the reader sees what a row
  // holds; on a phone each of its tracks is one line that opens in place. A search or a kind shows its matches open.
  const browsing = !kind && !dq.trim();
  const [opened, setOpened] = useState<{ product: string; keys: ReadonlySet<string> } | null>(null);
  const openKeys = opened?.product === productId ? opened.keys : new Set(groups[0] ? [groups[0].key] : []);
  const fold = browsing ? { isOpen: (key: string) => openKeys.has(key), toggle: (key: string) => setOpened({ product: productId, keys: flipKey(openKeys, key) }) } : undefined;
  // another product, kind, order or search, or a company opened or folded: the rows that stay slide to their new places, so what is below a
  // company that opens moves down gently and nothing above it moves; the new rows fade in
  const list = useFlip<HTMLDivElement>(hydrated ? `${listKey}|${sort.id}|${sort.dir}|${dq}|${browsing ? [...openKeys].join(",") : "*"}` : null);
  /** A head pressed while the list is scrolled under it: the list starts again from its first row, under the same head. */
  const pressHead = (id: SortId) => press(id, sort, list.current);

  const longestOrder = SORT_IDS.flatMap((id) => ([1, -1] as const).flatMap((dir) => (["company", "kind"] as const).map((mode) => orderLine({ id, dir }, mode))));
  // the phone's folded controls: "קרן השתלמות · מניות · מיון לפי דמי ניהול"
  const summary = (
    <>
      {product.name}
      {view.hasKinds && ` · ${kind || t.fold.kindAll}`} · {t.fold.sort}
      {t.sorts[sort.id].label}
    </>
  );
  return (
    <div className="flex flex-col gap-4">
      <PhoneFold summary={summary} more={t.fold.more} less={t.fold.less}>
        {/* the product, then the kind of track: one two-level choice, as the companies page's (kit ChoicePair) */}
        <ChoicePair
          parent={{ label: t.controls.product, ids: data.products.map((p) => p.id), labels: Object.fromEntries(data.products.map((p) => [p.id, p.name])), value: productId, counts: Object.fromEntries(data.products.map((p) => [p.id, p.rows.length])), onChange: (id) => id !== productId && navigate(trackBrowserPath(id, { search: keepFor(sp) }), { preventScrollReset: true }) }}
          under={
            <TextLink look="line" to={guidePath(view.id)} className="self-start text-sm">
              {t.count.whatIs} {view.name}
            </TextLink>
          }
          child={{
            label: t.controls.kind,
            ids: view.hasKinds ? [ALL_KINDS, ...view.kinds.map((k) => k.sub)] : [],
            labels: { [ALL_KINDS]: t.controls.kindAll, ...Object.fromEntries(view.kinds.map((k) => [k.sub, k.sub])) },
            value: kind || ALL_KINDS,
            counts: { [ALL_KINDS]: view.tracks.length, ...Object.fromEntries(view.kinds.map((k) => [k.sub, k.count])) },
            onChange: (id) => setKind(id === ALL_KINDS ? "" : id),
            // the place of the kinds says why there are none, so the control is not just gone
            hint: t.controls.noKinds,
          }}
        />
        <SelectField
          className="md:hidden"
          wide
          label={t.controls.sort}
          options={SORT_IDS.filter((id) => sortable.has(id)).map((id) => ({ id, name: t.sorts[id].label }))}
          value={sort.id}
          onChange={(v) => v && setSort({ id: v as SortId, dir: 1 })}
        />
      </PhoneFold>

      <div className="grid md:grid-cols-[minmax(0,22rem)]">
        <TextField label={t.controls.search} value={q} onChange={setQ} placeholder={t.controls.searchPlaceholder} />
      </div>

      <div className="flex flex-col gap-1 pt-1">
        <LongestCase cases={[<CountLine key="a" view={view} shown={view.tracks.length} companies={view.companies.length} />, <CountLine key="b" view={view} shown={view.tracks.length - 1} companies={view.companies.length} />]}>
          <CountLine view={view} shown={shown.length} companies={companiesIn(shown)} />
        </LongestCase>
        <LongestCase cases={longestOrder.map((line, i) => <p key={i} className="text-sm">{line}</p>)}>
          <p className="text-sm text-muted-foreground">{orderLine(sort, by)}</p>
        </LongestCase>
      </div>

      {/* the phone's rows have no column heads to hold the "?": one line opens the same cards */}
      <p className="md:hidden text-sm text-muted-foreground">
        {t.help.phoneLead} <Term id={HELP_TERMS.fee}>{t.help.fee}</Term> · <Term id={HELP_TERMS.exposure}>{t.help.exposure}</Term> · <Term id={HELP_TERMS.assets}>{t.help.assets}</Term>
      </p>
      <div ref={list} className="scroll-mt-14 lg:scroll-mt-16">
        {groups.length === 0 ? (
          <p className="py-6 text-muted-foreground">
            {t.noResult.before}
            {q.trim()}
            {t.noResult.after}
          </p>
        ) : (
          <TrackList view={view} groups={groups} by={by} sort={sort} sortable={sortable} onSort={pressHead} feeYear={feeYear} period={product.period} limit={limit} fold={fold} foldRows={browsing} />
        )}
      </div>
      {/* a phone's rows have no heads: the yield's caution stands under the list; from md it is the "?" beside the yield's head */}
      <p className="md:hidden text-sm text-muted-foreground max-w-measure">{t.pastNote}</p>
    </div>
  );
}

/** The set with `key` added, or taken out if it was there. */
function flipKey(set: ReadonlySet<string>, key: string): ReadonlySet<string> {
  const next = new Set(set);
  if (!next.delete(key)) next.add(key);
  return next;
}

function orderLine(sort: SortState, by: GroupBy): string {
  return `${by === "company" ? t.order.company : t.order.kind}${sortWords(sort, by)}.`;
}
