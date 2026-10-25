// The inputs and tags of exposure mode (design-spec 21.3, design-system 9.1 and 9.2): the accepted-fall field, the
// entered-return field, the cash-rate line, the worst-fall field, the accepted-fall chip, the holding-wrapper
// chips, the return label, the exclusion tag and the loss note. Every figure typed here is `entered` (D7, D9);
// no field has a placeholder number.
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { r2, r4catalogue, r5, values as valuesCopy } from "../../copy";
import { fmt } from "../../lib/format";
import type { ExposureEntry } from "../../lib/compare";
import type { ExposureRowView } from "../../lib/exposure-mode";
import { useGoals } from "../../lib/goal";
import { isoToday } from "../../lib/state";
import { entered as enteredValue, type SiteValue } from "../../lib/value";
import type { ValueObject } from "@finance-tool/schema";
import { GoalNumber } from "../compare/fields";
import { IconAlert, IconClock, IconExternal, IconFile, IconInfo, IconPencil } from "../icons";
import { Num, StateTag, startsAfter, useToday } from "../provenance";
import { Button, cx, NumberField, Tag } from "../kit";
import { Tpl } from "./tpl";

const pct100 = (n: number) => (n < 0 || n > 100 ? `${r2.form.errPercentBefore}100.` : null);
/** A61: a return is bounded by P-05's percentage range, the same as the goal form's (it was −100 to 100 here and −50 to 50 there). */
export type PctRange = { min: number; max: number };
const returnCheck = (range: PctRange) => (n: number) => (n < range.min || n > range.max ? `${valuesCopy.errors.pct[0]} ${fmt.number(range.min)} ${valuesCopy.errors.pct[1]}${fmt.number(range.max)}.` : null);

// ---------------------------------------------------------------- the goal form

/** A-29, the goal's common largest accepted fall: empty, never pre-filled, entered once typed (D11, D21). */
export function AcceptedFallField() {
  const { current, setAcceptedFall } = useGoals();
  if (!current) return null;
  const v = current.assumptions.acceptedFall ?? null;
  return (
    <GoalNumber
      label={r5.form.acceptedFall}
      unit="pct"
      value={v}
      source={v === null ? "empty" : "entered"}
      onChange={setAcceptedFall}
      validate={pct100}
      hint={r5.form.hint}
      note={<span className="text-xs text-muted-foreground">{v === null ? r5.form.empty : r5.form.use}</span>}
      bare={v === null}
    />
  );
}

// ---------------------------------------------------------------- the row's inputs

const ent = (n: number, unit: ValueObject["unit"]) => enteredValue(n, unit, isoToday());

/** A small "i" that opens a line of text under it (the popover of design-system 9.1, kept inline so it works on a phone). */
function InfoToggle({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="inline-flex flex-col gap-1">
      <button type="button" aria-label={label} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="size-6 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-accent align-middle">
        <IconInfo size={16} />
      </button>
      {open && <span className="text-xs text-muted-foreground font-normal max-w-[30ch]">{children}</span>}
    </span>
  );
}

export function EnteredReturnField({ entry, value, onChange, label, fromProduct, range }: { entry: ExposureEntry; value?: ValueObject; onChange: (v: ValueObject | undefined) => void; label?: ReactNode; /** The return taken from the product comparison (decision 16), shown in the field until the person types another. */ fromProduct?: ValueObject; range: PctRange }) {
  const cur = entry.record.currency;
  const word = r5.exposure.fields.currencyOne[cur] ?? cur;
  const shown = value ?? fromProduct;
  return (
    <NumberField
      label={label ?? (cur === "ILS" ? r5.exposure.fields.returnLabelIls : <Tpl t={r5.exposure.fields.returnLabel} vars={{ currency: word }} />)}
      unit="pct_per_year"
      value={typeof shown?.value === "number" ? shown.value : null}
      isEntered={!!shown}
      validate={returnCheck(range)}
      onCommit={(n) => onChange(ent(n, "pct_per_year"))}
      onReset={() => onChange(undefined)}
      hint={shown ? undefined : r5.exposure.fields.returnHint}
      note={
        shown ? (
          <span className="flex items-center gap-1.5 text-xs text-entered">
            <IconPencil size={14} />
            <StateTag state="entered" />
            {!value && fromProduct && <span>{r5.exposure.fields.returnFromProduct}</span>}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{r5.exposure.fields.returnEmpty}</span>
        )
      }
      optional
    />
  );
}

export function CashRateLine({ row, onChange, cashLink, range }: { row: ExposureRowView; onChange: (v: ValueObject | undefined) => void; cashLink: { href: string } | null; range: PctRange }) {
  const f = r5.exposure.fields;
  const overriding = !!row.enteredReturn;
  const today = useToday();
  const [open, setOpen] = useState(false);
  const note = (
    <InfoToggle label={f.cashNote.slice(0, 20)}>{f.cashNote}</InfoToggle>
  );
  if (row.published && !overriding && !open) {
    return (
      <div className="flex flex-col gap-1.5 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Num value={row.published.rate} />
          <Tag tone="neutral" icon={<IconFile size={14} />}>
            {f.institution}
          </Tag>
          {row.published.stale && <IconClock size={16} className="text-caution" />}
          {note}
        </div>
        <span className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
          <Tpl t={f.cashPublished} vars={{ date: <bdi dir="ltr">{row.published.effectiveFrom ? fmt.date(row.published.effectiveFrom) : ""}</bdi> }} />
          {row.published.effectiveFrom && startsAfter(row.published.rate, today) && (
            <Tag tone="caution" icon={<IconAlert size={14} />}>
              {r4catalogue.asOfAfterRead}
            </Tag>
          )}
        </span>
        <Button variant="quiet" className="self-start -ms-2 text-sm min-h-9" onClick={() => setOpen(true)}>
          {f.cashOverride}
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {!row.published && row.noSeries && (
        <p className="text-sm text-muted-foreground flex flex-col gap-1">
          <span>{f.noSeries}</span>
          {cashLink && (
            <a href={cashLink.href} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1 hover:underline">
              {f.noSeriesLink}
              <IconExternal size={16} />
            </a>
          )}
        </p>
      )}
      <EnteredReturnField entry={row.entry} value={row.enteredReturn} range={range} onChange={(v) => (setOpen(!!v || (open && !v)), onChange(v))} label={row.published ? f.cashLabel : undefined} />
      {row.published && (
        <Button
          variant="quiet"
          className="self-start -ms-2 text-sm min-h-9"
          onClick={() => {
            onChange(undefined);
            setOpen(false);
          }}
        >
          {f.cashReset}
        </Button>
      )}
    </div>
  );
}

export function WorstFallField({ entry, value, onChange }: { entry: ExposureEntry; value?: ValueObject; onChange: (v: ValueObject | undefined) => void }) {
  const f = r5.exposure.fields;
  return (
    <NumberField
      label={
        <span className="inline-flex items-start gap-1 flex-wrap">
          <Tpl t={f.worstLabel} vars={{ exposure: <bdi>{entry.name}</bdi> }} />
          <InfoToggle label={f.worstInfo}>
            {f.worstHint}{" "}
            <Link to={entry.guideHref} className="text-link hover:underline">
              <Tpl t={f.worstLink} vars={{ exposure: <bdi>{entry.name}</bdi> }} />
            </Link>
          </InfoToggle>
        </span>
      }
      unit="pct"
      value={typeof value?.value === "number" ? value.value : null}
      isEntered={!!value}
      validate={pct100}
      onCommit={(n) => onChange(ent(n, "pct"))}
      onReset={() => onChange(undefined)}
      note={
        value ? (
          <span className="flex items-center gap-1.5 text-xs text-entered">
            <IconPencil size={14} />
            <StateTag state="entered" />
          </span>
        ) : undefined
      }
      optional
    />
  );
}

export function AcceptedFallChip({ row, onChange }: { row: ExposureRowView; onChange: (v: ValueObject | undefined) => void }) {
  const f = r5.exposure.fields;
  const [open, setOpen] = useState(false);
  const v = row.acceptedFall.value;
  return (
    <div className="flex flex-col gap-1.5 items-start">
      {v ? (
        <Tag tone="entered" icon={<IconPencil size={14} />} className="!whitespace-normal">
          <Tpl t={f.acceptedChip} vars={{ accepted: <bdi dir="ltr">{fmt.pct(v.value as number)}</bdi> }} />
        </Tag>
      ) : (
        <Link to="/goal" className="inline-flex">
          <Tag tone="caution" icon={<IconAlert size={14} />} className="!whitespace-normal">
            {f.acceptedNotSet}
          </Tag>
        </Link>
      )}
      {(open || row.acceptedFall.perExposure) && (
        <NumberField
          label={f.acceptedSeparate}
          unit="pct"
          value={row.acceptedFall.perExposure && typeof v?.value === "number" ? v.value : null}
          isEntered={row.acceptedFall.perExposure}
          validate={pct100}
          onCommit={(n) => onChange(ent(n, "pct"))}
          onReset={() => onChange(undefined)}
          optional
          compact
        />
      )}
      {row.acceptedFall.perExposure ? (
        <Button
          variant="quiet"
          className="-ms-2 text-sm min-h-9"
          onClick={() => {
            onChange(undefined);
            setOpen(false);
          }}
        >
          {f.acceptedCommon}
        </Button>
      ) : (
        !open && (
          <Button variant="quiet" className="-ms-2 text-sm min-h-9" onClick={() => setOpen(true)}>
            {f.acceptedSeparate}
          </Button>
        )
      )}
    </div>
  );
}

export function HoldingWrapperChips({ row, onChange }: { row: ExposureRowView; onChange: (id: string | undefined) => void }) {
  const f = r5.exposure.fields;
  const [open, setOpen] = useState(false);
  const h = row.holding;
  return (
    <div className="flex flex-col gap-1.5 text-sm items-start">
      <span className="flex items-center gap-1.5 flex-wrap">
        {h.name ? <Tpl t={f.holdingLine} vars={{ wrapper: <Link to={`/guide/${h.wrapperId}`} className="text-link hover:underline"><bdi>{h.name}</bdi></Link> }} /> : null}
        {h.fromParameter && h.parameter ? (
          <span className="inline-flex items-center gap-1">
            <StateTag state="parameter" />
            <InfoToggle label={f.holdingParameter.slice(0, 20)}>{f.holdingParameter}</InfoToggle>
          </span>
        ) : (
          <StateTag state="entered" />
        )}
      </span>
      <Button variant="quiet" className="-ms-2 text-sm min-h-9" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {f.holdingChange}
      </Button>
      {open && (
        <div role="radiogroup" aria-label={f.holdingAria} className="flex flex-wrap gap-2">
          {h.options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={h.wrapperId === o.id}
              onClick={() => {
                onChange(o.id);
                setOpen(false);
              }}
              className={cx("sec-chip border border-border", h.wrapperId === o.id ? "sec-chip-on" : "bg-card hover:bg-accent")}
            >
              {o.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- tags

/** Every ranked or listed row carries the basis of its return next to the figure (design-system 9.2, roadmap R5 risk). */
export function ReturnLabel({ row }: { row: ExposureRowView }) {
  const r = row.grossReturn;
  if (!r) return null;
  const L = r5.exposure.returnLabels;
  const rate = <Num value={r as SiteValue} size="cell" />;
  if (r.state === "entered") {
    const overriddenCash = !!row.published && !!row.enteredReturn;
    return (
      <Tag tone="entered" icon={<IconPencil size={14} />} className="!whitespace-normal">
        <Tpl t={overriddenCash ? L.cashEntered : L.entered} vars={{ rate }} />
      </Tag>
    );
  }
  return (
    <Tag tone="neutral" icon={<IconFile size={14} />} className="!whitespace-normal">
      <Tpl t={L.sourced} vars={{ rate }} />
    </Tag>
  );
}

export function ExclusionTag({ worst, accepted }: { worst: number; accepted: number }) {
  return (
    <Tag tone="entered" icon={<IconPencil size={14} />} className="!whitespace-normal">
      <Tpl t={r5.exposure.notes.excludedTag} vars={{ worst: <bdi dir="ltr">{fmt.pct(worst)}</bdi>, accepted: <bdi dir="ltr">{fmt.pct(accepted)}</bdi> }} />
    </Tag>
  );
}

export function LossNote({ missing, href }: { missing: "worst-fall" | "largest-fall-accepted"; href?: string }) {
  const text = missing === "worst-fall" ? r5.exposure.notes.lossWorst : r5.exposure.notes.lossAccepted;
  return (
    <p className="text-sm text-caution-foreground flex items-start gap-2">
      <IconAlert size={16} className="text-caution shrink-0 mt-1" />
      <span>
        {href ? (
          <Link to={href} className="hover:underline">
            {text}
          </Link>
        ) : (
          text
        )}
      </span>
    </p>
  );
}
