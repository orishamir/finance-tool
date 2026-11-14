// The two columns that enter the deal (method §10.6, `builder`). "על מה העסקה" (`SetupColumn`): the deal's kind or, in the provident family,
// the place for its company and track, the price list it was filled from with the button that fills a new deal from another, and on a
// plain line at its end the month it started. "העמלות בעסקה" (`FeesColumn`): its fees, grouped by what each is charged on under the
// summary's group headings, a group shown only while the deal has a fee in it. A fee whose price changes by nothing is one slim line, its
// parts after its name; a fee whose price changes holds one band, a row per case, the tracks that are not the person's folded into one
// line, each case's standing against the cap after its parts. A tap on a slim line or a case's row opens it in place, the only place it
// shows: its slots, which open their menus, its parts with their boxes, and the actions on the case; while a fee is open, the things of its
// band's head are slots too, each opening its values and the action that stops the price changing by it. A fee just taken away leaves the page's undo line (`UndoLine`) in its place, as tall as its
// block was; another kind that takes fees away leaves it under the kind. After the groups, one quiet line offers the fees the deal could
// add: the kind's usual ones it lacks first, then the rarer ones and a fee of the person's own; a fee added lands in its group, open, and
// takes the focus in its first box. Where the page has no column for the toolbox and no sheet for it, the toolbox stands under its fee.
// A block under the pointer or the focus marks the fee in the summary.
import { useRef, useState, type ReactNode } from "react";
import type { ProductId } from "@finance-tool/schema";
import { feeDeal as copy } from "../../copy";
import type { Builder, BuilderRow, CaseRow as CaseRowView, SlimPart, WhenWords } from "../../lib/fee-deal/builder";
import { addCase, copyCase, setStart, type Side } from "../../lib/fee-deal/edit";
import type { DealKind } from "../../lib/fee-deal/kinds";
import { hasCases, pricesOn, type Fee, type FeeDeal } from "../../lib/fee-deal/model";
import { groupKey, groupOn, type DealRead, type StandingView } from "../../lib/fee-deal/parts";
import { templateSource, type LeftOut } from "../../lib/fee-deal/templates";
import type { UndoWhat } from "../../lib/fee-deal/undo";
import { fmt } from "../../lib/format";
import { FEE_KIND_IDS, FEE_SHAPES, holdsFunds, type FeeKindId } from "../../lib/fee-deal/shapes";
import { useIsoLayoutEffect } from "../../lib/hooks";
import { AddLine, Button, CaseFold, CaseRow, CaseSlot, ChoiceChips, ConditionBand, FeeBlock, GroupHead, MonthField, OpenCase, PartChip, Section, SlimFee, Step, When, monthText, type AddItem, type CaseWord } from "../kit";
import { Num } from "../provenance";
import type { OpenCase as OpenCaseView } from "../../lib/fee-deal/builder";
import { bringIntoView } from "./in-view";
import { LawTag, useFeeMark } from "./links";
import { OpenParts, PART_MARK, WhenText, numText, type PendingPart } from "./open-case";
import { TemplateNote } from "./picker";
import { UndoLine } from "./undo-line";
import { Fig, feeColour, feeName } from "./words";

const b = copy.builder;

/**
 * A price's standing against the cap now, after its parts (a slim fee's, or a case's in the band): the share of the cap or the standing's
 * tag; a later price's standing is said with that price, and the row's next change is in its notes. A tag leads to the fee's row of the
 * law card; a share opens its calculation. Nothing for a price not given yet.
 */
function RowStanding({ fee, priced, standing }: { fee: string; priced: boolean; standing: StandingView }) {
  if (!priced) return null;
  const now = standing.standing;
  if (now.judged && now.standing === "below" && standing.share)
    return (
      <span className="text-sm text-muted-foreground">
        <Num value={standing.share} display={fmt.share} />
        {copy.standing.shareShort}
      </span>
    );
  if (now.judged) return <LawTag fee={fee} standing={standing} />;
  return null;
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

export { bringIntoView } from "./in-view";

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

/** A case's value for each thing as a band row says it: the person's track marked "שלכם", a range's step with the range's icon. */
const caseWords = (when: readonly WhenWords[], mine: boolean, things: readonly { kind: string }[]): CaseWord[] =>
  when.map((w) => ({ text: <WhenText words={w} />, ...(w.any ? { any: true } : {}), ...(w.figure ? { range: true } : {}), ...(mine && things[w.thing]?.kind === "track" ? { mine: true } : {}) }));

/** A case's value for each thing in plain words, joined, for its spoken name and the toolbox's line ("בחו״ל, בארה״ב · מסלול 1"). */
export const caseText = (when: readonly WhenWords[]): string => when.map((w) => (w.figure ? `${w.lead ?? ""}${numText(w.figure)}` : (w.text ?? ""))).join(copy.cases.sep);

/** A part at rest, in a slim line or a case's row: its icon and first word, its figure in its own state, and the words after it. */
function RestPart({ part }: { part: SlimPart }) {
  const w = part.words;
  const tail = [w.tail, w.quiet].filter(Boolean).join("").trim();
  return (
    <PartChip kind={part.kind} mark={PART_MARK[part.id]} lead={w.lead?.trim()} figure={w.figure ? <Fig value={w.figure} /> : undefined} words={tail || undefined}>
      {w.mid && <span className="text-muted-foreground">{w.mid.trim()}</span>}
      {w.second && <Fig value={w.second} />}
      {w.month && <bdi dir="ltr">{monthText(w.month)}</bdi>}
    </PartChip>
  );
}

/** What the page holds for the case open in place, and what a fee's block does with it. */
export interface OpenHere {
  /** The open fee's id, and its open case (null for a slim fee). */
  fee: string | null;
  case: string | null;
  /** The open case as the panel builds it (`panel(...).open`). */
  view: OpenCaseView | null;
  /** A part the toolbox added that asks for its figure, month or fee in the open case. */
  pending: PendingPart | null;
  /** The slot whose menu is open: its thing's place among the fee's things. */
  menu: number | null;
  /** The thing of the band's head whose menu is open: its place among the fee's things. */
  thing: number | null;
}

/** The facts a slim line says at its end: that its price is not given yet or not read, its next change, where it is charged, its bounds. */
function RowNotes({ row, fee }: { row: BuilderRow; fee: Fee }) {
  const notes: ReactNode[] = [];
  if (!row.priced) notes.push(row.unmatched ? copy.cases.unmatched : b.facts.noPrice);
  if (row.next) notes.push(<When key="next" iso={row.next.at} lead={b.facts.next[row.next.change]!} />);
  if (row.insideFund) notes.push(b.facts.insideFund);
  if (row.priced && row.stages[0]!.price.form === "action" && FEE_SHAPES[fee.kind].fields.action?.includes("min") && !row.bounds.min && !row.bounds.max) notes.push(b.facts.noBounds);
  if (notes.length === 0) return null;
  return (
    <ul className="flex flex-col items-start gap-1 text-sm text-muted-foreground">
      {notes.map((n, k) => (
        <li key={k}>{n}</li>
      ))}
    </ul>
  );
}

/**
 * The page's undo line of a change to one fee's cases or prices (a case, a thing, a price taken away): it stands under the fee's block.
 * A price put in another form (`inCase`) leaves it in the open case, under its parts, where the change was made, while that case is open
 * (`caseId`, none for a fee whose price changes by nothing).
 */
export type CaseUndoLine = KindUndoLine & { feeId: string; inCase?: { caseId: string | null } };

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
  onOpen,
  onSlot,
  onThing,
  onAdd,
  onRemoveCase,
  onHoldOn,
  onPendingDone,
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
  /** A fee or a case opened in place, and how: by the pointer, or the keyboard (its first box then takes the focus). */
  onOpen: (feeId: string, caseId: string | null, by: "pointer" | "keyboard") => void;
  /** A slot of the open case tapped, at the pill it opens from; again, its menu closes. */
  onSlot: (t: number, at: HTMLElement) => void;
  /** A thing of the open fee's band head tapped, at its pill; again, its menu closes. */
  onThing: (t: number, at: HTMLElement) => void;
  onAdd: (kind: FeeKindId) => void;
  onRemoveCase: (feeId: string, caseId: string) => void;
  onHoldOn: (feeId: string, side: Side, k: number, caseId?: string) => void;
  onPendingDone: () => void;
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

  // the groups, each with its fees in one order by the fee's kind (`FEE_KIND_IDS`: a trade before its conversion), whatever order a
  // template filled them in, and fees of one kind in the deal's order; the line of a fee taken away stands in that fee's group, where its
  // block was
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

  // the undo line of a price put in another form, in the open case it was made in
  const formLine = (fee: Fee) => {
    const cl = caseLine?.feeId === fee.id && caseLine.inCase && caseLine.inCase.caseId === open.case && open.fee === fee.id ? caseLine : null;
    return cl ? (
      <UndoLine key={`undo:form:${cl.feeId}`} as="div" onUndo={cl.onUndo} onHold={cl.onHold} take={cl.take} refocusOnUndo refocus={() => blockOf(cl.feeId)?.querySelector<HTMLElement>("[data-case-parts] input[data-figure]")}>
        {cl.words}
      </UndoLine>
    ) : null;
  };
  const openParts = (fee: Fee, name: string) =>
    open.view && (
      <>
        <OpenParts fee={fee} open={open.view} deal={deal} name={name} pending={open.pending} onFee={onFee} onHoldOn={(side, k, caseId) => onHoldOn(fee.id, side, k, caseId)} onPendingDone={onPendingDone} />
        {formLine(fee)}
      </>
    );

  const block = (fee: Fee) => {
    const row = rows.get(fee.id);
    const name = feeName(fee.kind, fee.name);
    const isOpen = open.fee === fee.id;
    const dot = feeColour(fee.kind).bg;
    if (!row) return <p className="text-sm text-muted-foreground">{b.unread}</p>;
    if (row.block.kind === "slim")
      return (
        <div className="flex flex-col gap-1.5">
          <SlimFee dot={dot} name={<>{name}</>} label={b.open(name)} open={isOpen} onOpen={() => onOpen(fee.id, null, "pointer")}>
            {isOpen ? openParts(fee, name) : row.block.parts.map((p) => <RestPart key={p.id} part={p} />)}
            {!isOpen && <RowStanding fee={row.fee} priced={row.priced} standing={row.standingNow} />}
          </SlimFee>
          {!isOpen && <RowNotes row={row} fee={fee} />}
        </div>
      );
    const band = row.block;
    if (!hasCases(fee)) return null;
    const things = band.things.map((t) => ({ id: String(t.thing), name: t.words }));
    const byId = new Map([...band.rows, ...(band.folded?.rows ?? [])].map((r) => [r.case, r]));
    const folded = new Set(band.folded?.rows.map((r) => r.case));
    const caseRow = (r: CaseRowView) => {
      if (r.open && open.view) {
        const ov = open.view;
        return (
          <OpenCase
            key={r.case}
            slots={ov.slots.map((sl) => (
              <CaseSlot key={sl.thing} range={!!sl.words.figure} open={open.menu === sl.thing} onOpen={(at) => onSlot(sl.thing, at)}>
                <WhenText words={sl.words} />
              </CaseSlot>
            ))}
            mine={ov.slots.some((sl) => sl.mine)}
            {...(ov.canCopy ? { onCopy: () => copyOpen(fee, r.case) } : {})}
            {...(ov.canRemove ? { onRemove: () => onRemoveCase(fee.id, r.case) } : {})}
          >
            {openParts(fee, `${name}, ${caseText(r.when)}`)}
          </OpenCase>
        );
      }
      return (
        <CaseRow key={r.case} when={caseWords(r.when, r.mine, band.things)} label={`${copy.cases.openCase}${caseText(r.when)}`} onOpen={() => onOpen(fee.id, r.case, "pointer")}>
          {r.parts.map((p) => (
            <RestPart key={p.id} part={p} />
          ))}
          <RowStanding fee={fee.id} priced={r.priced} standing={r.standing} />
        </CaseRow>
      );
    };
    // the band's rows in the fee's order of cases, the folded ones as one line where the first of them stands
    const items: ReactNode[] = [];
    let foldPlaced = false;
    for (const c of fee.cases) {
      if (!folded.has(c.id)) {
        const r = byId.get(c.id);
        if (r) items.push(caseRow(r));
        continue;
      }
      if (foldPlaced) continue;
      foldPlaced = true;
      const on = unfolded.has(fee.id);
      items.push(
        <CaseFold key="fold" label={band.folded!.words} open={on} onToggle={() => setUnfolded((u) => (on ? new Set([...u].filter((x) => x !== fee.id)) : new Set([...u, fee.id])))}>
          {band.folded!.rows.map(caseRow)}
        </CaseFold>,
      );
    }
    return (
      <FeeBlock dot={dot} name={name}>
        <ConditionBand things={things} {...(isOpen ? { onThing: (id: string, at: HTMLElement) => onThing(Number(id), at), openThing: open.thing === null ? null : String(open.thing) } : {})} addCase={{ onAdd: () => addOne(fee) }}>
          {items}
        </ConditionBand>
      </FeeBlock>
    );
  };
  // "+ עוד מקרה" copies the open case, else the last, and opens the copy
  const addOne = (fee: Fee) => {
    const from = open.fee === fee.id ? (open.case ?? undefined) : undefined;
    const next = addCase(fee, from);
    if (!hasCases(next)) return;
    onFee(next);
    onOpen(fee.id, next.cases.at(-1)!.id, "pointer");
  };
  const copyOpen = (fee: Fee, caseId: string) => {
    const next = copyCase(fee, caseId);
    if (!hasCases(next)) return;
    onFee(next);
    const at = next.cases.findIndex((c) => c.id === caseId);
    onOpen(fee.id, next.cases[at + 1]!.id, "pointer");
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
                // a form's line stands in its open case (`formLine`), and nowhere while that case is closed
                const cl = caseLine?.feeId === it.fee.id && !caseLine.inCase ? caseLine : null;
                const li = (
                  <FeeItem key={it.fee.id} id={it.fee.id}>
                    {block(it.fee)}
                    {cl && (
                      <UndoLine key={`undo:case:${cl.feeId}`} as="div" className="mt-2" onUndo={cl.onUndo} onHold={cl.onHold} take={cl.take} refocusOnUndo refocus={() => feeFocus(blockOf(cl.feeId))}>
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
