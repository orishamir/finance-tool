// The index pills (the kit's ChipList; nothing preselected, D27), the "אחר" flow for a custom index, and the plan (the kit's PlanChips) with the dollar rate (D26).
import { useId, useMemo, useState } from "react";
import { invest as c } from "../../copy";
import type { FieldKey } from "../../lib/goal";
import { customIdOf, indexSuggestions, matchKnownIndex, type CustomIndex, type IndexRef } from "../../lib/invest";
import { fxLabel, nisPer, type FxSnapshot } from "../../lib/fx";
import type { WorkbenchBundle } from "../../lib/providers";
import { Num } from "../provenance";
import { Button, Card, ChipList, PlanChips, SegmentedControl, Sentence, Tag, type ChipItem, type PlanChipItem } from "../kit";

/** The index name as a pill: the pills sit under the heading "המדד", so a leading "מדד" is dropped. */
export const pillName = (name: string): string => name.replace(/^מדד\s+/, "");

export function IndexChips({ known, customs, selectedId, bundle, onRemove, onRename, onSave, onGo }: { known: IndexRef[]; customs: CustomIndex[]; selectedId: string | null; bundle: Pick<WorkbenchBundle, "exposures"> | null; onRemove: (id: string) => void; onRename: (id: string, name: string) => void; onSave: (c: CustomIndex) => void; onGo: (path: string) => void }) {
  const [adding, setAdding] = useState(false);
  const items: ChipItem[] = [
    ...known.map((i) => ({ id: i.id, label: pillName(i.name), href: `/invest/${i.id}` })),
    ...customs.map((i) => ({ id: i.id, label: pillName(i.name), href: `/invest?custom=${encodeURIComponent(i.id)}`, editable: true })),
  ];
  return (
    <div className="flex flex-col gap-3">
      <ChipList
        heading={c.chips.heading}
        note={c.chips.ownChoice}
        items={items}
        value={selectedId}
        words={{ confirm: c.chips.confirm, confirmYes: c.chips.confirmYes, confirmNo: c.chips.confirmNo, rename: c.chips.rename, remove: c.chips.remove, renameField: c.chips.renameField }}
        onRename={onRename}
        onDelete={onRemove}
        add={{ label: c.chips.other, onClick: () => setAdding((v) => !v), expanded: adding }}
      />
      {adding && bundle && <CustomPanel bundle={bundle} customs={customs} onCancel={() => setAdding(false)} onSave={(x) => { setAdding(false); onSave(x); onGo(`/invest?custom=${encodeURIComponent(x.id)}`); }} onKnown={(k) => { setAdding(false); onGo(`/invest/${k}`); }} />}
    </div>
  );
}

function CustomPanel({ bundle, customs, onCancel, onSave, onKnown }: { bundle: Pick<WorkbenchBundle, "exposures">; customs: CustomIndex[]; onCancel: () => void; onSave: (c: CustomIndex) => void; onKnown: (id: string) => void }) {
  const id = useId();
  const [name, setName] = useState("");
  const [step, setStep] = useState<"name" | "question">("name");
  const [israeli, setIsraeli] = useState<"yes" | "no" | null>(null);
  const [currency, setCurrency] = useState("");
  const [region, setRegion] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const names = useMemo(() => [...new Set(indexSuggestions(bundle).map((x) => pillName(x.name)))], [bundle]);
  const go = () => {
    const typed = name.trim();
    if (!typed) return;
    const known = matchKnownIndex(bundle, typed) ?? matchKnownIndex(bundle, `מדד ${typed}`);
    if (known) {
      onKnown(known.id);
      return;
    }
    if (customs.some((x) => x.id === customIdOf(typed))) return setNote(c.custom.nameTaken);
    setStep("question");
  };
  const save = () => {
    if (!israeli) return;
    const added = new Date().toISOString().slice(0, 10);
    const idx: CustomIndex = { id: customIdOf(name.trim()), name: name.trim(), israeli: israeli === "yes", ...(currency.trim() ? { currency: currency.trim() } : {}), ...(region.trim() ? { region: region.trim() } : {}), added };
    onSave(idx);
  };
  return (
    <Card pad="tight" className="flex flex-col gap-3 max-w-measure" role="group" aria-label={c.custom.heading}>
      <label htmlFor={`${id}-n`} className="text-sm font-medium">
        {c.custom.field}
      </label>
      <div className="flex flex-wrap gap-2">
        <input id={`${id}-n`} list={`${id}-l`} value={name} disabled={step === "question"} onChange={(e) => { setName(e.target.value); setNote(null); }} onKeyDown={(e) => e.key === "Enter" && go()} placeholder={c.custom.placeholder} className="h-field flex-1 min-w-48 rounded-md bg-card border border-input px-3" />
        <datalist id={`${id}-l`}>
          {names.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        {step === "name" && (
          <Button variant="primary" onClick={go} disabled={!name.trim()}>
            {c.custom.go}
          </Button>
        )}
      </div>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
      {step === "question" && (
        <div className="flex flex-col gap-3">
          <p className="font-medium">{c.custom.question}</p>
          <p className="text-sm text-muted-foreground">{c.custom.questionWhy}</p>
          <SegmentedControl<"yes" | "no"> label={c.custom.question} value={israeli} onChange={setIsraeli} options={[{ value: "yes", label: c.custom.yes }, { value: "no", label: c.custom.no }]} className="max-w-60" />
          <p className="text-sm text-muted-foreground">{c.custom.forInfo}</p>
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-sm">
              {c.custom.currency}
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-field rounded-md bg-card border border-input px-3 w-40" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {c.custom.region}
              <input value={region} onChange={(e) => setRegion(e.target.value)} className="h-field rounded-md bg-card border border-input px-3 w-40" />
            </label>
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={save} disabled={!israeli}>
              {c.custom.save}
            </Button>
            <Button variant="quiet" onClick={onCancel}>
              {c.custom.cancel}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------- the plan

export function PlanBlock({ items, onOpen, fx, today, brokers, yourBroker, onBroker, hasGoal }: { items: PlanChipItem[]; onOpen: (f: FieldKey | "all") => void; fx: FxSnapshot | undefined; today: string; brokers: { id: string; name: string }[]; yourBroker: string | null; onBroker: (id: string | null) => void; hasGoal: boolean }) {
  const usd = fx ? nisPer(fx, "USD", today) : null;
  return (
    <section className="flex flex-col gap-3" aria-label={c.plan.heading}>
      <PlanChips items={items} allLabel={c.plan.all} onOpen={onOpen} />
      <p className="text-sm text-muted-foreground">
        {hasGoal ? c.plan.fromGoal : c.plan.siteExample} · {c.plan.todayShekels}
      </p>
      <Sentence size="sm" tone="muted">
        {usd ? (
          <>
            {c.plan.dollar} <Num value={usd} exact /> · {fxLabel(fx!)}
          </>
        ) : (
          <Tag tone="caution">{c.plan.dollarMissing}</Tag>
        )}
      </Sentence>
      <HouseSelect label={c.plan.yourAccount} none={c.plan.yourAccountNone} value={yourBroker} options={brokers} onChange={onBroker} help={c.plan.yourAccountHelp} />
    </section>
  );
}

/** A house chosen from a list (the plan's account, the funds section's house): a plain select until the kit has one (kit round 2). */
export function HouseSelect({ label, none, value, options, onChange, help }: { label: string; none?: string; value: string | null; options: { id: string; name: string }[]; onChange: (id: string | null) => void; help?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1 max-w-measure">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} className="h-field rounded-md bg-card border border-input px-3 max-w-72">
        {none !== undefined && <option value="">{none}</option>}
        {options.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
      {help && <span className="text-sm text-muted-foreground">{help}</span>}
    </div>
  );
}
