// The case open in place (method §10.6, `panel`'s `open`): each price of the case with its parts in edit (part-edit.tsx), a later price
// headed by its first month and a sale priced apart under its own head; a part the toolbox added that still needs its figure, its month or
// its fee, asking for it where it will stand; and the menu a slot of the case opens (`slotEdit`), which the page holds open.
import { useState } from "react";
import { feeDeal as copy } from "../../copy";
import type { OpenCase, OpenPart, SlotEdit } from "../../lib/fee-deal/builder";
import { addOwnPlace, editPrice, setMine, setRangeUnit, setStep, setTop, setWhen, withCurrency, type Side } from "../../lib/fee-deal/edit";
import { anySourced, BOUND_CURRENCIES, pricesOn, type BoundCurrency, type Fee, type FeeDeal, type MonthKey, type Price } from "../../lib/fee-deal/model";
import { hasCurrency } from "../../lib/fee-deal/offers/capabilities";
import { setPart, type PartId } from "../../lib/fee-deal/offers/parts";
import { FEE_SHAPES, type RangeUnit } from "../../lib/fee-deal/shapes";
import { formatValue } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { Button, FigureField, InlineSelect, RangeMenu, SegmentedControl, TextField, TickMenu, TrackMenu, When, monthText } from "../kit";
import { PriceFigure, partFieldId } from "./figures";
import { PartLine, PendingEdit, SPOKEN, type PartPlace, type PendingPart } from "./part-edit";

/**
 * The parts of one price of the open case, in edit (`PartLine`). Each part's figures are the existing boxes (`PriceFigure`); a part's ✕
 * takes it away (`setPart`), the main price's makes the price free, and a later price's month taken away takes the prices after it with
 * it (`onHoldOn`).
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
  const stages = pricesOn(fee, side, caseId);
  const price = stages[k]!.price;
  const label = (field: string) => copy.builder.fieldName(name, field);
  const edit = (fn: (p: Price) => Price) => onFee(editPrice(fee, side, k, fn, caseId));
  // the price's currency, where the fee may take another, is chosen beside its first sum (a sum per unit's or per action's, else the
  // minimum's), whose box then draws no sign of its own, so the currency shows once; every other sum shows it as its sign. The chip is plain
  // while the price still holds a figure a template filled (a change of currency makes the whole price the person's, `withCurrency`)
  const chooser =
    hasCurrency(price) && (FEE_SHAPES[fee.kind].fields[price.form] ?? []).includes("currency") ? (
      <InlineSelect chip plain={anySourced(price)} label={label(copy.panel.currency)} options={BOUND_CURRENCIES.map((c) => ({ id: c, name: copy.panel.signs[c]! }))} value={price.currency ?? "ILS"} onChange={(v) => v && edit((x) => withCurrency(x, v as BoundCurrency))} />
    ) : null;
  const chooserOn: PartId | null = chooser ? (price.form === "action" ? (parts.some((p) => p.id === "min") ? "min" : parts.some((p) => p.id === "max") ? "max" : null) : price.form) : null;
  const at: PartPlace = {
    fee,
    ...(caseId ? { caseId } : {}),
    side,
    k,
    ...(until ? { until } : {}),
    stages,
    price,
    deal,
    label,
    edit,
    onFee,
    chooser,
    chooserOn,
    box: (part, f, opts = {}) => (
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
        label={label(SPOKEN[f.figure])}
        {...opts}
        id={partFieldId(fee.id, `${side}${k}-${part}-${f.figure}`)}
        onFee={onFee}
      />
    ),
  };
  const remove = (p: OpenPart) => {
    if (p.id === "free") return undefined;
    if (p.id === "until") return () => onHoldOn(side, k);
    return () => onFee(setPart(fee, p.id, false, { side, k, ...(caseId ? { caseId } : {}) }));
  };
  return (
    <>
      {parts.map((p) => (
        <PartLine key={p.id} part={p} at={at} onRemove={remove(p)} />
      ))}
      {pending && <PendingEdit fee={fee} caseId={caseId} side={side} k={k} part={pending} deal={deal} name={name} onFee={onFee} onDone={onPendingDone} />}
    </>
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

/** A range's top as plain words ("100 $", "200 יחידות"), for a menu's line and a case's spoken name. */
export const numText = (v: SiteValue): string => formatValue(v.value as number, v.unit);
