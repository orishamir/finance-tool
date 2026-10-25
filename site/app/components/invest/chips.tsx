// The index chips (nothing preselected, D27), the "אחר" flow for a custom index, and the plan chips with the dollar rate (D26).
import { useId, useMemo, useState } from "react";
import { Link } from "react-router";
import { invest as c } from "../../copy";
import { customIdOf, indexSuggestions, matchKnownIndex, type CustomIndex, type IndexRef } from "../../lib/invest";
import { fxLabel, nisPer, type FxSnapshot } from "../../lib/fx";
import type { WorkbenchBundle, WorkbenchInputs } from "../../lib/providers";
import { IconClose } from "../icons";
import { Num } from "../provenance";
import { Button, Card, cx, SegmentedControl, Sentence, Tag } from "../kit";

const chip = "inline-flex items-center gap-1 min-h-target lg:min-h-10 px-3.5 rounded-full border text-sm";

export function IndexChips({ known, customs, selectedId, bundle, onRemove, onSave, onGo }: { known: IndexRef[]; customs: CustomIndex[]; selectedId: string | null; bundle: Pick<WorkbenchBundle, "exposures"> | null; onRemove: (id: string) => void; onSave: (c: CustomIndex) => void; onGo: (path: string) => void }) {
  const [adding, setAdding] = useState(false);
  const idBase = useId();
  return (
    <section className="flex flex-col gap-3" aria-labelledby={`${idBase}-h`}>
      <h2 id={`${idBase}-h`} className="text-sm font-medium text-muted-foreground">
        {c.chips.heading}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {known.map((i) => (
          <li key={i.id}>
            <Link to={`/invest/${i.id}`} aria-current={selectedId === i.id ? "page" : undefined} className={cx(chip, selectedId === i.id ? "bg-primary text-primary-foreground border-primary font-medium" : "bg-card border-border hover:bg-accent")}>
              {i.name}
            </Link>
          </li>
        ))}
        {customs.map((i) => (
          <li key={i.id} className="inline-flex">
            <Link to={`/invest?custom=${encodeURIComponent(i.id)}`} aria-current={selectedId === i.id ? "page" : undefined} className={cx(chip, "pe-1.5 rounded-e-none", selectedId === i.id ? "bg-primary text-primary-foreground border-primary font-medium" : "bg-card border-border hover:bg-accent")}>
              {i.name}
            </Link>
            <button type="button" aria-label={c.chips.remove(i.name)} onClick={() => onRemove(i.id)} className="size-target lg:size-10 -ms-px inline-flex items-center justify-center rounded-e-full border border-border bg-card hover:bg-accent">
              <IconClose size={16} />
            </button>
          </li>
        ))}
        <li>
          <button type="button" aria-expanded={adding} onClick={() => setAdding((v) => !v)} className={cx(chip, "border-dashed border-border bg-transparent hover:bg-accent")}>
            {c.chips.other}
          </button>
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">{c.chips.ownChoice}</p>
      {adding && bundle && <CustomPanel bundle={bundle} customs={customs} onCancel={() => setAdding(false)} onSave={(x) => { setAdding(false); onSave(x); onGo(`/invest?custom=${encodeURIComponent(x.id)}`); }} onKnown={(k) => { setAdding(false); onGo(`/invest/${k}`); }} />}
    </section>
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
  const names = useMemo(() => [...new Set(indexSuggestions(bundle).map((x) => x.name))], [bundle]);
  const go = () => {
    const typed = name.trim();
    if (!typed) return;
    const known = matchKnownIndex(bundle, typed);
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
        <input id={`${id}-n`} list={`${id}-l`} value={name} disabled={step === "question"} onChange={(e) => { setName(e.target.value); setNote(null); }} onKeyDown={(e) => e.key === "Enter" && go()} placeholder={c.custom.placeholder} className="h-field flex-1 min-w-48 rounded-md bg-input border border-border px-3" />
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
              <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="h-field rounded-md bg-input border border-border px-3 w-40" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              {c.custom.region}
              <input value={region} onChange={(e) => setRegion(e.target.value)} className="h-field rounded-md bg-input border border-border px-3 w-40" />
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

export function PlanChips({ plan, fx, today, brokers, yourBroker, onBroker, hasGoal }: { plan: WorkbenchInputs; fx: FxSnapshot | undefined; today: string; brokers: { id: string; name: string }[]; yourBroker: string | null; onBroker: (id: string | null) => void; hasGoal: boolean }) {
  const id = useId();
  const usd = fx ? nisPer(fx, "USD", today) : null;
  const item = "flex flex-col gap-0.5 bg-card border border-border rounded-md px-3 py-2";
  const lbl = "text-xs text-muted-foreground";
  return (
    <section className="flex flex-col gap-3" aria-label={c.plan.heading}>
      <ul className="flex flex-wrap gap-2">
        <li className={item}>
          <span className={lbl}>{c.plan.now}</span>
          <Num value={plan.values.amount} />
        </li>
        <li className={item}>
          <span className={lbl}>{c.plan.monthly}</span>
          <Num value={plan.values.monthly} />
        </li>
        <li className={item}>
          <span className={lbl}>{c.plan.years}</span>
          <Num value={plan.values.years} />
        </li>
        <li className={item}>
          <span className={lbl}>{plan.returnFromParameter ? c.plan.retExample : c.plan.retEntered}</span>
          <Num value={plan.values.returnV} />
        </li>
        <li className={item}>
          <span className={lbl}>{c.plan.inflation}</span>
          <Num value={plan.values.inflation} />
        </li>
      </ul>
      <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-3">
        <span>
          {hasGoal ? c.plan.fromGoal : c.plan.siteExample} · {c.plan.todayShekels}
        </span>
        <Link to="/goal" className="text-link hover:underline min-h-target inline-flex items-center">
          {c.plan.change}
        </Link>
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
      <div className="flex flex-col gap-1 max-w-measure">
        <label htmlFor={`${id}-b`} className="text-sm font-medium">
          {c.plan.yourAccount}
        </label>
        <select id={`${id}-b`} value={yourBroker ?? ""} onChange={(e) => onBroker(e.target.value || null)} className="h-field rounded-md bg-input border border-border px-3 max-w-72">
          <option value="">{c.plan.yourAccountNone}</option>
          {brokers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">{c.plan.yourAccountHelp}</span>
      </div>
    </section>
  );
}
