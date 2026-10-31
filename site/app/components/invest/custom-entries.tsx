// The person's own broker and fund on the index page (D44): the two quiet buttons under the lists, the panel they open, and what a row of
// an entry says. Typing stays in the panel: nothing on the page changes until the person saves (ground rule 4, "nothing moves").
import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { invest as root } from "../../copy";
import { brokerDraftOf, brokerErrors, brokerFromDraft, brokerTerms, fundDraftOf, fundErrors, fundFromDraft, fundTerms, isForeignKind, NAME_MAX, newBrokerId, newFundId, type BrokerDraft, type CustomBroker, type CustomFund, type EntryError, type EntryTerm, type FundDraft } from "../../lib/custom-entries";
import { optionsOf, type IndexRef, type OptionId } from "../../lib/invest";
import { isoToday } from "../../lib/state";
import { Num, StateTag } from "../provenance";
import { Sheet } from "../Sheet";
import { Button, CheckField, FieldGroup, flushPendingFields, NumberField, percentCheck, SegmentedControl, SelectField, TextField } from "../kit";

const c = root.customEntries;

type Editing = { kind: "broker"; id: string | null } | { kind: "fund"; id: string | null };

interface Editors {
  addBroker: () => void;
  addFund: () => void;
  edit: (e: Editing) => void;
  brokers: readonly CustomBroker[];
  funds: readonly CustomFund[];
}

const EditorsContext = createContext<Editors | null>(null);

/** Holds what is being edited and the one panel; the rows and buttons below it reach it through the context. */
export function CustomEntriesHost({ index, brokers, funds, writable, onSaveBroker, onRemoveBroker, onSaveFund, onRemoveFund, children }: { index: IndexRef | null; brokers: readonly CustomBroker[]; funds: readonly CustomFund[]; writable: boolean; onSaveBroker: (b: CustomBroker) => void; onRemoveBroker: (id: string) => void; onSaveFund: (f: CustomFund) => void; onRemoveFund: (id: string) => void; children: ReactNode }) {
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
  const api = useMemo<Editors>(() => ({ addBroker: () => setEditing({ kind: "broker", id: null }), addFund: () => setEditing({ kind: "fund", id: null }), edit: setEditing, brokers, funds }), [brokers, funds]);
  return (
    <EditorsContext.Provider value={api}>
      {children}
      <Sheet open={!!editing} onClose={close} pc="center" height={100} labelledBy={headId}>
        {editing?.kind === "broker" && (
          <BrokerPanel
            key={editing.id ?? "new"}
            headId={headId}
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
export function AddEntryButton({ kind }: { kind: "broker" | "fund" }) {
  const e = useContext(EditorsContext);
  if (!e) return null;
  return (
    <Button variant="quiet" className="self-start -ms-2" onClick={kind === "broker" ? e.addBroker : e.addFund}>
      + {kind === "broker" ? c.addBroker : c.addFund}
    </Button>
  );
}

function EditButton({ editing }: { editing: Editing }) {
  const e = useContext(EditorsContext);
  if (!e) return null;
  return (
    <Button variant="quiet" className="text-sm" onClick={() => e.edit(editing)}>
      {c.edit}
    </Button>
  );
}


function Terms({ terms, editing }: { terms: { shown: EntryTerm[]; empty: string[] }; editing: Editing }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs leading-snug text-muted-foreground">
      <StateTag state="entered" />
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
      {terms.empty.length > 0 && <span>{terms.shown.length === 0 ? c.allEmpty : c.emptyLine(c.listWords(terms.empty))}</span>}
      <EditButton editing={editing} />
    </span>
  );
}

/** A broker row's line: that it was entered, every figure typed in the entered state, what was left empty, and the way to change it. */
export function BrokerTerms({ id }: { id: string }) {
  const e = useContext(EditorsContext);
  const b = e?.brokers.find((x) => x.id === id);
  return b ? <Terms terms={brokerTerms(b)} editing={{ kind: "broker", id }} /> : null;
}

/** The same line on a fund's row. */
export function FundTerms({ id }: { id: string }) {
  const e = useContext(EditorsContext);
  const f = e?.funds.find((x) => x.id === id);
  return f ? <Terms terms={fundTerms(f)} editing={{ kind: "fund", id }} /> : null;
}

// ---------------------------------------------------------------- the panels

/** The draft and a ref of it: a number still waiting out the typing pause is committed by the save, and read at once. */
function useDraft<T>(start: () => T) {
  const [draft, setDraft] = useState<T>(start);
  const now = useRef(draft);
  const set = <K extends keyof T>(k: K, v: T[K]) => {
    now.current = { ...now.current, [k]: v };
    setDraft(now.current);
  };
  return { draft, now, set };
}

const isInvalid = (form: HTMLElement | null) => !!form?.querySelector('[aria-invalid="true"]');
const nisCheck = (n: number) => (n < 0 ? c.errors.negative : null);
const pctCheck = percentCheck();

function Actions({ entry, name, writable, onSave, onCancel, onRemove }: { entry: boolean; name: string; writable: boolean; onSave: () => void; onCancel: () => void; onRemove: () => void }) {
  const [asking, setAsking] = useState(false);
  return (
    <div className="flex flex-col gap-2 pt-1">
      {!writable && <p className="text-xs text-caution-foreground">{c.noStorage}</p>}
      {asking ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm w-full">{c.removeAsk(name)}</p>
          <Button variant="destructive" onClick={onRemove}>
            {c.removeYes}
          </Button>
          <Button variant="quiet" onClick={() => setAsking(false)}>
            {c.cancel}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={onSave}>
            {c.save}
          </Button>
          <Button variant="quiet" onClick={onCancel}>
            {c.cancel}
          </Button>
          {entry && (
            <Button variant="destructive" className="ms-auto" onClick={() => setAsking(true)}>
              {c.remove}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function BrokerPanel({ headId, broker, others, writable, onSave, onCancel, onRemove }: { headId: string; broker: CustomBroker | null; others: readonly CustomBroker[]; writable: boolean; onSave: (b: CustomBroker) => void; onCancel: () => void; onRemove: (id: string) => void }) {
  const { draft, now, set } = useDraft<BrokerDraft>(() => brokerDraftOf(broker));
  const [errors, setErrors] = useState<EntryError[]>([]);
  const form = useRef<HTMLDivElement>(null);
  const w = c.fields;
  const field = (k: "tradeMin" | "custodyMin" | "monthlyFee", label: string, unit: string) => <NumberField label={label} unit={unit} value={draft[k]} isEntered={draft[k] !== null} validate={nisCheck} onCommit={(n) => set(k, n)} onReset={() => set(k, null)} placeholder="0" optional />;
  const percent = (k: "tradePct" | "custodyPct" | "fxPct", label: string, unit: string) => <NumberField label={label} unit={unit} value={draft[k]} isEntered={draft[k] !== null} validate={pctCheck} onCommit={(n) => set(k, n)} onReset={() => set(k, null)} placeholder="0" optional />;
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
        <p className="text-sm text-muted-foreground">{c.brokerSub}</p>
      </div>
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
      <Actions entry={!!broker} name={broker?.name ?? ""} writable={writable} onSave={save} onCancel={onCancel} onRemove={() => broker && onRemove(broker.id)} />
    </div>
  );
}

function FundPanel({ headId, index, fund, others, writable, onSave, onCancel, onRemove }: { headId: string; index: IndexRef; fund: CustomFund | null; others: readonly CustomFund[]; writable: boolean; onSave: (f: CustomFund) => void; onCancel: () => void; onRemove: (id: string) => void }) {
  const kinds = optionsOf(index.israeli);
  const { draft, now, set } = useDraft<FundDraft>(() => fundDraftOf(fund, kinds[0]!));
  const [errors, setErrors] = useState<EntryError[]>([]);
  const form = useRef<HTMLDivElement>(null);
  const w = c.fields;
  const foreign = isForeignKind(draft.kind);
  const percent = (k: "fixed" | "variable" | "trustee", label: string) => <NumberField label={label} unit="pct_per_year" value={draft[k]} isEntered={draft[k] !== null} validate={pctCheck} onCommit={(n) => set(k, n)} onReset={() => set(k, null)} placeholder="0" optional />;
  const save = () => {
    flushPendingFields();
    const d = now.current;
    const e = fundErrors(d, others, fund?.id ?? null);
    setErrors(e);
    if (e.length > 0 || isInvalid(form.current)) return;
    onSave(fundFromDraft(d, fund?.id ?? newFundId(), fund?.indexId ?? index.id, isoToday()));
  };
  return (
    <div ref={form} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 pe-10">
        <h2 id={headId} className="text-lg font-semibold">
          {fund ? c.fundEdit(fund.name) : c.fundTitle(index.name)}
        </h2>
        <p className="text-sm text-muted-foreground">{c.fundSub}</p>
      </div>
      <TextField label={w.fundName} value={draft.name} onChange={(v) => set("name", v)} maxLength={NAME_MAX} error={errors.includes("name-empty") ? c.errors["name-empty"] : errors.includes("name-taken") ? c.errors["name-taken"] : null} />
      <TextField label={w.number} value={draft.number} onChange={(v) => set("number", v)} maxLength={20} dir="ltr" />
      <SelectField className="max-w-none" label={w.kind} value={draft.kind} options={kinds.map((k: OptionId) => ({ id: k, name: c.kinds[k]! }))} onChange={(k) => k && set("kind", k as OptionId)} />
      {foreign ? (
        percent("fixed", w.yearly)
      ) : (
        <div className="field-row grid gap-3 grid-cols-[minmax(0,1fr)] sm:grid-cols-3">
          {percent("fixed", w.fixed)}
          {percent("variable", w.variable)}
          {percent("trustee", w.trustee)}
        </div>
      )}
      {/* an Israeli index is in shekels: there is no currency to neutralise */}
      {!index.israeli && (
        <FieldGroup title={w.hedged} note={draft.hedged ? <p className="text-xs text-muted-foreground">{c.hedgedNote}</p> : undefined}>
          <SegmentedControl<"no" | "yes"> label={w.hedged} value={draft.hedged ? "yes" : "no"} onChange={(v) => set("hedged", v === "yes")} options={[{ value: "no", label: w.hedgedNo }, { value: "yes", label: w.hedgedYes }]} className="max-w-72" />
        </FieldGroup>
      )}
      <Actions entry={!!fund} name={fund?.name ?? ""} writable={writable} onSave={save} onCancel={onCancel} onRemove={() => fund && onRemove(fund.id)} />
    </div>
  );
}
