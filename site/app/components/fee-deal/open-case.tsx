// The case open in place (method §10.6, `panel`'s `open`): each price of the case with its parts in edit (part-edit.tsx), in time order
// with a divider between two prices saying the month the later starts (F-110), and a sale priced apart under its own head; while a card
// from the toolbox is held or carried, at each place it can go the landing copy of what its tap would put there, in the very spot and room
// it would take (places.ts, the kit's `Landing`); a part the toolbox added that still needs its figure, its fee or its month, asking for it
// where it goes; and the menu a slot of the case opens (`slotEdit`), which the page holds open.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import { landedParts, landedPending, type OpenCase, type OpenPart, type OpenPending, type OpenStage } from "../../lib/fee-deal/panel";
import type { SlotEdit } from "../../lib/fee-deal/things";
import { addOwnPlace, nameTaken, setMine, setRangeUnit, setStep, setTop, setWhen } from "../../lib/fee-deal/edits/case";
import { editPrice, moveChange, setSaleApart } from "../../lib/fee-deal/edits/stage";
import { withCurrency } from "../../lib/fee-deal/edits/price";
import { BOUND_CURRENCIES, namesPlaces, pricedOf, pricesOn, untilRange, type BoundCurrency, type Fee, type FeeDeal, type Price, type Side } from "../../lib/fee-deal/model";
import { setPart, type PartId } from "../../lib/fee-deal/offers/parts";
import { partAt, placeWords, samePlace, type Place } from "../../lib/fee-deal/places";
import { SPOKEN } from "../../lib/fee-deal/part-words";
import type { RangeUnit } from "../../lib/fee-deal/offers/conditions";
import { amountWords, fmt, formatValue } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { ChangeDivider, DropZone, FigureField, GripRoom, InlineSelect, MonthField, RangeMenu, RemoveButton, TextField, TickMenu, TrackMenu, monthText, useCarried, type Landing } from "../kit";
import { bringIntoView } from "./in-view";
import { PriceFigure, partFieldId, partPlaceId } from "./figures";
import { NEW_OWN, OwnValueForm, type OwnTyped } from "./own-value";
import { PartLine, PendingEdit, PendingLanding, type PartPlace, type PendingHands } from "./part-edit";

/**
 * Where one price's parts stand and what they edit (part-edit.tsx `PartPlace`): price `stage.k` on `side` of `fee`'s case `caseId`, its
 * boxes named for `name`, their ids ending in `tail` (a landing copy's own, so no box of it shares an id with the part once it is there).
 * The price's currency, where the fee may take another, is chosen beside the part the panel marks (`stage.chooser`), whose box then draws
 * no sign of its own, so the currency shows once; every other sum shows it as its sign.
 */
function partPlace(fee: Fee, caseId: string | undefined, side: Side, stage: OpenStage, name: string, deal: FeeDeal, onFee: (f: Fee) => void, tail = ""): PartPlace {
  const { k, until } = stage;
  const stages = pricesOn(fee, side, caseId);
  const price = stages[k]!.price;
  const label = (field: string) => copy.builder.fieldName(name, field);
  const edit = (fn: (p: Price) => Price) => onFee(editPrice(fee, side, k, fn, caseId));
  const chooser = stage.chooser ? (
    <InlineSelect chip plain={stage.chooser.plain} label={label(copy.panel.currency)} options={BOUND_CURRENCIES.map((c) => ({ id: c, name: copy.panel.signs[c]! }))} value={stage.chooser.currency} onChange={(v) => v && edit((x) => withCurrency(x, v as BoundCurrency))} />
  ) : null;
  return {
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
        id={partFieldId(fee.id, `${partPlaceId(side, k, part)}-${f.figure}${tail}`)}
        onFee={onFee}
      />
    ),
  };
}

/** The open case as a toolbox card's tap at a place would leave it (`PlaceHands.lands`): the fee then, and its open case then. */
export interface Landed {
  fee: Fee;
  open: OpenCase;
}

/** A place's landing copy while a card can go there: how it is drawn (the button that adds it, or a carried card's mark), and what lands. */
interface Land extends Landed {
  mark: Landing;
}

/** The prices on a side of an open case. */
const stagesOn = (open: OpenCase, side: Side): readonly OpenStage[] => (side === "sell" ? (open.sell ?? []) : open.buy);

/**
 * The parts of one price of the open case, in edit (`PartLine`). Each part's figures are the existing boxes (`PriceFigure`); a part's bin
 * takes it away (`setPart`), and the charge's bin makes the price free through the page (`onRemoveCharge`, kept for the undo). While a
 * toolbox card can go on the price (`landing`), its parts are those the card's tap would leave there (`landedParts`): each it has now as it
 * is, the part the tap puts on as its landing copy in its place among them, a part the tap takes away (a free price's "חינם") gone until
 * the card is let go; and the part asking here, the one the tap would leave asking (`landedPending`).
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
  onRemoveCharge,
  pendingHands,
  grip,
  landing,
}: {
  fee: Fee;
  caseId?: string;
  side: Side;
  stage: OpenStage;
  name: string;
  deal: FeeDeal;
  /** The part asking for what it needs here, where it was added on this price. */
  pending: OpenPending | null;
  onFee: (f: Fee) => void;
  onRemoveCharge: () => void;
  pendingHands: PendingHands;
  grip?: PartGrip;
  /** The landing copy of what a held or carried toolbox card would put on this price. */
  landing: Land | null;
}) {
  const { k } = stage;
  const at = partPlace(fee, caseId, side, stage, name, deal, onFee);
  const remove = (p: OpenPart) => {
    if (p.remove === "part") return () => onFee(setPart(fee, p.id, false, { side, k, ...(caseId ? { caseId } : {}) }));
    if (p.remove === "charge") return onRemoveCharge;
    return undefined;
  };
  const after = landing ? stagesOn(landing.open, side).find((s) => s.k === k) : undefined;
  const place: Place = { on: "price", side, k };
  const asking = (p: OpenPending | null) => (p && samePlace(p.place, place) ? p : null);
  const parts = landing && after ? landedParts(stage, after) : stage.parts.map((part) => ({ part, lands: false }));
  const ask = landing ? landedPending(pending, asking(landing.open.pending)) : pending && { pending, lands: false };
  // a landing copy stands where the part will, as the price will be once it is there: its boxes, its currency chooser, its room
  const landAt = landing && after ? partPlace(landing.fee, caseId, side, after, name, deal, () => undefined, "-landing") : null;
  return (
    <>
      {parts.map(({ part: p, lands }) =>
        lands && landing && landAt ? (
          <PartLine key={p.id} part={p} at={landAt} onRemove={p.remove ? () => undefined : undefined} {...(grip?.(p.id, side, k) ? { grip: <GripRoom /> } : {})} landing={landing.mark} />
        ) : (
          <PartLine key={p.id} part={p} at={at} onRemove={remove(p)} grip={grip?.(p.id, side, k)} />
        ),
      )}
      {ask &&
        (ask.lands && landing ? (
          <PendingLanding key={`${ask.pending.part}-landing`} fee={fee} {...(caseId ? { caseId } : {})} pending={ask.pending} deal={deal} name={name} landing={landing.mark} />
        ) : (
          <AskPart key={ask.pending.part} fee={fee} caseId={caseId} pending={ask.pending} deal={deal} name={name} onFee={onFee} hands={pendingHands} />
        ))}
    </>
  );
}

/** A part's grip in the open case, by its id and the price it is on; null where it has none. */
export type PartGrip = (part: PartId, side: Side, k: number) => ReactNode;

/**
 * Where the open case's places take toolbox cards (places.ts): the card held, its words for its copies' spoken names, and its places, each
 * drawn with the card's landing copy, whose tap adds it there (`onPlace`); a card carried by the pointer, which each place that takes it
 * (`takes`) shows by the same copy, raised while the card is over it, and takes where it is let go (`onDrop`); and what lands at a place
 * (`lands`: the open case as the card's tap there would leave it; null where it changes no price there).
 */
export interface PlaceHands {
  held: { card: string; words: string; places: readonly Place[] } | null;
  onPlace: (place: Place) => void;
  takes: (item: string, place: Place) => boolean;
  onDrop: (item: string, place: Place) => void;
  lands: (item: string, place: Place) => Landed | null;
}

/**
 * A place of the open case, as a drop zone for a carried card (drawing no frame: the card's landing copy shows it takes it), around what
 * `children` draws with the place's landing copy (`land`): while a card is carried, its mark where the place takes it, raised while it is
 * over the place; else the held card's button, where the place takes that.
 */
function PlaceZone({ place, hands, label, children }: { place: Place; hands: PlaceHands; label: string; children: (land: Land | null) => ReactNode }) {
  const held = hands.held?.places.some((p) => samePlace(p, place)) ? hands.held : null;
  // while a card is carried, the places show the carried card's copy alone, never the held card's (the page lets the held card go)
  const carried = useCarried();
  return (
    <DropZone accepts={(it) => hands.takes(it, place)} onDrop={(it) => hands.onDrop(it, place)}>
      {({ takes, over }) => {
        const item = takes ? carried : held && carried === null ? held.card : null;
        const landed = item ? hands.lands(item, place) : null;
        return children(landed && { ...landed, mark: takes ? { over } : { label, onAdd: () => hands.onPlace(place) } });
      }}
    </DropZone>
  );
}

/**
 * The open case's prices in edit, each with its parts, in time order: between two prices a divider with the month the later starts, typed
 * in place and kept between its neighbours (`moveChange`), and its bin, which takes the change away (`onRemoveChange`, kept for the undo);
 * then a sale priced apart under its head, the same way. Each price is a place a toolbox card can go, and so is each side's prices where
 * the sale is priced apart (the month a price changes from), its landing copy at the foot of the side's prices (`places`). A part the
 * toolbox added that asks for its figure, fee or month asks at the place it was added (`open.pending`, by its place's kind): on its price,
 * at the foot of its side's prices, or at the foot of the case (`AskPart`).
 */
export function OpenParts({
  fee,
  open,
  deal,
  name,
  onFee,
  onRemoveChange,
  onRemoveCharge,
  places,
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
  /** A price's charge taken away by its bin: the price free, kept for the undo. */
  onRemoveCharge: (side: Side, k: number, caseId: string | undefined) => void;
  places: PlaceHands;
  pendingHands: PendingHands;
  /** A part's grip, which lifts it onto another case or fee, or into the bin (a part of the purchase's first price; none elsewhere). */
  grip?: PartGrip;
}) {
  const caseId = open.case ?? undefined;
  const c = copy.panel.change;
  const priced = pricedOf(fee, caseId);
  // the part asking for what it needs, at the place it was added: a price, the foot of a side's prices, the foot of the case
  const waitingAt = (place: Place): OpenPending | null => (open.pending && samePlace(open.pending.place, place) ? open.pending : null);
  // what asks at the foot of a side's prices or of the case: the part waiting there, or, while a card can go there, what its tap leaves there
  const asking = (place: Place, land: Land | null = null) => {
    const now = waitingAt(place);
    const w = land ? landedPending(now, land.open.pending && samePlace(land.open.pending.place, place) ? land.open.pending : null) : now && { pending: now, lands: false };
    if (!w) return null;
    if (w.lands && land) return <AskLanding key={`${w.pending.part}-landing`} fee={fee} caseId={caseId} pending={w.pending} deal={deal} name={name} landing={land.mark} />;
    return <AskPart key={w.pending.part} fee={fee} caseId={caseId} pending={w.pending} deal={deal} name={name} onFee={onFee} hands={pendingHands} />;
  };
  const addLabel = (place: Place) => copy.cases.addHere.replace("{card}", places.held?.words ?? "").replace("{place}", placeWords(priced, place, !open.case));
  const side = (s: Side, stages: readonly OpenStage[], sideLand: Land | null = null) => (
    <>
      {stages.map((st, j) => {
        const from = j > 0 ? stages[j - 1]!.until : undefined;
        const stageName = from ? `${name}, ${monthText(from)}` : name;
        const place: Place = { on: "price", side: s, k: st.k };
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
            <PlaceZone place={place} hands={places} label={addLabel(place)}>
              {(land) => (
                <div className="flex items-center gap-3" {...(from ? { "data-stage-from": `${s}:${from}` } : {})}>
                  <div className="flex min-w-0 flex-col gap-2">
                    <PriceParts fee={fee} {...(caseId ? { caseId } : {})} side={s} stage={st} name={stageName} deal={deal} pending={waitingAt(place)} onFee={onFee} onRemoveCharge={() => onRemoveCharge(s, st.k, caseId)} pendingHands={pendingHands} {...(grip ? { grip } : {})} landing={land} />
                  </div>
                </div>
              )}
            </PlaceZone>
          </div>
        );
      })}
      {/* a part that goes on the side's prices as a whole (the month a price changes from), asked at their foot, where its landing copy stands too */}
      {asking({ on: "side", side: s }, sideLand)}
    </>
  );
  // a side's prices under its head, where the sale is priced apart: the side is a place for the month a price changes from
  const headed = (s: Side, head: ReactNode, stages: readonly OpenStage[]) => {
    const place: Place = { on: "side", side: s };
    return (
      <PlaceZone place={place} hands={places} label={addLabel(place)}>
        {(land) => (
          <div className="flex flex-col gap-2">
            <div className="flex min-h-target items-center gap-2">{head}</div>
            {side(s, stages, land)}
          </div>
        )}
      </PlaceZone>
    );
  };
  // a part that goes on the case as a whole, asked at the foot of its prices
  const atCase = asking({ on: "fee" });
  if (!open.sell)
    return (
      <>
        {side("buy", open.buy)}
        {atCase}
      </>
    );
  return (
    <>
      {headed("buy", <p className="text-sm font-medium">{copy.panel.buyPrices}</p>, open.buy)}
      {headed(
        "sell",
        <>
          <p className="text-sm font-medium">{copy.panel.salePrices}</p>
          <RemoveButton label={copy.panel.saleRemove} tabIndex={0} onRemove={() => onFee(setSaleApart(fee, false, caseId))} />
        </>,
        open.sell,
      )}
      {atCase}
    </>
  );
}

/**
 * A part the toolbox added that asks for what it needs, by what it asks (the part registry's `ask`): a month as a divider (`AskChange`),
 * a figure or a fee as the part's line with its empty box (`PendingEdit`). Where it stands is its place's (`OpenParts`).
 */
function AskPart({ fee, caseId, pending, deal, name, onFee, hands }: { fee: Fee; caseId: string | undefined; pending: OpenPending; deal: FeeDeal; name: string; onFee: (f: Fee) => void; hands: PendingHands }) {
  if (pending.ask === "month") return <AskChange fee={fee} caseId={caseId} pending={pending} name={name} onFee={onFee} hands={hands} />;
  return <PendingEdit fee={fee} {...(caseId ? { caseId } : {})} pending={pending} deal={deal} name={name} onFee={onFee} hands={hands} />;
}

/** The landing copy of a part a toolbox card would leave asking at the foot of a side's prices or of the case (`AskPart`, before it is there). */
function AskLanding({ fee, caseId, pending, deal, name, landing }: { fee: Fee; caseId: string | undefined; pending: OpenPending; deal: FeeDeal; name: string; landing: Landing }) {
  if (pending.ask === "month") return <ChangeAsk fee={fee} caseId={caseId} side={partAt(pending.place, caseId).side ?? "buy"} name={name} onAdd={() => undefined} onCancel={() => undefined} landing={landing} />;
  return <PendingLanding fee={fee} {...(caseId ? { caseId } : {})} pending={pending} deal={deal} name={name} landing={landing} />;
}

/**
 * The month a price changes from, asked at the foot of a side's prices (the toolbox's line "+ התאריך", `OpenPending.ask` "month"): a
 * divider with "מ־" and an empty month box, which takes the focus as it appears. A month committed (Enter, the picker, or leaving the box)
 * splits the price in force that month in two there, the later a copy the person then changes (`splitAt`), and the focus goes to the
 * later price's first box. A month the prices change in already is refused at the box (`taken`). Escape or the bin closes it and nothing
 * changes, the focus back on the toolbox's line.
 */
function AskChange({ fee, caseId, pending, name, onFee, hands }: { fee: Fee; caseId: string | undefined; pending: OpenPending; name: string; onFee: (f: Fee) => void; hands: PendingHands }) {
  const at = partAt(pending.place, caseId);
  // the prices it splits: its side's, the purchase's where it names none (`setPart`)
  const side = at.side ?? "buy";
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
    onFee(setPart(fee, pending.part, true, { ...at, month }));
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
      <ChangeAsk fee={fee} caseId={caseId} side={side} name={name} onAdd={add} onCancel={cancel} />
    </div>
  );
}

/**
 * The divider that asks the month a price changes from (`AskChange`), or its landing copy (`landing`): "מ־", an empty month box that
 * refuses a month the side's prices change in already (`taken`), and its bin.
 */
function ChangeAsk({ fee, caseId, side = "buy", name, onAdd, onCancel, landing }: { fee: Fee; caseId: string | undefined; side?: Side; name: string; onAdd: (month: string) => void; onCancel: () => void; landing?: Landing }) {
  const c = copy.panel.change;
  const taken = pricesOn(fee, side, caseId).flatMap((s) => (s.until ? [s.until] : []));
  return (
    <ChangeDivider
      lead={c.from}
      month={<MonthField value={null} label={copy.builder.fieldName(name, c.month)} tight waits taken={{ months: taken, why: c.taken }} onCommit={onAdd} />}
      removeLabel={copy.builder.fieldName(name, c.remove)}
      onRemove={onCancel}
      {...(landing ? { landing } : {})}
    />
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
