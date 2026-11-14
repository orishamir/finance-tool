// The case open in place (method §10.6, `panel`'s `open`): each price of the case with its parts in edit (part-edit.tsx), a later price
// right after the month the price before it ends, and a sale priced apart under its own head; a part the toolbox added that still needs its figure, its month or
// its fee, asking for it on the price it goes on; and the menu a slot of the case opens (`slotEdit`), which the page holds open.
import { useState } from "react";
import { feeDeal as copy } from "../../copy";
import type { OpenCase, OpenPart, OpenPending, OpenStage } from "../../lib/fee-deal/panel";
import type { SlotEdit } from "../../lib/fee-deal/things";
import { addOwnPlace, setMine, setRangeUnit, setStep, setTop, setWhen } from "../../lib/fee-deal/edits/case";
import { editPrice } from "../../lib/fee-deal/edits/stage";
import { withCurrency } from "../../lib/fee-deal/edits/price";
import { BOUND_CURRENCIES, namesPlaces, pricesOn, type BoundCurrency, type Fee, type FeeDeal, type Price, type Side } from "../../lib/fee-deal/model";
import { setPart } from "../../lib/fee-deal/offers/parts";
import { SPOKEN } from "../../lib/fee-deal/part-words";
import type { RangeUnit } from "../../lib/fee-deal/offers/conditions";
import { formatValue } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { FigureField, InlineSelect, RangeMenu, TextField, TickMenu, TrackMenu, cx, monthText } from "../kit";
import { PriceFigure, partFieldId } from "./figures";
import { NEW_OWN, OwnValueForm, type OwnTyped } from "./own-value";
import { PartLine, PendingEdit, type PartPlace } from "./part-edit";
import type { ChargedForm } from "../../lib/fee-deal/offers/capacity";

/**
 * The parts of one price of the open case, in edit (`PartLine`). Each part's figures are the existing boxes (`PriceFigure`); a part's bin
 * takes it away (`setPart`), the main price's makes the price free, and a later price's month taken away takes the prices after it with
 * it (`onHoldOn`). The price's currency, where the fee may take another, is chosen beside the part the panel marks (`stage.chooser`),
 * whose box then draws no sign of its own, so the currency shows once; every other sum shows it as its sign.
 */
function PriceParts({
  fee,
  caseId,
  side,
  stage,
  name,
  deal,
  later,
  pending,
  onFee,
  onHoldOn,
  onPendingDone,
}: {
  fee: Fee;
  caseId?: string;
  side: Side;
  stage: OpenStage;
  name: string;
  deal: FeeDeal;
  /** The form a price added after a free one takes (`OpenCase.later`). */
  later: ChargedForm;
  /** The part asking for its figure, month or fee here, where it asks on this price (the toolbox's). */
  pending: OpenPending | null;
  onFee: (f: Fee) => void;
  onHoldOn: (side: Side, k: number) => void;
  onPendingDone: () => void;
}) {
  const { k, until, parts } = stage;
  const stages = pricesOn(fee, side, caseId);
  const price = stages[k]!.price;
  const label = (field: string) => copy.builder.fieldName(name, field);
  const edit = (fn: (p: Price) => Price) => onFee(editPrice(fee, side, k, fn, caseId));
  const chooser = stage.chooser ? (
    <InlineSelect chip plain={stage.chooser.plain} label={label(copy.panel.currency)} options={BOUND_CURRENCIES.map((c) => ({ id: c, name: copy.panel.signs[c]! }))} value={stage.chooser.currency} onChange={(v) => v && edit((x) => withCurrency(x, v as BoundCurrency))} />
  ) : null;
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
        {...(f.bare ? { unit: "" } : {})}
        label={label(SPOKEN[f.figure])}
        {...opts}
        id={partFieldId(fee.id, `${side}${k}-${part}-${f.figure}`)}
        onFee={onFee}
      />
    ),
  };
  const remove = (p: OpenPart) => {
    if (p.remove === "hold") return () => onHoldOn(side, k);
    if (p.remove === "part") return () => onFee(setPart(fee, p.id, false, { side, k, ...(caseId ? { caseId } : {}) }));
    return undefined;
  };
  return (
    <>
      {parts.map((p) => (
        <PartLine key={p.id} part={p} at={at} onRemove={remove(p)} />
      ))}
      {pending && <PendingEdit fee={fee} caseId={caseId} pending={pending} deal={deal} name={name} later={later} onFee={onFee} onDone={onPendingDone} />}
    </>
  );
}

/**
 * The open case's prices in edit, each with its parts: the purchase's (or the only) prices, a later one after the part that says the month
 * the price before it ends ("לזמן מוגבל, עד 07.2027"), which is its first month, so no head repeats it, and a line parts them;
 * then a sale priced apart under its head. A part the toolbox added that asks for its figure, month or fee asks on the price it goes on
 * (`open.pending`).
 */
export function OpenParts({
  fee,
  open,
  deal,
  name,
  onFee,
  onHoldOn,
  onPendingDone,
}: {
  fee: Fee;
  open: OpenCase;
  deal: FeeDeal;
  /** The fee's name, in each box's spoken name. */
  name: string;
  onFee: (f: Fee) => void;
  onHoldOn: (side: Side, k: number, caseId: string | undefined, after: ChargedForm) => void;
  onPendingDone: () => void;
}) {
  const caseId = open.case ?? undefined;
  const side = (s: Side, stages: readonly OpenStage[]) =>
    stages.map((st, j) => {
      const from = j > 0 ? stages[j - 1]!.until : undefined;
      const stageName = from ? `${name}, ${monthText(from)}` : name;
      return (
        <div key={`${s}-${st.k}`} className={cx("flex flex-col gap-2", from && "border-t border-border pt-2")}>
          <PriceParts
            fee={fee}
            {...(caseId ? { caseId } : {})}
            side={s}
            stage={st}
            name={stageName}
            deal={deal}
            later={open.later}
            pending={s === "buy" && open.pending?.k === st.k ? open.pending : null}
            onFee={onFee}
            onHoldOn={(sd, k) => onHoldOn(sd, k, caseId, open.later)}
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
    const place = !!b && namesPlaces(b);
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
          other={{ label: edit.other, onClick: () => setTyping(typing ? null : NEW_OWN) }}
        />
        {typing && (
          <div className="border-t border-border pt-3">
            <OwnValueForm value={typing} nameLabel={m.ownName} place={place} add={copy.cases.add} onChange={setTyping} onAdd={add} />
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

/** A case's value for one thing as plain words: a range's step with its top, else its words. */
export const whenText = (words: { text?: string; lead?: string; figure?: SiteValue }): string => (words.figure ? `${words.lead ?? ""}${numText(words.figure)}` : (words.text ?? ""));

/** A range's top as plain words ("100 $", "200 יחידות"), for a menu's line and a case's spoken name. */
export const numText = (v: SiteValue): string => formatValue(v.value as number, v.unit);
