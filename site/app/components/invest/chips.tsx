// The index pills (the kit's ChipList; nothing preselected, D27), the "אחר" flow for a custom index, and the plan (the kit's PlanChips) with the dollar rate (D26).
import { useId, useMemo, useState, type ReactNode } from "react";
import { invest as c } from "../../copy";
import { customIdOf, customIndexPath, indexPath, indexSuggestions, matchKnownIndex, type CustomIndex, type IndexRef } from "../../lib/invest";
import { fxLabel, nisPer, type FxSnapshot } from "../../lib/fx";
import type { WorkbenchBundle } from "../../lib/providers";
import { Num } from "../provenance";
import { Button, Card, ChipList, SegmentedControl, Sentence, Tag, type ChipItem } from "../kit";

/** The index name as a pill: the pills sit under the heading "המדד", so a leading "מדד" is dropped. */
export const pillName = (name: string): string => name.replace(/^מדד\s+/, "");

export function IndexChips({ known, customs, selectedId, bundle, onRemove, onRename, onSave, onGo }: { known: IndexRef[]; customs: CustomIndex[]; selectedId: string | null; bundle: Pick<WorkbenchBundle, "exposures"> | null; onRemove: (id: string) => void; onRename: (id: string, name: string) => void; onSave: (c: CustomIndex) => void; onGo: (path: string) => void }) {
  const [adding, setAdding] = useState(false);
  const items: ChipItem[] = [
    ...known.map((i) => ({ id: i.id, label: pillName(i.name), href: indexPath(i.id) })),
    ...customs.map((i) => ({ id: i.id, label: pillName(i.name), href: customIndexPath(i.id), editable: true })),
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
      {adding && bundle && <CustomPanel bundle={bundle} customs={customs} onCancel={() => setAdding(false)} onSave={(x) => { setAdding(false); onSave(x); onGo(customIndexPath(x.id)); }} onKnown={(k) => { setAdding(false); onGo(indexPath(k)); }} />}
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

/** The plan the page runs on: the knob strip (founder, 2026-10-28), the rest of the assumptions behind a button, and the dollar rate. */
/** `example`: no number entered yet, so every one is the site's example; once one is entered each slider marks its own. */
export function PlanBlock({ knobs, onOpen, fx, today, example }: { knobs: ReactNode; onOpen: () => void; fx: FxSnapshot | undefined; today: string; example: boolean }) {
  const usd = fx ? nisPer(fx, "USD", today) : null;
  return (
    <section className="flex flex-col gap-3" aria-label={c.plan.heading}>
      {knobs}
      <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
        <Button variant="secondary" className="!h-9 px-3 text-sm" onClick={onOpen}>
          {c.plan.knobs.others}
        </Button>
        <span>
          {example && <>{c.plan.siteExample} · </>}{c.plan.todayShekels}
        </span>
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
    </section>
  );
}
