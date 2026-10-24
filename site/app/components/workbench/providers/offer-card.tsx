// The entered-offer card (flow 29, design-system 8.1, design-spec 16.3): one field per fee line the tariff has for this
// instrument, the list value as the placeholder, and who offered it and when. A sheet on a phone, a popover on PC.
import { useId, useState } from "react";
import { r4workbench as c } from "../../../copy";
import { fmt } from "../../../lib/format";
import { draftOf, hasErrors, offerFromDraft, validateDraft, type DraftErrors, type EnteredOffer, type OfferDraft } from "../../../lib/offers";
import type { ProviderRowView } from "../../../lib/providers";
import { Button, cx } from "../../ui";
import { NumberField } from "../../timeline/fields";

const monthsOf = { month: 1, quarter: 3, year: 12 } as const;
const periodOfMonths = (m: number): "month" | "quarter" | "year" => (m === 1 ? "month" : m === 3 ? "quarter" : "year");

type Num = number | null;

function Group({ title, children, note }: { title: string; children: React.ReactNode; note?: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <legend className="font-medium mb-1">{title}</legend>
      {children}
      {note}
    </fieldset>
  );
}

export function EnteredOfferCard({ view, offer, today, writable, showFx, onSave, onClear, onClose, headId }: { view: ProviderRowView; offer: EnteredOffer | undefined; today: string; writable: boolean; showFx: boolean; onSave: (o: EnteredOffer) => void; onClear: () => void; onClose: () => void; headId: string }) {
  const t = c.providers.offer;
  const listCustody = view.list.custody?.period;
  const everyMonths = listCustody ? monthsOf[listCustody] : (offer?.lines.custody?.everyMonths ?? 12);
  const [draft, setDraft] = useState<OfferDraft>(() => draftOf(offer, everyMonths));
  const [errors, setErrors] = useState<DraftErrors>({});
  const dateId = useId();
  const set = <K extends keyof OfferDraft>(k: K, v: OfferDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const list = view.list;
  const pctPh = (x: { value: unknown } | undefined) => (x && typeof x.value === "number" ? t.placeholder(fmt.pct(x.value)) : t.noList);
  const nisPh = (x: { value: unknown } | null | undefined) => (x && typeof x.value === "number" ? t.placeholder(fmt.nis(x.value)) : undefined);
  const err = (k: keyof DraftErrors): string | null => {
    const e = errors[k];
    if (!e) return null;
    return e === "negative" ? t.errors.negative : e === "percent" ? t.errors.percent(100) : e === "min-above-max" ? t.errors.minAboveMax : e === "future" ? t.errors.future : e === "need-rate" ? t.errors.needRate : t.empty;
  };
  const pctCheck = (n: number) => (n < 0 ? t.errors.negative : n > 100 ? t.errors.percent(100) : null);
  const nisCheck = (n: number) => (n < 0 ? t.errors.negative : null);
  const field = (label: string, unit: string, value: Num, onChange: (n: Num) => void, placeholder: string | undefined, validate: (n: number) => string | null, external?: string | null) => (
    <NumberField label={label} unit={unit} value={value} isEntered={value !== null} validate={validate} onCommit={(n) => onChange(n)} onReset={() => onChange(null)} placeholder={placeholder} optional externalError={external ?? null} />
  );
  const above = (typed: Num, listed: { value: unknown } | undefined) => typed !== null && listed && typeof listed.value === "number" && typed > listed.value;
  const aboveNote = (on: boolean | undefined | null) => (on ? <p className="text-xs text-muted-foreground">{t.above}</p> : null);

  const save = () => {
    const e = validateDraft(draft, today);
    setErrors(e);
    if (hasErrors(e)) return;
    onSave(offerFromDraft(view.id, { ...draft, custodyEveryMonths: everyMonths }, today));
    onClose();
  };
  const periodWord = t.periods[periodOfMonths(everyMonths)]!;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id={headId} className="text-lg font-semibold">
          {t.title(view.name)}
        </h2>
        <p className="text-sm text-muted-foreground">{t.hint}</p>
      </div>
      <Group title={t.fields.trade} note={aboveNote(above(draft.tradeRate, list.trade?.rate))}>
        <div className="field-row grid gap-3 grid-cols-[minmax(0,1fr)] sm:grid-cols-3">
          {field(t.sub.pct, "pct_of_trade", draft.tradeRate, (n) => set("tradeRate", n), pctPh(list.trade?.rate), pctCheck, err("tradeRate"))}
          {field(t.sub.min, "nis_per_trade", draft.tradeMin, (n) => set("tradeMin", n), nisPh(list.trade?.min), nisCheck, err("tradeBounds"))}
          {field(t.sub.max, "nis_per_trade", draft.tradeMax, (n) => set("tradeMax", n), nisPh(list.trade?.max), nisCheck)}
        </div>
      </Group>
      <Group title={t.fields.custody} note={aboveNote(above(draft.custodyRate, list.custody?.rate))}>
        <div className="field-row grid gap-3 grid-cols-[minmax(0,1fr)] sm:grid-cols-3">
          {field(t.sub.pctPeriod(periodWord), "pct_of_balance_per_period", draft.custodyRate, (n) => set("custodyRate", n), pctPh(list.custody?.rate), pctCheck, err("custodyRate"))}
          {field(t.sub.min, "nis", draft.custodyMin, (n) => set("custodyMin", n), nisPh(list.custody?.min), nisCheck, err("custodyBounds"))}
          {field(t.sub.max, "nis", draft.custodyMax, (n) => set("custodyMax", n), nisPh(list.custody?.max), nisCheck)}
        </div>
      </Group>
      {showFx && (
        <Group title={t.fields.fx} note={aboveNote(above(draft.fxRate, list.fx?.rate))}>
          {field(t.sub.pct, "pct_of_trade", draft.fxRate, (n) => set("fxRate", n), pctPh(list.fx?.rate), pctCheck, err("fxRate"))}
        </Group>
      )}
      <Group title={t.fields.fixed} note={aboveNote(above(draft.monthlyFee, list.fixed?.rate))}>
        {field(t.sub.nisMonth, "nis_per_month", draft.monthlyFee, (n) => set("monthlyFee", n), list.fixed ? nisPh(list.fixed.rate) : undefined, nisCheck)}
      </Group>
      <Group title={t.who}>
        <div className="field">
          <label htmlFor={`${dateId}-by`} className="field-label">
            {t.whoText}
          </label>
          <div className="field-box">
            <input id={`${dateId}-by`} type="text" dir="auto" value={draft.offeredBy} onChange={(e) => set("offeredBy", e.target.value)} className="field-input !text-start" autoComplete="off" />
          </div>
        </div>
        <div className="field">
          <label htmlFor={dateId} className="field-label">
            {t.when}
          </label>
          <div className={cx("field-box", errors.offeredOn && "field-box-error")}>
            <input id={dateId} type="date" dir="ltr" max={today} value={draft.offeredOn} onChange={(e) => set("offeredOn", e.target.value)} className="field-input !text-start" />
          </div>
          {err("offeredOn") && <span className="text-xs text-destructive">{err("offeredOn")}</span>}
        </div>
      </Group>
      <p className="text-xs text-muted-foreground">{t.binding}</p>
      {errors.empty && <p className="text-sm text-destructive">{t.empty}</p>}
      {!writable && <p className="text-xs text-caution-foreground">{t.noStorage}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="primary" onClick={save}>
          {t.buttons.save}
        </Button>
        {offer && (
          <Button
            variant="secondary"
            onClick={() => {
              onClear();
              onClose();
            }}
          >
            {t.buttons.clear}
          </Button>
        )}
        <Button variant="quiet" onClick={onClose}>
          {t.buttons.cancel}
        </Button>
      </div>
    </div>
  );
}

