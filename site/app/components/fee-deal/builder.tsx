// The column "בונים את העסקה" (method §10.6, `builder`): the deal's kind, what it holds (three facts each chosen in place) or, in the
// provident family, the place for its company and track, and its fees, one card each with its figures typed in place, its standing
// against the cap after its name, the chosen card marked, and a way to take it away. A fee just taken away leaves a line in its place,
// as tall as its card was, that puts it back. Under the cards, one quiet line offers the fees the deal could add: the kind's usual ones
// it lacks first, then the rarer ones and a fee of the person's own.
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ProductId } from "@finance-tool/schema";
import { feeDeal as copy } from "../../copy";
import type { Builder, BuilderRow, StageView } from "../../lib/fee-deal/builder";
import { setHeld, setKind, setUntil, updateFee } from "../../lib/fee-deal/edit";
import type { DealKind } from "../../lib/fee-deal/kinds";
import { BOUND_CURRENCIES, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { refOf } from "../../lib/fee-deal/parts";
import { templateSource, type LeftOut } from "../../lib/fee-deal/templates";
import { fmt } from "../../lib/format";
import { FEE_SHAPES, type FeeKindId, type Held } from "../../lib/fee-deal/shapes";
import { IconBin } from "../icons";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { AddLine, Button, Card, ChoiceChips, InlineSelect, MonthField, PickCard, Section, Step, Tag, When, monthText, type AddItem } from "../kit";
import { Num } from "../provenance";
import { PriceFigure } from "./figures";
import { TemplateNote } from "./picker";
import { FeeName, StandingTag, feeName, perActionWord, refName } from "./words";

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

/** A row's standing against the cap, after the fee's name: the first later price whose standing differs, else the share of the cap or the standing now. */
function RowStanding({ row }: { row: BuilderRow }) {
  const now = row.standingNow.standing;
  if (row.standingLater) return <StandingTag standing={row.standingLater.standing} from={row.standingLater.at} />;
  if (now.judged && now.standing === "below" && row.standingNow.share)
    return (
      <span className="text-sm text-muted-foreground">
        <Num value={row.standingNow.share} display={fmt.share} />
        {copy.standing.shareShort}
      </span>
    );
  if (now.judged) return <StandingTag standing={row.standingNow} />;
  return null;
}

/** The facts a row says at its end: its next change, where it is charged, its sale, its bounds. */
function RowNotes({ row, fee }: { row: BuilderRow; fee: Fee }) {
  const notes: ReactNode[] = [];
  if (!row.standingLater && row.next) notes.push(<When key="next" iso={row.next.at} lead={b.facts.next[row.next.change]!} />);
  if (row.insideFund) notes.push(b.facts.insideFund);
  if (row.saleSame !== null) notes.push(row.saleSame ? b.facts.saleSame : b.facts.saleApart);
  if (row.stages[0]!.price.form === "action" && FEE_SHAPES[fee.kind].fields.action?.includes("min") && !row.bounds.min && !row.bounds.max) notes.push(b.facts.noBounds);
  if (notes.length === 0) return null;
  return (
    <ul className="flex flex-col items-start gap-1 whitespace-nowrap text-sm text-muted-foreground sm:items-end">
      {notes.map((n, k) => (
        <li key={k}>{n}</li>
      ))}
    </ul>
  );
}

/** A row's figures: each price from now on in its box, and a single price's bounds beside it. */
function RowFigures({ row, fee, onFee }: { row: BuilderRow; fee: Fee; onFee: (f: Fee) => void }) {
  const name = refName(row);
  // the row shows the prices from the reading's month on: the passed ones are a prefix of the fee's prices
  const offset = fee.stages.length - row.stages.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {row.stages.map((s, j) => {
        const k = offset + j;
        const words = rowWords(fee.kind, s, j > 0);
        // free until a month: one box, the month typed in place
        if (s.price.form === "free" && s.until)
          return (
            <MonthField
              key={k}
              value={s.until}
              lead={`${copy.price.free} ${copy.standing.until.trim()}`}
              tight
              label={b.fieldName(name, copy.panel.until)}
              onCommit={(m) => onFee(setUntil(fee, "buy", k, m))}
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
        return <PriceFigure key={k} fee={fee} side="buy" k={k} view={s.price} figure={main} label={b.fieldName(name, copy.panel.howMuch)} words={words} inside tight onFee={onFee} />;
      })}
      {row.stages.length === 1 &&
        (["min", "max"] as const).map((m) =>
          row.stages[0]!.price.figures[m] ? <PriceFigure key={m} fee={fee} side="buy" k={offset} view={row.stages[0]!.price} figure={m} label={b.fieldName(name, copy.panel[m])} words={m === "min" ? b.minWord : b.maxWord} inside tight onFee={onFee} /> : null,
        )}
    </div>
  );
}

/**
 * One fee's card: the chosen one framed in the action colour with the word, the others whole cards that choose it. Its end holds the way
 * to take the fee away, a bin: always on the chosen card and on a touch screen, on the others while the pointer is over the card or the
 * focus is in it. The bin lies above the card's own button, so pressing it never chooses the card.
 */
function FeeRowCard({ id, chosen, label, onChoose, children }: { id: string; chosen: boolean; label: string; onChoose: () => void; children: ReactNode }) {
  if (chosen)
    return (
      <Card pad="tight" edge="accent" as="li" data-fee={id} tabIndex={-1} className="group outline-none">
        {children}
      </Card>
    );
  return (
    <li data-fee={id}>
      <PickCard label={label} onPick={onChoose} pad="tight" className="group">
        {children}
      </PickCard>
    </li>
  );
}

/** A card's bin, by its fee's note at the card's end. */
function RemoveFee({ chosen, onRemove }: { chosen: boolean; onRemove: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={copy.panel.remove}
      onClick={onRemove}
      className={chosen ? undefined : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"}
    >
      <IconBin size={18} />
    </Button>
  );
}

/** Where a fee just taken away stood: a line as tall as its card was, saying so, with the action that puts it back (which takes the focus). */
function RemovedLine({ fee, height, onUndo }: { fee: Fee; height: number | undefined; onUndo: () => void }) {
  const line = useRef<HTMLElement>(null);
  useEffect(() => line.current?.querySelector("button")?.focus({ preventScroll: true }), []);
  return (
    <Card ref={line} pad="tight" as="li" className="flex flex-wrap items-center gap-x-3 gap-y-1 border-dashed" style={height ? { minHeight: height } : undefined}>
      <span className="text-sm text-muted-foreground">
        {b.removed}
        <FeeName fee={refOf(fee)} after="." />
      </span>
      <Button variant="quiet" flush onClick={onUndo}>
        {b.undo}
      </Button>
    </Card>
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
    const next = { ...now, ...part };
    setDraft(next);
    if (next.place && next.currency && next.payout) onHeld(next as Held);
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

export function BuilderColumn({ deal, view, kinds, chosen, onPickTrack, left, removed, focusFee, onFocused, onDeal, onChoose, onAdd, onRemove }: {
  deal: FeeDeal;
  view: Builder;
  kinds: readonly DealKind[];
  chosen: string | null;
  /** Opens the track picker from the button tapped, where the deal's kind has tracks (the provident family); null elsewhere. */
  onPickTrack: ((from: HTMLElement) => void) | null;
  /** What the template the deal was filled from left out; null where no template filled it. */
  left: readonly LeftOut[] | null;
  /** The fee just taken away, its place among the fees and what puts it back; null where none can be. */
  removed: { at: number; fee: Fee; onUndo: () => void } | null;
  /** A fee whose card takes the focus once drawn (one put back), and what to call once it has. */
  focusFee: string | null;
  onFocused: () => void;
  onDeal: (deal: FeeDeal) => void;
  onChoose: (feeId: string) => void;
  onAdd: (kind: FeeKindId) => void;
  onRemove: (feeId: string) => void;
}) {
  const kind = kinds.find((k) => k.id === deal.kind) ?? null;
  // a choice opened in the column belongs to the deal it was opened in (kept by its id): another deal opens with both closed. The column
  // is not remounted for it, so the track button the picker opened from keeps the focus it gets back.
  const [pickingIn, setPickingIn] = useState<string | null>(null);
  const picking = pickingIn === deal.id;
  const setPicking = (open: boolean) => setPickingIn(open ? deal.id : null);
  // each card's height as last drawn, so the line a removed fee leaves is as tall as its card was
  const list = useRef<HTMLUListElement>(null);
  const heights = useRef(new Map<string, number>());
  useIsoLayoutEffect(() => {
    for (const li of list.current?.querySelectorAll<HTMLElement>("li[data-fee]") ?? []) heights.current.set(li.dataset.fee!, li.getBoundingClientRect().height);
    if (!focusFee) return;
    const li = list.current?.querySelector<HTMLElement>(`li[data-fee="${focusFee}"]`);
    (li?.querySelector<HTMLElement>("[data-pick-card]") ?? li)?.focus({ preventScroll: true });
    onFocused();
  });
  const onFee = (f: Fee) => onDeal(updateFee(deal, f.id, () => f));
  const rows = new Map(view.rows.map((r) => [r.fee, r]));
  const adds: AddItem[] = [...view.suggestions.usual.map((k) => ({ id: k, label: feeName(k), usual: true })), ...view.suggestions.rarer.map((k) => ({ id: k, label: feeName(k) }))];
  const track = deal.template && templateSource(deal.template.id) === "track" ? deal.template : null;
  let n = 1;
  return (
    <Section title={b.title} level="kick" heading="h2">
      <div className="flex flex-col gap-4">
        <Step
          n={n++}
          done={!!kind}
          title={b.kind}
          value={kind?.name}
          action={
            kind && (
              <Button variant="quiet" size="sm" flush onClick={() => setPicking(!picking)} aria-expanded={picking}>
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
                  <FeeRowCard key={fee.id} id={fee.id} chosen={on} label={b.open(name)} onChoose={() => onChoose(fee.id)}>
                    {/* the note and the bin at the card's end, beside the boxes where the card has room; else on a line of their own under them */}
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
                      <div className="flex min-w-0 flex-col gap-2">
                        <span className="flex flex-wrap items-center gap-2">
                          <FeeName fee={refOf(fee)} className="font-semibold" />
                          {on && <Tag tone="primary">{b.chosen}</Tag>}
                          {row && <RowStanding row={row} />}
                        </span>
                        {row ? <RowFigures row={row} fee={fee} onFee={onFee} /> : <p className="text-sm text-muted-foreground">{b.unread}</p>}
                      </div>
                      <div className="ms-auto flex shrink-0 items-center gap-1">
                        {row && <RowNotes row={row} fee={fee} />}
                        <RemoveFee chosen={on} onRemove={() => onRemove(fee.id)} />
                      </div>
                    </div>
                  </FeeRowCard>
                );
                return removed && removed.at === i ? [<RemovedLine key={`removed:${removed.fee.id}`} fee={removed.fee} height={heights.current.get(removed.fee.id)} onUndo={removed.onUndo} />, card] : [card];
              })}
              {removed && removed.at >= deal.fees.length && <RemovedLine key={`removed:${removed.fee.id}`} fee={removed.fee} height={heights.current.get(removed.fee.id)} onUndo={removed.onUndo} />}
            </ul>
            <AddLine lead={b.add} items={adds} onAdd={(id) => onAdd(id as FeeKindId)} />
          </Step>
        )}
      </div>
    </Section>
  );
}
