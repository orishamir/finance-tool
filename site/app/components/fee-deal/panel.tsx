// The column "העמלה שבחרתם" (method §10.6, `panel`): every field of the chosen fee by its shape, its prices over time (a stage added or
// taken away), a sale priced apart where the shape allows it, and for a fee with a cap the block "מול החוק", the fee's row of the reading's
// law card: the bar, each price's standing and the cap's line with its rules.
import type { ReactNode } from "react";
import { feeDeal as copy, guideBlocks } from "../../copy";
import type { Panel, PanelStage } from "../../lib/fee-deal/builder";
import type { CapLine } from "../../lib/fee-deal/kinds";
import { addStage, editPrice, removeStage, setFeeName, setSaleApart, setUntil, withCurrency, withForm, withMonths, type Side } from "../../lib/fee-deal/edit";
import { BOUND_CURRENCIES, MONTHS, NAME_MAX, type BoundCurrency, type Fee, type MonthKey, type Months } from "../../lib/fee-deal/model";
import { refOf } from "../../lib/fee-deal/parts";
import type { LawRow } from "../../lib/fee-deal/reading";
import type { FieldId, FormId } from "../../lib/fee-deal/shapes";
import { Button, ChoiceChips, GroupHead, KeyValueList, MonthField, Section, SegmentedControl, TextField, InlineSelect, Tag, type KeyValueItem } from "../kit";
import { PriceFigure } from "./figures";
import { CapRules, FeeName, LawBlock, perActionWord, refName } from "./words";

const p = copy.panel;

const monthOptions = (words: Record<number, string>) => MONTHS.map((m) => ({ id: String(m), name: words[m]! }));

/** Whether a fee's prices on a side wait for a month: one but the last has no end, or the ends do not rise. */
function orderNote(stages: readonly PanelStage[]): string | null {
  if (stages.slice(0, -1).some((s) => !s.until)) return p.untilMissing;
  for (let k = 1; k < stages.length - 1; k++) if (stages[k]!.until! <= stages[k - 1]!.until!) return p.outOfOrder;
  return null;
}

/** One price's fields, by its form: a row of the panel's list for each. */
function stageItems(fee: Fee, side: Side, k: number, s: PanelStage, onFee: (f: Fee) => void): KeyValueItem[] {
  const name = refName(refOf(fee));
  const label = (field: string) => copy.builder.fieldName(name, field);
  const price = (fee.sale && side === "sell" ? fee.sale : fee.stages)[k]!.price;
  const edit = (fn: Parameters<typeof editPrice>[3]) => onFee(editPrice(fee, side, k, fn));
  const figure = (f: "rate" | "min" | "max" | "amount", words?: ReactNode, optional?: boolean) => <PriceFigure fee={fee} side={side} k={k} view={s.price} figure={f} label={label(f === "min" ? p.min : f === "max" ? p.max : p.howMuch)} words={words} optional={optional} onFee={onFee} />;
  const has = (f: FieldId) => s.fields.includes(f);
  const items: KeyValueItem[] = [];
  if (has("rate"))
    items.push({
      id: "rate",
      label: p.howMuch,
      value: (
        <span className="flex flex-wrap items-center gap-2">
          {figure("rate", price.form === "action" ? perActionWord(fee.kind) : undefined)}
          {price.form === "held" && <InlineSelect label={label(p.per)} labelHidden options={monthOptions(p.perOptions)} value={String(price.per)} onChange={(v) => v && edit((x) => withMonths(x, "per", Number(v) as Months))} />}
        </span>
      ),
    });
  if (has("amount")) items.push({ id: "amount", label: p.howMuch, value: figure("amount", price.form === "perAction" ? perActionWord(fee.kind) : undefined) });
  if (has("every") && price.form === "held")
    items.push({ id: "every", label: p.every, value: <InlineSelect label={label(p.every)} labelHidden options={monthOptions(p.everyOptions)} value={String(price.every)} onChange={(v) => v && edit((x) => withMonths(x, "every", Number(v) as Months))} /> });
  if (has("every") && price.form === "sum")
    items.push({ id: "every", label: p.sumEvery, value: <InlineSelect label={label(p.sumEvery)} labelHidden options={monthOptions(p.sumEveryOptions)} value={String(price.every)} onChange={(v) => v && edit((x) => withMonths(x, "every", Number(v) as Months))} /> });
  const boundWords = [price.form === "held" ? p.perCharge : perActionWord(fee.kind), p.optional].join(" · ");
  if (has("min")) items.push({ id: "min", label: p.min, value: figure("min", boundWords, true) });
  if (has("max")) items.push({ id: "max", label: p.max, value: figure("max", boundWords, true) });
  if (has("currency") && price.form === "action")
    items.push({
      id: "currency",
      label: p.currency,
      value: <InlineSelect label={label(p.currency)} labelHidden options={BOUND_CURRENCIES.map((c) => ({ id: c, name: p.currencies[c]! }))} value={price.currency ?? "ILS"} onChange={(v) => v && edit((x) => withCurrency(x, v as BoundCurrency))} />,
    });
  return items;
}

/** A fee's prices on one side, stage after stage: each with its form, its fields and the month it ends; a stage added or taken away. */
function Stages({ fee, side, stages, forms, onFee }: { fee: Fee; side: Side; stages: readonly PanelStage[]; forms: readonly FormId[]; onFee: (f: Fee) => void }) {
  const name = refName(refOf(fee));
  const note = orderNote(stages);
  const typed = side === "sell" && fee.sale ? fee.sale : fee.stages;
  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-3">
        {stages.map((s, k) => {
          const last = k === stages.length - 1;
          return (
            <li key={k} className="flex flex-col gap-3 rounded-md bg-muted/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{k === 0 ? p.stage.first : p.stage.next}</span>
                {stages.length > 1 && (
                  <Button variant="destructive" size="sm" onClick={() => onFee(removeStage(fee, side, k))}>
                    {p.removeStage}
                  </Button>
                )}
              </div>
              {forms.length > 1 && (
                <ChoiceChips
                  wrap
                  bleed=""
                  ids={forms}
                  labels={p.forms}
                  value={typed[k]!.price.form}
                  ariaLabel={copy.builder.fieldName(name, p.form)}
                  onChange={(form) => onFee(editPrice(fee, side, k, (x) => withForm(x, form)))}
                />
              )}
              <KeyValueList plain items={stageItems(fee, side, k, s, onFee)} />
              {stages.length > 1 &&
                (last ? (
                  <p className="text-sm text-muted-foreground">{p.noEnd}</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{p.until}</span>
                    <MonthField value={s.until ?? null} label={copy.builder.fieldName(name, p.until)} onCommit={(m) => onFee(setUntil(fee, side, k, m))} onClear={() => onFee(setUntil(fee, side, k, null))} />
                  </div>
                ))}
            </li>
          );
        })}
      </ol>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
      <Button variant="quiet" flush className="self-start" onClick={() => onFee(addStage(fee, side))}>
        + {stages.length === 1 ? p.addLater : p.addStage}
      </Button>
    </div>
  );
}

/**
 * "מול החוק": the fee's row of the reading's law card (`law`), so the panel and the card say the same: the tag and the bar of its standing
 * from the reading's month on, each price from then with its standing, and the cap's line with its rules. A fee the reading leaves out
 * (its prices are not in order yet) has no row, and shows the cap's line alone. A cap with a caveat judges no price (F-113): no tag, no
 * bar, and its line says the caveat after the figure.
 */
function Law({ cap, law, saved, first }: { cap: CapLine; law: LawRow | null; saved: boolean; first: MonthKey }) {
  if (cap.state === "absent") return null;
  if (cap.state === "none")
    return (
      <Section title={p.law} level="card" heading="h3" className="gap-2 border-t border-border pt-4">
        <CapRules cap={cap} />
      </Section>
    );
  return (
    <Section title={p.law} level="card" heading="h3" className="gap-3 border-t border-border pt-4">
      {law ? <LawBlock row={law} saved={saved} first={first} /> : <CapRules cap={cap} />}
    </Section>
  );
}

/**
 * The column. `law`: the chosen fee's row of the reading's law card, where it has one; `first`: the reading's first month; `saved`: the
 * deal's product saves, so a share of what is held reads "what has built up".
 */
export function PanelColumn({ panel, fee, law, first, saved, onFee, onRemove }: {
  panel: Panel | null;
  fee: Fee | null;
  law: LawRow | null;
  first: MonthKey;
  saved: boolean;
  onFee: (f: Fee) => void;
  onRemove: (feeId: string) => void;
}) {
  if (!panel || !fee)
    return (
      <Section title={p.title} level="kick" heading="h2">
        <p className="text-sm text-muted-foreground">{p.none}</p>
      </Section>
    );
  const base = panel.shape.base ? (guideBlocks.fees[panel.shape.base] as { base?: string } | undefined)?.base : undefined;
  const forms: FormId[] = ["free", ...panel.shape.forms];
  return (
    <Section title={p.title} level="kick" heading="h2">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">
          <FeeName fee={panel} />
        </h3>
        {fee.kind === "own" && <TextField label={p.ownName} value={fee.name ?? ""} maxLength={NAME_MAX} onChange={(v) => onFee(setFeeName(fee, v))} />}
        {base && (
          <p className="text-sm text-muted-foreground">
            {p.base}
            {copy.price.sep}
            {base}
          </p>
        )}
        {panel.oneSide && (
          <p>
            <Tag tone="outline">{p.oneSide[panel.oneSide]}</Tag>
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3 border-t border-border pt-4">
        <GroupHead as="h3" plain>
          {panel.limited ? p.stages : p.fields}
        </GroupHead>
        <Stages fee={fee} side="buy" stages={panel.stages} forms={forms} onFee={onFee} />
      </div>
      {panel.sale.allowed && (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <SegmentedControl
            label={p.sale}
            fit
            options={[
              { value: "same", label: p.saleSame },
              { value: "apart", label: p.saleApart },
            ]}
            value={panel.sale.stages ? "apart" : "same"}
            onChange={(v) => onFee(setSaleApart(fee, v === "apart"))}
          />
          {panel.sale.stages && (
            <>
              <GroupHead as="h3" plain>
                {p.salePrices}
              </GroupHead>
              <Stages fee={fee} side="sell" stages={panel.sale.stages} forms={forms} onFee={onFee} />
            </>
          )}
        </div>
      )}
      <Law cap={panel.cap} law={law} saved={saved} first={first} />
      <div className="border-t border-border pt-4">
        <Button variant="destructive" flush onClick={() => onRemove(fee.id)}>
          {p.remove}
        </Button>
      </div>
    </Section>
  );
}
