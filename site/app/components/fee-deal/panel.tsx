// The column "העמלה שבחרתם" (method §10.6, `panel`): every field of the chosen fee by its shape, one line each in a list whose labels share
// one narrow column and whose boxes start at one edge after it; how long its price holds (always, or up to a month after which it is free,
// or several prices one after another); a sale priced apart where the shape allows it; the fee against the law (one quiet line where no cap
// holds, else the fee's row of the reading's law card: the bar, each price's standing and the cap's line with its rules); and at the foot,
// filling the price from a price list and taking the fee away.
import type { ReactNode } from "react";
import { feeDeal as copy, guideBlocks } from "../../copy";
import type { Panel, PanelStage } from "../../lib/fee-deal/builder";
import type { CapLine } from "../../lib/fee-deal/kinds";
import { addStage, editPrice, removeStage, setFeeName, setSaleApart, setUntil, withCurrency, withForm, withMonths, type Side } from "../../lib/fee-deal/edit";
import { BOUND_CURRENCIES, MONTHS, NAME_MAX, type BoundCurrency, type Fee, type MonthKey, type Months } from "../../lib/fee-deal/model";
import { refOf } from "../../lib/fee-deal/parts";
import type { LawRow } from "../../lib/fee-deal/reading";
import type { FieldId, FormId } from "../../lib/fee-deal/shapes";
import { IconBin, IconExternal } from "../icons";
import { Button, InlineSelect, MenuPicker, MonthField, Section, SegmentedControl, Tag, TextField, TypedPlain, cx } from "../kit";
import { useOpen, useProvenanceData } from "../provenance";
import { PriceFigure } from "./figures";
import { CapRules, FeeName, LawBlock, feeName, perActionWord, refName } from "./words";

const p = copy.panel;

const monthOptions = (words: Record<number, string>) => MONTHS.map((m) => ({ id: String(m), name: words[m]! }));

/** Whether a fee's prices on a side wait for a month: one but the last has no end, or the ends do not rise. */
function orderNote(stages: readonly PanelStage[]): string | null {
  if (stages.slice(0, -1).some((s) => !s.until)) return p.untilMissing;
  for (let k = 1; k < stages.length - 1; k++) if (stages[k]!.until! <= stages[k - 1]!.until!) return p.outOfOrder;
  return null;
}

/**
 * One line of the panel's list: its label in the narrow first column, its boxes and their caption from the shared edge after it.
 * `className` goes on both cells (a line shown at one width only).
 */
function Row({ label, className, children }: { label: ReactNode; className?: string; children: ReactNode }) {
  return (
    <>
      <span className={cx("text-sm text-muted-foreground", className)}>{label}</span>
      <span className={cx("flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1", className)}>{children}</span>
    </>
  );
}

/** A line across both columns, from the labels' edge: a later price's head, a note, an action. */
const Across = ({ children }: { children: ReactNode }) => <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1">{children}</div>;

/** A caption after a box, in the muted ink. */
const Caption = ({ children }: { children: ReactNode }) => <span className="text-sm text-muted-foreground">{children}</span>;

/** One price's lines, by its form: how it is charged where the fee has several forms, then its figures, each in its box. */
function PriceRows({ fee, side, k, s, forms, onFee }: { fee: Fee; side: Side; k: number; s: PanelStage; forms: readonly FormId[]; onFee: (f: Fee) => void }) {
  const name = refName(refOf(fee));
  const label = (field: string) => copy.builder.fieldName(name, field);
  const price = (fee.sale && side === "sell" ? fee.sale : fee.stages)[k]!.price;
  const edit = (fn: Parameters<typeof editPrice>[3]) => onFee(editPrice(fee, side, k, fn));
  const has = (f: FieldId) => s.fields.includes(f);
  const figure = (f: "rate" | "min" | "max" | "amount", unit?: ReactNode) => (
    <PriceFigure fee={fee} side={side} k={k} view={s.price} figure={f} label={label(f === "min" ? p.min : f === "max" ? p.max : p.howMuch)} optional={f === "min" || f === "max"} unit={unit} onFee={onFee} />
  );
  // a bound's currency, where the fee may take another one, is the unit in the bound's box
  const currency =
    has("currency") && price.form === "action" ? (
      <InlineSelect label={label(p.currency)} labelHidden options={BOUND_CURRENCIES.map((c) => ({ id: c, name: p.signs[c]! }))} value={price.currency ?? "ILS"} onChange={(v) => v && edit((x) => withCurrency(x, v as BoundCurrency))} />
    ) : undefined;
  const per = price.form === "held" ? p.perCharge : perActionWord(fee.kind);
  return (
    <>
      {forms.length > 1 && (
        <Row label={p.form}>
          <InlineSelect label={label(p.form)} labelHidden options={forms.map((f) => ({ id: f, name: p.forms[f]! }))} value={price.form} onChange={(v) => v && edit((x) => withForm(x, v as FormId))} />
        </Row>
      )}
      {has("rate") && (
        <Row label={p.howMuch}>
          {figure("rate")}
          {price.form === "held" ? (
            <InlineSelect label={label(p.per)} labelHidden options={monthOptions(p.perOptions)} value={String(price.per)} onChange={(v) => v && edit((x) => withMonths(x, "per", Number(v) as Months))} />
          ) : (
            <Caption>{perActionWord(fee.kind)}</Caption>
          )}
        </Row>
      )}
      {has("amount") && (
        <Row label={p.howMuch}>
          {figure("amount")}
          {price.form === "perAction" && <Caption>{perActionWord(fee.kind)}</Caption>}
        </Row>
      )}
      {has("every") && price.form === "held" && (
        <Row label={p.every}>
          <InlineSelect label={label(p.every)} labelHidden options={monthOptions(p.everyOptions)} value={String(price.every)} onChange={(v) => v && edit((x) => withMonths(x, "every", Number(v) as Months))} />
        </Row>
      )}
      {has("every") && price.form === "sum" && (
        <Row label={p.sumEvery}>
          <InlineSelect label={label(p.sumEvery)} labelHidden options={monthOptions(p.sumEveryOptions)} value={String(price.every)} onChange={(v) => v && edit((x) => withMonths(x, "every", Number(v) as Months))} />
        </Row>
      )}
      {/* the minimum and the maximum share a line from 640 px; on a phone the maximum has a line of its own, its label in the column */}
      {has("min") && (
        <Row label={p.min}>
          {figure("min", currency)}
          {has("max") && (
            <span className="hidden items-center gap-x-2 sm:inline-flex">
              <span className="text-sm text-muted-foreground">{p.max}</span>
              {figure("max", currency)}
            </span>
          )}
          <Caption>{per}</Caption>
        </Row>
      )}
      {has("max") && (
        <Row label={p.max} className={has("min") ? "sm:hidden" : undefined}>
          {figure("max", currency)}
          <Caption>{per}</Caption>
        </Row>
      )}
    </>
  );
}

/**
 * A fee's prices on one side. One price: its lines, and "עד מתי": always, or for a time after which the fee is free (a second, free price
 * that starts at the month typed). Several prices otherwise: each under its head ("בהתחלה", "אחר כך") with the month it ends, and a later
 * one added or taken away.
 */
function Stages({ fee, side, stages, forms, onFee }: { fee: Fee; side: Side; stages: readonly PanelStage[]; forms: readonly FormId[]; onFee: (f: Fee) => void }) {
  const name = refName(refOf(fee));
  const note = orderNote(stages);
  const typed = side === "sell" && fee.sale ? fee.sale : fee.stages;
  const untilField = (k: number) => (
    <MonthField value={stages[k]!.until ?? null} label={copy.builder.fieldName(name, p.until)} onCommit={(m) => onFee(setUntil(fee, side, k, m))} onClear={() => onFee(setUntil(fee, side, k, null))} />
  );
  const addLater = (
    <Across>
      <Button variant="quiet" flush onClick={() => onFee(addStage(fee, side))}>
        + {stages.length === 1 ? p.addLater : p.addStage}
      </Button>
    </Across>
  );
  // one price that holds always, or one that holds up to a month and then the fee is free
  const limited = stages.length === 2 && typed[0]!.price.form !== "free" && typed[1]!.price.form === "free";
  if (stages.length === 1 || limited)
    return (
      <>
        <PriceRows fee={fee} side={side} k={0} s={stages[0]!} forms={forms} onFee={onFee} />
        {typed[0]!.price.form !== "free" && (
          <Row label={p.when}>
            <SegmentedControl
              label={copy.builder.fieldName(name, p.when)}
              fit
              options={[
                { value: "always", label: p.always },
                { value: "limited", label: p.limited },
              ]}
              value={limited ? "limited" : "always"}
              onChange={(v) => {
                if (v === "limited" && !limited) onFee(editPrice(addStage(fee, side), side, 1, (x) => withForm(x, "free")));
                if (v === "always" && limited) onFee(removeStage(fee, side, 1));
              }}
            />
            {limited && untilField(0)}
          </Row>
        )}
        {limited && note && (
          <Across>
            <Caption>{note}</Caption>
          </Across>
        )}
        {addLater}
      </>
    );
  return (
    <>
      {stages.map((s, k) => (
        <PriceStage key={k} head={k === 0 ? p.stage.first : p.stage.next} onRemove={() => onFee(removeStage(fee, side, k))}>
          <PriceRows fee={fee} side={side} k={k} s={s} forms={forms} onFee={onFee} />
          {k < stages.length - 1 ? (
            <Row label={p.until}>{untilField(k)}</Row>
          ) : (
            <Row label={p.until}>
              <Caption>{p.noEnd}</Caption>
            </Row>
          )}
        </PriceStage>
      ))}
      {note && (
        <Across>
          <Caption>{note}</Caption>
        </Across>
      )}
      {addLater}
    </>
  );
}

/** A price among several: its head across the list, with the action that takes it away, then its lines. */
function PriceStage({ head, onRemove, children }: { head: string; onRemove: () => void; children: ReactNode }) {
  return (
    <>
      <Across>
        <span className="text-sm font-medium">{head}</span>
        <Button variant="ghost" onClick={onRemove}>
          {p.removeStage}
        </Button>
      </Across>
      {children}
    </>
  );
}

/**
 * The fee against the law. No cap: one quiet line in the list ("אין תקרה בחוק" and its rules). A cap: "מול החוק", the fee's row of the
 * reading's law card (`law`), so the panel and the card say the same: the tag and the bar of its standing from the reading's month on, each
 * price from then with its standing, and the cap's line with its rules. A fee the reading leaves out (its prices are not in order yet) has
 * no row, and shows the cap's line alone. A cap with a caveat judges no price (F-113): no tag, no bar, and its line says the caveat after
 * the figure. The figures the person typed read as plain words here: the boxes above carry their blue.
 */
function Law({ cap, law, saved, first }: { cap: CapLine; law: LawRow | null; saved: boolean; first: MonthKey }) {
  if (cap.state === "absent" || cap.state === "none") return null;
  return (
    <Section title={p.law} level="card" heading="h3" gap="tight" className="border-t border-border pt-3">
      <TypedPlain>{law ? <LawBlock row={law} saved={saved} first={first} /> : <CapRules cap={cap} />}</TypedPlain>
    </Section>
  );
}

/** The houses whose price list has a line for the fee, and what filling the fee from one does. */
export interface PanelFill {
  houses: readonly { id: string; name: string }[];
  onFill: (houseId: string) => void;
}

/**
 * The column, for the chosen fee. `law`: its row of the reading's law card, where it has one; `first`: the reading's first month; `saved`:
 * the deal's product saves, so a share of what is held reads "what has built up"; `fill`: the price lists that can fill it, null where its
 * kind has none.
 */
export function PanelColumn({ panel, fee, law, first, saved, fill, onFee, onRemove }: {
  panel: Panel;
  fee: Fee;
  law: LawRow | null;
  first: MonthKey;
  saved: boolean;
  fill: PanelFill | null;
  onFee: (f: Fee) => void;
  onRemove: (feeId: string) => void;
}) {
  const open = useOpen();
  const terms = useProvenanceData()?.terms;
  const base = panel.shape.base ? (guideBlocks.fees[panel.shape.base] as { base?: string } | undefined)?.base : undefined;
  const forms: FormId[] = ["free", ...panel.shape.forms];
  // the site's own explanation of the fee: its glossary card, where the glossary has one by the fee's name
  const term = fee.kind === "own" ? null : feeName(fee.kind);
  const explained = term && terms?.[term] ? term : null;
  const noCap = panel.cap.state === "none";
  return (
    <Section title={p.title} level="kick" heading="h2" gap="tight">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-lg font-semibold">
          <FeeName fee={panel} />
        </h3>
        {panel.oneSide && <Tag tone="outline">{p.oneSide[panel.oneSide]}</Tag>}
        {explained && (
          <Button variant="quiet" size="sm" flush gap="sm" onClick={(e) => open({ kind: "term", id: explained }, e.currentTarget)}>
            {p.whatIs}
            <IconExternal size={14} />
          </Button>
        )}
      </div>
      {fee.kind === "own" && <TextField label={p.ownName} value={fee.name ?? ""} maxLength={NAME_MAX} onChange={(v) => onFee(setFeeName(fee, v))} />}
      {base && (
        <p className="text-sm text-muted-foreground">
          {p.base}
          {copy.price.sep}
          {base}
        </p>
      )}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
        <Stages fee={fee} side="buy" stages={panel.stages} forms={forms} onFee={onFee} />
        {panel.sale.allowed && (
          <Row label={p.sale}>
            <SegmentedControl
              label={copy.builder.fieldName(refName(panel), p.sale)}
              fit
              options={[
                { value: "same", label: p.saleSame },
                { value: "apart", label: p.saleApart },
              ]}
              value={panel.sale.stages ? "apart" : "same"}
              onChange={(v) => onFee(setSaleApart(fee, v === "apart"))}
            />
          </Row>
        )}
        {panel.sale.stages && (
          <>
            <Across>
              <span className="text-sm font-medium">{p.salePrices}</span>
            </Across>
            <Stages fee={fee} side="sell" stages={panel.sale.stages} forms={forms} onFee={onFee} />
          </>
        )}
        {noCap && (
          <Row label={p.law}>
            <CapRules cap={panel.cap} />
          </Row>
        )}
      </div>
      <Law cap={panel.cap} law={law} saved={saved} first={first} />
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {fill && fill.houses.length > 0 && <MenuPicker name={p.fill} items={fill.houses.map((h) => ({ id: h.id, label: h.name }))} value={null} placeholder={p.fill} onSelect={fill.onFill} />}
        <Button variant="ghost" onClick={() => onRemove(fee.id)}>
          <IconBin size={18} />
          {p.remove}
        </Button>
      </div>
    </Section>
  );
}
