// The case open in place (method §10.6, `panel`'s `open`): each price of the case with its parts in edit (part-edit.tsx), in time order
// with a divider between two prices saying the month the later starts (F-110), and a sale priced apart under its own head; a part the
// toolbox added that still needs its figure, its fee or its month, asking for it on the price it goes on; and the menu a slot of the case
// opens (`slotEdit`), which the page holds open.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import type { OpenCase, OpenPart, OpenPending, OpenStage } from "../../lib/fee-deal/panel";
import type { SlotEdit } from "../../lib/fee-deal/things";
import { addOwnPlace, nameTaken, setMine, setRangeUnit, setStep, setTop, setWhen } from "../../lib/fee-deal/edits/case";
import { editPrice, moveChange, setSaleApart } from "../../lib/fee-deal/edits/stage";
import { withCurrency } from "../../lib/fee-deal/edits/price";
import { BOUND_CURRENCIES, namesPlaces, pricesOn, splitRange, untilRange, type BoundCurrency, type Fee, type FeeDeal, type Price, type Side } from "../../lib/fee-deal/model";
import { setPart, type PartId } from "../../lib/fee-deal/offers/parts";
import { SPOKEN } from "../../lib/fee-deal/part-words";
import type { RangeUnit } from "../../lib/fee-deal/offers/conditions";
import { amountWords, fmt, formatValue } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { ChangeDivider, FigureField, InlineSelect, MonthField, RangeMenu, RemoveButton, TextField, TickMenu, TrackMenu, monthText } from "../kit";
import { bringIntoView } from "./in-view";
import { PriceFigure, partFieldId, partPlaceId } from "./figures";
import { NEW_OWN, OwnValueForm, type OwnTyped } from "./own-value";
import { PartLine, PendingEdit, type PartPlace, type PendingHands } from "./part-edit";

/**
 * The parts of one price of the open case, in edit (`PartLine`). Each part's figures are the existing boxes (`PriceFigure`); a part's bin
 * takes it away (`setPart`), the main price's makes the price free. The price's currency, where the fee may take another, is chosen beside the part the panel marks (`stage.chooser`),
 * whose box then draws no sign of its own, so the currency shows once; every other sum shows it as its sign.
 */
function PriceParts({
  fee,
  caseId,
  side,
  stage,
  name,
  deal,
  pending,
  onFee,
  pendingHands,
  grip,
}: {
  fee: Fee;
  caseId?: string;
  side: Side;
  stage: OpenStage;
  name: string;
  deal: FeeDeal;
  /** The part asking for its figure or fee here, where it asks on this price (the toolbox's). */
  pending: OpenPending | null;
  onFee: (f: Fee) => void;
  pendingHands: PendingHands;
  grip?: PartGrip;
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
        id={partFieldId(fee.id, `${partPlaceId(side, k, part)}-${f.figure}`)}
        onFee={onFee}
      />
    ),
  };
  const remove = (p: OpenPart) => {
    if (p.remove === "part") return () => onFee(setPart(fee, p.id, false, { side, k, ...(caseId ? { caseId } : {}) }));
    return undefined;
  };
  return (
    <>
      {parts.map((p) => (
        <PartLine key={p.id} part={p} at={at} onRemove={remove(p)} grip={grip?.(p.id, side, k)} />
      ))}
      {pending &&
        (pending.ask === "month" ? (
          <AskChange key={pending.part} fee={fee} caseId={caseId} pending={pending} name={name} onFee={onFee} hands={pendingHands} />
        ) : (
          <PendingEdit key={pending.part} fee={fee} caseId={caseId} pending={pending} deal={deal} name={name} onFee={onFee} hands={pendingHands} />
        ))}
    </>
  );
}

/** A part's grip in the open case, by its id and the price it is on; null where it has none. */
export type PartGrip = (part: PartId, side: Side, k: number) => ReactNode;

/**
 * The open case's prices in edit, each with its parts, in time order: between two prices a divider with the month the later starts, typed
 * in place and kept between its neighbours (`moveChange`), and its bin, which takes the change away (`onRemoveChange`, kept for the undo);
 * then a sale priced apart under its head, the same way. A press or the focus in one of the purchase's prices makes it the one the toolbox
 * adds to (`onEditing`). A part the toolbox added that asks for its figure, fee or month asks on the price it goes on (`open.pending`), the
 * month as a divider under that price (`AskChange`).
 */
export function OpenParts({
  fee,
  open,
  deal,
  name,
  onFee,
  onRemoveChange,
  onEditing,
  pendingHands,
  grip,
}: {
  fee: Fee;
  open: OpenCase;
  deal: FeeDeal;
  /** The fee's name, in each box's spoken name. */
  name: string;
  onFee: (f: Fee) => void;
  onRemoveChange: (side: Side, k: number, caseId: string | undefined) => void;
  /** The person is in one of the purchase's prices (its parts took the focus or a press), where there are several: the toolbox adds to it. */
  onEditing: (k: number, caseId: string | undefined, side: Side) => void;
  pendingHands: PendingHands;
  /** A part's grip, which lifts it onto another case or fee, or into the bin (a part of the purchase's first price; none elsewhere). */
  grip?: PartGrip;
}) {
  const caseId = open.case ?? undefined;
  const c = copy.panel.change;
  const side = (s: Side, stages: readonly OpenStage[]) => (
    <>
      {stages.map((st, j) => {
        const from = j > 0 ? stages[j - 1]!.until : undefined;
        const stageName = from ? `${name}, ${monthText(from)}` : name;
        return (
          <div key={`${s}-${st.k}`} className="flex flex-col gap-2">
            {j > 0 && (
              <ChangeDivider
                lead={c.from}
                month={<MonthField value={from ?? null} label={copy.builder.fieldName(name, c.month)} tight {...untilRange(pricesOn(fee, s, caseId), j - 1)} onCommit={(m) => onFee(moveChange(fee, s, j - 1, m, caseId))} />}
                removeLabel={copy.builder.fieldName(stageName, c.remove)}
                onRemove={() => onRemoveChange(s, j - 1, caseId)}
              />
            )}
            <div className="flex flex-col gap-2" {...(from ? { "data-stage-from": `${s}:${from}` } : {})} {...(stages.length > 1 || open.sell ? { onFocusCapture: () => onEditing(st.k, caseId, s), onPointerDownCapture: () => onEditing(st.k, caseId, s) } : {})}>
              <PriceParts fee={fee} {...(caseId ? { caseId } : {})} side={s} stage={st} name={stageName} deal={deal} pending={open.pending?.side === s && open.pending.k === st.k ? open.pending : null} onFee={onFee} pendingHands={pendingHands} {...(grip ? { grip } : {})} />
            </div>
          </div>
        );
      })}
    </>
  );
  return (
    <>
      {open.sell && <p className="text-sm font-medium">{copy.panel.buyPrices}</p>}
      {side("buy", open.buy)}
      {open.sell && (
        <>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{copy.panel.salePrices}</p>
            <RemoveButton label={copy.panel.saleRemove} tabIndex={0} onRemove={() => onFee(setSaleApart(fee, false, caseId))} />
          </div>
          {side("sell", open.sell)}
        </>
      )}
    </>
  );
}

/**
 * The month a price changes from, asked on the price the toolbox acts on (its line "+ התאריך", `OpenPending.ask` "month"): under that price
 * a divider with "מ־" and an empty month box, which takes the focus as it appears. A month committed (Enter, the picker, or leaving the
 * box) splits that price in two there, the later a copy the person then changes (`splitAt`), and the focus goes to the later price's first
 * box. The box takes only the price's own months (`splitRange`), so a month the prices change in already is refused at it. Escape or the
 * bin closes it and nothing changes, the focus back on the toolbox's line.
 */
function AskChange({ fee, caseId, pending, name, onFee, hands }: { fee: Fee; caseId: string | undefined; pending: OpenPending; name: string; onFee: (f: Fee) => void; hands: PendingHands }) {
  const c = copy.panel.change;
  const { side, k } = pending;
  const root = useRef<HTMLDivElement>(null);
  const [fresh] = useState(hands.fresh);
  useEffect(() => {
    hands.onShown();
    if (!fresh) return;
    root.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
    bringIntoView(root.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cancel = () => {
    hands.onDone();
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-part="${pending.part}"]`)?.focus({ preventScroll: true }));
  };
  const add = (month: string) => {
    onFee(setPart(fee, pending.part, true, { side, month, ...(caseId ? { caseId } : {}) }));
    hands.onDone();
    requestAnimationFrame(() => {
      // the later price is drawn anew under its divider: the fee's block is found by the fee
      const li = document.querySelector(`li[data-fee="${CSS.escape(fee.id)}"]`);
      const box = li?.querySelector<HTMLInputElement>(`[data-stage-from="${side}:${month}"] input[data-figure]`);
      if (!box) return;
      box.focus({ preventScroll: true });
      box.select();
      bringIntoView(box.closest<HTMLElement>("[data-stage-from]"));
    });
  };
  return (
    <div
      ref={root}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || e.defaultPrevented) return;
        e.preventDefault();
        e.stopPropagation();
        cancel();
      }}
    >
      <ChangeDivider
        lead={c.from}
        month={<MonthField value={null} label={copy.builder.fieldName(name, c.month)} tight waits {...splitRange(pricesOn(fee, side, caseId), k)} onCommit={add} />}
        removeLabel={copy.builder.fieldName(name, c.remove)}
        onRemove={cancel}
      />
    </div>
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
      // a name the list has already, by its id or its words, is refused (the form says so)
      if (!typing || !name || nameTaken(edit.options.flatMap((o) => [o.id, o.words]), name)) return;
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
            <OwnValueForm value={typing} nameLabel={m.ownName} place={place} add={copy.cases.add} onChange={setTyping} onAdd={add} taken={(name) => nameTaken(edit.options.flatMap((o) => [o.id, o.words]), name)} />
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
  // the last case's top moves between the top before it and none; any other case's top splits its step where it falls (`setStep`)
  const low = over ? (tops.at(-2)?.v ?? 0) : 0;
  const refused = (n: number) => (n > low ? null : copy.cases.stepTopRange(fmt.number(low), null));
  // two controls side by side: the side, and the number in a box of the usual size with its unit after it, a choice where there is one
  return (
    <RangeMenu
      title={edit.title}
      side={over ? "over" : "upTo"}
      onSide={(s) => onFee(setStep(fee, caseId, t, s === "over" ? null : tops.at(-1)!.v))}
      figure={<FigureField value={top} label={edit.title} unit={unitChoice ?? sign} sign={sign} wide validate={refused} onCommit={(n) => onFee(over ? setTop(fee, t, tops.length - 1, n) : setStep(fee, caseId, t, n))} />}
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

/** A range's top as plain words ("100 $", "200 יחידות"), for a menu's line, a band's step and a case's spoken name: isolated, never wrapped apart (`amountWords`). */
export const numText = (v: SiteValue): string => amountWords(formatValue(v.value as number, v.unit));
