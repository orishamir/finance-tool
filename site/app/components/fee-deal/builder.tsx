// The two columns that enter the deal (method §10.6, `builder`). "על מה העסקה" (`SetupColumn`): the deal's kind, what it holds (three
// facts each chosen in place) or, in the provident family, the place for its company and track, the price list it was filled from with
// the button that fills a new deal from another, and on a plain line at its end the month it started. "העמלות בעסקה" (`FeesColumn`): its
// fees, grouped by what each is charged on under the summary's group headings, a group shown only while the deal has a fee in it; one card each with its figures
// typed in place, its standing against the cap after its name and the bin at that line's end, the chosen card marked. A fee with a price
// not given yet shows its empty boxes and says so. A fee just taken away leaves the page's undo line (`UndoLine`) in its place, as tall as
// its card was; another kind that takes fees away leaves it under the kind. After the groups, one quiet line offers the fees the deal
// could add: the kind's usual ones it lacks first, then the rarer ones and a fee of the person's own; a fee added lands in its group and
// takes the focus in its first box. Where the page has no column for the chosen fee's panel (a phone, a narrow window), the panel opens
// right under its card. A card under the pointer or the focus marks the fee in the summary.
import { useRef, useState, type ReactNode } from "react";
import type { ProductId } from "@finance-tool/schema";
import { feeDeal as copy } from "../../copy";
import type { Builder, BuilderRow, StageView } from "../../lib/fee-deal/builder";
import { setStart, setUntil, updateFee } from "../../lib/fee-deal/edit";
import type { DealKind } from "../../lib/fee-deal/kinds";
import { pricesOn, untilRange, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { groupKey, groupOn, refOf, type DealRead } from "../../lib/fee-deal/parts";
import { templateSource, type LeftOut } from "../../lib/fee-deal/templates";
import type { UndoWhat } from "../../lib/fee-deal/undo";
import { fmt } from "../../lib/format";
import { FEE_KIND_IDS, FEE_SHAPES, holdsFunds, type FeeKindId } from "../../lib/fee-deal/shapes";
import { IconBin } from "../icons";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { AddLine, Button, ChoiceChips, GroupHead, MonthField, PickCard, Section, Step, Tag, When, cx, monthText, type AddItem } from "../kit";
import { Num } from "../provenance";
import { PriceFigure, mainFieldId } from "./figures";
import { LawTag, useFeeMark } from "./links";
import { TemplateNote } from "./picker";
import { UndoLine } from "./undo-line";
import { FeeName, feeName, perActionWord, refName, upToText } from "./words";

const b = copy.builder;

/** The words in a price's box in a row: what it is per ("לכל פעולה", "לכל יחידה", "בשנה"), then the month it ends, or "אחר כך" for a later price. */
function rowWords(kind: FeeKindId, s: StageView, later: boolean): string {
  const p = s.price;
  const unit =
    p.form === "action" || p.form === "perAction"
      ? perActionWord(kind)
      : p.form === "perUnit"
        ? copy.price.perUnit
        : p.form === "held"
          ? copy.price.per[p.per!]!
          : p.form === "sum"
            ? copy.price.per[p.every!]!
            : "";
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

/**
 * The facts a row says at its end: its next change, where it is charged, its bounds. Whether a sale is priced apart goes unsaid: a sale
 * priced apart shows its own line of figures after "במכירה".
 */
function RowNotes({ row, fee }: { row: BuilderRow; fee: Fee }) {
  const notes: ReactNode[] = [];
  if (!row.priced) notes.push(row.unmatched ? copy.cases.unmatched : b.facts.noPrice);
  if (row.next) notes.push(<When key="next" iso={row.next.at} lead={b.facts.next[row.next.change]!} />);
  if (row.insideFund) notes.push(b.facts.insideFund);
  if (row.priced && row.stages[0]!.price.form === "action" && FEE_SHAPES[fee.kind].fields.action?.includes("min") && !row.bounds.min && !row.bounds.max) notes.push(b.facts.noBounds);
  if (notes.length === 0) return null;
  return (
    <ul className="ms-auto flex flex-col items-start gap-1 whitespace-nowrap text-sm text-muted-foreground sm:items-end">
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
              {...untilRange(typed, k)}
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

/**
 * A single price's parts beyond its main figure, each in its box: its minimum and maximum, its percent maximum ("25 % מקסימום באחוזים"),
 * and its flat price with the sum it holds up to in the box's words ("2.85 $ לכל המרה עד 50 $").
 */
function PartFigures({ row, fee, k, onFee }: { row: BuilderRow; fee: Fee; k: number; onFee: (f: Fee) => void }) {
  const name = refName(row);
  const view = row.stages[0]!.price;
  const f = view.figures;
  const box = (figure: "min" | "max" | "cap" | "flat", words: ReactNode, spoken: string) =>
    f[figure] ? <PriceFigure key={figure} fee={fee} side="buy" k={k} view={view} figure={figure} label={b.fieldName(name, spoken)} words={words} inside tight onFee={onFee} /> : null;
  const upTo = f.flat && f.upTo ? (
    <>
      {perActionWord(fee.kind)}
      {copy.price.flat.upTo}
      {/* read as the box beside it reads its own sum, the sign after the number ("2.85 $"), not as a sum in running words */}
      <bdi dir="rtl" className="whitespace-nowrap">{upToText(f.upTo)}</bdi>
    </>
  ) : null;
  return (
    <>
      {box("min", b.minWord, copy.panel.min)}
      {box("max", b.maxWord, copy.panel.max)}
      {box("cap", copy.panel.cap, copy.panel.cap)}
      {upTo && box("flat", upTo, copy.panel.parts.flat)}
    </>
  );
}

/** A row's figures: each price from now on in its box, a single price's parts beside it, and a sale priced apart after "במכירה". */
function RowFigures({ row, fee, onFee }: { row: BuilderRow; fee: Fee; onFee: (f: Fee) => void }) {
  const offset = pricesOn(fee, "buy").length - row.stages.length;
  const sale = row.sale;
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {sale && <span className="text-sm text-muted-foreground">{copy.sides.buy}</span>}
        <SideFigures row={row} stages={row.stages} fee={fee} side="buy" onFee={onFee} />
        {row.stages.length === 1 && <PartFigures row={row} fee={fee} k={offset} onFee={onFee} />}
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
 * of an unchosen card that takes the focus chooses the card. A card under the pointer or the focus marks its fee in the summary, and is
 * marked when the summary points at it. The end of its name's line holds the way to take the fee away, a bin, apart from the notes at the
 * card's end so it is never read as taking a note away: always on the chosen card and on a touch screen, on the others while the pointer
 * is over the card or the focus is in it; while it is not shown it takes no press.
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

/**
 * A card's bin, at the end of its fee's name line; its spoken name names the fee. Its round face reaches 4 px past the line above and
 * below, taking no more height than the name's line and the room around it.
 */
function RemoveFee({ name, chosen, onRemove }: { name: string; chosen: boolean; onRemove: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={b.fieldName(name, copy.panel.remove)}
      onClick={onRemove}
      className={cx(
        "-my-1 ms-auto shrink-0",
        !chosen &&
          "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto focus-visible:opacity-100 [@media(hover:none)]:opacity-100 [@media(hover:none)]:pointer-events-auto",
      )}
    >
      <IconBin size={18} />
    </Button>
  );
}

/** The page's undo line, where it stands among the fees: in the place of a fee taken away, in that fee's group. */
export interface FeeUndoLine {
  what: Extract<UndoWhat, { kind: "remove" }>;
  /** The fee taken away, whose group the line stands in. */
  fee: Fee;
  /** What happened, in words: the live region says the same. */
  words: string;
  onUndo: () => void;
  onHold: (held: boolean) => void;
  /** Whether the line takes the focus as it appears (`UndoLine`). */
  take: () => boolean;
}

/** The page's undo line of another kind of product that took fees away: it stands under the kind. */
export type KindUndoLine = Omit<FeeUndoLine, "what" | "fee">;

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

export function SetupColumn({ deal, view, kinds, onPickTrack, onTemplates, left, kindLine, onDeal, onKind }: {
  deal: FeeDeal;
  view: Builder;
  kinds: readonly DealKind[];
  /** Opens the track picker from the button tapped, where the deal's kind has tracks (the provident family); null elsewhere. */
  onPickTrack: ((from: HTMLElement) => void) | null;
  /** Opens the price lists' picker from the button tapped, whose choice fills a new deal, where the deal's kind has price lists; null elsewhere. */
  onTemplates: ((from: HTMLElement) => void) | null;
  /** What the template the deal was filled from left out; null where no template filled it. */
  left: readonly LeftOut[] | null;
  /** The undo line of another kind just chosen that took fees away; null where none stands. */
  kindLine: KindUndoLine | null;
  onDeal: (deal: FeeDeal) => void;
  /** Another kind chosen for the deal. */
  onKind: (kind: ProductId) => void;
}) {
  const kind = kinds.find((k) => k.id === deal.kind) ?? null;
  // a choice opened in the column belongs to the deal it was opened in (kept by its id): another deal opens with it closed. The column
  // is not remounted for it, so the track button the picker opened from keeps the focus it gets back.
  const [pickingIn, setPickingIn] = useState<string | null>(null);
  const picking = pickingIn === deal.id;
  const setPicking = (open: boolean) => setPickingIn(open ? deal.id : null);
  const root = useRef<HTMLDivElement>(null);
  // a kind just chosen hands the focus to the next step's first control, where the chips it was chosen in leave; a kind with no second
  // step (a current account, a deposit, a makam) hands it to the next thing on the page, the fees column's add line
  const kindChosen = useRef(false);
  useIsoLayoutEffect(() => {
    if (!kindChosen.current) return;
    kindChosen.current = false;
    // the undo line of a kind that took fees away has the focus already
    if (!kindLine) (root.current?.querySelector<HTMLElement>("section:nth-of-type(2) :is(button, select, input)") ?? document.querySelector<HTMLElement>("[data-fees-add] button"))?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal.kind]);
  const track = deal.template && templateSource(deal.template.id) === "track" ? deal.template : null;
  const house = deal.template && templateSource(deal.template.id) === "house" ? deal.template : null;
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
                onKind(id);
                setPicking(false);
              }}
            />
          )}
          {kindLine && (
            <UndoLine key={`undo:product:${deal.kind}`} as="div" onUndo={kindLine.onUndo} onHold={kindLine.onHold} take={kindLine.take} refocusOnUndo refocus={() => root.current?.querySelector<HTMLElement>("button")}>
              {kindLine.words}
            </UndoLine>
          )}
        </Step>
        {kind && !holdsFunds(kind.id) && onPickTrack && (
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
          >
            {track && left && <TemplateNote template={track} left={left} />}
          </Step>
        )}
        {kind && onTemplates && (
          <Step n={n++} done={!!house} title={b.fill}>
            {house && left && <TemplateNote template={house} left={left} />}
            <Button variant="outline" className="self-start" onClick={(e) => onTemplates(e.currentTarget)}>
              {copy.end.template}
            </Button>
          </Step>
        )}
        {/* the month the deal started: a plain line at the column's end under a rule, not a step, since nothing waits on it */}
        {kind && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">{b.start}</span>
            <MonthField value={deal.start ?? null} label={b.start} onCommit={(m) => onDeal(setStart(deal, m))} onClear={() => onDeal(setStart(deal, null))} />
            <span className="text-muted-foreground">{b.optional}</span>
          </div>
        )}
      </div>
    </Section>
  );
}

/**
 * The order the fees' groups stand in: the actions a deal is mostly about (a purchase or sale, a conversion, a deposit, a payout), what is
 * held, the account, a transfer out, any other action, cover, and what is not said.
 */
const GROUP_ORDER = ["action:trade", "action:conversion", "action:deposit", "action:distribution", "held", "heldSaved", "account", "action:transfer_out", "action:none", "cover", "unsaid"];
const groupRank = (key: string) => {
  const k = GROUP_ORDER.indexOf(key);
  return k < 0 ? GROUP_ORDER.length : k;
};

/**
 * A fee's group among the cards: the heading key of what it is charged on (F-111, `groupOn`), by its first price that is not free, so a
 * fee free for a while stands where it will be charged; what is held reads "what has built up" in a product that saves.
 */
export function feeGroup(read: Pick<DealRead, "engine">, fee: Fee, saved: boolean): string {
  const stages = pricesOn(fee, "buy");
  const stage = stages.find((s) => s.price.form !== "free") ?? stages[0]!;
  const on = groupOn(read, { id: fee.id, kind: fee.kind, stages }, stage.price);
  return on.on === "held" && saved ? "heldSaved" : groupKey(on);
}

export function FeesColumn({ deal, view, groupOf, chosen, panel, line, focus, onFocused, onDeal, onChoose, onAdd, onRemove }: {
  deal: FeeDeal;
  view: Builder;
  /** Each fee's group (`feeGroup`). */
  groupOf: (fee: Fee) => string;
  chosen: string | null;
  /** The chosen fee's panel, drawn right under its card; null where the page draws it in a column of its own. */
  panel: ReactNode;
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
  // each card's height as last drawn (a card's height changes with the fees and with the choice), so the line a removed fee leaves is as
  // tall as its card was
  const root = useRef<HTMLDivElement>(null);
  const adding = useRef<HTMLDivElement>(null);
  const heights = useRef(new Map<string, number>());
  const cardOf = (feeId: string) => root.current?.querySelector<HTMLElement>(`li[data-fee="${CSS.escape(feeId)}"]`);
  useIsoLayoutEffect(() => {
    for (const li of root.current?.querySelectorAll<HTMLElement>("li[data-fee]") ?? []) heights.current.set(li.dataset.fee!, li.getBoundingClientRect().height);
    if (!focus) return;
    const li = cardOf(focus.fee);
    if (focus.on === "box") {
      const box = li?.querySelector<HTMLInputElement>("input[data-figure]");
      bringIntoView(li);
      box?.focus({ preventScroll: true });
      box?.select();
    } else cardFocus(li)?.focus({ preventScroll: true });
    onFocused();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal.fees, chosen, focus]);
  const onFee = (f: Fee) => onDeal(updateFee(deal, f.id, () => f));
  const rows = new Map(view.rows.map((r) => [r.fee, r]));
  // every chip alike: the usual fees come first, which is their only mark
  const adds: AddItem[] = [...view.suggestions.usual, ...view.suggestions.rarer].map((k) => ({ id: k, label: feeName(k) }));

  // the groups, each with its cards in one order by the fee's kind (`FEE_KIND_IDS`: a trade before its conversion), whatever order a
  // template filled them in, and fees of one kind in the deal's order; the line of a fee taken away stands in that fee's group, where its
  // card was
  type Item = { fee: Fee; i: number } | "line";
  const before = (a: { fee: Fee; i: number }, b2: { fee: Fee; i: number }) => FEE_KIND_IDS.indexOf(a.fee.kind) - FEE_KIND_IDS.indexOf(b2.fee.kind) || a.i - b2.i;
  const byGroup = new Map<string, Item[]>();
  deal.fees
    .map((fee, i) => ({ fee, i }))
    .sort(before)
    .forEach((it) => {
      const key = groupOf(it.fee);
      byGroup.set(key, [...(byGroup.get(key) ?? []), it]);
    });
  if (line) {
    const key = groupOf(line.fee);
    const items = byGroup.get(key) ?? [];
    const at = items.findIndex((it) => it !== "line" && before(it, { fee: line.fee, i: line.what.at }) >= 0);
    items.splice(at < 0 ? items.length : at, 0, "line");
    byGroup.set(key, items);
  }
  const groups = [...byGroup].sort(([a], [b2]) => groupRank(a) - groupRank(b2));
  // the cards as they stand on the page, so the line of a fee taken away hands the focus, when it goes, to the card now in its place, else
  // the one before it, else the add line
  const shown = groups.flatMap(([, items]) => items);
  const lineAt = shown.indexOf("line");
  const near = (k: number) => {
    const it = shown[k];
    return it && it !== "line" ? it.fee.id : null;
  };
  const afterRemoved = () => {
    const id = near(lineAt + 1) ?? near(lineAt - 1);
    return (id ? cardFocus(cardOf(id)) : null) ?? adding.current?.querySelector("button");
  };
  const undoLine = (l: FeeUndoLine) => (
    <UndoLine key={`undo:${l.what.kind}:${l.what.feeId}`} onUndo={l.onUndo} onHold={l.onHold} take={l.take} refocus={afterRemoved} height={heights.current.get(l.what.feeId)}>
      {l.words}
    </UndoLine>
  );
  const card = (fee: Fee) => {
    const row = rows.get(fee.id);
    const name = feeName(fee.kind, fee.name);
    const on = fee.id === chosen;
    return (
      <FeeRowCard key={fee.id} id={fee.id} chosen={on} label={b.open(name)} onChoose={(by) => onChoose(fee.id, by)}>
        {/* the card's body is the cell a figure's note stays inside */}
        <div data-note-cell="" className="flex flex-col gap-2">
          <span className="flex flex-wrap items-center gap-2">
            <FeeName fee={refOf({ fee: fee.id, kind: fee.kind, ...(fee.name ? { name: fee.name } : {}) })} className="font-semibold" />
            {on && <Tag tone="primary">{b.chosen}</Tag>}
            {row && <RowStanding row={row} />}
            <RemoveFee name={name} chosen={on} onRemove={() => onRemove(fee.id)} />
          </span>
          {/* the notes at the card's end, beside the boxes where the card has room; else on a line of their own under them */}
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            {row ? <RowFigures row={row} fee={fee} onFee={onFee} /> : <p className="text-sm text-muted-foreground">{b.unread}</p>}
            {row && <RowNotes row={row} fee={fee} />}
          </div>
        </div>
      </FeeRowCard>
    );
  };
  return (
    <Section title={b.fees} level="kick" heading="h2">
      <div ref={root} className="flex flex-col gap-6">
        {groups.map(([key, items]) => (
          <div key={key} className="flex flex-col gap-3">
            <GroupHead as="h3" plain>
              {copy.on[key]}
            </GroupHead>
            <ul className="flex flex-col gap-3">
              {items.flatMap((it) => {
                if (it === "line") return [undoLine(line!)];
                if (it.fee.id !== chosen || !panel) return [card(it.fee)];
                return [card(it.fee), <li key="panel">{panel}</li>];
              })}
            </ul>
          </div>
        ))}
        <div ref={adding} data-fees-add="" className="contents">
          <AddLine lead={b.add} items={adds} onAdd={(id) => onAdd(id as FeeKindId)} />
        </div>
      </div>
    </Section>
  );
}
