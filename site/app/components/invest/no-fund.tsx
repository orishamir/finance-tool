// An index with no fund the page can price (a custom index, founder 2026-11-04): the same page as every index, the result card set
// aside. Above the lists, one request to add the fund; the account list is the pair page's, ranked by what each account charges for
// the cheapest kind of fund at it; the fund column says there is no fund yet. Once a fund is added the page is the pair page.
import { useMemo, useState } from "react";
import { invest as c } from "../../copy";
import { firstCount, phoneOnlyValue, placesOf, type HouseRow, type InvestView, type OptionId } from "../../lib/invest";
import type { SiteValue } from "../../lib/value";
import type { WorkbenchBundle } from "../../lib/providers";
import { isGroupProvider } from "../../lib/group-pick";
import { fmt } from "../../lib/format";
import { IconCopy, IconExternal } from "../icons";
import { Num } from "../provenance";
import { Button, Card, ChartLegend, CostStack, LongestCase, PickList, SourcedTag, Swatch, Tag, cx, useChartPick, useHeldHeight, type CostPart, type PickRow } from "../kit";
import { barScale, byLegend, GroupLine, HouseLine, hasCurrent, legendLines, lineClass, lineOf, LONGEST_AMOUNT, LONGEST_YEARS, partName, legendName, AbroadNotes, OwnBankField } from "./pair";
import { optionClass, reasonText } from "./parts";
import { ProviderLink, providerName } from "./sections";
import { AddEntryButton, BrokerTerms, FundTerms } from "./custom-entries";
import { sourceHref } from "../../lib/sources";

const n = c.noFund;

/** The one thing the page asks for while it has no fund: the fund, so it can say what is left. */
export function NoFundCall({ view }: { view: InvestView }) {
  return (
    <Card pad="roomy" className="flex flex-col gap-2">
      <h3 className="font-semibold">{n.callTitle}</h3>
      <p className="text-sm text-muted-foreground max-w-measure">{n.callBody(view.index.name)}</p>
      <div className="pt-1">
        <AddEntryButton kind="fund" primary />
      </div>
    </Card>
  );
}

/** The houses the list ranks: priced ones by what the account charges, then the ones it cannot price, "no data" before "not possible". */
function ordered(view: InvestView) {
  const rows = view.houses.filter((h) => !isGroupProvider(h.provider));
  const ok = rows.filter((h): h is HouseRow & { generic: NonNullable<HouseRow["generic"]> } => !!h.generic).sort((a, b) => a.generic.costN! - b.generic.costN! || a.provider.short.localeCompare(b.provider.short, "he"));
  const missing = rows.filter((h) => !h.generic).sort((a, b) => Number(!!a.unavailable) - Number(!!b.unavailable) || a.provider.short.localeCompare(b.provider.short, "he"));
  return { rows, ok, missing };
}

/** Under a house's name: the kind of fund its cost is for, the cheapest mark, the standing-order price, and "by phone only" (2026-11-08). */
function SubLine({ kind, cheapest, standing, phone = null }: { kind: OptionId | null; cheapest: boolean; standing: boolean; /** The house sells that kind of fund only by phone: its words, which the tag opens. */ phone?: SiteValue | null }) {
  return (
    <span className="flex flex-wrap gap-x-2 min-h-5 text-xs font-normal text-muted-foreground">
      {kind && <span>{c.typeTags[kind]}</span>}
      {cheapest && <span className="font-medium text-primary">{c.pair.cheapestTag}</span>}
      {standing && <span>{c.pair.standingTag}</span>}
      {phone && <SourcedTag value={phone}>{c.pair.phoneTag}</SourcedTag>}
    </span>
  );
}

export function NoFundAccountColumn({ view, bundle, years, monthly = 1, chosen, onPick, ownBank }: { view: InvestView; bundle: WorkbenchBundle; years: number; /** At 0 no purchase runs on a standing order. */ monthly?: number; chosen: string | null; onPick: (id: string) => void; /** The bank where the person already has a current account, and its setter (D64). */ ownBank?: { value: string | null; onChange: (id: string | null) => void } }) {
  const legendPick = useChartPick();
  const { rows, ok, missing } = ordered(view);
  const heldKey = `${view.index.id}:${rows.length}`;
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const onGroup = (id: string, open: boolean) => setOpenGroups((xs) => (open ? (xs.includes(id) ? xs : [...xs, id]) : xs.filter((x) => x !== id)));
  const [abroadOpen, setAbroadOpen] = useState(false);
  const held = useHeldHeight<HTMLDivElement>(`${heldKey}:${openGroups.join()}:${abroadOpen}`);
  // every house the header can name, laid out unseen, so a long one moves nothing above the list
  const longest = useMemo(
    () => ({
      names: rows.map((h) => <span key={h.provider.id} className={cx("block text-xl font-bold [overflow-wrap:anywhere]", h.provider.custom && "text-entered")}><ProviderLink p={h.provider} /></span>),
      lines: rows.map((h) => <HouseLine key={h.provider.id} house={h.provider} snapshot={bundle.snapshots.find((s) => s.id === h.provider.id)} charge={<>{c.pair.colCharges(LONGEST_YEARS)}: {fmt.nisWhole(LONGEST_AMOUNT)}</>} />),
    }),
    [heldKey, bundle.snapshots], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const houseId = chosen && rows.some((h) => h.provider.id === chosen) ? chosen : (ok[0]?.provider.id ?? null);
  const house = houseId ? providerName(view, houseId) : undefined;
  const row = rows.find((h) => h.provider.id === houseId);
  if (!house || !row) return null;
  const scale = barScale(ok.map((h) => h.generic.costN!));
  const lines = legendLines(!!view.index.israeli, ok.flatMap((h) => (h.generic.lines ?? []).map((l) => lineOf(l.line))));
  const local = rows.filter((h) => !h.provider.foreign && !h.provider.custom);
  const saved = bundle.snapshots.filter((s) => rows.some((h) => h.provider.id === s.id && !h.provider.custom)).map((s) => s.snapshot).sort();
  const standingCount = local.filter((h) => h.standing).length;
  const kinds = view.options.filter((o) => o.exists).map((o) => o.id);
  // equal costs share a place, and a first place shared by two crowns neither (2026-11-05); the tie threshold is for what is left, not for costs
  const places = placesOf(ok.map((h) => h.generic.costN!), 0);
  const crown = firstCount(places) === 1;
  const snapOf = (id: string) => bundle.snapshots.find((s) => s.id === id);
  // the tag's room on a house that sells a kind of fund only by phone on some exchange, whichever the plan makes cheapest (2026-11-08)
  const phoneAny = (id: string, short: string, k: OptionId) => phoneOnlyValue(snapOf(id), k, "europe", short) ?? phoneOnlyValue(snapOf(id), k, "us", short);
  const pickRows: PickRow[] = ok.map((h, i) => {
    const g = h.generic;
    const from = h.provider.custom ? c.pair.sourceEntered : c.pair.sourceList(h.provider.short);
    // the account's fees on each other first, as on every bar of the page (pass 7)
    const parts: CostPart[] = [
      { id: "remainder", name: c.pair.remainder, about: c.pair.remainderAbout, value: g.interaction ?? 0, className: "bg-chart-cost-other", source: c.pair.sourceComputed },
      ...byLegend(g.lines ?? []).map((l) => ({ id: l.line, legendId: lineOf(l.line), name: partName(l.line), value: l.cost, className: lineClass[lineOf(l.line)] ?? "bg-chart-cost-other", source: from })),
    ];
    return {
      key: h.provider.id,
      selected: h.provider.id === houseId,
      onSelect: () => onPick(h.provider.id),
      cells: (
        <>
          <span className="text-sm text-muted-foreground tabular-nums text-center">{places[i]}</span>
          <span className={cx("flex flex-col min-w-0 leading-tight font-semibold [overflow-wrap:anywhere]", h.provider.custom && "text-entered")}>
            {h.provider.short}
            {/* the kind of fund and the cheapest mark change with the plan: the line holds its longest case, so a row keeps its height */}
            <LongestCase cases={kinds.map((k) => <SubLine key={k} kind={k} cheapest standing={h.standing} phone={phoneAny(h.provider.id, h.provider.short, k)} />)}>
              <SubLine kind={g.option ?? null} cheapest={crown && i === 0} standing={h.standing && monthly > 0} phone={g.option ? phoneOnlyValue(snapOf(h.provider.id), g.option, g.venue, h.provider.short) : null} />
            </LongestCase>
          </span>
          <span className="flex items-center min-w-0 @max-2xl:row-start-2 @max-2xl:col-start-3 @max-2xl:col-end-[-1]">
            <CostStack size="sm" parts={parts} total={Math.round(g.costN!)} scale={scale} highlight={legendPick.active} label={`${h.provider.short}: ${fmt.nisWhole(g.costN!)}`} />
          </span>
          <span className="col-end-[-1] text-end font-semibold">{g.cost && <Num animate value={g.cost} />}</span>
          <GroupLine id={h.provider.id} house={h.provider.short} snapshots={bundle.snapshots} open={openGroups.includes(h.provider.id)} onOpen={onGroup} />
          {h.provider.custom && <span className="col-start-2 col-end-[-1]"><BrokerTerms id={h.provider.id} /></span>}
        </>
      ),
    };
  });
  const greyRows: PickRow[] = missing.map((h) => {
    const na = h.unavailable;
    const snap = bundle.snapshots.find((s) => s.id === h.provider.id);
    return {
      key: h.provider.id,
      selected: h.provider.id === houseId,
      muted: true,
      onSelect: () => {},
      cells: (
        <>
          <span className="text-sm tabular-nums text-center">—</span>
          <span className={cx("flex flex-col min-w-0 leading-tight font-semibold [overflow-wrap:anywhere]", h.provider.custom && "text-entered")}>
            {h.provider.short}
            <span className="min-h-5" />
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0 text-xs @max-2xl:row-start-2 @max-2xl:col-start-3 @max-2xl:col-end-[-1]">
            <Tag tone={na ? undefined : "caution"}>{na ? c.pair.notPossible : c.pair.noData}</Tag>
            {na && !h.provider.custom && (
              <a href={sourceHref(na.source)} target="_blank" rel="noopener noreferrer" title={na.note ?? na.source.title} className="text-link hover:underline">
                {c.pair.notPossibleSource} ↗
              </a>
            )}
          </span>
          <span className="col-end-[-1] text-end font-semibold">—</span>
          <span className="col-start-2 col-end-[-1] text-xs leading-snug">
            {na && h.provider.custom ? c.customEntries.notSold : na ? c.pair.notPossibleAny : (snap?.missing_reason_he ?? (h.reason ? reasonText(h.reason, optionClass["il-etf"]) : c.funds.cannot))}
          </span>
          {h.provider.custom && <span className="col-start-2 col-end-[-1]"><BrokerTerms id={h.provider.id} /></span>}
        </>
      ),
    };
  });
  return (
    <Card ref={held} pad="none" className="flex flex-col overflow-hidden">
      <div className="bg-popover border-b border-border px-5 py-4 flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{c.pair.accountSlot}</span>
        <LongestCase cases={longest.names}>
          <span className={cx("block text-xl font-bold [overflow-wrap:anywhere]", house.custom && "text-entered")}>
            <ProviderLink p={house} />
          </span>
        </LongestCase>
        <LongestCase cases={longest.lines}>
          <HouseLine
            house={house}
            snapshot={bundle.snapshots.find((s) => s.id === house.id)}
            charge={
              row.generic?.costAs && (
                <>
                  {c.pair.colCharges(years)}: <Num animate value={row.generic.costAs(c.pair.colCharges(years))} />
                </>
              )
            }
          />
        </LongestCase>
      </div>
      <div className="px-5 pt-4 pb-2 flex flex-col gap-0.5">
        <h3 className="font-semibold">{c.pair.accounts}</h3>
        <span className="text-sm text-muted-foreground">{n.accountsCond}</span>
        <span className="text-sm text-muted-foreground">{n.accountsHint}</span>
        <LongestCase className="text-xs text-muted-foreground" cases={[<span key="s">{c.pair.standingNote(Math.max(standingCount, 1), local.length)}</span>, <span key="n">{c.pair.noMonthly}</span>]}>
          <span>{monthly === 0 ? c.pair.noMonthly : standingCount > 0 && c.pair.standingNote(standingCount, local.length)}</span>
        </LongestCase>
        <span className="text-xs text-muted-foreground">
          {c.pair.whichPrice}
          {saved.length > 0 && <> {c.pair.collectedSpan(`\u2066${fmt.date(saved[0]!)}\u2069`, `\u2066${fmt.date(saved.at(-1)!)}\u2069`)}</>}
        </span>
        <AbroadNotes view={view} bundle={bundle} open={abroadOpen} onOpenChange={setAbroadOpen} />
        {ownBank && <OwnBankField view={view} bundle={bundle} value={ownBank.value} onChange={ownBank.onChange} />}
      </div>
      <div className="@container">
        <PickList
          label={c.pair.listLabelAccounts}
          columns="1.5rem 9.5rem minmax(0,1fr) 6.5rem"
          phoneColumns="1.25rem minmax(0,1fr) auto"
          head={
            <>
              <span>#</span>
              <span>{c.pair.colAccount}</span>
              <span aria-hidden="true" className="max-md:hidden" />
              <span className="text-end whitespace-nowrap">{c.pair.colChargesShort}</span>
            </>
          }
          rows={[...pickRows, ...greyRows]}
        />
      </div>
      <div className="px-5 py-3 flex flex-col gap-3">
        <AddEntryButton kind="broker" />
        <ChartLegend
          pick={legendPick}
          items={[
            { id: "remainder", swatch: <Swatch shape="box" className="bg-chart-cost-other" />, label: c.pair.remainder },
            ...lines.map((l) => ({ id: l, swatch: <Swatch shape="box" className={lineClass[l] ?? "bg-chart-cost-other"} />, label: legendName(l, ok.some((h) => hasCurrent(h.generic.lines ?? []))) })),
            ...(ok.some((h) => h.generic.costN! > scale) ? [{ id: "broken", label: c.pair.broken }] : []),
          ]}
        />
      </div>
    </Card>
  );
}

/** The fund column with no fund to show: what is missing, the funds typed that cannot be priced, and where to find a fund's fees. */
export function NoFundColumn({ view, mayaHref }: { view: InvestView; mayaHref: string | null }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(c.funds.requestText(view.index.name));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  // a fund the person typed that prices nowhere (a hedged one, D44) keeps its row, with the reason
  const typed = view.options.filter((o) => o.exists).flatMap((o) => o.funds);
  return (
    <Card pad="none" className="flex flex-col overflow-hidden">
      <div className="bg-popover border-b border-border px-5 py-4 flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{c.pair.fundSlot}</span>
        <span className="text-lg font-bold">{n.fundTitle}</span>
        <span className="text-sm text-muted-foreground">{n.fundWhy}</span>
      </div>
      <div className="px-5 py-5 flex flex-col gap-3 items-start">
        <h3 className="font-semibold">{c.pair.funds(view.index.name)}</h3>
        {typed.length === 0 ? (
          <p className="text-muted-foreground">{n.none}</p>
        ) : (
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">{n.unpriced}</span>
            {typed.map((f) => (
              <span key={f.rec.id} className="flex flex-col gap-0.5">
                <bdi className="font-semibold text-entered [overflow-wrap:anywhere]">{f.name}</bdi>
                <span className="text-xs text-muted-foreground">{f.reason ? reasonText(f.reason, optionClass[f.option]) : c.funds.cannot}</span>
                <FundTerms id={f.rec.id} />
              </span>
            ))}
          </div>
        )}
        <AddEntryButton kind="fund" />
        <p className="text-sm text-muted-foreground">{n.mayaLead}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {mayaHref && (
            <a href={mayaHref} target="_blank" rel="noopener noreferrer" className="text-link hover:underline inline-flex items-center gap-1 min-h-target">
              {c.funds.maya} <IconExternal size={14} />
            </a>
          )}
          <Button variant="secondary" onClick={copy}>
            <IconCopy size={16} />
            {copied ? c.funds.copied : c.funds.request}
          </Button>
        </div>
      </div>
    </Card>
  );
}
