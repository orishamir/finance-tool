// A company's product on its page (components/company/template.tsx): its size and the dates of its figures, then the track browser's list
// over one company and one product in its shorter form (the designer's mock), the notes under it, and links to the product in every company
// and to its guide. No kind filter (a company has one or two tracks of a kind) and no
// search (at most about twenty tracks of a product). The order is in the address (`?sort=`), read once the page is in the browser, as on
// the tracks page.
import { startTransition, useEffect, useMemo, useState, type ReactNode } from "react";
import { trackBrowser as t } from "../../copy";
import { useAddressParams } from "../../lib/hooks";
import { useAddressSort } from "../../lib/list-sort";
import { HELP_TERMS, SORT_IDS, buildProductView, defaultSort, feeRangeOf, sortInForce, sortTracks, sortableIn, tracksPhrase, type SortId, type TbData, type TbGroup } from "../../lib/track-browser";
import { GoLink, SelectField, useFlip } from "../kit";
import { Num, Term } from "../provenance";
import { fmt } from "../../lib/format";
import { CompanySize, TrackList } from "./list";

/** As on the tracks page: the first rows at once, the rest the moment after. */
const FIRST_ROWS = 12;

export function CompanyTracks({ data, product, defaults, foot }: { data: TbData; /** The product shown, chosen by the page (the company template's side list). */ product: string; /** The tracks a new member joins. */ defaults: readonly number[]; /** The lines under the list. */ foot: ReactNode }) {
  const view = useMemo(() => buildProductView(data, product) ?? null, [data, product]);
  const { hydrated } = useAddressParams();
  const { chosen: sortSet, set: setSort, press } = useAddressSort(SORT_IDS, defaultSort);
  // a column sorts where it orders the product's tracks
  const sortable = useMemo(() => new Set<SortId>(view ? sortableIn(view, "company") : []), [view]);
  const sort = sortInForce(sortSet, sortable);
  const groups = useMemo<TbGroup[]>(
    () =>
      (view ? [view] : []).map((v) => {
        const list = sortTracks(v.tracks, sort, "company");
        return { key: `p:${v.id}`, by: "company", title: v.name, tracks: list, total: v.tracks.length, assets: v.companies[0]?.assets ?? null, fees: feeRangeOf(list, data.today) };
      }),
    [view, sort, data.today],
  );
  const [grown, setGrown] = useState<string | null>(null);
  const limit = grown === product ? Infinity : FIRST_ROWS;
  useEffect(() => {
    if (grown !== product) startTransition(() => setGrown(product));
  }, [grown, product]);
  // another order: the rows slide to their new places
  const list = useFlip<HTMLDivElement>(hydrated ? `${product}|${sort.id}|${sort.dir}` : null);
  const pressHead = (id: SortId) => press(id, sort, list.current);
  const feeYear = data.feeYear && typeof data.feeYear.value === "string" ? data.feeYear.value : null;
  if (!view) return null;

  // the tracks' deposit fee: a column only where they differ in it, else said once over the table (the designer's mock)
  const deposits = new Set(view.tracks.map((x) => `${x.deposit.value}`));
  const oneDeposit = deposits.size === 1 ? view.tracks[0]!.deposit : null;
  return (
    <div className="flex flex-col gap-4">
      {/* the product's size and dates, 8 px under the part's heading, whose section leaves 16 */}
      <div className="flex flex-col gap-1 -mt-2">
        <p>
          <CompanySize count={tracksPhrase(view.tracks.length)} assets={view.companies[0]?.assets ?? null} />
        </p>
        <p className="text-sm text-muted-foreground">
          {t.dates(feeYear, fmt.period(data.reportPeriod))}
          {oneDeposit && typeof oneDeposit.value === "number" && (
            <>
              {" "}
              {t.depositOnce} <Num value={oneDeposit} />.
            </>
          )}
        </p>
      </div>
      <SelectField
        className="md:hidden"
        wide
        label={t.controls.sort}
        options={SORT_IDS.filter((id) => sortable.has(id)).map((id) => ({ id, name: t.sorts[id].label }))}
        value={sort.id}
        onChange={(v) => v && setSort({ id: v as SortId, dir: 1 })}
      />
      {/* the phone's rows have no column heads to hold the "?": one line opens the same cards */}
      <p className="md:hidden text-sm text-muted-foreground">
        {t.help.phoneLead} <Term id={HELP_TERMS.fee}>{t.help.fee}</Term> · <Term id={HELP_TERMS.exposure}>{t.help.exposure}</Term> · <Term id={HELP_TERMS.assets}>{t.help.assets}</Term>
      </p>
      <div ref={list} className="scroll-mt-14 lg:scroll-mt-16 flex flex-col gap-3">
        <TrackList view={view} groups={groups} by="company" sort={sort} sortable={sortable} onSort={pressHead} feeYear={feeYear} period={data.reportPeriod} limit={limit} fixed defaults={defaults} compact={oneDeposit ? "no-deposit" : "with-deposit"} />
        {/* under the table, quiet: the fee's caps and the direct expenses, then what the yield is */}
        {foot}
        <p className="text-xs text-muted-foreground">{t.pastNote}</p>
      </div>
      {!view.noPage && (
        <p className="flex flex-wrap gap-x-6">
          <GoLink to={`/tracks/${view.id}`}>{t.inAll(view.name)}</GoLink>
          <GoLink to={`/guide/${view.id}`}>
            {t.count.whatIs} {view.name}
          </GoLink>
        </p>
      )}
    </div>
  );
}
