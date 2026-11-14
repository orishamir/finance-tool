// The two columns that enter the deal (method §10.6, `builder`). "על מה העסקה" (`SetupColumn`): the deal's kind or, in the provident family,
// the place for its company and track, and the price list it was filled from with the button that fills a new deal from another.
// "העמלות בעסקה" (`FeesColumn`): its fees, grouped by what each is charged on under the summary's group headings, a group shown only while
// the deal has a fee in it, each fee in its block (fee-block.tsx). A fee just taken away leaves the page's undo line (`UndoLine`) in its
// place, as tall as its block was; another kind that takes fees away leaves it under the kind. After the groups, one quiet line offers the
// fees the deal could add: the kind's usual ones it lacks first, then the rarer ones and a fee of the person's own; a fee added lands in
// its group, open, and takes the focus in its first box. Where the page has no column for the toolbox and no sheet for it, the toolbox
// stands under its fee. A block under the pointer or the focus marks the fee in the summary.
import { useRef, useState, type ReactNode } from "react";
import type { ProductId } from "@finance-tool/schema";
import { feeDeal as copy } from "../../copy";
import type { Builder } from "../../lib/fee-deal/builder";
import type { DealKind } from "../../lib/fee-deal/kinds";
import { pricesOn, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { groupKey, groupOn, type DealRead } from "../../lib/fee-deal/parts";
import { templateSource, type LeftOut } from "../../lib/fee-deal/templates";
import type { LeftOutView } from "../../lib/left-out";
import type { UndoWhat } from "../../lib/fee-deal/undo";
import { FEE_KIND_IDS, holdsFunds, type FeeKindId } from "../../lib/fee-deal/shapes";
import type { ByKind } from "../../lib/fee-deal/offers/conditions";
import { productOffered } from "../../lib/fee-deal/offers/offer";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { AddLine, Button, ChoiceChips, GroupHead, Section, Step, type AddItem } from "../kit";
import { bringIntoView } from "./in-view";
import { useFeeMark } from "./links";
import { FeeBlockView, type BlockActions, type OpenHere } from "./fee-block";
import { TemplateNote } from "./picker";
import { UndoLine } from "./undo-line";
import { feeName } from "./words";

const b = copy.builder;

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

export { bringIntoView } from "./in-view";

export function SetupColumn({ deal, view, kinds, onPickTrack, onTemplates, filled, kindLine, onDeal, onKind }: {
  deal: FeeDeal;
  view: Builder;
  kinds: readonly DealKind[];
  /** Opens the track picker from the button tapped, where the deal's kind has tracks (the provident family); null elsewhere. */
  onPickTrack: ((from: HTMLElement) => void) | null;
  /** Opens the price lists' picker from the button tapped, whose choice fills a new deal, where the deal's kind has price lists; null elsewhere. */
  onTemplates: ((from: HTMLElement) => void) | null;
  /** What the template the deal was filled from left out, and what a house's record says its price leaves out (D106); null where no template filled it. */
  filled: { left: readonly LeftOut[]; leftOut: LeftOutView | null } | null;
  /** The undo line of another kind just chosen that took fees away; null where none stands. */
  kindLine: KindUndoLine | null;
  onDeal: (deal: FeeDeal) => void;
  /** Another kind chosen for the deal. */
  onKind: (kind: ProductId) => void;
}) {
  const kind = kinds.find((k) => k.id === deal.kind) ?? null;
  // the products the picker offers (`productOffered`); a saved deal of another still opens with its own
  const offered = kinds.filter(productOffered);
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
              ids={offered.map((k) => k.id)}
              labels={Object.fromEntries(offered.map((k) => [k.id, k.name]))}
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
            {track && filled && <TemplateNote template={track} left={filled.left} />}
          </Step>
        )}
        {kind && onTemplates && (
          <Step n={n++} done={!!house} title={b.fill}>
            {house && filled && <TemplateNote template={house} left={filled.left} leftOut={filled.leftOut} />}
            <Button variant="outline" className="self-start" onClick={(e) => onTemplates(e.currentTarget)}>
              {copy.end.template}
            </Button>
          </Step>
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

/**
 * The page's undo line of a change to one fee's cases or prices (a case, a thing, a price taken away): it stands under the fee's block.
 * A price put in another form (`inCase`) leaves it in the open case, under its parts, where the change was made, while that case is open
 * (`caseId`, none for a fee whose price changes by nothing). A thing taken away (`thing`, its place) gives the focus back, on "ביטול", to
 * its pill in the band's head, else to the open case, brought into view.
 */
export type CaseUndoLine = KindUndoLine & { feeId: string; inCase?: { caseId: string | null }; thing?: number };

/**
 * The fees in their groups, each group with its fees in one order by the fee's kind (`FEE_KIND_IDS`: a trade before its conversion),
 * whatever order a template filled them in, and fees of one kind in the deal's order; the line of a fee taken away (`line`) stands in that
 * fee's group, where its block was. The groups stand in `GROUP_ORDER`.
 */
type Item = { fee: Fee; i: number } | "line";
function groupsOf(fees: readonly Fee[], groupOf: (fee: Fee) => string, line: FeeUndoLine | null): [string, Item[]][] {
  const before = (a: { fee: Fee; i: number }, b2: { fee: Fee; i: number }) => FEE_KIND_IDS.indexOf(a.fee.kind) - FEE_KIND_IDS.indexOf(b2.fee.kind) || a.i - b2.i;
  const byGroup = new Map<string, Item[]>();
  fees
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
  return [...byGroup].sort(([a], [b2]) => groupRank(a) - groupRank(b2));
}

export function FeesColumn({
  deal,
  view,
  groupOf,
  open,
  toolbox,
  line,
  caseLine,
  focus,
  onFocused,
  onDeal,
  onAdd,
  actions,
  ask,
}: {
  deal: FeeDeal;
  view: Builder;
  /** Each fee's group (`feeGroup`). */
  groupOf: (fee: Fee) => string;
  open: OpenHere;
  /** The toolbox for the open fee, drawn under its block; null where the page draws it in a column of its own or a sheet. */
  toolbox: ReactNode;
  /** The undo line of a fee just taken away; null where none stands. */
  line: FeeUndoLine | null;
  /** The undo line of a change to one fee's cases or prices; null where none stands. */
  caseLine: CaseUndoLine | null;
  /** What takes the focus once drawn, and what to call once it has. */
  focus: FeeFocus | null;
  onFocused: () => void;
  onDeal: (deal: FeeDeal) => void;
  onAdd: (kind: FeeKindId) => void;
  /** What a fee's block hands to the page. */
  actions: BlockActions;
  /** The thing to change by whose question stands in the open fee's block, in place, where its band will stand; null where none is asked. */
  ask: ByKind | null;
}) {
  // each block's height as last drawn, so the line a removed fee leaves is as tall as its block was
  const root = useRef<HTMLDivElement>(null);
  const adding = useRef<HTMLDivElement>(null);
  const heights = useRef(new Map<string, number>());
  // the fees whose folded tracks are open
  const [unfolded, setUnfolded] = useState<ReadonlySet<string>>(new Set());
  const blockOf = (feeId: string) => root.current?.querySelector<HTMLElement>(`li[data-fee="${CSS.escape(feeId)}"]`);
  useIsoLayoutEffect(() => {
    for (const li of root.current?.querySelectorAll<HTMLElement>("li[data-fee]") ?? []) heights.current.set(li.dataset.fee!, li.getBoundingClientRect().height);
    if (!focus) return;
    const li = blockOf(focus.fee);
    if (focus.on === "box") {
      // the fee's first box (the open case's price, in a fee with cases), brought above a phone's pinned sheet with the parts around it,
      // so an undo line under them is in view too
      const box = li?.querySelector<HTMLInputElement>("input[data-figure]");
      box?.focus({ preventScroll: true });
      box?.select();
      bringIntoView(box?.closest("[data-case-parts]") ?? box?.closest("[data-lift]") ?? li);
    } else feeFocus(li)?.focus({ preventScroll: true });
    onFocused();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal.fees, open.fee, focus]);
  const onFee = (f: Fee) => onDeal({ ...deal, fees: deal.fees.map((x) => (x.id === f.id ? f : x)) });
  const rows = new Map(view.rows.map((r) => [r.fee, r]));
  // every chip alike: the usual fees come first, which is their only mark
  const adds: AddItem[] = [...view.suggestions.usual, ...view.suggestions.rarer].map((k) => ({ id: k, label: feeName(k) }));

  const groups = groupsOf(deal.fees, groupOf, line);
  // the fees as they stand on the page, so the line of a fee taken away hands the focus, when it goes, to the fee now in its place, else
  // the one before it, else the add line
  const shown = groups.flatMap(([, items]) => items);
  const lineAt = shown.indexOf("line");
  const near = (k: number) => {
    const it = shown[k];
    return it && it !== "line" ? it.fee.id : null;
  };
  const afterRemoved = () => {
    const id = near(lineAt + 1) ?? near(lineAt - 1);
    return (id ? feeFocus(blockOf(id)) : null) ?? adding.current?.querySelector("button");
  };
  const undoLine = (l: FeeUndoLine) => (
    <UndoLine key={`undo:${l.what.kind}:${l.what.feeId}`} onUndo={l.onUndo} onHold={l.onHold} take={l.take} refocus={afterRemoved} height={heights.current.get(l.what.feeId)}>
      {l.words}
    </UndoLine>
  );

  // where the focus goes from a case's or a thing's undo line: a thing put back, its pill (else the open case); else the fee's first row
  const backTo = (cl: CaseUndoLine): HTMLElement | null => {
    const li = blockOf(cl.feeId);
    const el = (cl.thing !== undefined ? (li?.querySelector<HTMLElement>(`[data-thing="${cl.thing}"]`) ?? li?.querySelector<HTMLElement>("[data-open-case] button")) : null) ?? feeFocus(li);
    bringIntoView(el);
    return el;
  };
  // the undo line of a price put in another form, in the open case it was made in
  const formLine = (fee: Fee) => {
    const cl = caseLine?.feeId === fee.id && caseLine.inCase && caseLine.inCase.caseId === open.case && open.fee === fee.id ? caseLine : null;
    return cl ? (
      <UndoLine key={`undo:form:${cl.feeId}`} as="div" onUndo={cl.onUndo} onHold={cl.onHold} take={cl.take} refocusOnUndo refocus={() => blockOf(cl.feeId)?.querySelector<HTMLElement>("[data-case-parts] input[data-figure]")}>
        {cl.words}
      </UndoLine>
    ) : null;
  };
  const unfold = (feeId: string) => (on: boolean) => setUnfolded((u) => (on ? new Set([...u, feeId]) : new Set([...u].filter((x) => x !== feeId))));

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
                // a form's line stands in its open case (`formLine`), and nowhere while that case is closed
                const cl = caseLine?.feeId === it.fee.id && !caseLine.inCase ? caseLine : null;
                const li = (
                  <FeeItem key={it.fee.id} id={it.fee.id}>
                    <FeeBlockView fee={it.fee} row={rows.get(it.fee.id)} deal={deal} open={open} ask={ask} unfolded={unfolded.has(it.fee.id)} formLine={formLine(it.fee)} actions={actions} onUnfold={unfold(it.fee.id)} onFee={onFee} />
                    {cl && (
                      <UndoLine key={`undo:case:${cl.feeId}`} as="div" className="mt-2" onUndo={cl.onUndo} onHold={cl.onHold} take={cl.take} refocusOnUndo refocus={() => backTo(cl)}>
                        {cl.words}
                      </UndoLine>
                    )}
                  </FeeItem>
                );
                return it.fee.id === open.fee && toolbox ? [li, <li key="toolbox">{toolbox}</li>] : [li];
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

/** One fee among the column's: under the pointer or the focus it marks its fee in the summary. */
function FeeItem({ id, children }: { id: string; children: ReactNode }) {
  const { handlers } = useFeeMark(id);
  return (
    <li data-fee={id} data-figures="" className="come-in" {...handlers}>
      {children}
    </li>
  );
}

/** What takes the focus for a fee: its slim line's button, else its first case's row, else its first box. */
const feeFocus = (li: HTMLElement | null | undefined): HTMLElement | null => li?.querySelector<HTMLElement>("[data-pick-card], input") ?? null;
