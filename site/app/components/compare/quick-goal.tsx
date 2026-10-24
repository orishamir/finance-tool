// The home page's question card (docs/design-spec.md section 1a, flows 6.1): the sum, the years and what it is for,
// in everyday words, turned into the saved goal; one button opens the comparison. Everything typed is the person's (D7).
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router";
import { home as copy, r2, values as valuesCopy } from "../../copy";
import { fmt, parseNumber } from "../../lib/format";
import { useGoals } from "../../lib/goal";
import { purposeIds, quickGoalPlan, type PurposeId, type QuickInput, type QuickMessages, type QuickPlan } from "../../lib/quick-goal";
import { RawWatch } from "../holdings/fields";
import { flushPendingFields, NumberField } from "../timeline/fields";
import { Button, Card, cx } from "../ui";
import { ChoiceChips } from "./fields";
import type { Range } from "./goal-form";

export interface QuickGoalCardProps {
  bounds: { horizon: Range; monthly: Range };
  /** "new" adds a second goal (the saved-goal disclosure); "current" fills the current one (first visit). */
  mode: "current" | "new";
  className?: string;
}

const iso = (n: number) => `⁦${fmt.number(n)}⁩`;
const raw = (t: string): number | null => (t.trim() === "" ? null : parseNumber(t));

export function QuickGoalCard({ bounds, mode, className }: QuickGoalCardProps) {
  const { status, update, add } = useGoals();
  const navigate = useNavigate();
  const form = useRef<HTMLFormElement>(null);
  const [text, setText] = useState({ amountNow: "", monthly: "", years: "" });
  const [committed, setCommitted] = useState<{ amountNow: number | null; monthly: number | null; years: number | null }>({ amountNow: null, monthly: null, years: null });
  const [unknownYears, setUnknownYears] = useState(false);
  const [yearsKey, setYearsKey] = useState(0);
  const [purpose, setPurpose] = useState<PurposeId | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const loading = status === "loading";
  const cushion = purpose === "cushion";

  const msgs: QuickMessages = {
    needAmount: copy.quick.needAmount,
    nan: valuesCopy.errors.nan,
    years: r2.form.errYears,
    yearsWhole: r2.form.errYearsWhole,
    yearsRange: `${valuesCopy.errors.years[0]} ${iso(bounds.horizon.min)} ${valuesCopy.errors.years[1]}${iso(bounds.horizon.max)}.`,
    names: copy.quick.purposes as Record<PurposeId, string>,
  };
  // the typed text is the truth; a value typed before the page woke up reaches only the field's own commit
  const pick = (k: "amountNow" | "monthly" | "years") => (text[k].trim() !== "" ? raw(text[k]) : committed[k]);
  const input = (): QuickInput => ({ amountNow: pick("amountNow"), monthly: pick("monthly"), years: pick("years"), unknownYears, purpose });
  const plan = (): QuickPlan => quickGoalPlan(input(), bounds, msgs);

  const nonNegative = (n: number) => (n < 0 ? valuesCopy.errors.negative : null);
  const yearsCheck = (n: number) => (n < 1 ? msgs.years : !Number.isInteger(n) ? msgs.yearsWhole : n > bounds.horizon.max ? msgs.yearsRange : null);

  /** Writes the goal to the device before the page changes (the next page reads the store as it mounts). */
  const apply = (p: Extract<QuickPlan, { kind: "compare" }>) => {
    flushPendingFields();
    flushSync(() => {
      if (mode === "new") add();
      update(p.patch);
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const p = plan();
    if (p.kind === "invalid") {
      setMessage(p.message);
      form.current?.querySelector<HTMLInputElement>(`[data-quick="${p.field}"] input`)?.focus();
      return;
    }
    setMessage(null);
    if (p.kind === "idle") {
      navigate(p.to);
      return;
    }
    apply(p);
    navigate(p.to);
  };

  const onAllFields = () => {
    if (loading) return;
    const p = plan();
    if (p.kind === "compare") apply(p);
  };

  const chooseYears = (t: string) => {
    setText((x) => ({ ...x, years: t }));
    if (t.trim() !== "" && unknownYears) setUnknownYears(false);
  };

  return (
    <Card className={cx("flex flex-col gap-4 md:gap-5", loading && "opacity-40 cursor-wait", className)}>
      <h2 className="text-xl font-semibold">{copy.quick.heading}</h2>
      <form ref={form} noValidate onSubmit={onSubmit} className="flex flex-col gap-4 md:gap-5">
        {/* a field row (app.css): the three boxes line up even where the years label wraps (2026-10-24 night, the founder's screenshot);
            the wrappers are `contents` so each field is the row's own item, and the years slot is a cell with the chip beside the box on a
            phone and under it from `md` */}
        <div className="field-row grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          <div data-quick="amount" className="contents">
            <RawWatch onRaw={(t) => setText((x) => ({ ...x, amountNow: t }))}>
              <NumberField label={copy.quick.amountNow} unit="nis" value={committed.amountNow} isEntered={committed.amountNow !== null} validate={nonNegative} onCommit={(n) => setCommitted((c) => ({ ...c, amountNow: n }))} onReset={() => setCommitted((c) => ({ ...c, amountNow: null }))} optional inputMode="decimal" />
            </RawWatch>
          </div>
          <div data-quick="monthly" className="contents" hidden={cushion}>
            <RawWatch onRaw={(t) => setText((x) => ({ ...x, monthly: t }))}>
              <NumberField label={copy.quick.monthly} unit="nis_per_month" value={committed.monthly} isEntered={committed.monthly !== null} validate={nonNegative} onCommit={(n) => setCommitted((c) => ({ ...c, monthly: n }))} onReset={() => setCommitted((c) => ({ ...c, monthly: null }))} optional inputMode="decimal" />
            </RawWatch>
          </div>
          <div className={cx("field-cell col-span-2 md:col-span-1 md:row-span-3 gap-x-3 [&_.field]:transition-opacity", unknownYears && "[&_.field]:opacity-40")} data-quick="years" hidden={cushion}>
            <RawWatch onRaw={chooseYears}>
              <NumberField key={yearsKey} label={copy.quick.years} unit="years" value={committed.years} isEntered={committed.years !== null} validate={yearsCheck} onCommit={(n) => setCommitted((c) => ({ ...c, years: n }))} onReset={() => setCommitted((c) => ({ ...c, years: null }))} optional inputMode="numeric" />
            </RawWatch>
            <button
              type="button"
              aria-pressed={unknownYears}
              onClick={() => {
                const next = !unknownYears;
                setUnknownYears(next);
                if (next) {
                  setText((x) => ({ ...x, years: "" }));
                  setCommitted((c) => ({ ...c, years: null }));
                  setYearsKey((k) => k + 1);
                }
              }}
              className={cx("sec-chip border border-border self-end md:row-start-3 md:col-start-1 md:self-start md:justify-self-start md:mt-0.5 transition-colors duration-[var(--duration-fast)]", unknownYears ? "sec-chip-on" : "bg-card hover:bg-accent")}
            >
              {copy.quick.unknownYears}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="field-label">{copy.quick.purposeLabel}</span>
          <ChoiceChips ids={purposeIds} labels={copy.quick.purposes} value={purpose} onChange={(id) => setPurpose((p) => (p === id ? null : id))} ariaLabel={copy.quick.purposeLabel} bleed="-mx-4 px-4" />
          <div className="-mx-4 px-4 md:mx-0 md:px-0 flex items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible pb-1 scrollbar-none">
            <span className="text-sm text-muted-foreground shrink-0">{copy.quick.already}</span>
            <Link to="/idle-cash" className="sec-chip !min-h-8 !px-3 border border-border bg-card hover:bg-accent shrink-0">
              {copy.quick.alreadyDeposit}
            </Link>
            <Link to="/holdings" className="sec-chip !min-h-8 !px-3 border border-border bg-card hover:bg-accent shrink-0">
              {copy.quick.alreadyStudyFund}
            </Link>
            <button type="button" onClick={() => setPurpose("none")} className={cx("sec-chip !min-h-8 !px-3 border border-border shrink-0", purpose === "none" ? "sec-chip-on" : "bg-card hover:bg-accent")}>
              {copy.quick.alreadyLarge}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <Button variant="primary" type="submit" disabled={loading} className="w-full md:w-auto md:min-w-48">
            {cushion ? copy.quick.submitCushion : copy.quick.submit}
          </Button>
          <Link to="/goal" onClick={onAllFields} className="text-link text-sm min-h-target inline-flex items-center hover:underline self-start md:self-auto">
            {copy.quick.allFields}
          </Link>
        </div>
        <p role="status" className={cx("text-sm text-destructive", !message && "hidden")}>
          {message}
        </p>
        <p className="text-xs text-muted-foreground">{copy.quick.line}</p>
      </form>
    </Card>
  );
}
