// The person's own fund on the index page (D44): the quiet button under the lists, the panel it opens, and what a fund's row says. Typing
// stays in the panel: nothing on the page changes until the person saves (guidelines/design.md, "little movement"). The panel asks where
// the fund is bought and where it is registered, the fund and its fees, what it does, and of an index the person added, where its
// companies are; beside the questions, the fund's row as it will stand and what the calculation still needs.
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { invest as root } from "../../copy";
import type { FundRecord, ValueObject } from "@finance-tool/schema";
import { asksCountry, boughtInAt, boughtInSaid, BUY_ABROAD, BUY_IN_ISRAEL, countriesAt, COUNTRIES, customFundGaps, draftKind, draftPriceUnit, draftWithPlace, fundDraftOf, fundErrors, fundFromDraft, fundTerms, isForeignKind, NAME_MAX, newFundId, PAYOUTS, PER_YEAR, recordOfFund, type BuyAt, type CustomFund, type EntryError, type EntryTerm, type CountryAnswer, type FundDraft, type FundPayout, type FundTracking, type PerYear } from "../../lib/custom-entries";
import { dividendTaxLabel, fundLabels, optionLabels, type Label } from "../../lib/labels";
import { INDEX_REGIONS, type IndexFacts, type IndexRegion } from "../../lib/index-region";
import { optionsOf, type CustomIndex, type IndexRef } from "../../lib/invest";
import { isoToday } from "../../lib/state";
import { entered } from "../../lib/value";
import { Num, StateTag } from "../provenance";
import { Sheet } from "../Sheet";
import { Actions, EditButton, useDraft, isInvalid, EditorsContext, useEditors, type Editing, type Editors, type PanelWorld } from "./editors";
import { aboveZeroCheck, Button, ChoiceChips, Disclosure, LabelRow, MixedName, NeedBar, NeedList, NumberField, percentCheck, Step, TextField, type ChipLook, type NeedItem, type NeedState } from "../kit";

const c = root.customEntries;

/** Holds what is being edited and the one panel; the rows and buttons below it reach it through the context. */
export function CustomEntriesHost({ index, funds, writable, onSaveFund, onSaveIndex, onRemoveFund, world, children }: { /** What a fund's preview prices on; null while the page has no comparison. */ world: PanelWorld | null; index: IndexRef | null; funds: readonly CustomFund[]; writable: boolean; onSaveFund: (f: CustomFund) => void; /** An index the person added, with what the panel said of it (its region and yield). */ onSaveIndex: (i: CustomIndex) => void; onRemoveFund: (id: string) => void; children: ReactNode }) {
  const [editing, setEditing] = useState<Editing | null>(null);
  // a new panel for each fund "save and add another" opens, so it starts fresh
  const [round, setRound] = useState(0);
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
  const api = useMemo<Editors>(() => ({ addFund: () => setEditing({ kind: "fund", id: null }), edit: setEditing, funds, world }), [funds, world]);
  return (
    <EditorsContext.Provider value={api}>
      {children}
      <Sheet open={!!editing} onClose={close} pc="center" height={100} labelledBy={headId} className={editing ? "sheet-fund" : undefined}>
        {editing && index && (
          <FundPanel
            key={`${editing.id ?? "new"}-${round}`}
            headId={headId}
            index={index}
            fund={funds.find((f) => f.id === editing.id) ?? null}
            start={editing.start}
            others={funds.filter((f) => f.indexId === index.id)}
            writable={writable}
            onCancel={close}
            onSave={(f, facts, again) => {
              if (facts) onSaveIndex(facts);
              onSaveFund(f);
              if (again) {
                setRound((r) => r + 1);
                setEditing({ kind: "fund", id: null, start: again });
                return;
              }
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

/**
 * The button that adds a fund: the kit's `add` under a list, or with `primary` the one thing a page with no fund asks for (a custom index).
 * Outside the host (a test of a list alone) it is not drawn.
 */
export function AddEntryButton({ primary = false }: { primary?: boolean }) {
  const e = useEditors();
  if (!e) return null;
  return primary ? (
    <Button variant="primary" className="self-start" onClick={e.addFund}>
      + {c.addFund}
    </Button>
  ) : (
    <Button variant="add" onClick={e.addFund}>
      {c.addFund}
    </Button>
  );
}

/** What is left empty is not known, never zero (D56). The entered tag stands before what was typed, and only when something was. */
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

/**
 * Beside a typed fund's name in the lists: the pencil that opens its panel, as a deal's (`DealEditMark`). With the name's
 * entered ink it says the fund is the person's own; what was typed is in the panel and in the sheets of the figures it prices. Outside the
 * host (a test of a list alone) it is not drawn.
 */
export function FundEditMark({ id }: { id: string }) {
  const e = useEditors();
  if (!e) return null;
  return (
    <Button variant="icon" size="mark" aria-label={c.editFund} onClick={() => e.edit({ kind: "fund", id })}>
      <Pencil size={14} aria-hidden />
    </Button>
  );
}

/** A fund's row's line: that it was entered, every figure typed in the entered state, what was left empty, and the way to change it. */
export function FundTerms({ id }: { id: string }) {
  const e = useEditors();
  const f = e?.funds.find((x) => x.id === id);
  return f ? <Terms terms={fundTerms(f)} editing={{ kind: "fund", id }} /> : null;
}

// ---------------------------------------------------------------- the panel

const pctCheck = percentCheck();
const UNSURE = "unsure";

/** What the panel says of the index: what was saved on it, as the person changes it here (the region, and the yield as typed). */
export interface FactsDraft {
  region: IndexRegion | null;
  yieldPct: number | null;
}

/**
 * The index as the draft sees it, as `indexSeenBy` on the page: what the panel says of an added index; an added index the person said is
 * in shekels read as Israeli, and one bought in a foreign currency read in it.
 */
function seenBy(d: FundDraft, index: IndexRef, facts: FactsDraft, today: string): IndexRef {
  if (!index.custom) return index;
  const custom = { ...index.custom, ...factsOf(index.custom, facts, today) };
  if (d.shekelIndex) return { ...index, custom, israeli: true };
  const boughtIn = d.buyAt ? boughtInAt(d.buyAt) : null;
  return { ...index, custom, ...(boughtIn ? { boughtIn } : {}) };
}

/** The index's facts as they would be saved: a yield whose value is unchanged keeps its date (it is dated the day it was typed). */
function factsOf(saved: IndexFacts, facts: FactsDraft, today: string): IndexFacts {
  const kept = saved.dividendYield && saved.dividendYield.value === facts.yieldPct ? saved.dividendYield : null;
  const dividendYield: ValueObject | null = facts.yieldPct === null ? null : (kept ?? entered(facts.yieldPct, "pct_per_year", today, c.fields.indexYield));
  return { ...(facts.region ? { region: facts.region } : {}), ...(dividendYield ? { dividendYield } : {}) };
}

/** The record a draft would save, as the page would read it: the labels and the checklist come from it, never from words of their own. None before the first question is answered. */
function draftRecord(d: FundDraft, index: IndexRef, today: string): FundRecord | null {
  if (!d.buyAt) return null;
  const currency = index.exposure?.currency ?? null;
  const f = fundFromDraft({ ...d, buyAt: d.buyAt, name: d.name || "-", hedged: d.hedged ?? false }, "custom-fund-preview", index.id, today, currency);
  return recordOfFund(f, currency);
}

/** Everything the fund's row shows: where it is held, then the fund's own labels (as `fundLabels` on the page); a hedge not chosen yet says nothing of the currency. */
function rowLabels(d: FundDraft, rec: FundRecord | null, seen: IndexRef): Label[] {
  const kind = draftKind(d);
  if (!rec || !kind) return [];
  const all = [...optionLabels(kind), ...fundLabels(rec, seen, kind)];
  return d.hedged === null ? all.filter((l) => !HEDGE_LABELS.has(l.id)) : all;
}
const HEDGE_LABELS = new Set<string>(["currency", "currency-many", "currency-foreign", "hedged", "hedged-many", "tax-currency"]);

/** Whether the panel asks what the fund does with the currency: on any index but an Israeli one, as the page reads it. */
const asksHedge = (index: IndexRef) => !index.israeli;

/**
 * What the calculation needs, each item with its state, from the record the draft saves (`customFundGaps`, the reasons the page gives a
 * fund no price) and from the label of the tax inside the fund (`dividendTaxLabel`): what that label says is not counted, the checklist
 * says too. A question answered "not sure" is never done: where the fund is still priced it says what stands in, and where the answer
 * changes nothing the item is left out.
 */
function needsOf(d: FundDraft, rec: FundRecord | null, index: IndexRef, seen: IndexRef): NeedItem[] {
  const w = c.needs;
  const gaps = rec ? customFundGaps(rec) : [];
  const item = (id: keyof typeof w.items, state: NeedState, note?: string): NeedItem => ({ id, text: w.items[id], state, ...(note ? { note } : {}) });
  const tax = rec ? dividendTaxLabel(rec, seen) : null;
  // no exchange named: the fund is priced on the exchange that leaves the least (F-65)
  const anyExchange = rec?.exchange === "unknown";
  const out: NeedItem[] = [!d.buyAt ? item("place", "missing") : boughtInSaid(d.buyAt) ? item("place", "done") : item("place", "stand-in", w.standIn.place(anyExchange))];
  out.push(item("fee", (rec ? gaps.includes("fee-unknown") : d.fixed === null) ? "missing" : "done"));
  out.push(item("payout", d.payout ? "done" : "missing"));
  if (d.payout === "distributing") out.push(item("yield", gaps.includes("need-yield") ? "missing" : "done"));
  if (!index.israeli && asksCountry(d.buyAt)) {
    const country = countryNeed(d, gaps, tax, anyExchange);
    if (country) out.push(item("country", country.state, country.note));
  }
  if (asksHedge(index)) out.push(d.hedged === true ? item("gap", "missing", w.gap) : item("hedge", d.hedged === null ? "missing" : "done"));
  if (tax) out.push(item("dividendTax", tax === "tax-fund-dividend" ? "done" : "left-out", w.dividendTax[tax]));
  return out;
}

/** The country item: missing where the fund has no price without it; "not sure" with what stands in, or none where it changes nothing. */
function countryNeed(d: FundDraft, gaps: readonly string[], tax: string | null, anyExchange: boolean): { state: NeedState; note?: string } | null {
  const w = c.needs;
  if (gaps.includes("tase-country-unknown")) return { state: "missing", note: w.taseCountry };
  if (gaps.includes("domicile-unknown")) return { state: "missing" };
  if (d.country !== "unsure") return { state: "done" };
  if (tax === "tax-fund-dividend-domicile") return { state: "stand-in", note: w.standIn.countryTax };
  return anyExchange ? { state: "stand-in", note: w.standIn.countryExchange } : null;
}

/**
 * What the panel shows beside the questions, from the draft as it stands: the index as the fund would see it, the record it would save, the
 * checklist and where the calculation stands.
 */
export function panelStateOf(draft: FundDraft, index: IndexRef, facts: FactsDraft, today: string): { seen: IndexRef; rec: FundRecord | null; needs: NeedItem[]; status: keyof typeof c.status } {
  const seen = seenBy(draft, index, facts, today);
  const rec = draftRecord(draft, index, today);
  const needs = needsOf(draft, rec, index, seen);
  return { seen, rec, needs, status: statusOf(needs) };
}

/** Where the calculation stands: a missing item leaves the fund with no price; an item left out leaves a price without it. */
const statusOf = (needs: readonly NeedItem[]): keyof typeof c.status => (needs.some((x) => x.state === "missing") ? "missing" : needs.some((x) => x.state === "left-out") ? "left-out" : "ok");

function FundPanel({ headId, index, fund, start, others, writable, onSave, onCancel, onRemove }: { headId: string; index: IndexRef; fund: CustomFund | null; start: Editing["start"]; others: readonly CustomFund[]; writable: boolean; onSave: (f: CustomFund, index: CustomIndex | null, again: { buyAt: BuyAt; country: CountryAnswer } | null) => void; onCancel: () => void; onRemove: (id: string) => void }) {
  const [today] = useState(isoToday);
  const { draft, now, set, setMany } = useDraft<FundDraft>(() => fundDraftOf(fund, start ?? { buyAt: null, country: index.israeli ? "IL" : "unsure" }, index.israeli));
  const [facts, setFacts] = useState<FactsDraft>(() => ({ region: index.custom?.region ?? null, yieldPct: typeof index.custom?.dividendYield?.value === "number" ? index.custom.dividendYield.value : null }));
  const [errors, setErrors] = useState<EntryError[]>([]);
  const form = useRef<HTMLDivElement>(null);
  const currencyOfIndex = index.exposure?.currency ?? null;
  const { seen, rec, needs, status } = panelStateOf(draft, index, facts, today);
  const save = (again: boolean) => {
    const d = now.current;
    const e = fundErrors(d, others, fund?.id ?? null);
    setErrors(e);
    if (e.length > 0 || isInvalid(form.current) || !d.buyAt) return;
    const f = fundFromDraft({ ...d, buyAt: d.buyAt }, fund?.id ?? newFundId(), fund?.indexId ?? index.id, isoToday(), currencyOfIndex, fund);
    // the index is saved again only where what the panel says of it changed; what was cleared there leaves it
    const custom = index.custom;
    const next = custom ? factsOf(custom, facts, isoToday()) : null;
    const changed = custom && next && (next.region !== custom.region || next.dividendYield !== custom.dividendYield) ? { ...withoutFacts(custom), ...next } : null;
    onSave(f, changed, again ? { buyAt: d.buyAt, country: d.country } : null);
  };
  const actions = (saveIn: "here" | "bar") => <Actions entry={!!fund} name={fund?.name ?? ""} writable={writable} saveIn={saveIn} onSave={() => save(false)} again={{ label: c.saveAnother, onClick: () => save(true) }} onCancel={onCancel} onRemove={() => fund && onRemove(fund.id)} />;
  const side = (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{c.preview}</p>
        <div className="flex flex-col gap-2 rounded-md border border-border p-3">
          <span className={draft.name.trim() ? "font-medium min-w-0 text-entered" : "font-medium min-w-0 text-muted-foreground"}>
            <MixedName>{draft.name.trim() || c.fields.fundName}</MixedName>
          </span>
          <LabelRow labels={rowLabels(draft, rec, seen)} still />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">{c.needs.title}</p>
        <NeedList items={needs} />
      </div>
      <p className="text-sm">{c.status[status]}</p>
    </>
  );
  return (
    <div ref={form} className="@container/fund flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 id={headId} className="text-lg font-semibold">
          {fund ? c.fundEdit(fund.name) : c.fundTitle(index.name)}
        </h2>
        <p className="text-sm text-muted-foreground">{c.fundSub}</p>
      </div>
      <div className="grid gap-6 border-t border-border pt-4 @4xl/fund:grid-cols-[minmax(0,1fr)_22rem] @4xl/fund:gap-8">
        <div className="flex flex-col gap-4 min-w-0">
          <FundQuestions draft={draft} set={set} setMany={setMany} index={index} currencyOfIndex={currencyOfIndex} facts={facts} setFacts={setFacts} errors={errors} />
          <div className="@4xl/fund:hidden">{actions("bar")}</div>
        </div>
        <aside className="hidden @4xl/fund:flex flex-col gap-5 self-start sticky top-0 min-w-0">
          {side}
          {actions("here")}
        </aside>
      </div>
      <div className="@4xl/fund:hidden">
        <NeedBar status={c.statusShort[status]} listLabel={c.needs.title} list={<div className="flex flex-col gap-4">{side}</div>} action={<Button variant="primary" onClick={() => save(false)}>{c.save}</Button>} />
      </div>
    </div>
  );
}

/** A custom index without what the panel says of it, so a fact cleared there leaves the saved index. */
function withoutFacts(i: CustomIndex): CustomIndex {
  const rest = { ...i };
  delete rest.region;
  delete rest.dividendYield;
  return rest;
}

// ---------------------------------------------------------------- the questions

type SetDraft = <K extends keyof FundDraft>(k: K, v: FundDraft[K]) => void;

function Question({ id, text, aside, children, after }: { id: string; text: ReactNode; aside?: ReactNode; children: ReactNode; after?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <p id={id} className="text-sm font-medium">
        {text}
        {aside && <span className="font-normal text-muted-foreground"> · {aside}</span>}
      </p>
      {children}
      {after}
    </div>
  );
}

function FundQuestions({ draft, set, setMany, index, currencyOfIndex, facts, setFacts, errors }: { draft: FundDraft; set: SetDraft; setMany: (p: Partial<FundDraft>) => void; index: IndexRef; currencyOfIndex: string | null; facts: FactsDraft; setFacts: (f: FactsDraft) => void; errors: EntryError[] }) {
  const ids = useId();
  const w = c.fields;
  const kind = draftKind(draft);
  // a foreign fund, or one whose kind is not known yet, has one yearly charge; an Israeli one its fixed and variable fees and the trustee's
  const yearly = !kind || isForeignKind(kind);
  const priceUnit = draftPriceUnit(draft, currencyOfIndex);
  const setPlace = (buyAt: BuyAt, country: CountryAnswer) => setMany(draftWithPlace(draft, { buyAt, country }, currencyOfIndex));
  // no "0" in an empty field: an empty fee is not known, not a fee of zero
  const percent = (k: "fixed" | "variable" | "trustee", label: string, hint?: string) => <NumberField label={label} unit="pct_per_year" value={draft[k]} isEntered={draft[k] !== null} validate={pctCheck} onCommit={(n) => set(k, n)} onReset={() => set(k, null)} hint={hint} optional />;
  const open = draft.buyAt ? countriesAt(draft.buyAt) : COUNTRIES;
  const onlyIsrael = index.israeli || !asksCountry(draft.buyAt);
  // Israel stays in sight, closed, where the answer closes it; abroad "another country" and "not sure" lead to the same fund, and one chip says both
  const countryIds = COUNTRIES.filter((x) => x === "IL" || open.includes(x));
  const countryLook: Partial<Record<string, ChipLook>> = { unsure: "unsure", ...(open.includes("IL") ? {} : { IL: "closed" }) };
  const countryLabels = open.includes("other") ? c.countryNames : { ...c.countryNames, unsure: c.countryOtherOrUnsure };
  const step1 = !!draft.buyAt;
  const step2 = !!draft.name.trim() && (yearly ? draft.fixed !== null : draft.fixed !== null && draft.variable !== null && draft.trustee !== null);
  const step3 = draft.payout !== null && (!asksHedge(index) || draft.hedged !== null);
  return (
    <div className="flex flex-col gap-4">
      <Step n={1} done={step1} title={c.steps.place}>
        <Question id={`${ids}-buy`} text={c.ask.buyAt} after={errors.includes("place-none") && <p className="text-xs text-destructive">{c.errors["place-none"]}</p>}>
          <div className="@container">
            <div className="grid gap-x-4 gap-y-2 @xl:grid-cols-[auto_minmax(0,1fr)] @xl:items-center">
              <span className="text-sm text-muted-foreground">{c.buyGroups.israel}</span>
              <ChoiceChips ids={BUY_IN_ISRAEL} labels={c.buyAtNames} value={draft.buyAt} onChange={(at) => setPlace(at, draft.country)} ariaLabel={`${c.ask.buyAt} ${c.buyGroups.israel}`} wrap />
              {optionsOf(index.israeli).includes("abroad") && (
                <>
                  <span className="text-sm text-muted-foreground">{c.buyGroups.abroad}</span>
                  <ChoiceChips ids={BUY_ABROAD} labels={c.buyAtNames} value={draft.buyAt} onChange={(at) => setPlace(at, draft.country)} ariaLabel={`${c.ask.buyAt} ${c.buyGroups.abroad}`} look={{ abroad: "unsure" }} wrap />
                </>
              )}
            </div>
          </div>
        </Question>
        {onlyIsrael ? (
          <Question id={`${ids}-country`} text={c.ask.country}>
            <p className="text-xs text-muted-foreground">{index.israeli ? c.countryWhy.israeliIndex : c.countryWhy.manager}</p>
          </Question>
        ) : (
          <Question id={`${ids}-country`} text={c.ask.country} aside={c.ask.countryWhere} after={!open.includes("IL") && <p className="text-xs text-muted-foreground">{c.countryWhy.abroad}</p>}>
            <ChoiceChips ids={countryIds} labels={countryLabels} value={draft.country} onChange={(v) => (draft.buyAt ? setPlace(draft.buyAt, v) : set("country", v))} ariaLabel={c.ask.country} look={countryLook} wrap />
          </Question>
        )}
      </Step>
      <Step n={2} done={step2} title={c.steps.fund}>
        <div className="@container">
          <div className="grid gap-4 @xl:grid-cols-2">
            <TextField label={w.fundName} value={draft.name} onChange={(v) => set("name", v)} maxLength={NAME_MAX} dir="auto" error={errors.includes("name-empty") ? c.errors["name-empty"] : errors.includes("name-taken") ? c.errors["name-taken"] : null} />
            <TextField label={w.number} value={draft.number} onChange={(v) => set("number", v)} maxLength={20} dir="ltr" />
            {yearly ? (
              percent("fixed", w.yearly, c.feeHint)
            ) : (
              <>
                {percent("fixed", w.fixed)}
                {percent("variable", w.variable)}
                {percent("trustee", w.trustee)}
              </>
            )}
            {priceUnit && <NumberField label={priceUnit === "agorot" ? w.unitPriceAgorot : w.unitPrice} unit={priceUnit} value={draft.unitPrice?.value ?? null} isEntered={draft.unitPrice !== null} validate={aboveZeroCheck} onCommit={(n) => set("unitPrice", { value: n, unit: priceUnit })} onReset={() => set("unitPrice", null)} hint={c.unitPriceHint} agorot optional />}
          </div>
        </div>
      </Step>
      <Step n={3} done={step3} title={c.steps.traits} value={c.stepNotes.traits}>
        <Question
          id={`${ids}-payout`}
          text={c.ask.payout}
          after={
            draft.payout === "distributing" && (
              <div className="flex flex-col gap-3">
                <NumberField label={w.yield} unit="pct_per_year" value={draft.yield} isEntered={draft.yield !== null} validate={pctCheck} onCommit={(n) => set("yield", n)} onReset={() => set("yield", null)} optional />
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm">{w.perYear}</span>
                  <ChoiceChips ids={PER_YEAR.map(String)} labels={c.perYearNames} value={draft.perYear === null ? null : String(draft.perYear)} onChange={(v) => set("perYear", Number(v) as PerYear)} ariaLabel={w.perYear} wrap />
                </div>
              </div>
            )
          }
        >
          <ChoiceChips ids={[...PAYOUTS, UNSURE]} labels={{ ...c.payoutNames, [UNSURE]: c.unsure }} value={draft.payout ?? UNSURE} onChange={(v) => set("payout", v === UNSURE ? null : (v as FundPayout))} ariaLabel={c.ask.payout} look={{ [UNSURE]: "unsure" }} wrap />
        </Question>
        <Question id={`${ids}-tracking`} text={c.ask.tracking}>
          <ChoiceChips ids={[...ASKED_TRACKINGS, UNSURE]} labels={{ ...c.trackingNames, [UNSURE]: c.unsure }} value={draft.tracking ?? UNSURE} onChange={(v) => set("tracking", v === UNSURE ? null : (v as FundTracking))} ariaLabel={c.ask.tracking} look={{ [UNSURE]: "unsure" }} wrap />
        </Question>
        {asksHedge(index) && (
          <Question id={`${ids}-hedge`} text={c.ask.hedged} after={errors.includes("hedged-none") && <p className="text-xs text-destructive">{c.errors["hedged-none"]}</p>}>
            <ChoiceChips
              ids={index.custom ? HEDGE_ON_CUSTOM : HEDGE}
              labels={c.hedgedNames}
              value={draft.hedged === null ? null : draft.hedged ? "yes" : draft.shekelIndex ? "shekel" : "no"}
              onChange={(v) => setMany({ hedged: v === "yes", shekelIndex: v === "shekel" })}
              ariaLabel={c.ask.hedged}
              wrap
            />
          </Question>
        )}
      </Step>
      {index.custom && (
        <Step n={4} done={facts.region !== null} title={c.steps.index} value={c.stepNotes.index}>
          <Question id={`${ids}-region`} text={c.ask.region}>
            <ChoiceChips ids={INDEX_REGIONS} labels={c.regionNames} value={facts.region} onChange={(region) => setFacts({ ...facts, region })} ariaLabel={c.ask.region} look={{ other: "unsure" }} wrap />
          </Question>
          {/* the yield is read only where the index is of US companies (F-107); elsewhere it would change nothing */}
          {facts.region === "us" && (
            <Disclosure label={<span className="flex flex-col"><span className="font-medium">{c.more.label}</span><span className="text-xs text-muted-foreground">{c.more.sub}</span></span>} defaultOpen={facts.yieldPct !== null}>
              <div className="pt-2">
                <NumberField label={w.indexYield} unit="pct_per_year" value={facts.yieldPct} isEntered={facts.yieldPct !== null} validate={pctCheck} onCommit={(n) => setFacts({ ...facts, yieldPct: n })} onReset={() => setFacts({ ...facts, yieldPct: null })} optional />
              </div>
            </Disclosure>
          )}
        </Step>
      )}
    </div>
  );
}

/** The ways of following an index the panel offers; a fund saved as "mixed" keeps it until another answer is chosen. */
const ASKED_TRACKINGS: readonly FundTracking[] = ["physical", "swap", "futures"];
const HEDGE = ["no", "yes"] as const;
/** On an index the person added, a third answer: the index is in shekels, so the fund moves with no foreign currency. */
const HEDGE_ON_CUSTOM = ["no", "yes", "shekel"] as const;
