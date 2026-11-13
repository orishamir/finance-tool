// The column "בונים את העסקה" (method §10.6, `builder`): the deal's kind, what it holds (three facts each chosen in place) or, in the
// provident family, the place for its company and track, and its fees, one card each with its figures typed in place, its standing
// against the cap after its name, the chosen card marked, and a way to take it away. A fee with a price not given yet shows its empty
// boxes and says so. A fee just taken away leaves the page's undo line (`UndoLine`) in its place, as tall as its card was. Under the
// cards, one quiet line offers the fees the deal could add: the kind's usual ones it lacks first, then the rarer ones and a fee of the
// person's own; a fee added takes the focus in its first box. A card under the pointer or the focus marks the fee in the glance.
import { useRef, useState, type ReactNode } from "react";
import type { ProductId } from "@finance-tool/schema";
import { feeDeal as copy } from "../../copy";
import type { Builder, BuilderRow, StageView } from "../../lib/fee-deal/builder";
import { pickHeld, setHeld, setKind, setUntil, updateFee } from "../../lib/fee-deal/edit";
import type { DealKind } from "../../lib/fee-deal/kinds";
import { BOUND_CURRENCIES, pricesOn, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { refOf } from "../../lib/fee-deal/parts";
import { templateSource, type LeftOut } from "../../lib/fee-deal/templates";
import type { UndoWhat } from "../../lib/fee-deal/undo";
import { fmt } from "../../lib/format";
import { FEE_SHAPES, type FeeKindId, type Held } from "../../lib/fee-deal/shapes";
import { IconBin } from "../icons";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { AddLine, Button, ChoiceChips, InlineSelect, MonthField, PickCard, Section, Step, Tag, When, monthText, type AddItem } from "../kit";
import { Num } from "../provenance";
import { PriceFigure, mainFieldId } from "./figures";
import { LawTag, useFeeMark } from "./links";
import { TemplateNote } from "./picker";
import { UndoLine } from "./undo-line";
import { FeeName, feeName, perActionWord, refName } from "./words";

const b = copy.builder;

/** The words in a price's box in a row: what it is per ("לכל פעולה", "בשנה"), then the month it ends, or "אחר כך" for a later price. */
function rowWords(kind: FeeKindId, s: StageView, later: boolean): string {
  const p = s.price;
  const unit =
    p.form === "action" || p.form === "perAction" ? perActionWord(kind) : p.form === "held" ? copy.price.per[p.per!]! : p.form === "sum" ? copy.price.per[p.every!]! : "";
  const when = s.until ? `${copy.standing.until}${monthText(s.until)}` : later ? b.then : "";
  // "0.4% בשנה, עד 03.2028" but "0.4% בשנה אחר כך"
  return [unit, when].filter(Boolean).join(s.until ? ", " : " ");
}

/**
 * A row's standing against the cap now, after the fee's name: the share of the cap or the standing's tag; a later price's standing is
 * said with that price, and the row's next change is in its notes. A tag leads to the fee's row of the law card; a share opens its
 * calculation.
 */
function RowStanding({ row }: { row: BuilderRow }) {
  if (!row.priced) return null;
  const now = row.standingNow.standing;
  if (now.judged && now.standing === "below" && row.standingNow.share)
    return (
      <span className="text-sm text-muted-foreground">
        <Num value={row.standingNow.share} display={fmt.share} />
        {copy.standing.shareShort}
      </span>
    );
  if (now.judged) return <LawTag fee={row.fee} standing={row.standingNow} />;
  return null;
}

/** The facts a row says at its end: its next change, where it is charged, its sale, its bounds. */
function RowNotes({ row, fee }: { row: BuilderRow; fee: Fee }) {
  const notes: ReactNode[] = [];
  if (!row.priced) notes.push(b.facts.noPrice);
  if (row.next) notes.push(<When key="next" iso={row.next.at} lead={b.facts.next[row.next.change]!} />);
  if (row.insideFund) notes.push(b.facts.insideFund);
  if (row.saleSame !== null) notes.push(row.saleSame ? b.facts.saleSame : b.facts.saleApart);
  if (row.priced && row.stages[0]!.price.form === "action" && FEE_SHAPES[fee.kind].fields.action?.includes("min") && !row.bounds.min && !row.bounds.max) notes.push(b.facts.noBounds);
  if (notes.length === 0) return null;
  return (
    <ul className="flex flex-col items-start gap-1 whitespace-nowrap text-sm text-muted-foreground sm:items-end">
      {notes.map((n, k) => (
        <li key={k}>{n}</li>
      ))}
    </ul>
  );
}

/** One side's prices from now on, each in its box: a price free until a month is one box with the month typed in place. */
function SideFigures({ row, stages, fee, side, onFee }: { row: BuilderRow; stages: readonly StageView[]; fee: Fee; side: "buy" | "sell"; onFee: (f: Fee) => void }) {
  const name = refName(row);
  // the row shows the prices from the reading's month on: the passed ones are a prefix of the fee's prices
  const typed = pricesOn(fee, side);
  const offset = typed.length - stages.length;
  return (
    <>
      {stages.map((s, j) => {
        const k = offset + j;
        const words = rowWords(fee.kind, s, j > 0);
        if (s.price.form === "free" && s.until)
          return (
            <MonthField
              key={k}
              value={s.until}
              lead={`${copy.price.free} ${copy.standing.until.trim()}`}
              tight
              label={b.fieldName(name, copy.panel.until)}
              onCommit={(m) => onFee(setUntil(fee, side, k, m))}
            />
          );
        if (s.price.form === "free")
          return (
            <span key={k} className="inline-flex min-h-target items-center gap-1.5">
              <Tag tone="entered" size="sm">
                {copy.price.free}
              </Tag>
              {words && <span className="text-sm text-muted-foreground">{words}</span>}
            </span>
          );
        const main = s.price.form === "action" || s.price.form === "held" ? "rate" : "amount";
        return <PriceFigure key={k} fee={fee} side={side} k={k} view={s.price} figure={main} label={b.fieldName(name, side === "sell" ? `${copy.sides.sell}, ${copy.panel.howMuch}` : copy.panel.howMuch)} words={words} inside tight id={mainFieldId(fee.id, side, k, "row")} onFee={onFee} />;
      })}
    </>
  );
}

/** A row's figures: each price from now on in its box, a single price's bounds beside it, and a sale priced apart after "במכירה". */
function RowFigures({ row, fee, onFee }: { row: BuilderRow; fee: Fee; onFee: (f: Fee) => void }) {
  const name = refName(row);
  const offset = fee.stages.length - row.stages.length;
  const sale = row.sale;
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {sale && <span className="text-sm text-muted-foreground">{copy.sides.buy}</span>}
        <SideFigures row={row} stages={row.stages} fee={fee} side="buy" onFee={onFee} />
        {row.stages.length === 1 &&
          (["min", "max"] as const).map((m) =>
            row.stages[0]!.price.figures[m] ? <PriceFigure key={m} fee={fee} side="buy" k={offset} view={row.stages[0]!.price} figure={m} label={b.fieldName(name, copy.panel[m])} words={m === "min" ? b.minWord : b.maxWord} inside tight onFee={onFee} /> : null,
          )}
      </div>
      {/* a sale priced apart on a line of its own, so a line breaks between the purchase and the sale, never inside one */}
      {sale && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm text-muted-foreground">{copy.sides.sell}</span>
          <SideFigures row={row} stages={sale} fee={fee} side="sell" onFee={onFee} />
        </div>
      )}
    </div>
  );
}

/**
 * One fee's card, the whole card the button that chooses it (`PickCard`): the chosen one framed in the action colour with the word. Its
 * button comes first, so the keyboard meets the fee's name, then its boxes, then its bin; Enter in its last box comes back to it. A field
 * of an unchosen card that takes the focus chooses the card. A card under the pointer or the focus marks its fee in the glance, and is
 * marked when the glance points at it. Its end holds the way to take the fee away, a bin: always on the chosen card and on a touch screen,
 * on the others while the pointer is over the card or the focus is in it; while it is not shown it takes no press.
 */
function FeeRowCard({ id, chosen, label, onChoose, children }: { id: string; chosen: boolean; label: string; onChoose: (by: "pointer" | "keyboard" | "field") => void; children: ReactNode }) {
  const { marked, handlers } = useFeeMark(id);
  return (
    <li
      data-fee={id}
      data-figures=""
      className="come-in"
      {...handlers}
      onFocus={(e) => {
        handlers.onFocus?.(e);
        if (!chosen && (e.target as HTMLElement).matches("input, select")) onChoose("field");
      }}
    >
      <PickCard label={label} chosen={chosen} marked={marked} onPick={(by) => onChoose(by)} pad="tight" className="group" buttonProps={{ "data-figures-back": "" }}>
        {children}
      </PickCard>
    </li>
  );
}

/** What takes the focus for a fee's card: its own button. */
const cardFocus = (li: HTMLElement | null | undefined): HTMLElement | null => li?.querySelector<HTMLElement>("[data-pick-card]") ?? null;

/** A card's bin, by its fee's note at the card's end; its spoken name names the fee. */
function RemoveFee({ name, chosen, onRemove }: { name: string; chosen: boolean; onRemove: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={b.fieldName(name, copy.panel.remove)}
      onClick={onRemove}
      className={
        chosen
          ? undefined
          : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus-visible:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:pointer-events-auto"
      }
    >
      <IconBin size={18} />
    </Button>
  );
}

/**
 * What a fund-holding deal holds: three facts, each a chip chosen in place (where the fund is bought, its currency, what it does with
 * interest and dividends). Until all three are chosen the deal says nothing of what it holds; after that each choice changes it at once.
 */
function HeldChips({ held, onHeld }: { held: Held | undefined; onHeld: (h: Held) => void }) {
  const [draft, setDraft] = useState<Partial<Held>>(held ?? {});
  const now: Partial<Held> = held ?? draft;
  const pick = (part: Partial<Held>) => {
    const next = pickHeld(now, part);
    setDraft(next.draft);
    if (next.held) onHeld(next.held);
  };
  const opts = (ids: readonly string[]) => ids.map((id) => ({ id, name: b.heldSaid[id] ?? id }));
  // a currency the deal holds that the list does not offer (from an older deal) stays a choice, so the chip shows it
  const currencies: string[] = [...BOUND_CURRENCIES];
  if (now.currency && !currencies.includes(now.currency)) currencies.push(now.currency);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <InlineSelect chip label={b.place.label!} all={b.place.label!} options={opts(["israel", "abroad"])} value={now.place ?? null} onChange={(v) => v && pick({ place: v as Held["place"] })} />
      <InlineSelect chip label={b.currency.label!} all={b.currency.label!} options={opts(currencies)} value={now.currency ?? null} onChange={(v) => v && pick({ currency: v })} />
      <InlineSelect chip label={b.payout.label!} all={b.payout.label!} options={opts(["accumulating", "distributing"])} value={now.payout ?? null} onChange={(v) => v && pick({ payout: v as Held["payout"] })} />
    </div>
  );
}

/** The page's undo line, where it stands in the builder: in the place of a fee taken away. */
export interface FeeUndoLine {
  what: Extract<UndoWhat, { kind: "remove" }>;
  /** What happened, in words: the live region says the same. */
  words: string;
  onUndo: () => void;
  onHold: (held: boolean) => void;
  /** Whether the line takes the focus as it appears (`UndoLine`). */
  take: () => boolean;
}

/** A fee whose card or first box takes the focus once drawn: one put back by the undo (its card), one just added (its first box). */
export interface FeeFocus {
  fee: string;
  on: "card" | "box";
}

/** Whether an element stands wholly in the window, under the site's sticky header. */
function inView(el: Element): boolean {
  const r = el.getBoundingClientRect();
  const top = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
  return r.top >= top && r.bottom <= window.innerHeight;
}

/** Brings an element into the window where it is not wholly in it, gliding unless the device asks for less motion. */
export function bringIntoView(el: Element | null | undefined) {
  if (!el || inView(el)) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ block: "nearest", behavior: still ? "auto" : "smooth" });
}

export function BuilderColumn({ deal, view, kinds, chosen, onPickTrack, left, line, focus, onFocused, onDeal, onChoose, onAdd, onRemove }: {
  deal: FeeDeal;
  view: Builder;
  kinds: readonly DealKind[];
  chosen: string | null;
  /** Opens the track picker from the button tapped, where the deal's kind has tracks (the provident family); null elsewhere. */
  onPickTrack: ((from: HTMLElement) => void) | null;
  /** What the template the deal was filled from left out; null where no template filled it. */
  left: readonly LeftOut[] | null;
  /** The undo line of a fee just taken away; null where none stands. */
  line: FeeUndoLine | null;
  /** What takes the focus once drawn, and what to call once it has. */
  focus: FeeFocus | null;
  onFocused: () => void;
  onDeal: (deal: FeeDeal) => void;
  /** A card chosen, and how: by the pointer, the keyboard (the panel's first field then takes the focus) or a field of it taking the focus. */
  onChoose: (feeId: string, by: "pointer" | "keyboard" | "field") => void;
  onAdd: (kind: FeeKindId) => void;
  onRemove: (feeId: string) => void;
}) {
  const kind = kinds.find((k) => k.id === deal.kind) ?? null;
  // a choice opened in the column belongs to the deal it was opened in (kept by its id): another deal opens with both closed. The column
  // is not remounted for it, so the track button the picker opened from keeps the focus it gets back.
  const [pickingIn, setPickingIn] = useState<string | null>(null);
  const picking = pickingIn === deal.id;
  const setPicking = (open: boolean) => setPickingIn(open ? deal.id : null);
  // each card's height as last drawn (a card's height changes with the fees and with the choice), so the line a removed fee leaves is as
  // tall as its card was
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const adding = useRef<HTMLDivElement>(null);
  const heights = useRef(new Map<string, number>());
  // a kind just chosen hands the focus to the next step's first control, where the chips it was chosen in leave
  const kindChosen = useRef(false);
  useIsoLayoutEffect(() => {
    for (const li of list.current?.querySelectorAll<HTMLElement>("li[data-fee]") ?? []) heights.current.set(li.dataset.fee!, li.getBoundingClientRect().height);
    if (kindChosen.current) {
      kindChosen.current = false;
      root.current?.querySelector<HTMLElement>("section:nth-of-type(2) :is(button, select, input)")?.focus();
    }
    if (!focus) return;
    const li = list.current?.querySelector<HTMLElement>(`li[data-fee="${focus.fee}"]`);
    if (focus.on === "box") {
      const box = li?.querySelector<HTMLInputElement>("input[data-figure]");
      bringIntoView(li);
      box?.focus({ preventScroll: true });
      box?.select();
    } else cardFocus(li)?.focus({ preventScroll: true });
    onFocused();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal.fees, deal.kind, chosen, focus]);
  const cardAt = (i: number) => list.current?.querySelectorAll<HTMLElement>("li[data-fee]")[i];
  // the line of a fee taken away hands the focus, when it goes, to the card now in its place, else the one before it, else the add line
  const afterRemoved = (at: number) => () => cardFocus(cardAt(at) ?? cardAt(at - 1)) ?? adding.current?.querySelector("button");
  const undoLine = (l: FeeUndoLine, height?: number) => (
    <UndoLine key={`undo:${l.what.kind}:${l.what.feeId}`} onUndo={l.onUndo} onHold={l.onHold} take={l.take} refocus={afterRemoved(l.what.at)} height={height}>
      {l.words}
    </UndoLine>
  );
  const onFee = (f: Fee) => onDeal(updateFee(deal, f.id, () => f));
  const rows = new Map(view.rows.map((r) => [r.fee, r]));
  // every chip alike: the usual fees come first, which is their only mark
  const adds: AddItem[] = [...view.suggestions.usual, ...view.suggestions.rarer].map((k) => ({ id: k, label: feeName(k) }));
  const track = deal.template && templateSource(deal.template.id) === "track" ? deal.template : null;
  let n = 1;
  return (
    <Section title={b.title} level="kick" heading="h2">
      <div ref={root} className="flex flex-col gap-4">
        <Step
          n={n++}
          done={!!kind}
          title={b.kind}
          value={kind?.name}
          action={
            kind && (
              <Button variant="quiet" size="sm" flush wide onClick={() => setPicking(!picking)} aria-expanded={picking}>
                {picking ? b.close : b.kindChange}
              </Button>
            )
          }
        >
          {(!kind || picking) && (
            <ChoiceChips
              wrap
              bleed=""
              ids={kinds.map((k) => k.id)}
              labels={Object.fromEntries(kinds.map((k) => [k.id, k.name]))}
              value={deal.kind}
              ariaLabel={b.kindsAria}
              onChange={(id: ProductId) => {
                kindChosen.current = true;
                onDeal(setKind(deal, id));
                setPicking(false);
              }}
            />
          )}
        </Step>
        {kind && view.holdsFunds && (
          <Step n={n++} done={!!view.held} title={b.held}>
            <HeldChips key={deal.id} held={view.held} onHeld={(h) => onDeal(setHeld(deal, h))} />
          </Step>
        )}
        {kind && !view.holdsFunds && onPickTrack && (
          <Step
            n={n++}
            done={!!track}
            title={b.track}
            value={track ? track.name : b.trackNone}
            action={
              <Button variant="quiet" size="sm" flush onClick={(e) => onPickTrack(e.currentTarget)}>
                {b.trackPick}
              </Button>
            }
          />
        )}
        {kind && (
          <Step n={n++} done={deal.fees.length > 0} title={b.fees}>
            {deal.template && left && <TemplateNote template={deal.template} left={left} />}
            {deal.fees.length > 0 && <p className="text-sm text-muted-foreground">{b.feesLead}</p>}
            <ul ref={list} className="flex flex-col gap-3">
              {deal.fees.flatMap((fee, i) => {
                const row = rows.get(fee.id);
                const name = feeName(fee.kind, fee.name);
                const on = fee.id === chosen;
                const card = (
                  <FeeRowCard key={fee.id} id={fee.id} chosen={on} label={b.open(name)} onChoose={(by) => onChoose(fee.id, by)}>
                    {/* the note and the bin at the card's end, beside the boxes where the card has room; else on a line of their own under them */}
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                      <div className="flex min-w-0 flex-col gap-2">
                        <span className="flex flex-wrap items-center gap-2">
                          <FeeName fee={refOf(fee)} className="font-semibold" />
                          {on && <Tag tone="primary">{b.chosen}</Tag>}
                          {row && <RowStanding row={row} />}
                        </span>
                        {row ? <RowFigures row={row} fee={fee} onFee={onFee} /> : <p className="text-sm text-muted-foreground">{b.unread}</p>}
                      </div>
                      <div className="ms-auto flex shrink-0 items-center gap-2">
                        {row && <RowNotes row={row} fee={fee} />}
                        <RemoveFee name={name} chosen={on} onRemove={() => onRemove(fee.id)} />
                      </div>
                    </div>
                  </FeeRowCard>
                );
                if (line && line.what.at === i) return [undoLine(line, heights.current.get(line.what.feeId)), card];
                return [card];
              })}
              {line && line.what.at >= deal.fees.length && undoLine(line, heights.current.get(line.what.feeId))}
            </ul>
            <div ref={adding} className="contents">
              <AddLine lead={b.add} items={adds} onAdd={(id) => onAdd(id as FeeKindId)} />
            </div>
          </Step>
        )}
      </div>
    </Section>
  );
}
