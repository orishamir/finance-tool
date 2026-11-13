// The column "העמלה שבחרתם" (method §10.6, `panel`): the fee's name as its heading, typed in place for a fee of the person's own (a pencil
// in its box, its spoken name "שם העמלה"); every field of the chosen fee by its shape, one line each in a list whose labels share
// one narrow column and whose boxes start at one edge after it; each price with how long it holds, a price for a limited time followed by
// the next one; a sale priced apart where the shape allows it; and at the foot, filling the price from a price list and taking the fee
// away. The law is the reading's law card's alone: the panel says nothing of a cap. A price just taken away leaves the page's undo line
// where it was.
import { Fragment, useRef, useState, type ReactNode } from "react";
import { feeDeal as copy, guideBlocks } from "../../copy";
import type { Panel, PanelStage } from "../../lib/fee-deal/builder";
import { editPrice, setFeeName, setLimited, setSaleApart, withCurrency, withFlat, withForm, withMonths, type Figure, type Side } from "../../lib/fee-deal/edit";
import { BOUND_CURRENCIES, MONTHS, NAME_MAX, pricesOn, stageFault, untilRange, type BoundCurrency, type Fee, type MonthKey, type Months } from "../../lib/fee-deal/model";
import { refOf } from "../../lib/fee-deal/parts";
import type { FieldId, FormId } from "../../lib/fee-deal/shapes";
import { termKey } from "../../lib/fee-page-data";
import { IconBin, IconClose, IconPencil } from "../icons";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { AlignedAcross as Across, AlignedCaption as Caption, AlignedList, AlignedRow as Row, Button, HelpMark, InlineSelect, MenuPicker, MonthField, Section, SegmentedControl, Swatch, Tag, TextField, When, cx, monthText } from "../kit";
import { useProvenanceData } from "../provenance";
import { fmt, joinLead } from "../../lib/format";
import { PriceFigure, mainFieldId } from "./figures";
import { UndoLine } from "./undo-line";
import { FeeName, feeColour, feeName, perActionWord, refName } from "./words";

const p = copy.panel;

/** A later price's first month in words with its lead ("ממרץ 2028"), as the reading heads a period. */
const fromWords = (m: MonthKey) => `${joinLead(copy.read.periods.from, fmt.period(m))}${fmt.period(m)}`;

const monthOptions = (words: Record<number, string>) => MONTHS.map((m) => ({ id: String(m), name: words[m]! }));

/** What a price among several lacks in its month, under its own month: none given though a later price follows, or not after the one before. */
function monthNote(stages: readonly PanelStage[], k: number): ReactNode {
  const fault = stageFault(stages, k);
  if (fault?.kind === "missing") return p.untilMissing;
  if (fault?.kind !== "after") return null;
  return (
    <>
      {p.outOfOrder.before}
      <bdi dir="ltr">{monthText(fault.month)}</bdi>
      {p.outOfOrder.after}
    </>
  );
}

/**
 * One price's lines (`name`, the price's name in its fields' labels), by its form: how it is charged where the fee has several forms, then
 * its figures, each in its box: its rate or sum, the months, the minimum and the maximum, the percent maximum ("מקסימום באחוזים", a share
 * of the action), and the small action's price ("פעולה קטנה": the same price, or a flat price up to a sum, whose two boxes come on a line
 * under it in two phrases that each keep together: "[2.85 $] לכל המרה," and "עד המרה של [50 $]"). The price's currency, where the fee
 * may take another, is chosen once, in its first sum's box (a sum per unit's or a sum per action's, else the minimum's); every other sum's
 * box shows it as its unit.
 */
function PriceRows({ fee, side, k, s, forms, name, onFee }: { fee: Fee; side: Side; k: number; s: PanelStage; forms: readonly FormId[]; name: string; onFee: (f: Fee) => void }) {
  const label = (field: string) => copy.builder.fieldName(name, field);
  const price = pricesOn(fee, side)[k]!.price;
  const edit = (fn: Parameters<typeof editPrice>[3]) => onFee(editPrice(fee, side, k, fn));
  const has = (f: FieldId) => s.fields.includes(f);
  const spoken: Record<Figure, string> = { rate: p.howMuch, amount: p.howMuch, min: p.min, max: p.max, cap: p.cap, flat: p.parts.flat, upTo: p.parts.upTo };
  const figure = (f: Figure, unit?: ReactNode, opts: { blank?: boolean } = {}) => (
    <PriceFigure
      fee={fee}
      side={side}
      k={k}
      view={s.price}
      figure={f}
      label={label(spoken[f])}
      optional={f === "min" || f === "max" || f === "cap"}
      unit={unit}
      {...opts}
      {...(f === "rate" || f === "amount" ? { id: mainFieldId(fee.id, side, k, "panel") } : {})}
      onFee={onFee}
    />
  );
  const priced = price.form === "action" || price.form === "perUnit" || price.form === "perAction";
  const cur = priced ? (price.currency ?? "ILS") : "ILS";
  const chooser =
    has("currency") && priced ? (
      <InlineSelect label={label(p.currency)} labelHidden options={BOUND_CURRENCIES.map((c) => ({ id: c, name: p.signs[c]! }))} value={cur} onChange={(v) => v && edit((x) => withCurrency(x, v as BoundCurrency))} />
    ) : undefined;
  // a sum per unit or a sum per action takes the choice in its own box; a share of an action, in its first bound's
  const inAmount = price.form === "perUnit" || price.form === "perAction" ? chooser : undefined;
  const inBound = price.form === "action" ? chooser : undefined;
  const per = price.form === "held" ? p.perCharge : perActionWord(fee.kind);
  const flat = (price.form === "action" || price.form === "perUnit") && price.flat ? price.flat : null;
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
          {figure("amount", inAmount)}
          {price.form === "perAction" && <Caption>{perActionWord(fee.kind)}</Caption>}
          {price.form === "perUnit" && <Caption>{copy.price.perUnit}</Caption>}
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
      {/* the minimum and the maximum share a line, each box drawn once: where the line is narrow the maximum, with its word, goes under
          the minimum, and the label stays by the first line */}
      {(has("min") || has("max")) && (
        <Row label={has("min") ? p.min : p.max} top>
          {has("min") && figure("min", inBound)}
          {has("min") && has("max") && (
            <span className="inline-flex items-center gap-x-2">
              <Caption>{p.max}</Caption>
              {figure("max")}
            </span>
          )}
          {!has("min") && has("max") && figure("max", inBound)}
          <Caption>{per}</Caption>
        </Row>
      )}
      {has("cap") && (
        <Row label={p.cap}>
          {figure("cap")}
          <Caption>{copy.price.of[fee.kind] ?? copy.price.of.default}</Caption>
        </Row>
      )}
      {has("flat") && (
        <>
          <Row label={p.small}>
            <SegmentedControl
              label={label(p.small)}
              fit
              options={[
                { value: "same", label: p.smallSame },
                { value: "flat", label: p.smallFlat },
              ]}
              value={flat ? "flat" : "same"}
              onChange={(v) => edit((x) => withFlat(x, v === "flat"))}
            />
          </Row>
          {flat && (
            <Row label={null}>
              <span className="inline-flex items-center gap-x-2 whitespace-nowrap">
                {figure("flat", undefined, { blank: true })}
                <Caption>
                  {perActionWord(fee.kind)}
                  {copy.price.flatSep}
                </Caption>
              </span>
              <span className="inline-flex items-center gap-x-2 whitespace-nowrap">
                <Caption>{p.upTo[fee.kind] ?? p.upTo.default}</Caption>
                {figure("upTo", undefined, { blank: true })}
              </span>
            </Row>
          )}
        </>
      )}
    </>
  );
}

/**
 * A fee's prices on one side, as a chain each price makes with its "עד מתי": "כל הזמן", the price holds on and is the last; "לזמן מוגבל",
 * the month box comes on its row, focused, and changes nothing the page reads until a month is given; the month ends the price and adds
 * the next one under it (`setLimited`), headed by the month it starts, asking for its price, with its own "עד מתי". "כל הזמן" on a price
 * before others takes the prices after it away (`onHoldOn`). A later price carries its own remove action (`onRemoveStage`). `between`
 * (the sale's line) follows the chain. A price taken away leaves `line` where it was, which hands the focus to the "עד מתי" of the price
 * before it when it goes.
 */
function Stages({ fee, side, stages, forms, between, line, onFee, onRemoveStage, onHoldOn }: {
  fee: Fee;
  side: Side;
  stages: readonly PanelStage[];
  forms: readonly FormId[];
  between?: ReactNode;
  line: StageLine | null;
  onFee: (f: Fee) => void;
  onRemoveStage: (side: Side, k: number) => void;
  onHoldOn: (side: Side, k: number) => void;
}) {
  const name = refName(refOf(fee));
  // the last price asking for its month, on this fee and side only: another fee's panel starts without it
  const [askingFor, setAskingFor] = useState<string | null>(null);
  const asking = askingFor === `${fee.id}:${side}`;
  const ask = (on: boolean) => setAskingFor(on ? `${fee.id}:${side}` : null);
  // the later price just added takes the focus once it is drawn
  const added = useRef<number | null>(null);
  useIsoLayoutEffect(() => {
    if (added.current === null) return;
    const field = document.getElementById(mainFieldId(fee.id, side, added.current, "panel")) as HTMLInputElement | null;
    added.current = null;
    field?.focus();
    field?.select();
  }, [stages.length]);
  const last = stages.length - 1;
  const limit = (k: number, month: MonthKey) => {
    if (k === last) {
      added.current = stages.length;
      ask(false);
    }
    onFee(setLimited(fee, side, k, month));
  };
  // a price's name in its fields' labels: the fee's, and from a later price's month on
  const startOf = (k: number) => (k > 0 ? stages[k - 1]!.until : undefined);
  const stageName = (k: number) => {
    const from = startOf(k);
    return from ? `${name}, ${fromWords(from)}` : name;
  };
  const whenOf = (k: number) => `[data-when="${side}:${k}"] [tabindex="0"]`;
  const undo =
    line?.side === side ? (
      <UndoLine key={`undo:stage:${side}:${line.k}`} as="div" className="col-span-2" onUndo={line.onUndo} onHold={line.onHold} take={line.take} refocusOnUndo refocus={() => document.querySelector<HTMLElement>(whenOf(Math.max(0, Math.min(line.k, stages.length) - 1)))}>
        {line.words}
      </UndoLine>
    ) : null;
  return (
    <>
      {stages.map((s, k) => {
        const note = monthNote(stages, k);
        const limited = k < last || asking;
        const from = startOf(k);
        const label = (field: string) => copy.builder.fieldName(stageName(k), field);
        return (
          <Fragment key={k}>
            {undo && line!.k === k && k > 0 ? undo : null}
            {k > 0 && (
              <Across>
                <span className="text-sm font-medium">{from ? <When iso={from} lead={copy.read.periods.from} /> : p.stage.next}</span>
                <Button variant="icon" size="sm" aria-label={`${p.removeStage}, ${stageName(k)}`} title={p.removeStage} onClick={() => onRemoveStage(side, k)} className="-my-2">
                  <IconBin size={16} />
                </Button>
              </Across>
            )}
            <PriceRows fee={fee} side={side} k={k} s={s} forms={forms} name={stageName(k)} onFee={onFee} />
            <Row label={p.when}>
              <span data-when={`${side}:${k}`} className="contents">
                <SegmentedControl
                  label={label(p.when)}
                  fit
                  options={[
                    { value: "always", label: p.always },
                    { value: "limited", label: p.limited },
                  ]}
                  value={limited ? "limited" : "always"}
                  onChange={(v) => {
                    if (v === "limited") return k === last && ask(true);
                    if (k < last) onHoldOn(side, k);
                    else ask(false);
                  }}
                />
              </span>
              {k < last ? (
                <MonthField value={s.until ?? null} label={label(p.until)} {...untilRange(stages, k)} onCommit={(m) => limit(k, m)} />
              ) : (
                asking && <MonthField value={null} label={label(p.until)} {...untilRange(stages, k)} waits autoFocus onCommit={(m) => limit(k, m)} />
              )}
            </Row>
            {note && (
              <Across>
                <Caption>{note}</Caption>
              </Across>
            )}
          </Fragment>
        );
      })}
      {undo && line!.k > last ? undo : null}
      {between}
    </>
  );
}

/**
 * The page's undo line in the panel: of prices just taken away from the chosen fee (their side and the place of the first), where they
 * were; or of the fee just filled from a price list, in the panel's foot where the fill was chosen. Each stands where it moves nothing
 * above it.
 */
export type PanelUndoLine = ({ kind: "stage"; side: Side; k: number } | { kind: "fill" }) & {
  words: string;
  onUndo: () => void;
  onHold: (held: boolean) => void;
  /** Whether the line takes the focus as it appears (`UndoLine`). */
  take: () => boolean;
};

type StageLine = Extract<PanelUndoLine, { kind: "stage" }>;

/** The houses whose price list has a line for the fee, and what filling the fee from one does. */
export interface PanelFill {
  houses: readonly { id: string; name: string }[];
  onFill: (houseId: string) => void;
}

/**
 * The column, for the chosen fee. `product`: the deal's product, whose sense of the fee's name "מה זה" opens; `fill`: the price lists
 * that can fill it, null where its kind has none; `line`: the undo line of a price just taken away from it (one, or those after a price
 * held on) or of a fill. `onRemoveStage` takes a later price away, `onHoldOn` the prices after one; `onClose` un-chooses the fee (the
 * head's close button; the page closes it on Escape too).
 */
export function PanelColumn({ panel, fee, product, fill, line, onFee, onRemove, onRemoveStage, onHoldOn, onClose }: {
  panel: Panel;
  fee: Fee;
  product: string | null;
  fill: PanelFill | null;
  line: PanelUndoLine | null;
  onFee: (f: Fee) => void;
  onRemove: (feeId: string) => void;
  onRemoveStage: (side: Side, k: number) => void;
  onHoldOn: (side: Side, k: number) => void;
  onClose: () => void;
}) {
  const stageLine = line?.kind === "stage" ? line : null;
  const terms = useProvenanceData()?.terms;
  const base = panel.shape.base ? (guideBlocks.fees[panel.shape.base] as { base?: string } | undefined)?.base : undefined;
  const forms: FormId[] = ["free", ...panel.shape.forms];
  // the site's own explanation of the fee: its glossary card by the fee's name, in the deal's product's sense where the glossary gives
  // that product one of its own
  const term = fee.kind === "own" ? null : feeName(fee.kind);
  const own = term && product ? termKey(term, product) : null;
  const explained = own && terms?.[own] ? own : term && terms?.[term] ? term : null;
  // a sale priced as a purchase or apart: its line stands after the price's figures, before how long the price holds
  const sale = panel.sale.allowed ? (
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
  ) : null;
  return (
    <Section title={p.title} level="kick" heading="h2" gap="tight" action={<Button variant="icon" size="sm" aria-label={p.close} title={p.close} onClick={onClose} className="-my-2"><IconClose size={18} /></Button>}>
      {/* clear of the head's close button by the 6 px its tap area reaches under its face, so the two areas never meet */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5">
        {fee.kind === "own" ? (
          // a fee of the person's own: its heading is its name, typed in place (an empty name reads as the page names such a fee)
          <>
            <h3 className="sr-only">{refName(panel)}</h3>
            <span className="flex min-w-0 flex-[1_1_14rem] items-center gap-2">
              <Swatch shape="box" className={cx("shrink-0", feeColour(fee.kind).bg)} />
              <TextField inline grow labelHidden label={p.ownName} value={fee.name ?? ""} placeholder={feeName("own")} maxLength={NAME_MAX} icon={<IconPencil size={16} />} onChange={(v) => onFee(setFeeName(fee, v))} />
            </span>
          </>
        ) : (
          <h3 className="text-lg font-semibold">
            <FeeName fee={panel} />
          </h3>
        )}
        {panel.oneSide && <Tag tone="outline">{p.oneSide[panel.oneSide]}</Tag>}
        {explained && term && <HelpMark term={explained} about={term} words={p.whatIs} className="ms-auto" />}
      </div>
      {base && (
        <p className="text-sm text-muted-foreground">
          {p.base}
          {copy.price.sep}
          {base}
        </p>
      )}
      {/* Enter in a box moves to the next box of the panel (`FigureField`) */}
      <div data-figures="">
        <AlignedList>
          <Stages fee={fee} side="buy" stages={panel.stages} forms={forms} between={sale} line={stageLine} onFee={onFee} onRemoveStage={onRemoveStage} onHoldOn={onHoldOn} />
          {panel.sale.stages && (
            <>
              <Across>
                <span className="text-sm font-medium">{p.salePrices}</span>
              </Across>
              <Stages fee={fee} side="sell" stages={panel.sale.stages} forms={forms} line={stageLine} onFee={onFee} onRemoveStage={onRemoveStage} onHoldOn={onHoldOn} />
            </>
          )}
        </AlignedList>
      </div>
      {/* the foot: a fill's undo line stands where the fill was chosen, in the picker's place, so nothing above it moves */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {line?.kind === "fill" ? (
          <UndoLine key="undo:fill" as="div" onUndo={line.onUndo} onHold={line.onHold} take={line.take} refocusOnUndo refocus={() => document.querySelector<HTMLElement>("[data-fill-picker] button")}>
            {line.words}
          </UndoLine>
        ) : (
          fill && fill.houses.length > 0 && (
            <span data-fill-picker="" className="contents">
              <MenuPicker name={p.fill} items={fill.houses.map((h) => ({ id: h.id, label: h.name }))} value={null} placeholder={p.fill} onSelect={fill.onFill} />
            </span>
          )
        )}
        <Button variant="ghost" onClick={() => onRemove(fee.id)}>
          <IconBin size={18} />
          {p.remove}
        </Button>
      </div>
    </Section>
  );
}
