// Fields the add-holding sheet needs beyond release 1's number field: a date in the same box (design-spec 11.3 `DateField`)
// and a native select in the same box. Both left to right inside, as every field.
import { useId, type ReactNode } from "react";
import { r3holdings as copy } from "../../copy";
import { fmt } from "../../lib/format";
import { transferBars, type TransferBar } from "../../lib/state";
import { RuleRef } from "../provenance";
import { cx, Disclosure } from "../kit";

/** A native date picker in the field box; the text form of the value is `22.10.2026` (design-spec 1.5). */
export function DateField({ label, value, onChange, max, hint, error }: { label: ReactNode; value: string; onChange: (v: string) => void; max?: string; hint?: ReactNode; error?: ReactNode | null }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="field-body">
        <div className={cx("field-box", error ? "field-box-error" : false)}>
          <input id={id} type="date" dir="ltr" max={max} value={value} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} onChange={(e) => onChange(e.target.value)} className="field-input !text-end" />
          {/^\d{4}-\d{2}-\d{2}$/.test(value) && (
            <bdi dir="ltr" className="field-unit">
              {fmt.date(value)}
            </bdi>
          )}
        </div>
        {error ? (
          <span id={`${id}-err`} className="text-xs text-destructive">
            {error}
          </span>
        ) : hint ? (
          <span className="text-xs text-muted-foreground">{hint}</span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Reports what is typed in the number fields inside it, as typed (a field commits only valid values, after a pause, so the
 * form itself cannot see "abc" or "150%" that the field refuses). `display: contents` keeps the layout of the children.
 */
export function RawWatch({ onRaw, children }: { onRaw: (text: string) => void; children: ReactNode }) {
  return (
    <div className="contents" onInput={(e) => onRaw((e.target as HTMLInputElement).value ?? "")}>
      {children}
    </div>
  );
}

export function SelectField<T extends string>({ label, value, onChange, options, placeholder, error }: { label: ReactNode; value: T | null; onChange: (v: T) => void; options: { value: T; label: string }[]; placeholder: string; error?: ReactNode | null }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="field-body">
        <div className={cx("field-box", error ? "field-box-error" : false)}>
          <select id={id} value={value ?? ""} aria-invalid={error ? true : undefined} onChange={(e) => e.target.value && onChange(e.target.value as T)} className="field-input !text-start">
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}

/** A text field in the same box (the company filter, the typed name). */
export function TextField({ label, value, onChange, placeholder, dir = "auto", icon, error, onKeyDown, describedBy }: { label: ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; dir?: "auto" | "ltr" | "rtl"; icon?: ReactNode; error?: ReactNode | null; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; describedBy?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="field-body">
        <div className={cx("field-box", error ? "field-box-error" : false)}>
          {icon}
          <input id={id} type="text" dir={dir} value={value} placeholder={placeholder} aria-invalid={error ? true : undefined} aria-describedby={describedBy} onKeyDown={onKeyDown} onChange={(e) => onChange(e.target.value)} className="field-input !text-start" />
        </div>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    </div>
  );
}

/** The words of PF-17's text that name each bar; a checkbox is offered only for a case the rule's text names. */
const barWords: Record<TransferBar, string> = {
  loan: "הלוואה",
  attachment: "עיקול",
  annuityStarted: "קצבה שהתחילה",
  receivingFundClosed: "סגורה",
  disabilityAnnuityClaimed: "נכות",
  memberDied: "נפטר",
  appliedToComprehensivePension: "מקיפה",
};

/** "מצבים שחוסמים העברה": optional checkboxes, one for each case PF-17 names (reg. 4); nothing is assumed when none is ticked. */
export function BarsDisclosure({ bars, onChange, text }: { bars: Partial<Record<TransferBar, boolean>>; onChange: (b: Partial<Record<TransferBar, boolean>>) => void; text: string }) {
  const shown = transferBars.filter((b) => text.includes(barWords[b]));
  if (shown.length === 0) return null;
  return (
    <Disclosure label={<span className="text-sm text-link">{copy.bars.label}</span>} summaryClassName="min-h-9">
      <div className="flex flex-col gap-1 pb-2">
        <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1.5">
          {copy.bars.lead} <RuleRef id="PF-17" />
        </p>
        {shown.map((b) => (
          <label key={b} className="flex items-center gap-3 min-h-target text-sm cursor-pointer">
            <input type="checkbox" checked={!!bars[b]} onChange={(e) => onChange({ ...bars, [b]: e.target.checked })} className="size-5 accent-[var(--primary)]" />
            {copy.barLabels[b]}
          </label>
        ))}
      </div>
    </Disclosure>
  );
}
