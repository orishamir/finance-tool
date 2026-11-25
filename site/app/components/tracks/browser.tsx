// The track browser (D54): the controls and the list for one product. The product is in the address
// (`/tracks/<id>`), so the back button and a shared link work; the kind, the search and the sort are in its query, so a shared link opens the same list.
// No kind chosen, the tracks stand under their companies; a kind chosen, its tracks of every company are one list. The loader's data covers the six products, so choosing another keeps the page and fetches nothing.
// With no kind and no search the list opens folded: each company one row with its count and its money, the first open, and on a phone each
// track one line that opens in place; on a computer the companies fold the same way and the table keeps its rows.
// The product, the kind and the sort stand first; on a phone they fold into one line that says what is chosen (`PhoneFold`), and the
// search stays open under them. The count is said right over the list; the order is the sorted head's arrow and the phone's sort control.
// On a phone, whose rows have no heads, how to read the list is one "?" by the page's title (`TracksHelp`), caution where the product's fee
// figure has a catch (child savings, CS OQ9); from md the heads and their own "?" say it.
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { guidePath, trackBrowserPath } from "../../lib/site-paths";
import { useNavigate, useParams } from "react-router";
import { inBackground } from "../../lib/background";
import { trackBrowser as t } from "../../copy";
import { fmt } from "../../lib/format";
import { HELP_TERMS, SORT_IDS, sortInForce, sortableIn, buildGroups, buildProductView, defaultProduct, defaultSort, filterTracks, sortTracks, type GroupBy, type SortId, type TbData, type TbProduct } from "../../lib/track-browser";
import type { SiteValue } from "../../lib/value";
import { useAddressSort } from "../../lib/list-sort";
import { useAddressParams } from "../../lib/hooks";
import { normName } from "../../lib/track-names";
import { ChoicePair, HelpMark, PhoneFold, SelectField, TextField, TextLink, gershayim, useFlip } from "../kit";

/** The kind chip that stands for every kind (the regulator never names a kind so). */
const ALL_KINDS = "*";
import { CHILD_SAVINGS, childFeeHelp, TrackList } from "./list";

/** The rows drawn at once when the list is new (a product, a kind): the first screens. The rest are drawn the moment after, in a transition, so a click is answered at once. */
const FIRST_ROWS = 12;

/** The address's query for another product: the sort carries over, the kind does not (each product has its own). */
function keepFor(search: URLSearchParams): string {
  const next = new URLSearchParams(search);
  next.delete("kind");
  const s = next.toString();
  return s ? `?${s}` : "";
}

/** The product the address names, or the default one. */
function productOf(data: TbData, param: string | undefined): TbProduct {
  return data.products.find((p) => p.id === param) ?? data.products.find((p) => p.id === defaultProduct) ?? data.products[0]!;
}

/**
 * The "?" by the page's title, on a phone only: how to read the list of the product the address names, which the column heads and their
 * own "?" say from md. The phone's rows have no heads, so it says the fees' year and the figures' date, the source, that the companies stand
 * from the largest to the smallest by money managed, what the past yield is (the rows saying only "before fees and tax"), on a pension
 * product that the fees are the whole fund's (CAT-39), on child savings first what the fee figure is not, in the caution role, with CS-18
 * under it (CS OQ9); then the cards of the fee, the exposure and the money managed.
 */
export function TracksHelp({ data, childAge = null }: { data: TbData; childAge?: SiteValue | null }) {
  const params = useParams();
  const product = productOf(data, params.product);
  const feeYear = data.feeYear && typeof data.feeYear.value === "string" ? data.feeYear.value : null;
  const child = product.id === CHILD_SAVINGS ? childFeeHelp(childAge) : null;
  const lead = [child?.text, product.dataset === "pensia-net" ? t.wholeFund : null, t.pageHelp.dates(feeYear, fmt.period(product.period)), t.pageHelp.own, t.pastNote].filter(Boolean).join(" ");
  return (
    <span className="md:hidden">
      <HelpMark term={[HELP_TERMS.fee, HELP_TERMS.exposure, HELP_TERMS.assets]} about={t.pageHelp.about} lead={lead} rules={child?.rules} tone={child ? "caution" : undefined} />
    </span>
  );
}

/** `childAge`: CS-18's age until which National Insurance pays a child-savings fund's fee, for that product's fee head's caution "?". */
export function TrackBrowser({ data, childAge = null }: { data: TbData; childAge?: SiteValue | null }) {
  const params = useParams();
  const navigate = useNavigate();
  const product = productOf(data, params.product);
  const productId = product.id;
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
  // the search is in the address too (?q=), so a link or Back opens the same list. While the box has the focus it shows what was typed,
  // as the address follows each keystroke a moment later: the address read back mid-typing would move the caret
  const [typing, setTyping] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const q = searchFocused && typing !== null ? typing : (sp.get("q") ?? "");
  const setQ = (value: string) => {
    setTyping(value);
    update({ q: value || null });
  };
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
          parent={{ label: t.controls.product, ids: data.products.map((p) => p.id), labels: Object.fromEntries(data.products.map((p) => [p.id, p.name])), value: productId, counts: Object.fromEntries(data.products.map((p) => [p.id, p.rows.length])), onChange: (id) => {
            if (id !== productId) inBackground(navigate(trackBrowserPath(id, { search: keepFor(sp) }), { preventScrollReset: true }));
          } }}
          under={
            <TextLink look="line" to={guidePath(view.id)} className="self-start text-sm">
              {t.count.whatIs} {view.name}
            </TextLink>
          }
          child={{
            label: t.controls.kind,
            ids: view.hasKinds ? [ALL_KINDS, ...view.kinds.map((k) => k.sub)] : [],
            labels: { [ALL_KINDS]: t.controls.kindAll, ...Object.fromEntries(view.kinds.map((k) => [k.sub, gershayim(k.sub)])) },
            value: kind || ALL_KINDS,
            counts: { [ALL_KINDS]: view.tracks.length, ...Object.fromEntries(view.kinds.map((k) => [k.sub, k.count])) },
            onChange: (id) => setKind(id === ALL_KINDS ? "" : id),
            // the place of the kinds says why there are none, so the control is not just gone
            hint: t.controls.noKinds,
            labelAbove: true,
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

      <div
        className="grid md:grid-cols-[minmax(0,22rem)]"
        onFocus={() => setSearchFocused(true)}
        onBlur={() => {
          setSearchFocused(false);
          setTyping(null);
        }}
      >
        <TextField label={t.controls.search} value={q} onChange={setQ} placeholder={t.controls.searchPlaceholder} />
      </div>

      <div ref={list} className="scroll-mt-14 lg:scroll-mt-16">
        {groups.length === 0 ? (
          <p className="py-6 text-muted-foreground">
            {t.noResult.before}
            {q.trim()}
            {t.noResult.after}
          </p>
        ) : (
          <TrackList view={view} groups={groups} by={by} sort={sort} sortable={sortable} onSort={pressHead} feeYear={feeYear} period={product.period} limit={limit} fold={fold} foldRows={browsing} childAge={childAge} />
        )}
      </div>
    </div>
  );
}

/** The set with `key` added, or taken out if it was there. */
function flipKey(set: ReadonlySet<string>, key: string): ReadonlySet<string> {
  const next = new Set(set);
  if (!next.delete(key)) next.add(key);
  return next;
}
