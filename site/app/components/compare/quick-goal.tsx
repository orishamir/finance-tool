// The home page's question card (docs/design-spec.md section 1a, flows 6.1): what it is for, the sum and the years, in
// everyday words, turned into the saved goal; one button opens the comparison. Everything typed is the person's (D7).
// The purpose comes first and sets the questions under it (2026-10-25, the founder: the chips sat under the fields, only
// "כרית ביטחון" changed anything, and it removed a field above the chip, so the page moved under the pointer).
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useNavigate } from "react-router";
import { home as copy, r2, values as valuesCopy } from "../../copy";
import { fmt, parseNumber } from "../../lib/format";
import { childAgeFrom, useGoals, type Presets } from "../../lib/goal";
import { asPresetParam, type PresetMeta } from "../../lib/goal-values";
import { presetFor, purposeIds, quickFields, quickGoalPlan, type PurposeId, type QuickInput, type QuickMessages, type QuickPlan } from "../../lib/quick-goal";
import { Tpl } from "../exposure-mode/tpl";
import { RawWatch } from "../holdings/fields";
import { Num } from "../provenance";
import { Button, Card, ChipList, ChoiceChips, cx, flushPendingFields, NumberField } from "../kit";
import type { Range } from "./goal-form";

export interface QuickGoalCardProps {
  bounds: { horizon: Range; monthly: Range };
  /** P-07, for the years a purpose assumes (shown as a site parameter). */
  presets: Presets;
  meta: PresetMeta;
  today: string;
  /** "new" adds a second goal (the saved-goal disclosure); "current" fills the current one (first visit). */
  mode: "current" | "new";
  className?: string;
}

type Typed = "amountNow" | "monthly" | "years" | "childAge" | "targetCost";

const iso = (n: number) => `⁦${fmt.number(n)}⁩`;
const raw = (t: string): number | null => (t.trim() === "" ? null : parseNumber(t));

export function QuickGoalCard({ bounds, presets, meta, today, mode, className }: QuickGoalCardProps) {
  const { status, update, add } = useGoals();
  const navigate = useNavigate();
  const form = useRef<HTMLFormElement>(null);
  const [text, setText] = useState<Record<Typed, string>>({ amountNow: "", monthly: "", years: "", childAge: "", targetCost: "" });
  const [committed, setCommitted] = useState<Record<Typed, number | null>>({ amountNow: null, monthly: null, years: null, childAge: null, targetCost: null });
  const [unknownYears, setUnknownYears] = useState(false);
  const [yearsKey, setYearsKey] = useState(0);
  const [purpose, setPurpose] = useState<PurposeId | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const loading = status === "loading";
  const ask = quickFields(purpose);

  const msgs: QuickMessages = {
    needAmount: copy.quick.needAmount,
    nan: valuesCopy.errors.nan,
    years: r2.form.errYears,
    yearsWhole: r2.form.errYearsWhole,
    yearsRange: `${valuesCopy.errors.years[0]} ${iso(bounds.horizon.min)} ${valuesCopy.errors.years[1]}${iso(bounds.horizon.max)}.`,
    childAge: r2.form.errChildAge,
    negative: valuesCopy.errors.negative,
    names: copy.quick.purposes as Record<PurposeId, string>,
  };
  // the typed text is the truth; a value typed before the page woke up reaches only the field's own commit
  const pick = (k: Typed) => (text[k].trim() !== "" ? raw(text[k]) : committed[k]);
  const input = (): QuickInput => ({ amountNow: pick("amountNow"), monthly: pick("monthly"), years: pick("years"), unknownYears, purpose, childAge: pick("childAge"), targetCost: pick("targetCost") });
  const plan = (): QuickPlan => quickGoalPlan(input(), { horizon: bounds.horizon, today }, msgs);
  const watch = (k: Typed) => (t: string) => setText((x) => ({ ...x, [k]: t }));
  const commit = (k: Typed) => (n: number) => setCommitted((c) => ({ ...c, [k]: n }));
  const clear = (k: Typed) => () => setCommitted((c) => ({ ...c, [k]: null }));

  const nonNegative = (n: number) => (n < 0 ? valuesCopy.errors.negative : null);
  const yearsCheck = (n: number) => (n < 1 ? msgs.years : !Number.isInteger(n) ? msgs.yearsWhole : n > bounds.horizon.max ? msgs.yearsRange : null);
  const ageCheck = (n: number) => (childAgeFrom(n, Number(today.slice(0, 4))) === null ? msgs.childAge : null);

  // The years the comparison will assume, said where the reader chose: with the years empty once a purpose is chosen, or with
  // "לא יודעים", or for a child (to 18 from the age). So every purpose shows what it does (the founder, 2026-10-25).
  const preset = presetFor(purpose, { monthly: pick("monthly") });
  const presetYears = presets[preset]?.horizon_years;
  const noYears = unknownYears || (purpose !== null && pick("years") === null);
  const assumed =
    presetYears && typeof presetYears.value === "number" && ((ask.years && noYears) || ask.childAge) ? (
      <p className="text-sm text-muted-foreground" data-quick-assumed>
        <Tpl t={ask.childAge ? copy.quick.childNote : copy.quick.unknownNote} vars={{ n: <Num value={asPresetParam(presetYears, meta)} display={fmt.number(presetYears.value)} />, preset: r2.presets[preset] ?? "" }} />
      </p>
    ) : null;

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
        {/* first, so a chip that changes the fields only changes what is under it */}
        <div className="flex flex-col gap-2">
          <span className="field-label">{copy.quick.purposeLabel}</span>
          {/* wraps on a phone too: the first question shows all its answers (two of seven scrolled out of sight before) */}
          <ChoiceChips ids={purposeIds} labels={copy.quick.purposes} value={purpose} onChange={(id) => setPurpose((p) => (p === id ? null : id))} ariaLabel={copy.quick.purposeLabel} wrap />
          {/* the kit's link pills, wrapping like the purposes above: as a sideways row of 32 px pills the second was cut at the
              card's edge on a phone (2026-10-26) */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
            <span className="text-sm text-muted-foreground shrink-0" aria-hidden="true">
              {copy.quick.already}
            </span>
            <ChipList
              heading={copy.quick.already}
              headingHidden
              items={[
                { id: "deposit", label: copy.quick.alreadyDeposit, href: "/idle-cash" },
                { id: "study-fund", label: copy.quick.alreadyStudyFund, href: "/holdings" },
              ]}
              value={null}
            />
          </div>
        </div>
        {/* a field row (app.css): the boxes line up even where a label wraps (2026-10-24 night, the founder's screenshot); the
            wrappers are `contents` so each field is the row's own item, and the years slot is a cell with the chip beside the box
            on a phone and under it from `md`. A field the purpose does not ask is hidden, not unmounted, so its text survives a
            change of mind. */}
        <div className="field-row grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          <div data-quick="amount" className="contents">
            <RawWatch onRaw={watch("amountNow")}>
              <NumberField label={copy.quick.amountNow} unit="nis" value={committed.amountNow} isEntered={committed.amountNow !== null} validate={nonNegative} onCommit={commit("amountNow")} onReset={clear("amountNow")} optional inputMode="decimal" />
            </RawWatch>
          </div>
          <div data-quick="monthly" className="contents" hidden={!ask.monthly}>
            <RawWatch onRaw={watch("monthly")}>
              <NumberField label={copy.quick.monthly} unit="nis_per_month" value={committed.monthly} isEntered={committed.monthly !== null} validate={nonNegative} onCommit={commit("monthly")} onReset={clear("monthly")} optional inputMode="decimal" />
            </RawWatch>
          </div>
          <div className={cx("field-cell col-span-2 md:col-span-1 md:row-span-3 gap-x-3 [&_.field]:transition-opacity", unknownYears && "[&_.field]:opacity-40")} data-quick="years" hidden={!ask.years}>
            <RawWatch onRaw={chooseYears}>
              <NumberField key={yearsKey} label={copy.quick.years} unit="years" value={committed.years} isEntered={committed.years !== null} validate={yearsCheck} onCommit={commit("years")} onReset={clear("years")} optional inputMode="numeric" />
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
          <div data-quick="childAge" className="contents" hidden={!ask.childAge}>
            <RawWatch onRaw={watch("childAge")}>
              <NumberField label={r2.form.childAge} unit="years" value={committed.childAge} isEntered={committed.childAge !== null} validate={ageCheck} onCommit={commit("childAge")} onReset={clear("childAge")} optional inputMode="numeric" />
            </RawWatch>
          </div>
          <div data-quick="cost" className="contents" hidden={!ask.targetCost}>
            <RawWatch onRaw={watch("targetCost")}>
              <NumberField label={copy.quick.costLabel[purpose ?? ""] ?? r2.form.targetCost} unit="nis" value={committed.targetCost} isEntered={committed.targetCost !== null} validate={nonNegative} onCommit={commit("targetCost")} onReset={clear("targetCost")} hint={copy.quick.costHint} optional inputMode="decimal" />
            </RawWatch>
          </div>
        </div>
        {assumed}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
          <Button variant="primary" type="submit" disabled={loading} className="w-full md:w-auto md:min-w-48">
            {purpose === "cushion" ? copy.quick.submitCushion : copy.quick.submit}
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
