// The person's own broker and fund on the index page (D44): the two quiet buttons under the lists, the panel they open, and what a row of
// an entry says. Typing stays in the panel: nothing on the page changes until the person saves (guidelines/design.md, "little movement").
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { invest as root } from "../../copy";
import type { FundRecord } from "@finance-tool/schema";
import { brokerDraftOf, brokerErrors, brokerFromDraft, brokerTerms, customFundGap, unknownLines, DOMICILES, fundDraftOf, fundErrors, fundFromDraft, fundTerms, isForeignKind, NAME_MAX, newBrokerId, newFundId, PAYOUTS, PER_YEAR, recordOfFund, TRACKINGS, type BrokerDraft, type CustomBroker, type CustomFund, type EntryError, type EntryTerm, type FundDomicile, type FundDraft, type FundPayout, type FundTracking, type PerYear } from "../../lib/custom-entries";
import { fundLabels, optionLabels, type Label } from "../../lib/labels";
import { optionsOf, type IndexRef, type OptionId } from "../../lib/invest";
import { isoToday } from "../../lib/state";
import { Num, StateTag } from "../provenance";
import { Sheet } from "../Sheet";
import { Actions, EditButton, nisCheck, useDraft, isInvalid, EditorsContext, useEditors, type Editing, type Editors, type PanelWorld } from "./editors";
import { OwnAccountPanel, OwnTerms } from "./own-account";
import { Button, CheckField, ChoiceChips, FieldGroup, flushPendingFields, LabelRow, LongestCase, NumberField, percentCheck, SelectField, TextField, TileChoice, type Tile } from "../kit";
import { optionClass, reasonText } from "./parts";
import { isGroupProvider } from "../../lib/group-pick";

const c = root.customEntries;

/** Holds what is being edited and the one panel; the rows and buttons below it reach it through the context. */
export function CustomEntriesHost({ index, brokers, funds, writable, onSaveBroker, onRemoveBroker, onSaveFund, onRemoveFund, world, opening, onOpened, children }: { /** What the account panel prices on; null while the page has no comparison. */ world: PanelWorld | null; /** A house and starting point the address asks the panel to open on (a house's page links here); `onOpened` clears it. */ opening?: { houseId: string; from: string } | null; onOpened?: () => void; index: IndexRef | null; brokers: readonly CustomBroker[]; funds: readonly CustomFund[]; writable: boolean; onSaveBroker: (b: CustomBroker) => void; onRemoveBroker: (id: string) => void; onSaveFund: (f: CustomFund) => void; onRemoveFund: (id: string) => void; children: ReactNode }) {
  const [editing, setEditing] = useState<Editing | null>(null);
  const headId = useId();
  // the row just saved may stand far above the button: it is brought into view, once
  const [saved, setSaved] = useState<string | null>(null);
  useEffect(() => {
    if (!saved) return;
    const frame = requestAnimationFrame(() => {
      [...document.querySelectorAll<HTMLElement>("[data-pick-key]")].find((x) => x.dataset.pickKey === saved)?.scrollIntoView({ block: "center", behavior: "instant" });
      setSaved(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [saved]);
  const close = () => setEditing(null);
  const api = useMemo<Editors>(() => ({ addBroker: () => setEditing({ kind: "broker", id: null }), addFund: () => setEditing({ kind: "fund", id: null }), openOwn: (houseId, from = "list") => setEditing({ kind: "own", houseId, from }), edit: setEditing, brokers, funds, world }), [brokers, funds, world]);
  // a house's page asks for the panel through the address: opened once the page has its comparison
  useEffect(() => {
    if (!opening || !world) return;
    setEditing({ kind: "own", houseId: opening.houseId, from: opening.from });
    onOpened?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opening, !!world]);
  const ownOf = (b: CustomBroker | undefined) => (b?.base && world?.wb.snapshots.some((s) => s.id === b.base!.houseId && !s.id.startsWith("custom-broker-")) ? b : undefined);
  const editedBroker = editing?.kind === "broker" ? brokers.find((b) => b.id === editing.id) : undefined;
  const own: { houseId: string; from: string; broker: CustomBroker | null } | null = editing?.kind === "own" && world?.wb.snapshots.some((s) => s.id === editing.houseId) ? { houseId: editing.houseId, from: editing.from, broker: null } : ownOf(editedBroker) ? { houseId: editedBroker!.base!.houseId, from: "list", broker: editedBroker! } : null;
  return (
    <EditorsContext.Provider value={api}>
      {children}
      <Sheet open={!!editing} onClose={close} pc="center" height={100} labelledBy={headId} className={own || editing?.kind === "fund" ? "sheet-wide" : undefined}>
        {own && world && (
          <OwnAccountPanel
            key={own.broker?.id ?? `${own.houseId}:${own.from}`}
            headId={headId}
            world={world}
            houseId={own.houseId}
            from={own.from}
            broker={own.broker}
            others={brokers}
            funds={funds}
            writable={writable}
            onCancel={close}
            onSave={(b) => {
              onSaveBroker(b);
              setSaved(b.id);
              close();
            }}
            onRemove={(id) => {
              onRemoveBroker(id);
              close();
            }}
          />
        )}
        {editing?.kind === "broker" && !own && (
          <BrokerPanel
            key={editing.id ?? "new"}
            headId={headId}
            houses={world ? world.view.houses.filter((h) => !h.provider.custom && !isGroupProvider(h.provider)).map((h) => ({ id: h.provider.id, name: h.provider.short })) : []}
            onHouse={(houseId) => setEditing({ kind: "own", houseId, from: "list" })}
            broker={brokers.find((b) => b.id === editing.id) ?? null}
            others={brokers}
            writable={writable}
            onCancel={close}
            onSave={(b) => {
              onSaveBroker(b);
              setSaved(b.id);
              close();
            }}
            onRemove={(id) => {
              onRemoveBroker(id);
              close();
            }}
          />
        )}
        {editing?.kind === "fund" && index && (
          <FundPanel
            key={editing.id ?? "new"}
            headId={headId}
            index={index}
            fund={funds.find((f) => f.id === editing.id) ?? null}
            others={funds.filter((f) => f.indexId === index.id)}
            writable={writable}
            onCancel={close}
            onSave={(f) => {
              onSaveFund(f);
              setSaved(f.id);
              close();
            }}
            onRemove={(id) => {
              onRemoveFund(id);
              close();
            }}
          />
        )}
      </Sheet>
    </EditorsContext.Provider>
  );
}

// ---------------------------------------------------------------- the buttons and the rows

/** The quiet button under a list. Outside the host (a test of a list alone) it is not drawn. */
/** `primary`: the one thing a page with no fund asks for (a custom index); quiet under a list otherwise. */
export function AddEntryButton({ kind, primary = false }: { kind: "broker" | "fund"; primary?: boolean }) {
  const e = useEditors();
  if (!e) return null;
  return (
    <Button variant={primary ? "primary" : "quiet"} className={primary ? "self-start" : "self-start -ms-2"} onClick={kind === "broker" ? e.addBroker : e.addFund}>
      + {kind === "broker" ? c.addBroker : c.addFund}
    </Button>
  );
}

/** What is left empty is not known, never zero (D56): an account's fields and a fund's fees alike. The entered tag stands before
 *  what was typed, and only when something was: alone, it stood before its own "not entered". */
export function Terms({ terms, editing }: { terms: { shown: EntryTerm[]; empty: string[] }; editing: Editing }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-snug text-muted-foreground">
      {terms.shown.length > 0 && <StateTag state="entered" />}
      {terms.shown.map((t) => (
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
      {terms.empty.length > 0 && <span>{c.unknownLine(c.listWords(terms.empty))}</span>}
      <EditButton editing={editing} />
    </span>
  );
}

/** A broker row's line: that it was entered, every figure typed in the entered state, what was left empty, and the way to change it. */
export function BrokerTerms({ id }: { id: string }) {
  const e = useEditors();
  const b = e?.brokers.find((x) => x.id === id);
  if (b?.base) return <OwnTerms b={b} />;
  return b ? <Terms terms={{ shown: brokerTerms(b).shown, empty: unknownLines(b) }} editing={{ kind: "broker", id }} /> : null;
}

/** The same line on a fund's row. */
export function FundTerms({ id }: { id: string }) {
  const e = useEditors();
  const f = e?.funds.find((x) => x.id === id);
  return f ? <Terms terms={fundTerms(f)} editing={{ kind: "fund", id }} /> : null;
}

// ---------------------------------------------------------------- the panels

const pctCheck = percentCheck();

/** The choice a new account starts from: a collected house's price list, or a house the site has not collected. */
const NOT_LISTED = "not-listed";

function BrokerPanel({ headId, broker, houses, onHouse, others, writable, onSave, onCancel, onRemove }: { headId: string; broker: CustomBroker | null; /** The collected houses a new account can start from. */ houses: { id: string; name: string }[]; onHouse: (houseId: string) => void; others: readonly CustomBroker[]; writable: boolean; onSave: (b: CustomBroker) => void; onCancel: () => void; onRemove: (id: string) => void }) {
  const { draft, now, set } = useDraft<BrokerDraft>(() => brokerDraftOf(broker));
  // a new account starts from a house's price list, as the account card's does; only a house not in the list is typed from scratch
  const [basis, setBasis] = useState<string | null>(broker || houses.length === 0 ? NOT_LISTED : null);
  const [errors, setErrors] = useState<EntryError[]>([]);
  const form = useRef<HTMLDivElement>(null);
  const w = c.fields;
  // no "0" in an empty field: an empty field is a price not known, not a price of zero
  const field = (k: "tradeMin" | "custodyMin" | "monthlyFee", label: string, unit: string) => <NumberField agorot label={label} unit={unit} value={draft[k]} isEntered={draft[k] !== null} validate={nisCheck} onCommit={(n) => set(k, n)} onReset={() => set(k, null)} optional />;
  const percent = (k: "tradePct" | "custodyPct" | "fxPct", label: string, unit: string) => <NumberField label={label} unit={unit} value={draft[k]} isEntered={draft[k] !== null} validate={pctCheck} onCommit={(n) => set(k, n)} onReset={() => set(k, null)} optional />;
  const save = () => {
    flushPendingFields();
    const d = now.current;
    const e = brokerErrors(d, others, broker?.id ?? null);
    setErrors(e);
    if (e.length > 0 || isInvalid(form.current)) return;
    onSave(brokerFromDraft(d, broker?.id ?? newBrokerId(), isoToday()));
  };
  return (
    <div ref={form} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 pe-10">
        <h2 id={headId} className="text-lg font-semibold">
          {broker ? c.brokerEdit(broker.name) : c.brokerTitle}
        </h2>
        <p className="text-sm text-muted-foreground">{basis === NOT_LISTED ? c.brokerSub : c.brokerStart}</p>
      </div>
      {!broker && houses.length > 0 && (
        <SelectField
          label={c.basis}
          none={c.basisNone}
          options={[...houses, { id: NOT_LISTED, name: c.basisNotListed }]}
          value={basis}
          onChange={(id) => (id && id !== NOT_LISTED ? onHouse(id) : setBasis(id))}
        />
      )}
      {basis === NOT_LISTED && (
        <>
      <TextField label={w.brokerName} value={draft.name} onChange={(v) => set("name", v)} maxLength={NAME_MAX} error={errors.includes("name-empty") ? c.errors["name-empty"] : errors.includes("name-taken") ? c.errors["name-taken"] : null} />
      <FieldGroup title={w.trade}>
        <div className="field-row grid gap-3 grid-cols-[minmax(0,1fr)] sm:grid-cols-2">
          {percent("tradePct", w.percent, "pct_of_trade")}
          {field("tradeMin", w.tradeMin, "nis_per_trade")}
        </div>
      </FieldGroup>
      <FieldGroup title={w.custody}>
        <div className="field-row grid gap-3 grid-cols-[minmax(0,1fr)] sm:grid-cols-2">
          {percent("custodyPct", w.percentYear, "pct_per_year")}
          {field("custodyMin", w.custodyMin, "nis_per_month")}
        </div>
      </FieldGroup>
      <FieldGroup title={w.fx}>
        <div className="field-row grid gap-3 grid-cols-[minmax(0,1fr)] sm:grid-cols-2">{percent("fxPct", w.percent, "pct_of_trade")}</div>
      </FieldGroup>
      <FieldGroup title={w.monthly}>
        <div className="field-row grid gap-3 grid-cols-[minmax(0,1fr)] sm:grid-cols-2">{field("monthlyFee", w.nisMonth, "nis_per_month")}</div>
      </FieldGroup>
      <FieldGroup title={w.sells} note={errors.includes("sells-none") ? <p className="text-xs text-destructive">{c.errors["sells-none"]}</p> : undefined}>
        <div className="flex flex-col">
          <CheckField label={w.sellsIsraeli} checked={draft.sellsIsraeli} onChange={(v) => set("sellsIsraeli", v)} />
          <CheckField label={w.sellsAbroad} checked={draft.sellsAbroad} onChange={(v) => set("sellsAbroad", v)} />
        </div>
      </FieldGroup>
        </>
      )}
      {basis === NOT_LISTED ? <Actions entry={!!broker} name={broker?.name ?? ""} writable={writable} onSave={save} onCancel={onCancel} onRemove={() => broker && onRemove(broker.id)} /> : <Button variant="quiet" className="self-start -ms-2" onClick={onCancel}>{c.cancel}</Button>}
    </div>
  );
}

function FundPanel({ headId, index, fund, others, writable, onSave, onCancel, onRemove }: { headId: string; index: IndexRef; fund: CustomFund | null; others: readonly CustomFund[]; writable: boolean; onSave: (f: CustomFund) => void; onCancel: () => void; onRemove: (id: string) => void }) {
  const kinds = optionsOf(index.israeli);
  const { draft, now, set } = useDraft<FundDraft>(() => fundDraftOf(fund, kinds[0]!, index.israeli));
  const [errors, setErrors] = useState<EntryError[]>([]);
  const form = useRef<HTMLDivElement>(null);
  const w = c.fields;
  const foreign = isForeignKind(draft.kind);
  // no "0" in an empty field: an empty fee is not known, not a fee of zero
  const percent = (k: "fixed" | "variable" | "trustee", label: string) => <NumberField label={label} unit="pct_per_year" value={draft[k]} isEntered={draft[k] !== null} validate={pctCheck} onCommit={(n) => set(k, n)} onReset={() => set(k, null)} optional />;
  const save = () => {
    flushPendingFields();
    const d = now.current;
    const e = fundErrors(d, others, fund?.id ?? null);
    setErrors(e);
    if (e.length > 0 || isInvalid(form.current)) return;
    onSave(fundFromDraft(d, fund?.id ?? newFundId(), fund?.indexId ?? index.id, isoToday()));
  };
  return (
    <div ref={form} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1 pe-10">
        <h2 id={headId} className="text-lg font-semibold">
          {fund ? c.fundEdit(fund.name) : c.fundTitle(index.name)}
        </h2>
        <p className="text-sm text-muted-foreground">{c.fundSub}</p>
      </div>
      {/* on a computer the panel is wide: the fund and its fees side by side */}
      <div className="@container">
        <div className="grid gap-5 @xl:grid-cols-2 @xl:gap-8">
          <FieldGroup title={c.fundParts.fund}>
            <TextField label={w.fundName} value={draft.name} onChange={(v) => set("name", v)} maxLength={NAME_MAX} error={errors.includes("name-empty") ? c.errors["name-empty"] : errors.includes("name-taken") ? c.errors["name-taken"] : null} />
            <TextField label={w.number} value={draft.number} onChange={(v) => set("number", v)} maxLength={20} dir="ltr" />
            <SelectField className="max-w-none" label={w.kind} value={draft.kind} options={kinds.map((k: OptionId) => ({ id: k, name: c.kinds[k]! }))} onChange={(k) => k && set("kind", k as OptionId)} />
          </FieldGroup>
          <FieldGroup title={c.fundParts.fees} className="@xl:border-t-0 @xl:pt-0">
            {foreign ? (
              percent("fixed", w.yearly)
            ) : (
              <>
                {percent("fixed", w.fixed)}
                {percent("variable", w.variable)}
                {percent("trustee", w.trustee)}
              </>
            )}
          </FieldGroup>
        </div>
      </div>
      <FieldGroup title={c.fundParts.traits}>
        <FundTraits draft={draft} set={set} index={index} hedgedError={errors.includes("hedged-none")} />
      </FieldGroup>
      {/* on a computer the row and the buttons stay in view while the questions scroll, so each answer shows at once */}
      <div className="flex flex-col gap-3 border-t border-border pt-3 lg:sticky lg:bottom-[-20px] lg:-mx-5 lg:px-5 lg:pb-5 lg:-mb-5 lg:bg-popover">
        <FundPreview draft={draft} index={index} />
        <Actions entry={!!fund} name={fund?.name ?? ""} writable={writable} onSave={save} onCancel={onCancel} onRemove={() => fund && onRemove(fund.id)} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- what the fund does, and its row before it is saved

/** The record a draft would save, as the page would read it: the labels and the gap come from it, never from words of their own. */
function draftRecord(d: FundDraft, index: IndexRef): FundRecord {
  const f = fundFromDraft({ ...d, name: d.name || "-", hedged: d.hedged ?? false }, "custom-fund-preview", index.id, isoToday());
  return recordOfFund(f, index.exposure?.currency ?? null);
}

/** The index as the draft sees it: on an index the person added, "המדד בשקלים" reads it as Israeli (as indexSeenBy on the page). */
const seenBy = (d: FundDraft, index: IndexRef): IndexRef => (index.custom && d.shekelIndex ? { ...index, israeli: true } : index);

/** Everything the fund's row shows: where it is held, then the fund's own labels (as `fundLabels` on the page). */
function rowLabels(d: FundDraft, index: IndexRef): Label[] {
  const all = [...optionLabels(d.kind), ...fundLabels(draftRecord(d, index), seenBy(d, index), d.kind)];
  // a hedge not chosen yet says nothing of the currency
  return d.hedged === null ? all.filter((l) => !HEDGE_LABELS.has(l.id)) : all;
}
const HEDGE_LABELS = new Set<string>(["currency", "currency-many", "currency-foreign", "hedged", "hedged-many", "tax-currency"]);

/**
 * The tiles of one question: each answer with the labels it adds to the row, the labels every answer shares left out (the row below shows
 * them). An answer that adds none says what it leaves instead.
 */
function tilesOf<T extends string>(d: FundDraft, index: IndexRef, answers: { value: T; as: Partial<FundDraft>; title?: string; empty?: string }[]): Tile<T>[] {
  const sets = answers.map((a) => rowLabels({ ...d, ...a.as }, index));
  const everywhere = new Set(sets[0]!.map((l) => l.id).filter((id) => sets.every((x) => x.some((l) => l.id === id))));
  return answers.map((a, i) => {
    const own = sets[i]!.filter((l) => !everywhere.has(l.id));
    return { value: a.value, ...(a.title ? { title: a.title } : {}), body: own.length > 0 ? <LabelRow labels={own} still /> : <span className="text-xs text-muted-foreground">{a.empty ?? c.noLabel}</span> };
  });
}

const UNKNOWN = "unknown";

function FundTraits({ draft, set, index, hedgedError }: { draft: FundDraft; set: <K extends keyof FundDraft>(k: K, v: FundDraft[K]) => void; index: IndexRef; hedgedError: boolean }) {
  const ids = useId();
  const foreign = isForeignKind(draft.kind);
  const w = c.fields;
  const question = (n: number, text: string, tiles: ReactNode, after?: ReactNode) => (
    <div className="flex flex-col gap-2">
      <p id={`${ids}-${n}`} className="text-sm font-medium">
        {text}
      </p>
      {tiles}
      {after}
    </div>
  );
  const payoutTiles = tilesOf(draft, index, [...PAYOUTS.map((p) => ({ value: p as string, as: { payout: p } })), { value: UNKNOWN, as: { payout: null }, title: c.unknown, empty: c.noPrice }]);
  const trackingTiles = tilesOf(draft, index, [...TRACKINGS.map((t) => ({ value: t as string, as: { tracking: t } })), { value: UNKNOWN, as: { tracking: null }, title: c.unknown }]);
  const domicileTiles = tilesOf(draft, index, [...DOMICILES.map((x) => ({ value: x as string, as: { domicile: x }, title: c.domicileNames[x]! })), { value: UNKNOWN, as: { domicile: null }, title: c.domicileNames.other!, empty: draft.payout === "distributing" ? c.noPrice : c.noLabel }]);
  // a hedged fund the person typed has no price (its gap to the index is not known): the tile says so beside its label. On an index the
  // person added a third answer says the index is in shekels (asked of the fund, not of the index)
  const hedgedTiles = tilesOf(draft, index, [
    { value: "no", as: { hedged: false, shekelIndex: false } },
    { value: "yes", as: { hedged: true, shekelIndex: false } },
    ...(index.custom ? [{ value: "shekel", as: { hedged: false, shekelIndex: true }, title: c.shekelIndex, empty: c.shekelIndexNote }] : []),
  ]).map((t) =>
    t.value === "yes"
      ? {
          ...t,
          body: (
            <>
              {t.body}
              <span className="text-xs text-muted-foreground">{c.noPrice}</span>
            </>
          ),
        }
      : t,
  );
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-muted-foreground -mt-1">{c.traitsSub}</p>
      {question(
        1,
        c.ask.payout,
        <TileChoice labelledBy={`${ids}-1`} tiles={payoutTiles} value={draft.payout ?? UNKNOWN} onChange={(v) => set("payout", v === UNKNOWN ? null : (v as FundPayout))} columns={3} />,
        draft.payout === "distributing" && (
          <div className="flex flex-col gap-3">
            <NumberField label={w.yield} unit="pct_per_year" value={draft.yield} isEntered={draft.yield !== null} validate={pctCheck} onCommit={(n) => set("yield", n)} onReset={() => set("yield", null)} optional />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm">{w.perYear}</span>
              <ChoiceChips ids={PER_YEAR.map(String)} labels={c.perYearNames} value={draft.perYear === null ? null : String(draft.perYear)} onChange={(v) => set("perYear", Number(v) as PerYear)} ariaLabel={w.perYear} wrap />
            </div>
          </div>
        ),
      )}
      {!index.israeli &&
        question(
          2,
          index.custom ? c.ask.currency : c.ask.hedged,
          <TileChoice labelledBy={`${ids}-2`} tiles={hedgedTiles} value={draft.hedged === null ? null : draft.hedged ? "yes" : draft.shekelIndex ? "shekel" : "no"} onChange={(v) => { set("hedged", v === "yes"); set("shekelIndex", v === "shekel"); }} columns={index.custom ? 3 : undefined} />,
          hedgedError && <p className="text-xs text-destructive">{c.errors["hedged-none"]}</p>,
        )}
      {foreign && question(3, c.ask.domicile, <TileChoice labelledBy={`${ids}-3`} tiles={domicileTiles} value={draft.domicile ?? UNKNOWN} onChange={(v) => set("domicile", v === UNKNOWN ? null : (v as FundDomicile))} columns={3} />)}
      {question(4, c.ask.tracking, <TileChoice labelledBy={`${ids}-4`} tiles={trackingTiles} value={draft.tracking ?? UNKNOWN} onChange={(v) => set("tracking", v === UNKNOWN ? null : (v as FundTracking))} columns={3} />)}
    </div>
  );
}

/** The fund's row as it will stand on the list, and whether the page can price it; held at its longest case, so the buttons under it stay put. */
function FundPreview({ draft, index }: { draft: FundDraft; index: IndexRef }) {
  const cls = optionClass[draft.kind];
  const gap = customFundGap(draftRecord(draft, index));
  const body = (labels: Label[], line: string) => (
    <div className="flex flex-col gap-1.5">
      {labels.length > 0 ? <LabelRow labels={labels} still /> : <span className="text-xs text-muted-foreground">{c.previewNone}</span>}
      <p className="text-xs text-muted-foreground">{line}</p>
    </div>
  );
  // the longest row any answer can give, and the longest line; only the kind and the index change what can be shown
  const longest = useMemo(() => {
    const variants: FundDraft[] = [];
    const currencies = index.israeli ? [{ hedged: false, shekelIndex: false }] : [{ hedged: false, shekelIndex: false }, { hedged: true, shekelIndex: false }, ...(index.custom ? [{ hedged: false, shekelIndex: true }] : [])];
    for (const payout of [...PAYOUTS, null]) for (const domicile of [...DOMICILES, null]) for (const cur of currencies) for (const tracking of TRACKINGS) variants.push({ ...draft, payout, domicile, ...cur, tracking, yield: 1, perYear: 4 });
    const size = (ls: Label[]) => ls.reduce((n, l) => n + l.text.length + 4, 0);
    const rows = variants.map((v) => rowLabels(v, index)).sort((a, b) => size(b) - size(a));
    const lines = [c.previewPriced, ...(["fee-unknown", "payout-unknown", "need-yield", "domicile-unknown", "no-hedge-entered"] as const).map((code) => reasonText({ code }, cls))].sort((a, b) => b.length - a.length);
    return { row: rows[0]!, line: lines[0]! };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.kind, index, cls]);
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium">{c.preview}</p>
      <LongestCase cases={[body(longest.row, longest.line)]}>{body(rowLabels(draft, index), gap ? reasonText({ code: gap }, cls) : draft.hedged === null ? c.errors["hedged-none"]! : c.previewPriced)}</LongestCase>
    </div>
  );
}
