// The case open in place (method §10.6, `panel`'s `open`): each price of the case with its parts in edit, a later price headed by its first
// month and a sale priced apart under its own head; a part the toolbox added that still needs its figure, its month or its fee, asking for
// it where it will stand; and the menu a slot of the case opens (`slotEdit`), which the page holds open.
import { useEffect, useState, type ReactNode } from "react";
import { dealCases, feeDeal as copy } from "../../copy";
import type { OpenCase, OpenPart, PartField, SlotEdit } from "../../lib/fee-deal/builder";
import { addOwnPlace, editPrice, setMine, setPart, setRangeUnit, setStep, setTop, setUntil, setWhen, withCurrency, withDiscountOnMin, withMonths, withThirdForm, withThirdWho, type PartId, type Side } from "../../lib/fee-deal/edit";
import { BOUND_CURRENCIES, MONTHS, pricesOn, untilRange, type BoundCurrency, type Fee, type FeeDeal, type MonthKey, type Months, type Price } from "../../lib/fee-deal/model";
import { FEE_KIND_IDS, FEE_SHAPES, type FeeKindId, type RangeUnit } from "../../lib/fee-deal/shapes";
import { formatValue, typedSum } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { Button, FigureField, InlineSelect, MonthField, PartEdit, RangeMenu, SegmentedControl, Switch, TextField, TickMenu, TrackMenu, When, monthText, type PartMark } from "../kit";
import { PriceFigure, partFieldId, signText } from "./figures";
import { bringIntoView } from "./in-view";
import { feeName, perActionWord } from "./words";

const cp = copy.cases.parts;

/** The icon before a part's first word: a minimum's, a maximum's (a percent maximum's too), a link's. */
export const PART_MARK: Partial<Record<PartId, PartMark>> = { min: "min", max: "max", cap: "max", offset: "link", refund: "link" };

/** A part the toolbox added that cannot stand until it has a figure (a bound), a month (a later price) or a fee (an offset). */
export type PendingPart = "min" | "max" | "cap" | "until" | "offset";

/** Where a pending part stands: its fee, its case (null for a slim fee), and the part. */
export interface Pending {
  fee: string;
  case: string | null;
  part: PendingPart;
}

const monthOptions = (words: Record<number, string>) => MONTHS.map((m) => ({ id: String(m), name: words[m]! }));

/** A price on an action, which carries a currency for its sums. */
const pricedIn = (p: Price): p is Extract<Price, { form: "action" | "perUnit" | "perAction" }> => p.form === "action" || p.form === "perUnit" || p.form === "perAction";

/** A word of a part trimmed of the spaces it carries to stand in a sentence. */
const bare = (s: string | undefined) => s?.trim();

/**
 * The parts of one price of the open case, in edit. Each part's figures are the existing boxes (`PriceFigure`); a part's ✕ takes it away
 * (`setPart`), the main price's makes the price free, and a later price's month taken away takes the prices after it with it (`onHoldOn`).
 */
function PriceParts({
  fee,
  caseId,
  side,
  k,
  until,
  parts,
  name,
  deal,
  pending,
  onFee,
  onHoldOn,
  onPendingDone,
}: {
  fee: Fee;
  caseId?: string;
  side: Side;
  k: number;
  until?: MonthKey;
  parts: OpenPart[];
  name: string;
  deal: FeeDeal;
  /** The part asking for its figure, month or fee here, where it asks on this price (the last price of the purchase). */
  pending: PendingPart | null;
  onFee: (f: Fee) => void;
  onHoldOn: (side: Side, k: number) => void;
  onPendingDone: () => void;
}) {
  const at = { side, k, ...(caseId ? { caseId } : {}) };
  const stages = pricesOn(fee, side, caseId);
  const price = stages[k]!.price;
  const label = (field: string) => copy.builder.fieldName(name, field);
  const edit = (fn: (p: Price) => Price) => onFee(editPrice(fee, side, k, fn, caseId));
  const shape = FEE_SHAPES[fee.kind];
  // the price's currency, where the fee may take another, is chosen beside its first sum (a sum per unit's or per action's, else the
  // minimum's), whose box then draws no sign of its own, so the currency shows once; every other sum shows it as its sign
  const chooser =
    pricedIn(price) && (shape.fields[price.form] ?? []).includes("currency") ? (
      <InlineSelect chip label={label(copy.panel.currency)} options={BOUND_CURRENCIES.map((c) => ({ id: c, name: copy.panel.signs[c]! }))} value={price.currency ?? "ILS"} onChange={(v) => v && edit((x) => withCurrency(x, v as BoundCurrency))} />
    ) : null;
  const chooserOn: PartId | null = chooser ? (price.form === "action" ? (parts.some((p) => p.id === "min") ? "min" : parts.some((p) => p.id === "max") ? "max" : null) : price.form) : null;
  const box = (part: PartId, f: PartField, spoken: string, opts: { optional?: boolean } = {}) => (
    <PriceFigure
      key={f.figure}
      fee={fee}
      side={side}
      k={k}
      {...(caseId ? { caseId } : {})}
      figure={f.figure}
      value={f.value}
      sign={f.sign}
      {...(chooserOn === part && f.figure !== "rate" ? { unit: "" } : {})}
      label={label(spoken)}
      {...opts}
      id={partFieldId(fee.id, `${side}${k}-${part}-${f.figure}`)}
      onFee={onFee}
    />
  );
  const quiet = (t: ReactNode) => (t ? <span className="text-muted-foreground">{t}</span> : null);
  const spoken: Record<string, string> = {
    rate: copy.panel.howMuch,
    amount: copy.panel.howMuch,
    min: copy.panel.min,
    max: copy.panel.max,
    cap: copy.panel.cap,
    flat: copy.panel.parts.flat,
    upTo: copy.panel.parts.upTo,
    discount: copy.panel.parts.discount,
    third: copy.panel.parts.third,
    thirdMin: copy.panel.parts.thirdMin,
    thirdMax: copy.panel.parts.thirdMax,
    refund: copy.panel.parts.refund,
  };

  const body = (p: OpenPart): ReactNode => {
    const w = p.words;
    switch (p.id) {
      case "share":
      case "perUnit":
      case "perAction":
        return (
          <>
            {box(p.id, p.fields[0]!, spoken[p.fields[0]!.figure]!)}
            {chooserOn === p.id && chooser}
            {quiet(bare(w.tail))}
          </>
        );
      case "held":
        return price.form === "held" ? (
          <>
            {box(p.id, p.fields[0]!, spoken.rate!)}
            <InlineSelect chip label={label(copy.panel.per)} options={monthOptions(copy.panel.perOptions)} value={String(price.per)} onChange={(v) => v && edit((x) => withMonths(x, "per", Number(v) as Months))} />
            <InlineSelect label={copy.panel.every} options={monthOptions(copy.panel.everyOptions)} value={String(price.every)} onChange={(v) => v && edit((x) => withMonths(x, "every", Number(v) as Months))} />
          </>
        ) : null;
      case "sum":
        return price.form === "sum" ? (
          <>
            {box(p.id, p.fields[0]!, spoken.amount!)}
            <InlineSelect chip label={label(copy.panel.sumEvery)} options={monthOptions(copy.panel.sumEveryOptions)} value={String(price.every)} onChange={(v) => v && edit((x) => withMonths(x, "every", Number(v) as Months))} />
          </>
        ) : null;
      case "discount":
        return (
          <>
            {box(p.id, p.fields[0]!, spoken.discount!)}
            {quiet(bare(cp.discount.tail))}
            {pricedIn(price) && price.discount && <Switch label={cp.discountOnMin} checked={!!price.discount.alsoMin} onChange={(on) => edit((x) => withDiscountOnMin(x, on))} />}
          </>
        );
      case "third":
        return pricedIn(price) && price.third ? (
          <>
            <TextField inline labelHidden label={label(cp.thirdWho)} placeholder={cp.thirdWho} value={price.third.who ?? ""} onChange={(v) => edit((x) => withThirdWho(x, v))} />
            <InlineSelect
              chip
              label={label(cp.thirdForm)}
              options={[{ id: "none", name: cp.thirdNone }, ...(["action", "perUnit", "perAction"] as const).map((f) => ({ id: f, name: copy.panel.forms[f]! }))]}
              value={price.third.price?.form ?? "none"}
              onChange={(v) => v && edit((x) => withThirdForm(x, v === "none" ? null : (v as "action" | "perUnit" | "perAction")))}
            />
            {p.fields.map((f) => (
              <span key={f.figure} className="inline-flex items-center gap-2">
                {f.figure !== "third" && quiet(f.figure === "thirdMin" ? copy.panel.min : copy.panel.max)}
                {box(p.id, f, spoken[f.figure]!, { optional: f.figure !== "third" })}
              </span>
            ))}
          </>
        ) : null;
      case "until":
        return <MonthField value={until ?? null} label={label(copy.panel.until)} tight {...untilRange(stages, k)} onCommit={(m) => onFee(setUntil(fee, side, k, m, caseId))} />;
      case "min":
      case "max":
        return (
          <>
            {box(p.id, p.fields[0]!, spoken[p.id]!, { optional: true })}
            {chooserOn === p.id && chooser}
            {quiet(bare(w.tail))}
          </>
        );
      case "cap":
        return (
          <>
            {box(p.id, p.fields[0]!, spoken.cap!, { optional: true })}
            {quiet(bare(w.tail))}
          </>
        );
      case "flat":
        return (
          <>
            {box(p.id, p.fields[0]!, spoken.flat!)}
            {quiet(bare(perActionWord(fee.kind)))}
            {quiet(copy.panel.upTo[fee.kind] ?? copy.panel.upTo.default)}
            {box(p.id, p.fields[1]!, spoken.upTo!)}
          </>
        );
      case "offset":
        return price.form !== "free" && price.offset ? <OffsetChoice deal={deal} fee={fee} value={price.offset.kind} label={label(cp.offset)} onChange={(kind) => edit((x) => (x.form === "free" ? x : { ...x, offset: { kind } }))} /> : null;
      case "refund":
        return box(p.id, p.fields[0]!, spoken.refund!);
      default:
        return w.quiet ? quiet(bare(w.quiet)) : null;
    }
  };
  // the words a part leads with: an offset's are its choice of fee, said around it
  const leadOf = (p: OpenPart): ReactNode => (p.id === "offset" ? bare(cp.offsetOf.lead) : p.id === "flat" ? bare(cp.flat.lead) : bare(p.words.lead));
  const remove = (p: OpenPart) => {
    if (p.id === "free") return undefined;
    if (p.id === "until") return () => onHoldOn(side, k);
    return () => onFee(setPart(fee, p.id, false, at));
  };
  return (
    <>
      {parts.map((p) => (
        <PartEdit key={p.id} kind={p.kind} mark={PART_MARK[p.id]} lead={leadOf(p)} onRemove={remove(p)} removeLabel={label(dealCases.removePart)}>
          {body(p)}
          {p.id === "offset" && quiet(bare(cp.offsetOf.tail))}
        </PartEdit>
      ))}
      {pending && <PendingEdit fee={fee} caseId={caseId} side={side} k={k} part={pending} deal={deal} name={name} onFee={onFee} onDone={onPendingDone} />}
    </>
  );
}

/** The fee an offset is against: the deal's other fees, else every fee the site names (the reading states it, as method §10.6 says under "What the page states and does not compute"; it reads no figure of it). */
function OffsetChoice({ deal, fee, value, label, onChange }: { deal: FeeDeal; fee: Fee; value: FeeKindId | null; label: string; onChange: (kind: FeeKindId) => void }) {
  const others = [...new Set(deal.fees.filter((f) => f.id !== fee.id).map((f) => f.kind))];
  const kinds = others.length ? others : FEE_KIND_IDS.filter((k) => k !== "own");
  return <InlineSelect chip label={label} all={value === null ? copy.cases.parts.offsetPick : undefined} options={kinds.map((k) => ({ id: k, name: feeName(k) }))} value={value} onChange={(v) => v && onChange(v as FeeKindId)} />;
}

/** A part the toolbox added that asks, where it will stand, for its figure (a bound), its month (a later price) or its fee (an offset). */
function PendingEdit({ fee, caseId, side, k, part, deal, name, onFee, onDone }: { fee: Fee; caseId?: string; side: Side; k: number; part: PendingPart; deal: FeeDeal; name: string; onFee: (f: Fee) => void; onDone: () => void }) {
  const at = { side, k, ...(caseId ? { caseId } : {}) };
  const label = (field: string) => copy.builder.fieldName(name, field);
  const price = pricesOn(fee, side, caseId)[k]!.price;
  // the part asks where it stands: its box takes the focus as it appears (a month's box takes it itself), above a phone's pinned sheet
  useEffect(() => {
    if (part !== "min" && part !== "max" && part !== "cap") return;
    const box = document.getElementById(partFieldId(fee.id, `${part}-pending`));
    box?.focus({ preventScroll: true });
    bringIntoView(box?.closest("[data-lift]"));
  }, [fee.id, part]);
  const cur = pricedIn(price) ? (price.currency ?? "ILS") : "ILS";
  // the bound's box is drawn anew as the bound it now is: the focus goes on to it, where the typing goes on
  const done = (next: Fee, box?: string) => {
    onFee(next);
    onDone();
    if (box)
      requestAnimationFrame(() => {
        const el = document.getElementById(partFieldId(fee.id, box)) as HTMLInputElement | null;
        el?.focus();
        el?.setSelectionRange(el.value.length, el.value.length);
      });
  };
  let body: ReactNode;
  let lead: string | undefined;
  if (part === "until") {
    lead = bare(cp.until);
    body = <MonthField value={null} label={label(copy.panel.until)} tight waits autoFocus {...untilRange(pricesOn(fee, side, caseId), k)} onCommit={(m) => done(setPart(fee, "until", true, { ...at, month: m }))} />;
  } else if (part === "offset") {
    lead = bare(cp.offsetOf.lead);
    body = (
      <>
        <OffsetChoice deal={deal} fee={fee} value={null} label={label(cp.offset)} onChange={(kind) => done(setPart(fee, "offset", true, { ...at, against: kind }))} />
        <span className="text-muted-foreground">{bare(cp.offsetOf.tail)}</span>
      </>
    );
  } else {
    lead = part === "min" ? bare(cp.min) : bare(cp.max);
    const pct = part === "cap";
    const tail = pct ? (copy.price.of[fee.kind] ?? copy.price.of.default) : price.form === "held" ? (price.boundsEvery ? copy.price.per[price.boundsEvery]! : copy.panel.perCharge) : (cp.boundPer[fee.kind] ?? cp.boundPer.default);
    body = (
      <FigureField
        value={null}
        label={label(part === "cap" ? copy.panel.cap : part === "min" ? copy.panel.min : copy.panel.max)}
        unit={pct ? "%" : signText(copy.panel.signs[price.form === "held" ? "ILS" : cur] ?? "₪")}
        sign={pct ? "%" : (copy.panel.signs[cur] ?? "₪")}
        tight
        id={partFieldId(fee.id, `${part}-pending`)}
        words={<span className="text-muted-foreground">{tail}</span>}
        onCommit={(n) => done(setPart(fee, part, true, { ...at, value: n }), `${side}${k}-${part}-${part}`)}
      />
    );
  }
  return (
    <PartEdit kind={part === "offset" ? "link" : part === "until" ? "price" : "bound"} mark={part === "offset" ? "link" : part === "until" ? undefined : PART_MARK[part]} lead={lead} onRemove={onDone} removeLabel={label(dealCases.removePart)}>
      {body}
    </PartEdit>
  );
}

/**
 * The open case's prices in edit, each with its parts: the purchase's (or the only) prices, a later one headed by its first month; then a
 * sale priced apart under its head. `pending`: a part the toolbox added that asks for its figure, month or fee, on the last price.
 */
export function OpenParts({
  fee,
  open,
  deal,
  name,
  pending,
  onFee,
  onHoldOn,
  onPendingDone,
}: {
  fee: Fee;
  open: OpenCase;
  deal: FeeDeal;
  /** The fee's name, in each box's spoken name. */
  name: string;
  pending: PendingPart | null;
  onFee: (f: Fee) => void;
  onHoldOn: (side: Side, k: number, caseId?: string) => void;
  onPendingDone: () => void;
}) {
  const caseId = open.case ?? undefined;
  const side = (s: Side, stages: OpenCase["buy"]) =>
    stages.map((st, j) => {
      const from = j > 0 ? stages[j - 1]!.until : undefined;
      const stageName = from ? `${name}, ${monthText(from)}` : name;
      return (
        <div key={`${s}-${st.k}`} className="flex flex-col gap-2">
          {from && (
            <p className="text-sm font-medium">
              <When iso={from} lead={copy.read.periods.from} />
            </p>
          )}
          <PriceParts
            fee={fee}
            {...(caseId ? { caseId } : {})}
            side={s}
            k={st.k}
            {...(st.until ? { until: st.until } : {})}
            parts={st.parts}
            name={stageName}
            deal={deal}
            pending={s === "buy" && j === stages.length - 1 ? pending : null}
            onFee={onFee}
            onHoldOn={(sd, k) => onHoldOn(sd, k, caseId)}
            onPendingDone={onPendingDone}
          />
        </div>
      );
    });
  return (
    <>
      {side("buy", open.buy)}
      {open.sell && (
        <>
          <p className="text-sm font-medium">{copy.panel.salePrices}</p>
          {side("sell", open.sell)}
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------- a slot's menu

/** A value of the person's own being typed in a list's menu: its name, and for what is bought or held, where it is bought and its currency. */
interface OwnTyped {
  name: string;
  place: "israel" | "abroad";
  currency: BoundCurrency;
}

/**
 * What a slot of the open case opens: a list to tick, "בכל …" one of its values, with a value of the person's own
 * typed under it; a track's name with the switch that makes it the person's; a condition's value; a range's side and top with its unit and
 * the case before it. Each change is made at once.
 */
export function SlotMenu({ edit, fee, caseId, t, top, onFee }: { edit: SlotEdit; fee: Fee; caseId: string; t: number; /** A range's top as the case says it now (its figure, in its state). */ top: SiteValue | null; onFee: (f: Fee) => void }) {
  const [typing, setTyping] = useState<OwnTyped | null>(null);
  const m = copy.cases.slot;
  if (edit.kind === "list") {
    const ticked = edit.any.ticked ? ["any"] : edit.options.filter((o) => o.ticked).map((o) => o.id);
    const toggle = (id: string) => {
      if (id === "any") return onFee(setWhen(fee, caseId, t, "any"));
      const now = ticked.filter((x) => x !== "any");
      const next = now.includes(id) ? now.filter((x) => x !== id) : [...now, id];
      if (next.length) onFee(setWhen(fee, caseId, t, next));
    };
    const b = fee.by?.[t];
    const place = b?.kind === "what" || b?.kind === "held";
    const add = () => {
      const name = typing?.name.trim();
      if (!typing || !name) return;
      const withOwn = place ? addOwnPlace(fee, t, { name, place: typing.place, currency: typing.currency }) : fee;
      const now = ticked.filter((x) => x !== "any");
      onFee(setWhen(withOwn, caseId, t, [...now.filter((x) => x !== name), name]));
      setTyping(null);
    };
    return (
      <div className="flex flex-col gap-3">
        <TickMenu
          title={edit.title}
          options={[...edit.options.map((o) => ({ id: o.id, label: o.words })), { id: "any", label: edit.any.words }]}
          ticked={ticked}
          onToggle={toggle}
          other={{ label: edit.other, onClick: () => setTyping(typing ? null : { name: "", place: "abroad", currency: "USD" }) }}
        />
        {typing && (
          <div className="flex flex-col gap-3 border-t border-border pt-3">
            <TextField label={m.ownName} value={typing.name} onChange={(name) => setTyping({ ...typing, name })} />
            {place && (
              <>
                <SegmentedControl
                  label={m.ownPlace}
                  fit
                  options={[
                    { value: "israel", label: m.israel },
                    { value: "abroad", label: m.abroad },
                  ]}
                  value={typing.place}
                  onChange={(v) => setTyping({ ...typing, place: v as "israel" | "abroad" })}
                />
                <InlineSelect label={m.ownCurrency} options={BOUND_CURRENCIES.map((c) => ({ id: c, name: copy.panel.currencies[c]! }))} value={typing.currency} onChange={(v) => v && setTyping({ ...typing, currency: v as BoundCurrency })} />
              </>
            )}
            <Button variant="outline" className="self-start" disabled={!typing.name.trim()} onClick={add}>
              {copy.cases.add}
            </Button>
          </div>
        )}
      </div>
    );
  }
  if (edit.kind === "track") return <TrackMenu name={edit.name ?? ""} onName={(v) => v.trim() && onFee(setWhen(fee, caseId, t, [v]))} mine={edit.mine} onMine={(on) => onFee(setMine(fee, caseId, on))} />;
  if (edit.kind === "own") return <TextField label={edit.title} value={edit.name ?? ""} onChange={(v) => v.trim() && onFee(setWhen(fee, caseId, t, [v]))} />;
  // a range: "עד" its top, or "מעל" the top of the case before it; the number is the case's own top, or the last top where it is above it
  const b = fee.by![t]!;
  const tops = "tops" in b ? b.tops : [];
  const over = edit.upTo === null;
  const unitChoice = edit.units.length > 1 ? <InlineSelect chip label={m.unit} options={edit.units.map((u) => ({ id: u.unit, name: u.words }))} value={edit.unit} onChange={(v) => v && onFee(setRangeUnit(fee, t, v as RangeUnit))} /> : undefined;
  const sign = edit.units.find((u) => u.unit === edit.unit)?.words ?? "";
  // three controls side by side: the side, the number in a box of the usual size, and its unit, a choice where there is one
  return (
    <RangeMenu
      title={edit.title}
      side={over ? "over" : "upTo"}
      onSide={(s) => onFee(setStep(fee, caseId, t, s === "over" ? null : tops.at(-1)!.v))}
      figure={<FigureField value={top} label={edit.title} unit={unitChoice ? undefined : sign} sign={sign} wide onCommit={(n) => onFee(over ? setTop(fee, t, tops.length - 1, n) : setStep(fee, caseId, t, n))} />}
      unit={unitChoice}
      before={edit.before ? <WhenText words={edit.before} /> : undefined}
    />
  );
}

/** A case's value for one thing in words: a range's step with its top, else its words. */
export function WhenText({ words }: { words: { text?: string; lead?: string; figure?: SiteValue } }) {
  if (words.figure)
    return (
      <>
        {words.lead}
        <bdi dir="ltr">{numText(words.figure)}</bdi>
      </>
    );
  return <>{words.text}</>;
}

/** A range's top as plain words, a whole sum without cents ("100 $", "200 יחידות"), for a menu's line and a case's spoken name. */
export const numText = (v: SiteValue): string => typedSum(v.value as number, v.unit) ?? formatValue(v.value as number, v.unit);
