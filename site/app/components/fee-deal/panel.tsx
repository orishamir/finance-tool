// The column "העמלה שבחרתם" (method §10.6, `panel`): every field of the chosen fee by its shape, one line each in a list whose labels share
// one narrow column and whose boxes start at one edge after it; how long its price holds (always, or up to a month after which it is free,
// or several prices one after another); a sale priced apart where the shape allows it; the fee against the law (one quiet line where no cap
// holds, else the fee's row of the reading's law card: the bar, each price's standing and the cap's line with its rules); and at the foot,
// filling the price from a price list and taking the fee away. A stage just taken away leaves the page's undo line where it was.
import { useRef, useState, type ReactNode } from "react";
import { feeDeal as copy, guideBlocks } from "../../copy";
import type { Panel, PanelStage } from "../../lib/fee-deal/builder";
import type { CapLine } from "../../lib/fee-deal/kinds";
import { addLater, editPrice, setFeeName, setSaleApart, setUntil, withCurrency, withForm, withMonths, type Side } from "../../lib/fee-deal/edit";
import { BOUND_CURRENCIES, MONTHS, NAME_MAX, type BoundCurrency, type Fee, type MonthKey, type Months } from "../../lib/fee-deal/model";
import { refOf } from "../../lib/fee-deal/parts";
import type { LawRow } from "../../lib/fee-deal/reading";
import type { FieldId, FormId } from "../../lib/fee-deal/shapes";
import { termKey } from "../../lib/fee-page-data";
import { IconBin, IconClose } from "../icons";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { AlignedAcross as Across, AlignedCaption as Caption, AlignedList, AlignedRow as Row, Button, HelpMark, InlineSelect, MenuPicker, MonthField, Section, SegmentedControl, Tag, TextField, TypedPlain, monthText } from "../kit";
import { useProvenanceData } from "../provenance";
import { PriceFigure, mainFieldId } from "./figures";
import { UndoLine } from "./undo-line";
import { CapRules, FeeName, LawBlock, feeName, perActionWord, refName } from "./words";

const p = copy.panel;

const monthOptions = (words: Record<number, string>) => MONTHS.map((m) => ({ id: String(m), name: words[m]! }));

/** What a price among several lacks in its month, under its own month: none given though a later price follows, or not after the one before. */
function monthNote(stages: readonly PanelStage[], k: number): ReactNode {
  if (k === stages.length - 1) return null;
  const until = stages[k]!.until;
  if (!until) return p.untilMissing;
  const before = k > 0 ? stages[k - 1]!.until : undefined;
  if (!before || until > before) return null;
  return (
    <>
      {p.outOfOrder.before}
      <bdi dir="ltr">{monthText(before)}</bdi>
      {p.outOfOrder.after}
    </>
  );
}

/** One price's lines, by its form: how it is charged where the fee has several forms, then its figures, each in its box. */
function PriceRows({ fee, side, k, s, forms, onFee }: { fee: Fee; side: Side; k: number; s: PanelStage; forms: readonly FormId[]; onFee: (f: Fee) => void }) {
  const name = refName(refOf(fee));
  const label = (field: string) => copy.builder.fieldName(name, field);
  const price = (fee.sale && side === "sell" ? fee.sale : fee.stages)[k]!.price;
  const edit = (fn: Parameters<typeof editPrice>[3]) => onFee(editPrice(fee, side, k, fn));
  const has = (f: FieldId) => s.fields.includes(f);
  const figure = (f: "rate" | "min" | "max" | "amount", unit?: ReactNode) => (
    <PriceFigure
      fee={fee}
      side={side}
      k={k}
      view={s.price}
      figure={f}
      label={label(f === "min" ? p.min : f === "max" ? p.max : p.howMuch)}
      optional={f === "min" || f === "max"}
      unit={unit}
      {...(f === "rate" || f === "amount" ? { id: mainFieldId(fee.id, side, k, "panel") } : {})}
      onFee={onFee}
    />
  );
  // a bound's currency, where the fee may take another one, is the unit in the first bound's box, chosen there once; the other bound's box
  // says it as its unit
  const cur = price.form === "action" ? (price.currency ?? "ILS") : "ILS";
  const currency =
    has("currency") && price.form === "action" ? (
      <InlineSelect label={label(p.currency)} labelHidden options={BOUND_CURRENCIES.map((c) => ({ id: c, name: p.signs[c]! }))} value={cur} onChange={(v) => v && edit((x) => withCurrency(x, v as BoundCurrency))} />
    ) : undefined;
  const sign = currency ? p.signs[cur] : undefined;
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
      {/* the minimum and the maximum share a line, each box drawn once: where the line is narrow the maximum, with its word, goes under
          the minimum, and the label stays by the first line */}
      {(has("min") || has("max")) && (
        <Row label={has("min") ? p.min : p.max} top>
          {has("min") && figure("min", currency)}
          {has("min") && has("max") && (
            <span className="inline-flex items-center gap-x-2">
              <Caption>{p.max}</Caption>
              {figure("max", sign)}
            </span>
          )}
          {!has("min") && has("max") && figure("max", currency)}
          <Caption>{per}</Caption>
        </Row>
      )}
    </>
  );
}

/**
 * A fee's prices on one side. One price: its lines, then `between` (the sale's line), then "עד מתי": always, or for a limited time, which
 * asks in place for the month it ends and changes nothing the page reads until it is given. Several prices: each under its head
 * ("בהתחלה", "אחר כך") with the month it ends and what that month lacks, then `between`, then "+ מחיר אחר אחר כך", which asks for the
 * month the last price ends the same way. A month given adds one later price, its figure blank (`addLater`), and its box takes the focus.
 * A stage taken away (`onRemoveStage`) leaves `line` where it was, which hands the focus to the side's way to add a price when it goes.
 */
function Stages({ fee, side, stages, forms, between, line, onFee, onRemoveStage }: {
  fee: Fee;
  side: Side;
  stages: readonly PanelStage[];
  forms: readonly FormId[];
  between?: ReactNode;
  line: StageLine | null;
  onFee: (f: Fee) => void;
  onRemoveStage: (side: Side, k: number) => void;
}) {
  const name = refName(refOf(fee));
  // asking for the month the last price ends, on this fee and side only: another fee's panel starts without it
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
  const later = (month: MonthKey) => {
    added.current = stages.length;
    ask(false);
    onFee(addLater(fee, side, month));
  };
  const undo =
    line?.side === side ? (
      <UndoLine key={`undo:stage:${side}:${line.k}`} as="div" className="col-span-2" onUndo={line.onUndo} onHold={line.onHold} refocusOnUndo refocus={() => document.querySelector<HTMLElement>(`[data-add-stage="${side}"]`)}>
        {line.words}
      </UndoLine>
    ) : null;
  const undoAt = (k: number) => (undo && line!.k === k ? undo : null);
  const askField = () => <MonthField value={null} label={copy.builder.fieldName(name, p.until)} waits autoFocus onCommit={later} />;
  const untilField = (k: number) => (
    <MonthField value={stages[k]!.until ?? null} label={copy.builder.fieldName(name, p.until)} onCommit={(m) => onFee(setUntil(fee, side, k, m))} onClear={() => onFee(setUntil(fee, side, k, null))} />
  );
  if (stages.length === 1)
    return (
      <>
        {undoAt(0)}
        <PriceRows fee={fee} side={side} k={0} s={stages[0]!} forms={forms} onFee={onFee} />
        {between}
        <Row label={p.when}>
          <SegmentedControl
            label={copy.builder.fieldName(name, p.when)}
            fit
            options={[
              { value: "always", label: p.always },
              { value: "limited", label: p.limited },
            ]}
            value={asking ? "limited" : "always"}
            onChange={(v) => ask(v === "limited")}
          />
          {asking && askField()}
        </Row>
        {undo && line!.k > 0 ? undo : null}
      </>
    );
  return (
    <>
      {stages.map((s, k) => {
        const note = monthNote(stages, k);
        const last = k === stages.length - 1;
        return (
          <PriceStage key={k} head={k === 0 ? p.stage.first : p.stage.next} before={undoAt(k)} onRemove={() => onRemoveStage(side, k)}>
            <PriceRows fee={fee} side={side} k={k} s={s} forms={forms} onFee={onFee} />
            <Row label={p.until}>{!last ? untilField(k) : asking ? askField() : <Caption>{p.noEnd}</Caption>}</Row>
            {note && (
              <Across>
                <Caption>{note}</Caption>
              </Across>
            )}
          </PriceStage>
        );
      })}
      {undo && line!.k >= stages.length ? undo : null}
      {between}
      {!asking && (
        <Across>
          <Button variant="quiet" flush data-add-stage={side} onClick={() => ask(true)}>
            + {p.addLater}
          </Button>
        </Across>
      )}
    </>
  );
}

/** A price among several: its head across the list, with the action that takes it away, then its lines; `before`, the line of a stage taken away from its place. */
function PriceStage({ head, before, onRemove, children }: { head: string; before: ReactNode; onRemove: () => void; children: ReactNode }) {
  return (
    <>
      {before}
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

/**
 * The page's undo line in the panel: of a stage just taken away from the chosen fee (its side and place), where the stage was; or of the
 * fee just filled from a price list, in the panel's foot where the fill was chosen. Each stands where it moves nothing above it.
 */
export type PanelUndoLine = ({ kind: "stage"; side: Side; k: number } | { kind: "fill" }) & {
  words: string;
  onUndo: () => void;
  onHold: (held: boolean) => void;
};

type StageLine = Extract<PanelUndoLine, { kind: "stage" }>;

/** The houses whose price list has a line for the fee, and what filling the fee from one does. */
export interface PanelFill {
  houses: readonly { id: string; name: string }[];
  onFill: (houseId: string) => void;
}

/**
 * The column, for the chosen fee. `product`: the deal's product, whose sense of the fee's name "מה זה" opens; `law`: its row of the
 * reading's law card, where it has one; `first`: the reading's first month; `saved`: the deal's product saves, so a share of what is held
 * reads "what has built up"; `fill`: the price lists that can fill it, null where its kind has none; `line`: the undo line of a stage just
 * taken away from it or of a fill. `onClose` un-chooses the fee (the head's close button; the page closes it on Escape too).
 */
export function PanelColumn({ panel, fee, product, law, first, saved, fill, line, onFee, onRemove, onRemoveStage, onClose }: {
  panel: Panel;
  fee: Fee;
  product: string | null;
  law: LawRow | null;
  first: MonthKey;
  saved: boolean;
  fill: PanelFill | null;
  line: PanelUndoLine | null;
  onFee: (f: Fee) => void;
  onRemove: (feeId: string) => void;
  onRemoveStage: (side: Side, k: number) => void;
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
  const noCap = panel.cap.state === "none";
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h3 className="text-lg font-semibold">
          <FeeName fee={panel} />
        </h3>
        {panel.oneSide && <Tag tone="outline">{p.oneSide[panel.oneSide]}</Tag>}
        {explained && term && <HelpMark term={explained} about={term} words={p.whatIs} className="ms-auto" />}
      </div>
      {fee.kind === "own" && <TextField label={p.ownName} value={fee.name ?? ""} maxLength={NAME_MAX} onChange={(v) => onFee(setFeeName(fee, v))} />}
      {base && (
        <p className="text-sm text-muted-foreground">
          {p.base}
          {copy.price.sep}
          {base}
        </p>
      )}
      <AlignedList>
        <Stages fee={fee} side="buy" stages={panel.stages} forms={forms} between={sale} line={stageLine} onFee={onFee} onRemoveStage={onRemoveStage} />
        {panel.sale.stages && (
          <>
            <Across>
              <span className="text-sm font-medium">{p.salePrices}</span>
            </Across>
            <Stages fee={fee} side="sell" stages={panel.sale.stages} forms={forms} line={stageLine} onFee={onFee} onRemoveStage={onRemoveStage} />
          </>
        )}
        {noCap && (
          <Row label={p.law}>
            <CapRules cap={panel.cap} />
          </Row>
        )}
      </AlignedList>
      <Law cap={panel.cap} law={law} saved={saved} first={first} />
      {/* the foot: a fill's undo line stands where the fill was chosen, in the picker's place, so nothing above it moves */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {line?.kind === "fill" ? (
          <UndoLine key="undo:fill" as="div" onUndo={line.onUndo} onHold={line.onHold} refocusOnUndo refocus={() => document.querySelector<HTMLElement>("[data-fill-picker] button")}>
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
