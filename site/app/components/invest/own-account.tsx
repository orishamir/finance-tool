// An account on your own terms, started from a house (option א of 8dd1f013:research/specs/2026-11-04-own-broker/mockups.html):
// the panel that starts from a house's price list, or from one of its groups' prices, and lets the person change only what they got; the
// buttons that open it; and the line a person's row carries in the comparison. Typing stays in the panel: the page changes when the person adds
// the account (guidelines/design.md). The prices are the library's (own-account.ts, own-account-view.ts); nothing here prices anything.
import type { FeeLine } from "@finance-tool/engine";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { invest as root, r4catalogue } from "../../copy";
import { brokerErrors, brokerFromDraft, brokerTerms, NAME_MAX, newBrokerId, type BrokerDraft, type CustomBroker, type EntryError } from "../../lib/custom-entries";
import { fmt } from "../../lib/format";
import { accountSum, buildInvest, type PairCosts } from "../../lib/invest";
import { baseOf, startingPointsOf, withAdopted, type GroupCopy } from "../../lib/own-account";
import { pointOfBroker, startDraft, stretchesOf } from "../../lib/own-account-panel";
import { FEE_LINE, FEE_TYPES, layersOf, ownAccountResult, type FeeLayers, type FeeType, type LayerFigure } from "../../lib/own-account-view";
import { customersPaid } from "../../lib/customers-paid";
import { useAfterRender, useSettled } from "../../lib/settled";
import { isoToday } from "../../lib/state";
import { entered, numberOf, type SiteValue } from "../../lib/value";
import { withCustomEntries } from "../../lib/custom-entries";
import { Num, StateTag } from "../provenance";
import { Button, Callout, ChartLegend, CostStack, DocLink, FieldState, flushPendingFields, NumberField, percentCheck, PeriodStrip, SelectField, StatRow, StatTile, Swatch, TextField, useChartPick, cx, type CostPart } from "../kit";
import { Actions, EditButton, isInvalid, nisCheck, useDraft, useEditors, type PanelWorld } from "./editors";
import { sourceHref, type CitedPlace } from "../../lib/sources";

const c = root.customEntries;
const p = root.ownAccount.panel;
const pairWords = root.pair;
const pctCheck = percentCheck();

/** The cost bars' colours by fee type: the index page's own (pair.tsx). */
const LINE_CLASS: Record<string, string> = { trade: "bg-chart-cost-trade", custody: "bg-chart-cost-custody", fixed: "bg-chart-cost-fixed", fx: "bg-chart-cost-fx" };
const lineClass = (l: string) => LINE_CLASS[l] ?? "bg-chart-cost-other";
/** A fee type's place in the bars and the legend: the index page's (pair.tsx `byLegend`), any other type after them. */
const lineRank = (l: string) => { const i = Object.keys(LINE_CLASS).indexOf(l); return i < 0 ? Infinity : i; };
/** A bank's current account (F-102, D64) is shown as the account's fee, as on the index page's lists (pair.tsx `lineOf`). */
const lineOf = (l: FeeLine): string => (l === "account" ? "fixed" : l);
/** The account fee's name, which covers the current account too where the account has one (pair.tsx `legendName`). */
const fixedName = (line: string, current: boolean): string | undefined => (line === "fixed" && current ? pairWords.legendAccount : pairWords.lines[line]);
const FEE_OF_LINE: Record<string, FeeType> = { trade: "trade", custody: "custody", fixed: "fixed", fx: "conversion" };

const plus = (n: number) => (n > 0 ? `⁦+${fmt.nisWhole(n)}⁩` : undefined);
const dash = <span aria-hidden="true">—</span>;

// ---------------------------------------------------------------- one price, in words

/** A price's figures one under another, each with its word ("מינימום", "לרבעון"), every number through the provenance component. */
function Figures({ figs, asEntered, today, about }: { figs: LayerFigure[]; /** The person chose this price: its numbers are theirs (entered, blue), the group's document beside it. */ asEntered?: boolean; today?: string; about?: string }) {
  return (
    <span className="flex flex-col gap-0.5">
      {figs.map((f) => {
        const value: SiteValue = asEntered && typeof f.value.value === "number" ? entered(f.value.value, f.value.unit, today ?? isoToday(), about) : f.value;
        const word = p.kinds[f.kind];
        return (
          <span key={`${f.kind}-${f.per ?? ""}`} className="whitespace-normal">
            {word && f.kind !== "rate" && f.kind !== "exempt" && <>{word} </>}
            <Num value={value} size="cell" {...(f.kind === "exempt" ? { display: p.exempt } : {})} />
            {f.kind === "rate" && f.per && f.per !== "trade" && <span className="text-muted-foreground"> {r4catalogue.card.period[f.per]}</span>}
          </span>
        );
      })}
    </span>
  );
}

/** The link to the document a figure is from: its own page of a PDF where the record names one. */
function SourceLink({ source, children }: { source: CitedPlace & { title?: string }; children: ReactNode }) {
  return <DocLink href={sourceHref(source)}>{children}</DocLink>;
}

// ---------------------------------------------------------------- the person's column

interface FieldSpec {
  key: "tradePct" | "tradeMin" | "custodyPct" | "custodyMin" | "monthlyFee" | "fxPct";
  caption: string;
  label: string;
  unit: string;
  pct: boolean;
}
const FIELDS: Record<FeeType, FieldSpec[]> = {
  trade: [
    { key: "tradePct", caption: c.fields.percent, label: p.field.tradePct, unit: "pct_of_trade", pct: true },
    { key: "tradeMin", caption: c.fields.tradeMin, label: p.field.tradeMin, unit: "nis_per_trade", pct: false },
  ],
  custody: [
    { key: "custodyPct", caption: c.fields.percentYear, label: p.field.custodyPct, unit: "pct_per_year", pct: true },
    { key: "custodyMin", caption: c.fields.custodyMin, label: p.field.custodyMin, unit: "nis_per_month", pct: false },
  ],
  fixed: [{ key: "monthlyFee", caption: c.fields.nisMonth, label: p.field.monthlyFee, unit: "nis_per_month", pct: false }],
  conversion: [{ key: "fxPct", caption: c.fields.percent, label: p.field.fxPct, unit: "pct_of_trade", pct: true }],
};

/** What the group's price says on a line, and what the person can do with it. */
function GroupNote({ layer, groupName, onAdopt, today }: { layer: FeeLayers; groupName: string; onAdopt: (fee: GroupFeeKey, on: boolean) => void; today: string }) {
  const g = layer.group;
  if (!g) return null;
  // the price's own words; what it is charged on is the researcher's reading of the document, kept in the record (it read as a note in brackets)
  const words = g.words;
  const doc = <SourceLink source={g.source}>{p.groupDoc}</SourceLink>;
  const ends = g.forMonths !== null && <span className="text-muted-foreground">{p.groupFor(p.groupEnds(g.forMonths))}</span>;
  const side = g.side && <span className="text-muted-foreground">{p.groupSide[g.side]}</span>;
  if (g.applied && !g.adopted) {
    return (
      <span className="flex flex-col gap-0.5">
        <Figures figs={g.figures} />
        <span className="flex flex-wrap items-center gap-x-2 text-xs">
          <span className="text-muted-foreground">{p.fromGroup(groupName)}</span>
          {doc}
        </span>
        {(ends || side) && <span className="flex flex-wrap gap-x-2 text-xs">{ends}{side}</span>}
      </span>
    );
  }
  if (g.adopted) {
    return (
      <span className="flex flex-col gap-0.5">
        <Figures figs={g.figures} asEntered today={today} about={p.adoptedAbout(groupName, words)} />
        <span className="flex flex-wrap items-center gap-x-2 text-xs">
          <StateTag state="entered" />
          <span className="text-muted-foreground">{p.adopted}</span>
          {doc}
        </span>
        {(ends || side) && <span className="flex flex-wrap gap-x-2 text-xs">{ends}{side}</span>}
        <Button variant="quiet" className="self-start text-sm -ms-2 min-h-target" onClick={() => onAdopt(g.key, false)}>
          {p.adoptUndo}
        </Button>
      </span>
    );
  }
  // a price whose words do not name fund units: shown beside the list's, not applied (D42); the person may choose to use it
  return (
    <span className="flex flex-col gap-0.5 text-xs">
      <span className="text-muted-foreground">{p.groupWords(words)}</span>
      <span className="text-muted-foreground">{p.groupNoFund}</span>
      <span className="flex flex-wrap items-center gap-x-2">{doc}</span>
      {g.adoptable && (
        <Button variant="secondary" className="self-start text-sm min-h-target" onClick={() => onAdopt(g.key, true)}>
          {p.adoptButton}
        </Button>
      )}
    </span>
  );
}
type GroupFeeKey = NonNullable<FeeLayers["group"]>["key"];

function YoursCell({ layer, draft, set, setMany, groupName, onAdopt, today }: { layer: FeeLayers; draft: BrokerDraft; set: <K extends keyof BrokerDraft>(k: K, v: BrokerDraft[K]) => void; setMany: (patch: Partial<BrokerDraft>) => void; groupName: string; onAdopt: (fee: GroupFeeKey, on: boolean) => void; today: string }) {
  const specs = FIELDS[layer.fee];
  const typed = specs.some((s) => draft[s.key] !== null);
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm min-h-5">{layer.group ? <GroupNote layer={layer} groupName={groupName} onAdopt={onAdopt} today={today} /> : !typed && <span className="text-muted-foreground">{p.sameAsList}</span>}</div>
      <div className="flex flex-wrap items-start gap-x-3 gap-y-1">
        {specs.map((s) => (
          <div key={s.key} className="flex flex-col gap-0.5 [&_.field-box-compact]:w-28">
            <span className="text-xs text-muted-foreground">{s.caption}</span>
            <NumberField compact optional agorot={!s.pct} label={s.label} unit={s.unit} value={draft[s.key] as number | null} isEntered={draft[s.key] !== null} validate={s.pct ? pctCheck : nisCheck} onCommit={(n) => set(s.key, n)} onReset={() => set(s.key, null)} placeholder={p.field.placeholder} />
          </div>
        ))}
      </div>
      <FieldState entered={typed} onReset={() => setMany(Object.fromEntries(specs.map((s) => [s.key, null])) as Partial<BrokerDraft>)} />
    </div>
  );
}

function ListCell({ layer }: { layer: FeeLayers }) {
  if (layer.list.length === 0) return <span className="text-sm text-muted-foreground">{p.listNone}</span>;
  const src = layer.list[0]!.value.source as { url: string; title?: string; page?: number };
  return (
    <span className="flex flex-col gap-1 text-sm">
      <Figures figs={layer.list} />
      {src.url && src.url !== "local" && (
        <span className="text-xs">
          <SourceLink source={src}>{p.listWord}</SourceLink>
        </span>
      )}
    </span>
  );
}

// ---------------------------------------------------------------- what the draft prices at

/** The bars' parts for one account: its fee types in their colours, each with where its price comes from. */
function costParts(pc: PairCosts, lines: readonly string[], source: (line: string) => ReactNode): CostPart[] {
  const n = (v: SiteValue) => (typeof v.value === "number" ? v.value : 0);
  const parts: CostPart[] = lines.map((line) => ({ id: line, legendId: line, name: fixedName(line, pc.account.some((l) => l.line === "account")) ?? pairWords.lines.other, value: pc.account.filter((l) => lineOf(l.line) === line).reduce((a, l) => a + n(l.cost), 0), className: lineClass(line), inside: true as const, source: source(line) }));
  // the account's fees on each other first, as on every bar of the page
  return [{ id: "remainder", legendId: "remainder", name: pairWords.remainder, about: pairWords.remainderAbout, value: pc.interaction, className: "bg-chart-cost-other", inside: true as const, source: p.costs.computed }, ...parts];
}
const total = (parts: CostPart[]) => parts.reduce((a, x) => a + x.value, 0);

/** `pc`: the account whose cost the bar draws; its figure adds up the account's line costs and the remainder, each opening its own sheet (F-91). */
function Bar({ who, pc, parts, scale, label, today, highlight }: { who: string; pc: PairCosts; parts: CostPart[]; scale: number; label: string; today: string; highlight: string | null }) {
  const sum = total(parts);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[7rem_minmax(0,1fr)_6rem] items-center gap-x-3 gap-y-1.5">
      <span className="text-sm text-muted-foreground">{who}</span>
      <div className="min-w-0 max-md:col-span-2 max-md:row-start-2">
        <CostStack parts={parts} total={Math.round(sum)} scale={scale} highlight={highlight} label={`${who}: ${fmt.nisWhole(sum)}`} />
      </div>
      <span className="text-end font-semibold">
        <Num animate value={accountSum(pc, label, today, Math.round)} />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- the panel

export function OwnAccountPanel({ headId, world, houseId, from, broker, others, funds, writable, onSave, onCancel, onRemove }: { headId: string; world: PanelWorld; houseId: string; from: string; broker: CustomBroker | null; others: readonly CustomBroker[]; funds: readonly import("../../lib/custom-entries").CustomFund[]; writable: boolean; onSave: (b: CustomBroker) => void; onCancel: () => void; onRemove: (id: string) => void }) {
  const house = world.wb.snapshots.find((s) => s.id === houseId)!;
  const row = world.view.houses.find((h) => h.provider.id === houseId);
  const short = row?.provider.short ?? house.provider.name_he;
  const option = row?.best?.fund.option ?? null;
  const points = useMemo(() => startingPointsOf(house), [house]);
  const id = useRef(broker?.id ?? newBrokerId()).current;
  const today = isoToday();
  const form = useRef<HTMLDivElement>(null);
  const [errors, setErrors] = useState<EntryError[]>([]);
  const { draft, now, set, setMany } = useDraft<BrokerDraft>(() => {
    if (broker) return { name: broker.name, tradePct: numberOf(broker.tradePct), tradeMin: numberOf(broker.tradeMin), custodyPct: numberOf(broker.custodyPct), custodyMin: numberOf(broker.custodyMin), fxPct: numberOf(broker.fxPct), monthlyFee: numberOf(broker.monthlyFee), sellsIsraeli: broker.sells.israeli, sellsAbroad: broker.sells.abroad, base: broker.base, untilYears: broker.untilYears ?? null };
    const point = points.find((x) => x.key === from) ?? points[0]!;
    const base = p.nameDefault(short);
    let name = base;
    for (let n = 2; others.some((o) => o.name === name); n++) name = `${base} ${n}`;
    return startDraft(house, point, name);
  });
  const point = pointOfBroker(points, draft.base);
  const group: GroupCopy | null = draft.base?.group ?? null;

  // what the lines say is cheap to build, so it follows every keystroke; the account's prices (every account on the page again) wait for the hand to rest
  const live = useMemo(() => brokerFromDraft(draft, id, today), [draft, id, today]);
  const layers = useMemo(() => (option ? layersOf(world.wb, world.plan, live, house, option) : null), [world.wb, world.plan, live, house, option]);
  const settled = useSettled(draft, 250);
  const answer = useAfterRender(
    option
      ? () => {
          const b = brokerFromDraft(settled, id, today);
          const bundle = withCustomEntries(world.wb, [...others.filter((o) => o.id !== id), b], funds, world.customs);
          const view = buildInvest({ bundle, index: world.index, plan: world.plan, yourBroker: null });
          return { b, result: ownAccountResult({ bundle, index: world.index, plan: world.plan, broker: b, view }) };
        }
      : null,
    [settled],
    40,
  );
  const result = answer?.result ?? null;
  const legend = useChartPick();

  const years = world.plan.years;
  const stretches = layers ? stretchesOf(layers, draft.untilYears, years) : null;
  const adopt = (fee: GroupFeeKey, on: boolean) => draft.base?.group && set("base", { ...draft.base, group: withAdopted(draft.base.group, fee, on) });
  const start = (key: string) => {
    const next = points.find((x) => x.key === key);
    if (next) setMany({ base: baseOf(house, next), untilYears: null });
  };

  const save = () => {
    flushPendingFields();
    const d = now.current;
    const e = brokerErrors(d, others, broker?.id ?? null);
    setErrors(e);
    if (e.length > 0 || isInvalid(form.current)) return;
    onSave(brokerFromDraft(d, id, today));
  };

  // the bars: the house's price list against the account, one scale, every fee type in both so a part that falls to zero shrinks in its place
  const withCurrentAccount = !!result && [...result.yours.account, ...(result.list?.account ?? [])].some((l) => l.line === "account");
  // in the index page's order (pair.tsx `byLegend`), whatever the price list's own, so the bars and the legend agree
  const lineIds = result && result.list ? [...new Set([...result.yours.account, ...result.list.account].map((l) => lineOf(l.line)))].sort((a, b) => lineRank(a) - lineRank(b) || (a < b ? -1 : a > b ? 1 : 0)) : [];
  const layerOf = (line: string) => layers?.find((l) => l.fee === FEE_OF_LINE[line]);
  const sourceYours = (line: string): ReactNode => {
    const l = layerOf(line);
    if (!l) return p.costs.computed;
    return l.setBy === "yours" ? p.costs.fromYours : l.setBy === "group" && group ? p.costs.fromGroup(group.name) : p.costs.fromList(short);
  };
  const listParts = result?.list ? costParts(result.list, lineIds, () => p.costs.fromList(short)) : [];
  const yoursParts = result ? costParts(result.yours, lineIds, sourceYours) : [];
  const scale = Math.max(total(listParts), total(yoursParts));
  const barLabels = { list: p.costs.total(p.costs.list), yours: p.costs.total(p.costs.yours) };
  const legendLines = ["remainder", ...lineIds.filter((l) => l !== "remainder")];

  const nameError = errors.includes("name-empty") ? c.errors["name-empty"] : errors.includes("name-taken") ? c.errors["name-taken"] : null;
  const tase = world.wb.links.tase?.href ?? null;

  return (
    <div ref={form} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 pe-10">
        <h2 id={headId} className="text-lg font-semibold">
          {p.title(short)}
        </h2>
        <p className="text-sm text-muted-foreground max-w-measure">{p.sub}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <TextField label={p.nameField} value={draft.name} onChange={(v) => set("name", v)} maxLength={NAME_MAX} error={nameError} />
        {points.length > 1 && (
          <SelectField
            wide
            label={p.startField}
            value={point.key}
            options={points.map((x) => ({ id: x.key, name: x.group ? x.nameHe : p.startList(short) }))}
            onChange={(k) => k && start(k)}
          />
        )}
      </div>

      {!option && <Callout tone="caution">{p.noWay(short)}</Callout>}
      {option && answer !== null && !result && <Callout tone="caution">{p.cannot}</Callout>}

      <StatRow cols={3}>
        <StatTile label={p.tileLeft(years)} note={p.tileLeftNote}>
          {result ? <Num animate value={result.left} /> : dash}
        </StatTile>
        <StatTile label={p.tilePlace} note={p.tilePlaceNote}>
          {result ? <Num value={result.place} display={p.tilePlaceValue(result.rank, result.of)} /> : dash}
        </StatTile>
        <StatTile label={p.tileDiff(short)} note={p.tileDiffNote}>
          {result?.difference ? <Num animate value={result.difference} display={plus} /> : dash}
        </StatTile>
      </StatRow>

      {layers && (
        <div role="table" aria-label={p.gridLabel} className="grid gap-x-3 gap-y-4 md:grid-cols-[6rem_9rem_8rem_minmax(0,1fr)]">
          <div role="row" className="contents max-md:hidden text-xs text-muted-foreground">
            {[p.head.fee, p.head.list, p.head.avg, p.head.yours].map((h) => (
              <div key={h} role="columnheader" className="pb-1.5 border-b border-border">
                {h}
              </div>
            ))}
          </div>
          {FEE_TYPES.map((fee, i) => {
            const layer = layers.find((l) => l.fee === fee)!;
            return (
              <div key={fee} role="row" className="contents">
                <div role="rowheader" className={`md:col-start-1 text-sm font-semibold max-md:border-t max-md:border-border max-md:pt-3`}>
                  {pairWords.lines[FEE_LINE[fee]] ?? fee}
                </div>
                <div role="cell" className="md:col-start-2 flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground md:hidden">{p.listLabel}</span>
                  <ListCell layer={layer} />
                </div>
                <div role="cell" className="md:col-start-4 flex flex-col gap-1" data-fee={i}>
                  <span className="text-xs text-muted-foreground md:hidden">{p.yoursLabel}</span>
                  <YoursCell layer={layer} draft={draft} set={set} setMany={setMany} groupName={group?.name ?? ""} onAdopt={adopt} today={today} />
                </div>
              </div>
            );
          })}
          <div role="cell" className="md:col-start-3 md:row-start-2 md:row-span-4 text-xs text-muted-foreground flex flex-col gap-2 max-md:border-t max-md:border-border max-md:pt-3">
            <span className="text-sm font-semibold md:hidden text-foreground">{p.head.avg}</span>
            {FEE_TYPES.map((fee) => customersPaid(houseId, fee)).some((v) => v) ? null : (
              <>
                <span>{p.avgBody(short)}</span>
                {tase && <DocLink href={tase}>{p.avgLink}</DocLink>}
              </>
            )}
          </div>
        </div>
      )}

      {group && (
        <div className="flex flex-col gap-3">
          <div className="max-w-xs">
            <NumberField optional label={p.until.label} unit="years" value={draft.untilYears ?? null} isEntered={draft.untilYears != null} validate={(n) => (Number.isInteger(n) && n >= 1 ? null : p.until.error)} onCommit={(n) => set("untilYears", n)} onReset={() => set("untilYears", null)} placeholder={p.field.placeholder} hint={p.until.hint(short)} />
          </div>
          {stretches && (
            <PeriodStrip
              years={years}
              label={p.until.strip}
              today={p.until.today}
              word={p.until.year}
              segments={stretches.map((s) => ({ from: s.fromYears, to: s.toYears, tone: s.kind === "all" ? "first" : s.kind === "some" ? "middle" : "after", label: s.kind === "all" ? p.until.allGroup : s.kind === "some" ? p.until.someGroup(s.fees.map((f) => pairWords.lines[FEE_LINE[f]] ?? f).join(", ")) : p.until.afterGroup }))}
            />
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="font-semibold">{p.costs.title}</h3>
        {result && result.list ? (
          <>
            <Bar who={p.costs.list} pc={result.list} parts={listParts} scale={scale} label={barLabels.list} today={today} highlight={legend.active} />
            <Bar who={p.costs.yours} pc={result.yours} parts={yoursParts} scale={scale} label={barLabels.yours} today={today} highlight={legend.active} />
            <ChartLegend pick={legend} items={legendLines.map((l) => ({ id: l, swatch: <Swatch shape="box" className={l === "remainder" ? "bg-chart-cost-other" : lineClass(l)} />, label: l === "remainder" ? pairWords.remainder : (fixedName(l, withCurrentAccount) ?? pairWords.lines.other ?? l) }))} />
          </>
        ) : (
          <p className="text-sm text-muted-foreground min-h-[7rem]">{p.computing}</p>
        )}
      </div>

      <p className="text-sm max-w-measure min-h-[3lh] max-md:min-h-[5lh]">
        {result ? (
          result.deciding ? (
            <>
              {p.decidesLead(pairWords.lines[result.deciding.line] ?? result.deciding.line)} <Num animate value={result.deciding.gap} display={(n) => fmt.nisWhole(Math.abs(n))} /> {(result.deciding.gap.value as number) > 0 ? p.decidesLess : p.decidesMore}
            </>
          ) : (
            result.list && p.decidesNone
          )
        ) : null}
      </p>

      <Actions entry={!!broker} name={draft.name} writable={writable} onSave={save} onCancel={onCancel} onRemove={() => broker && onRemove(broker.id)} saveLabel={broker ? undefined : p.add} />
    </div>
  );
}


// ---------------------------------------------------------------- the buttons and the row

/** The button on a house's row (and in a group's sub-row): opens the panel on the house's price list, or on that group. */
export function OwnAccountButton({ houseId, house, from = "list", children, className = "self-start -ms-2" }: { houseId: string; house: string; from?: string; children?: ReactNode; className?: string }) {
  const e = useEditors();
  if (!e?.world || !e.world.wb.snapshots.some((s) => s.id === houseId)) return null;
  return (
    <Button variant="quiet" className={cx("text-sm", className)} onClick={() => e.openOwn(houseId, from)}>
      {children ?? root.ownAccount.open(house)}
    </Button>
  );
}

/** A person's account built on a house, in the comparison: that it was entered, the house and group it started from, what it leaves against the house's own price list, and what was typed. */
export function OwnTerms({ b }: { b: CustomBroker }) {
  const e = useEditors();
  const w = e?.world;
  const base = b.base!;
  const house = w?.wb.snapshots.find((s) => s.id === base.houseId && !s.id.startsWith("custom-broker-"));
  const result = useMemo(() => (w && house ? ownAccountResult({ bundle: w.bundle, index: w.index, plan: w.plan, broker: b, view: w.view }) : null), [w, house, b]);
  const short = w?.view.houses.find((h) => h.provider.id === base.houseId)?.provider.short ?? base.houseName;
  const typed = brokerTerms(b).shown;
  const diff = result?.difference;
  const more = diff ? (diff.value as number) > 0 : false;
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-snug text-muted-foreground">
      <StateTag state="entered" />
      <span>{house ? p.basedOn(short, base.group?.name ?? null) : p.houseGone(base.houseName)}</span>
      {diff && result?.list && (
        <span>
          {Math.round(Math.abs(diff.value as number)) === 0 ? p.rowSame : <><Num value={diff} display={(n) => fmt.nisWhole(Math.abs(n))} /> {p.rowDiff(more)}</>}
          {result.deciding && `, ${p.rowMainly(pairWords.lines[result.deciding.line] ?? result.deciding.line)}`}
        </span>
      )}
      {typed.map((t) => (
        <span key={t.id}>
          {t.word}:
          {t.figures.map((x, i) => (
            <span key={i} className="ms-1">
              {x.before}
              {x.before ? " " : null}
              <Num value={x.value} />
            </span>
          ))}
        </span>
      ))}
      <EditButton editing={{ kind: "broker", id: b.id }} />
    </span>
  );
}
