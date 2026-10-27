// The index page as two linked lists (founder, 2026-10-27; spec research/specs/2026-10-27-invest-improvements 3.8 to 3.10): an account
// and a fund. The account list prices every account with the chosen fund, the fund list prices every fund at the chosen account;
// neither list leaves anything out (a row that cannot be priced stays, with its reason). Above them, the result: what is put in, what
// is left, and what it costs, split by who takes it. On the cheapest pair one figure; once the person picks something else, their pair
// and the cheapest one above each other.
import { useMemo } from "react";
import type { FeeLine } from "@finance-tool/engine";
import { brands, invest as c } from "../../copy";
import { pairCosts, type FundWay, type InvestView, type PairCosts, type Reason, type WayPrice } from "../../lib/invest";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { brokerLabels, fundLabels, optionLabels, type Label } from "../../lib/labels";
import { computed, type SiteValue } from "../../lib/value";
import { fmt } from "../../lib/format";
import { IconLock } from "../icons";
import { Num } from "../provenance";
import { Button, Card, ChartLegend, CostStack, LabelChip, LabelFilter, LabelRow, PickList, ProductIdLink, Sentence, Swatch, Tag, cx, type CostPart, type PickRow } from "../kit";
import { optionClass, OptionTag, reasonText } from "./parts";
import { ProviderLink, providerName } from "./sections";
import { Fees } from "./funds";

export interface Pick {
  house: string;
  fund: string;
}

const lineClass: Record<string, string> = { trade: "bg-chart-cost-trade", custody: "bg-chart-cost-custody", fixed: "bg-chart-cost-fixed", fx: "bg-chart-cost-fx" };
const lineOf = (line: FeeLine) => (line in lineClass ? line : "other");
/** A computed shekel figure of this page, whole shekels (the totals and gaps the bars and lists show). */
const nis = (n: number, formula: string, about: string, today: string, inputs: Record<string, SiteValue> = {}): SiteValue => computed(Math.round(n), "nis", formula, inputs, { today, about });
/** A gain shown with its plus sign, isolated so it reads "+2,621 ₪" inside Hebrew. */
const plus = (v: SiteValue) => (typeof v.value === "number" && v.value > 0 ? `\u2066+${fmt.nisWhole(v.value)}\u2069` : undefined);
const priced = (x: WayPrice | { reason: Reason } | undefined): x is WayPrice => !!x && "valueN" in x;

/** Every fund on the index, of every option that exists for it. */
export const allFunds = (view: InvestView): FundWay[] => view.options.filter((o) => o.exists).flatMap((o) => o.funds);

/** The default pick: the cheapest complete way. */
export const pickOfHeadline = (view: InvestView): Pick | null => (view.headline ? { house: view.headline.providerId, fund: view.headline.fund.rec.id } : null);

/** The other half when one half changes: keep it when it still prices, else the one that leaves the most with the new half. */
export function repick(view: InvestView, cur: Pick, change: Partial<Pick>): Pick {
  const funds = allFunds(view);
  if (change.house) {
    const keep = funds.find((f) => f.rec.id === cur.fund);
    if (keep && priced(keep.byHouse[change.house])) return { house: change.house, fund: cur.fund };
    const best = funds.map((f) => ({ f, at: f.byHouse[change.house!] })).filter((x) => priced(x.at) && !x.at.open).sort((a, b) => (b.at as WayPrice).valueN - (a.at as WayPrice).valueN)[0];
    return { house: change.house, fund: best?.f.rec.id ?? cur.fund };
  }
  if (change.fund) {
    const f = funds.find((x) => x.rec.id === change.fund);
    if (f && priced(f.byHouse[cur.house])) return { house: cur.house, fund: change.fund };
    return { house: f?.best?.providerId ?? cur.house, fund: change.fund };
  }
  return cur;
}

// ---------------------------------------------------------------- the result

function partsOf(pc: PairCosts): CostPart[] {
  const n = (v: SiteValue) => (typeof v.value === "number" ? v.value : 0);
  const whole = (x: number) => Math.round(x).toLocaleString("he-IL");
  const account = pc.account.map((l) => ({ id: l.line, value: n(l.cost), className: lineClass[lineOf(l.line)] ?? "bg-chart-cost-other", inside: whole(n(l.cost)) }));
  return [...account, { id: "fund", value: n(pc.fund), className: "bg-chart-cost-fund", inside: whole(n(pc.fund)) }, { id: "tax", value: n(pc.tax), className: "bg-chart-tax", inside: whole(n(pc.tax)) }];
}
const totalOf = (parts: CostPart[]) => parts.reduce((a, p) => a + Math.max(0, p.value), 0);

function CostLegend({ lines }: { lines: string[] }) {
  const groupHead = (text: string) => ({ id: `g-${text}`, label: <span className="text-foreground font-medium">{text}</span> });
  return (
    <ChartLegend
      items={[
        groupHead(c.pair.who.account),
        ...lines.map((l) => ({ id: l, swatch: <Swatch shape="box" className={lineClass[l] ?? "bg-chart-cost-other"} />, label: c.pair.lines[l] ?? c.pair.lines.other })),
        groupHead(c.pair.who.fund),
        { id: "fund", swatch: <Swatch shape="box" className="bg-chart-cost-fund" />, label: c.pair.fundLine },
        groupHead(c.pair.who.state),
        { id: "tax", swatch: <Swatch shape="box" className="bg-chart-tax" />, label: c.pair.taxLine },
      ]}
    />
  );
}

function CostBar({ who, sub, pc, scale, you, today }: { who: string; sub: string; pc: PairCosts; scale: number; you?: boolean; today: string }) {
  const parts = partsOf(pc);
  const total = totalOf(parts);
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)_6rem] items-center gap-3">
      <span className={cx("flex flex-col leading-tight font-semibold", you && "text-entered")}>
        {who}
        <span className="text-xs font-normal text-muted-foreground">{sub}</span>
      </span>
      <CostStack parts={parts} scale={scale} label={`${who}: ${fmt.nisWhole(total)}`} />
      <span className="text-end font-semibold">
        <Num value={nis(total, "F-61", who, today, { left: pc.left })} />
      </span>
    </div>
  );
}

export function PairResult({ view, bundle, plan, pick, onPick }: { view: InvestView; bundle: WorkbenchBundle; plan: WorkbenchInputs; pick: Pick; onPick: (p: Pick) => void }) {
  const best = pickOfHeadline(view);
  const onBest = !!best && best.house === pick.house && best.fund === pick.fund;
  const pc = useMemo(() => pairCosts({ bundle, index: view.index, plan, fundId: pick.fund, providerId: pick.house }), [bundle, view.index, plan, pick.fund, pick.house]);
  const pcBest = useMemo(() => (best && !onBest ? pairCosts({ bundle, index: view.index, plan, fundId: best.fund, providerId: best.house }) : null), [bundle, view.index, plan, best?.fund, best?.house, onBest]);
  if (!pc) return null;
  const years = plan.years;
  const months = 12 * plan.years;
  const lines = [...new Set([...pc.account, ...(pcBest?.account ?? [])].map((l) => lineOf(l.line)))];
  const gap = (a: SiteValue, b: SiteValue, about: string) => nis((a.value as number) - (b.value as number), "F-65", about, bundle.today, { a, b });
  const paid = (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-muted-foreground">{c.pair.paidIn}</span>
      <span className="text-3xl font-bold leading-tight">
        <Num value={pc.paidIn} />
      </span>
      <span className="text-xs text-muted-foreground">{c.pair.paidInNote(months)}</span>
    </div>
  );
  const arrow = (
    <span aria-hidden="true" className="text-2xl text-muted-foreground self-center">
      ←
    </span>
  );

  if (onBest) {
    const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
    const yours = view.yourBroker && view.yourBroker !== pick.house ? fund?.byHouse[view.yourBroker] : undefined;
    const yourName = view.yourBroker ? providerName(view, view.yourBroker)?.short : undefined;
    const total = totalOf(partsOf(pc));
    const accountTotal = pc.account.reduce((a, l) => a + (l.cost.value as number), 0) + pc.interaction;
    return (
      <Card pad="roomy" className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          {paid}
          {arrow}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm text-muted-foreground">
              {c.pair.left(years)} · <span className="text-primary font-medium">{c.pair.cheapestStar}</span>
            </span>
            <span className="text-3xl font-bold leading-tight">
              <Num value={pc.left} />
            </span>
            <span className="text-xs text-muted-foreground">{c.pair.leftNote}</span>
          </div>
          {priced(yours) && yourName && (
            <div className="flex flex-col gap-0.5 ms-auto">
              <span className="text-sm text-muted-foreground">{c.pair.vsYourAccount(yourName)}</span>
              <span className="text-2xl font-bold text-primary">
                <Num value={gap(pc.left, yours.value, c.pair.vsYourAccount(yourName))} display={plus(gap(pc.left, yours.value, c.pair.vsYourAccount(yourName)))} />
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">
            {c.pair.costTitle(years)}: <Num value={nis(total, "F-61", c.pair.costTitle(years), bundle.today, { left: pc.left })} />{" "}
            <span className="text-sm font-normal text-muted-foreground">
              {c.pair.ofWhichAccount} <Num value={nis(accountTotal, "F-63", c.pair.ofWhichAccount, bundle.today)} />
            </span>
          </h3>
          <CostBar who={providerName(view, pick.house)?.short ?? pick.house} sub={c.pair.cheapest} pc={pc} scale={total} today={bundle.today} />
          <CostLegend lines={lines} />
        </div>
      </Card>
    );
  }

  const parts = partsOf(pc);
  const partsBest = pcBest ? partsOf(pcBest) : [];
  const scale = Math.max(totalOf(parts), totalOf(partsBest));
  const sumAccount = (x: PairCosts) => x.account.reduce((a, l) => a + (l.cost.value as number), 0) + x.interaction;
  return (
    <Card pad="roomy" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-stretch gap-x-6 gap-y-4">
        {paid}
        {arrow}
        <div className="flex-1 min-w-64 rounded-lg border border-entered bg-entered/10 p-3 flex flex-col gap-0.5">
          <span className="text-sm text-muted-foreground">{c.pair.yours}</span>
          <span className="text-3xl font-bold leading-tight">
            <Num value={pc.left} />
          </span>
          <span className="text-xs text-muted-foreground">
            {c.pair.left(years)}, {c.pair.leftNote}
          </span>
        </div>
        {pcBest && best && (
          <div className="flex-1 min-w-64 rounded-lg border border-border p-3 flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">{c.pair.cheapestStar}</span>
            <span className="text-3xl font-bold leading-tight text-primary">
              <Num value={pcBest.left} />
            </span>
            <span className="flex flex-wrap items-center gap-x-3 text-sm">
              <span>
                <Num value={gap(pcBest.left, pc.left, c.pair.moreIfCheapest)} display={plus(gap(pcBest.left, pc.left, c.pair.moreIfCheapest))} /> {c.pair.moreIfCheapest}
              </span>
              <Button variant="quiet" onClick={() => onPick(best)}>
                {c.pair.pickCheapest}
              </Button>
            </span>
          </div>
        )}
      </div>
      {pcBest && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold">{c.pair.costTitleBoth(years)}</h3>
          <CostBar who={providerName(view, pick.house)?.short ?? pick.house} sub={c.pair.yours} pc={pc} scale={scale} you today={bundle.today} />
          <CostBar who={providerName(view, best!.house)?.short ?? best!.house} sub={c.pair.cheapest} pc={pcBest} scale={scale} today={bundle.today} />
          <CostLegend lines={lines} />
          <Sentence size="sm" tone="muted">
            {c.pair.gapLead} {c.pair.gapPart.account} <Num value={nis(sumAccount(pc) - sumAccount(pcBest), "F-63", c.pair.gapPart.account, bundle.today)} />
            {" · "}
            {c.pair.gapPart.fund} <Num value={gap(pc.fund, pcBest.fund, c.pair.gapPart.fund)} />
            {" · "}
            {c.pair.gapPart.tax} <Num value={gap(pc.tax, pcBest.tax, c.pair.gapPart.tax)} />
          </Sentence>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------- the account column

/** The bars' scale: the costs of the main group, so one or two far larger accounts do not flatten the rest (they get a break mark). */
function barScale(costs: number[]): number {
  if (costs.length === 0) return 0;
  const sorted = [...costs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)]!;
  const inGroup = sorted.filter((x) => x <= 2.5 * Math.max(median, 1));
  return Math.max(...inGroup);
}

export function AccountColumn({ view, bundle, years, pick, onPick }: { view: InvestView; bundle: WorkbenchBundle; years: number; pick: Pick; onPick: (p: Pick) => void }) {
  const fund = allFunds(view).find((f) => f.rec.id === pick.fund);
  const house = providerName(view, pick.house);
  if (!fund || !house) return null;
  const best = pickOfHeadline(view);
  const rows = view.providers.map((p) => ({ p, at: fund.byHouse[p.id] }));
  const ok = rows.filter((r): r is { p: typeof r.p; at: WayPrice } => priced(r.at)).sort((a, b) => Number(a.at.open) - Number(b.at.open) || b.at.valueN - a.at.valueN);
  const missing = rows.filter((r) => !priced(r.at));
  const scale = barScale(ok.map((r) => r.at.accountCost));
  const lines = [...new Set(ok.flatMap((r) => r.at.lines.map((l) => lineOf(l.line))))];
  const snapshot = bundle.snapshots.find((s) => s.id === pick.house);
  const at = fund.byHouse[pick.house];
  const byReason = new Map<string, string[]>();
  for (const r of missing) {
    const text = r.at && "reason" in r.at ? reasonText(r.at.reason, optionClass[fund.option]) : c.funds.cannot;
    byReason.set(text, [...(byReason.get(text) ?? []), r.p.id]);
  }
  const pickRows: PickRow[] = ok.map((r, i) => {
    const parts: CostPart[] = r.at.lines.map((l) => ({ id: l.line, value: l.cost, className: lineClass[lineOf(l.line)] ?? "bg-chart-cost-other" }));
    const isYours = r.p.id === view.yourBroker;
    const isBest = best?.house === r.p.id && best.fund === pick.fund && pick.house !== r.p.id;
    return {
      key: r.p.id,
      selected: r.p.id === pick.house,
      onSelect: () => onPick(repick(view, pick, { house: r.p.id })),
      cells: (
        <>
          <span className="text-sm text-muted-foreground tabular-nums text-center">{r.at.open ? "—" : i + 1}</span>
          <span className={cx("flex flex-col leading-tight font-semibold whitespace-nowrap", isYours && "text-entered")}>
            {r.p.short}
            {isYours && <span className="text-xs font-normal text-muted-foreground">{c.pair.yoursTag}</span>}
            {isBest && <span className="text-xs font-medium text-primary">{c.pair.cheapestTag}</span>}
          </span>
          <span className="flex items-center gap-2 min-w-0">
            <CostStack size="sm" parts={parts} scale={scale} label={`${r.p.short}: ${fmt.nisWhole(r.at.accountCost)}`} />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              <Num value={nis(r.at.accountCost, "F-63", `${r.p.short}: ${c.pair.colChargesShort}`, bundle.today)} />
            </span>
          </span>
          <span className="text-end font-semibold">
            <Num value={r.at.value} />
          </span>
        </>
      ),
    };
  });
  return (
    <Card pad="none" className="flex flex-col overflow-hidden">
      <div className="bg-popover border-b border-border px-5 py-4 flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{c.pair.accountSlot}</span>
        <span className="text-xl font-bold">
          <ProviderLink p={house} />
        </span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {priced(at) && (
            <span className="text-muted-foreground">
              {c.pair.colCharges(years)}: <Num value={nis(at.accountCost, "F-63", c.pair.colCharges(years), bundle.today)} />
            </span>
          )}
          <LabelRow labels={brokerLabels(house, false)} />
          {snapshot && (
            <a href={snapshot.tariff.url} target="_blank" rel="noopener noreferrer" title={snapshot.tariff.title} className="text-link hover:underline">
              {c.pair.tariff} ↗
            </a>
          )}
        </span>
      </div>
      <div className="px-5 pt-4 pb-2 flex flex-col gap-0.5">
        <h3 className="font-semibold">{c.pair.accounts}</h3>
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-1.5">
          {c.pair.accountsCond} <Tag><bdi>{fund.name}</bdi></Tag> · {c.pair.accountsHint}
        </span>
      </div>
      <PickList
        label={c.pair.listLabelAccounts}
        columns="1.5rem 8rem minmax(0,1fr) 6.5rem"
        head={
          <>
            <span>#</span>
            <span>{c.pair.colAccount}</span>
            <span>{c.pair.colChargesShort}</span>
            <span className="text-end">{c.pair.colLeft}</span>
          </>
        }
        rows={pickRows}
      />
      <div className="px-5 py-3 flex flex-col gap-3">
        <ChartLegend
          items={[
            ...lines.map((l) => ({ id: l, swatch: <Swatch shape="box" className={lineClass[l] ?? "bg-chart-cost-other"} />, label: c.pair.lines[l] ?? c.pair.lines.other })),
            ...(ok.some((r) => r.at.accountCost > scale) ? [{ id: "broken", label: c.pair.broken }] : []),
          ]}
        />
        {missing.length > 0 && (
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{c.pair.notPriced(missing.length)}</span>
            {[...byReason.entries()].map(([text, ids]) => (
              <span key={text} className="flex flex-col gap-0.5">
                <span>{text}</span>
                <span className="flex flex-wrap gap-x-1">
                  {ids.map((id, i) => (
                    <button key={id} type="button" className="text-link hover:underline" onClick={() => onPick(repick(view, pick, { house: id }))}>
                      {providerName(view, id)?.short ?? id}
                      {i < ids.length - 1 ? " ·" : ""}
                    </button>
                  ))}
                </span>
              </span>
            ))}
            <span>{c.pair.willJoin}</span>
          </div>
        )}
      </div>
    </Card>
  );
}


// ---------------------------------------------------------------- the fund column

const FILTER_FAMILIES = new Set<Label["family"]>(["trade", "follow", "currency", "payout", "held"]);

const mayaHrefOf = (f: FundWay) => {
  // Maya's page of the fund exists for an Israeli ETF and an Israeli tracking fund (the address pattern of the fund records' sources)
  const kind = f.option === "il-etf" ? "etfs" : f.option === "il-tracking" ? "mutual-funds" : null;
  return kind && f.rec.identifiers.tase_number ? `https://maya.tase.co.il/he/funds/${kind}/${f.rec.identifiers.tase_number}` : null;
};

/** The fund's labels: how it trades (the type, from its option), then what the record says about it. */
const labelsOf = (view: InvestView, f: FundWay): Label[] => [optionLabels(f.option)[1] ?? optionLabels(f.option)[0]!, ...fundLabels(f.rec, view.index, f.option)];

export function FundColumn({ view, today, pick, onPick, filter, onFilter }: { view: InvestView; today: string; pick: Pick; onPick: (p: Pick) => void; filter: string | null; onFilter: (id: string | null) => void }) {
  const funds = allFunds(view);
  const fund = funds.find((f) => f.rec.id === pick.fund);
  const house = providerName(view, pick.house);
  if (!fund || !house) return null;
  const selAt = fund.byHouse[pick.house];
  const rows = funds.map((f) => ({ f, at: f.byHouse[pick.house], labels: labelsOf(view, f) }));
  // the labels that split the list: some funds have them, some do not
  const counts = new Map<string, { label: Label; count: number }>();
  for (const r of rows) for (const l of r.labels) counts.set(l.id, { label: l, count: (counts.get(l.id)?.count ?? 0) + 1 });
  // only what the fund is (its type, how it tracks, its currency, what it pays out, where it is held); the tax and paperwork labels are read, not filtered on
  const options = [...counts.values()].filter((x) => x.count > 0 && x.count < rows.length && FILTER_FAMILIES.has(x.label.family));
  const active = filter && counts.has(filter) ? filter : null;
  const shown = rows.filter((r) => !active || r.labels.some((l) => l.id === active) || r.f.rec.id === pick.fund);
  const order = (r: (typeof rows)[number]) => (priced(r.at) ? (r.at.open ? 1 : 0) : 2);
  shown.sort((a, b) => order(a) - order(b) || (priced(b.at) ? b.at.valueN : 0) - (priced(a.at) ? a.at.valueN : 0));
  const pickRows: PickRow[] = shown.map((r) => {
    const at = r.at;
    const isSel = r.f.rec.id === pick.fund;
    const right = isSel ? (
      <span className="text-sm text-muted-foreground">{c.pair.chosen}</span>
    ) : priced(at) && priced(selAt) ? (
      <span className="font-semibold">
        <Num value={nis(at.valueN - selAt.valueN, "F-65", c.pair.colDiff, today, { a: at.value, b: selAt.value })} display={plus(nis(at.valueN - selAt.valueN, "F-65", c.pair.colDiff, today))} />
      </span>
    ) : (
      <span className="text-xs text-muted-foreground whitespace-normal">{at && "reason" in at ? reasonText(at.reason, optionClass[r.f.option]) : c.funds.cannot}</span>
    );
    return {
      key: r.f.rec.id,
      selected: isSel,
      muted: !priced(at),
      onSelect: () => onPick(repick(view, pick, { fund: r.f.rec.id })),
      cells: (
        <>
          <span className="flex flex-col gap-1.5 min-w-0">
            <span className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="font-semibold">
                <bdi>{r.f.name}</bdi>
              </span>
              <span onClick={(e) => e.stopPropagation()}>
                <ProductIdLink id={r.f.number} href={mayaHrefOf(r.f)} label={brands.funds.mayaLink(r.f.number)} />
              </span>
            </span>
            <span className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
              {r.labels.map((l) => (
                <LabelChip key={l.id} label={l} />
              ))}
              {priced(at) && at.open && (
                <Tag tone="blocked" icon={<IconLock size={14} />}>
                  {c.options.open}
                </Tag>
              )}
            </span>
          </span>
          <span className="text-end self-center max-w-40">{right}</span>
        </>
      ),
    };
  });
  return (
    <Card pad="none" className="flex flex-col overflow-hidden">
      <div className="bg-popover border-b border-border px-5 py-4 flex flex-col gap-1.5">
        <span className="text-sm text-muted-foreground">{c.pair.fundSlot}</span>
        <span className="flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-bold whitespace-nowrap">
            <bdi>{fund.name}</bdi>
          </span>
          <ProductIdLink id={fund.number} href={mayaHrefOf(fund)} label={brands.funds.mayaLink(fund.number)} />
        </span>
        <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
          {c.pair.colFees}: <Fees rec={fund.rec} inline />
        </span>
        <span className="flex flex-wrap gap-1.5 items-center">
          <OptionTag option={fund.option} />
          {fund.rec.manager && <span className="text-xs text-muted-foreground">{c.funds.manager}: <bdi>{fund.rec.manager}</bdi></span>}
        </span>
      </div>
      <div className="px-5 pt-4 pb-2 flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-semibold">{c.pair.funds(view.index.name)}</h3>
          <span className="text-sm text-muted-foreground flex flex-wrap items-center gap-1.5">
            {c.pair.fundsCond} <Tag>{house.short}</Tag> · {c.pair.fundsHint}
          </span>
        </div>
        <LabelFilter lead={c.pair.filter} allLabel={c.pair.clearFilter} value={active} onChange={onFilter} options={options} />
      </div>
      <PickList label={c.pair.listLabelFunds} columns="minmax(0,1fr) auto" head={<><span>{c.pair.colFund}</span><span className="text-end">{c.pair.colDiff}</span></>} rows={pickRows} />
      <p className="px-5 py-3 text-sm text-muted-foreground">
        {active ? `${c.pair.shown(shown.length, rows.length)} · ` : ""}
        {c.funds.trackingNote}
      </p>
    </Card>
  );
}

