// A fee whose price changes by things, laid out by its shape (method §10.6, F-114; lib/fee-deal/band-layout.ts and layout.ts): its
// condition's head, then, where its block has the room, a table of its cases (one thing; a range as a ladder whose step tops are typed in
// place) or a grid (two things; a third a switch above it; under a row's cells, a cell for each part its cells hold alike), the case open
// under them; on a block narrower than a computer's, the same cases as rows in the cases' band, a grid's in one group per value of its first thing,
// a part one cell holds for every case said once above them. Each add slot stands beside the heads (at the end of the column heads, under
// the row heads): "+ מקרה" on a list thing's table and a grid's row and column ask their new values from those the cases name not yet
// (`AskValuesOf`), on a split table it copies the open case (else the last); "+ מדרגה" asks only the new boundary (`AskStep`); a place of a
// grid no case holds takes a copy of its row's case. Every
// case shows, in the fee's order, the person's own marked "שלכם" and none set apart for not being theirs. Every head, row, cell and thing
// of the head has a grip (⋮⋮, lifted.ts says where each drops and what the bin takes), whose menu moves, duplicates or removes by
// keyboard; a table's columns, a grid's rows and columns and the cases read as rows are sortable lists, the others opening the gap where
// the pointer stands, and every place shows what a drop would do while a thing is over it (the page draws the deal as it would leave it).
// Every cell of a table or a grid has knobs that stretch it where nothing is overwritten (reach.ts), the cells it would cover showing its
// price while it is pulled, a cell over its whole row saying so. Under a grid's row, or a table's last row, a strip drawn while the
// pointer is there adds a part to every case of it as one stretched cell (`partAcross`), as its head's menu does. A toolbox part dragged
// here drops on a case's head, cell or row, or on the open case; a thing to change by, on a case's head, splits that case alone.
import { useMemo, useRef, useState, type ReactNode } from "react";
import { dealCases, feeDeal as copy } from "../../copy";
import type { CaseRow as CaseRowView, FeeBlock as BlockView } from "../../lib/fee-deal/rows";
import type { SlimPart, WhenWords } from "../../lib/fee-deal/case-words";
import { thingName } from "../../lib/fee-deal/case-words";
import { addCase, addCaseAt, copyCase, setTop } from "../../lib/fee-deal/edits/case";
import { duplicateValue, moveCase, moveValue, swapThings } from "../../lib/fee-deal/edits/arrange";
import { partAcross, shrink, shrinkAway, shrinkEmpties, stretch, stretchOver } from "../../lib/fee-deal/edits/cells";
import { bandLayout, headSaysLead, laterChanges, mergedParts, partsByRow, rangeSign, rowHead, type PartRow, type StepBounds } from "../../lib/fee-deal/band-layout";
import { valueKey, WHOLE, type FeeLayout, type GridRow, type Head, type Shared } from "../../lib/fee-deal/layout";
import { liftId, type Lifted, type LiftTarget } from "../../lib/fee-deal/lifted";
import { isRange, NAME_MAX, type CasesFee, type Fee } from "../../lib/fee-deal/model";
import { gridColumnSlots, gridPartSlots, gridRowSlots, knobEdges, reachEdits, reachOf, tableSlots, type Slot } from "../../lib/fee-deal/reach";
import type { StandingView } from "../../lib/fee-deal/deal-read";
import { fmt } from "../../lib/format";
import { ActionMenu, AddSlot, CaseGrid, CaseGroup, CaseRow, CaseSlot, CaseTable, ConditionBand, ConditionHead, DropBin, FigureField, Grip, OpenCase, PartChip, SegmentedControl, SharedLine, SpanKnob, Tag, monthText, useWidth, type AddSpec, type CaseWord, type GripAction, type SortOf } from "../kit";
import { IdRef, Num } from "../provenance";
import { AskStep, AskValuesOf } from "./ask-thing";
import { LawTag } from "./links";
import { WhenText, numText, whenText } from "./open-case";
import { PART_MARK } from "./part-edit";
import { EditHere, PartFig } from "./edit-here";
import type { BlockActions, OpenHere, ZoneOf } from "./fee-block";

const sep = copy.cases.sep;

/** A case's value for each thing in plain words, joined, for its spoken name and the toolbox's line ("בחו״ל, בארה״ב · מסלול 1"). */
export const caseText = (when: readonly WhenWords[]): string => when.map(whenText).join(sep);

/** A ladder's step as plain words, its range: "עד 100,000 ₪", "100,000 עד 500,000 ₪", "מעל 500,000 ₪". */
const stepText = (b: StepBounds): string =>
  !b.from ? `${copy.cases.upTo}${numText(b.to!)}` : !b.to ? `${copy.cases.over}${numText(b.from)}` : `${fmt.number(b.from.value as number)}${copy.cases.stepBetween}${numText(b.to)}`;

/**
 * A case's value for each thing as a band row says it: the person's track marked "שלכם", a range's step with the range's icon, read as its
 * range where its bounds are given (`bounds`, the case's `CaseRow.bounds`).
 */
export const caseWords = (when: readonly WhenWords[], mine: boolean, things: readonly { kind: string }[], bounds: readonly (StepBounds | null)[] = []): CaseWord[] =>
  when.map((w) => {
    const b = bounds[w.thing];
    return { text: b ? <bdi>{stepText(b)}</bdi> : <WhenText words={w} />, ...(w.any ? { any: true } : {}), ...(w.figure ? { range: true } : {}), ...(mine && things[w.thing]?.kind === "track" ? { mine: true } : {}) };
  });

/**
 * A price's standing against the cap now, after its parts (a slim fee's, or a case's): the share of the cap or the standing's tag; a tag
 * leads to the fee's row of the law card; a share opens its calculation. Nothing for a price not given yet.
 */
export function RowStanding({ fee, priced, standing }: { fee: string; priced: boolean; standing: StandingView }) {
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

/** A part at rest, in a slim line or a case's row: its icon and first word, its figure in its own state, and the words after it. */
export function RestPart({ part }: { part: SlimPart }) {
  const w = part.words;
  const tail = [w.tail, w.quiet].filter(Boolean).join("").trim();
  return (
    <PartChip kind={part.kind} mark={PART_MARK[part.id]} lead={w.lead?.trim()} figure={w.figure ? <PartFig part={part} n={0} value={w.figure} /> : undefined} words={tail || undefined}>
      {w.mid && <span className="text-muted-foreground">{w.mid.trim()}</span>}
      {w.second && <PartFig part={part} n={1} value={w.second} />}
      {w.month && <bdi dir="ltr">{monthText(w.month)}</bdi>}
      {w.questions?.map((q) => <IdRef key={q} id={q} />)}
    </PartChip>
  );
}

/** A part as words in a table's cell or a line said once: its first word (left out under a head that says it, `bare`), its figures, its tail. */
function PartText({ part, bare }: { part: SlimPart; bare?: boolean }) {
  const w = part.words;
  return (
    <span>
      {!bare && w.lead}
      {w.figure && <PartFig part={part} n={0} value={w.figure} />}
      {w.mid}
      {w.second && <PartFig part={part} n={1} value={w.second} />}
      {w.month && <bdi dir="ltr">{monthText(w.month)}</bdi>}
      {w.tail}
      {w.quiet && <span className="text-muted-foreground">{w.quiet}</span>}
      {w.questions?.map((q) => <IdRef key={q} id={q} />)}
    </span>
  );
}

/** Parts as words, one after the other with " · " between them. */
function Joined({ parts, bare }: { parts: readonly SlimPart[]; bare?: boolean }) {
  return (
    <>
      {parts.map((p, k) => (
        <span key={`${p.stage ?? 0}:${p.id}`}>
          {k > 0 && <span className="text-muted-foreground">{sep}</span>}
          <PartText part={p} bare={bare} />
        </span>
      ))}
    </>
  );
}

/**
 * Whether a table or a grid is drawn: where its block has the room it needs (a head column, each case's or value's, and the add pill), or
 * a computer's room (`TABLE_ROOM`), where a table wider than its block scrolls inside itself rather than falling back to rows; narrower,
 * the cases read as rows.
 */
function fits(layout: FeeLayout, width: number): boolean {
  const need = layout.shape === "table" ? 96 + layout.columns.length * (layout.ladder ? STEP_COLUMN : 128) + 96 : layout.shape === "grid" ? 152 + layout.columns.length * (layout.across.range ? STEP_COLUMN : 136) + 96 : Infinity;
  return layout.shape !== "rows" && (width >= need || width >= TABLE_ROOM);
}

/** A block this wide, in px, is a computer's: its table is drawn whatever its cases, and scrolls inside itself where it is wider. */
const TABLE_ROOM = 600;

/** A ladder's column, in px: room for its head on one line, "100,000 עד" and its top's box (`CaseTable`'s and `CaseGrid`'s `steps`). */
const STEP_COLUMN = 184;

/** The question of an add slot open: the thing it adds a value of, and whether it adds a step. */
type Asking = { thing: number; range: boolean } | null;

/**
 * A knob being dragged: the line it stands in (a part row, a grid's row by its key, or a grid's column as `col:` and its key), where its
 * cell starts (`base`), and the columns or rows the cell would reach now.
 */
type Reach = { row: string; base: number; from: number; to: number; fill: ReactNode } | null;



export function FeeCases({
  fee,
  band,
  open,
  name,
  onFee,
  actions,
  zone,
  openParts,
}: {
  fee: CasesFee;
  band: Extract<BlockView, { kind: "band" }>;
  open: OpenHere;
  name: string;
  onFee: (f: Fee) => void;
  actions: BlockActions;
  /** A drop zone around `el` for the places `on` (the first that takes a thing gets it): it takes a toolbox part, and lifted things. */
  zone: ZoneOf;
  /** The open case's parts in edit, with the spoken name of its boxes. */
  openParts: (spoken: string) => ReactNode;
}) {
  const { onOpen, onSlot, onThing, onRemoveCase, onRemoveBy, lift } = actions;
  const isOpen = open.fee === fee.id;
  const openCase = isOpen ? open.case : null;
  // the switch starts on the person's own case's value, where a case is theirs (their track), else on the first
  const mineOn = fee.cases.find((c) => c.mine)?.when[2];
  const [switchTo, setSwitchTo] = useState<string | null>(mineOn !== undefined && mineOn !== "any" ? valueKey(mineOn) : null);
  const [asking, setAsking] = useState<Asking>(null);
  const [reach, setReach] = useState<Reach>(null);
  const slot = useRef<HTMLElement | null>(null);
  const [box, width] = useWidth(326);
  // every case, in the fee's order: none is set apart for not being the person's; a later price says only what it changes
  const rows = useMemo(() => band.rows.map((r) => ({ ...r, parts: laterChanges(r.parts) })), [band.rows]);
  const byCase = new Map(rows.map((r) => [r.case, r]));
  const layout = useMemo(() => bandLayout(fee, rows, switchTo), [fee, rows, switchTo]);
  const wide = fits(layout, width);
  const c = copy.cases;
  const lw = c.lifted;

  const partsOf = (caseId: string, row: PartRow) => partsByRow(byCase.get(caseId)!.parts).get(row) ?? [];
  /** The parts a case's row shows, read as rows (a band); a grid's cell, what no part cell under its row holds (`cellParts`). */
  const shownParts = (caseId: string) => layout.shows[caseId]!.flatMap((row) => partsOf(caseId, row as PartRow));
  const cellParts = (caseId: string) => (layout.shape === "grid" ? layout.cellShows[caseId]! : []).flatMap((row) => partsOf(caseId, row as PartRow));
  /** Of several cases, each one's value of the first thing they differ by, in words: what tells them apart in a cell over them all. */
  const namedAmong = (cases: readonly string[]) => (id: string) => {
    const at = byCase.get(id)!.when;
    const t = at.findIndex((_, k) => cases.some((o) => JSON.stringify(byCase.get(o)!.when[k]) !== JSON.stringify(at[k])));
    return whenText(at[t < 0 ? 0 : t]!);
  };
  /**
   * Figures drawn inside are edited in place for these cases (`EditHere`), and carried on to the later prices that held them alike; a
   * figure the cases hold from different places names each case by what tells it apart.
   */
  const here = (cases: readonly string[], el: ReactNode) => <EditHere.Provider value={{ fee, cases, onFee, carry: true, named: namedAmong(cases) }}>{el}</EditHere.Provider>;
  /** The parts said once for many cases, each edited for all of them. */
  const saidJoined = (said: readonly Shared[]) => (
    <>
      {said.map((x, k) => (
        <span key={x.row}>
          {k > 0 && <span className="text-muted-foreground">{sep}</span>}
          {here(x.cases, <Joined parts={mergedParts(x.cases, (id) => partsOf(id, x.row as PartRow))} />)}
        </span>
      ))}
    </>
  );
  const label = (r: CaseRowView) => `${c.openCase}${caseText(r.when)}`;
  const openIt = (caseId: string) => () => onOpen(fee.id, caseId, "pointer");
  // a case or a step added opens: the first case the fee did not have
  const addAndOpen = (next: Fee) => {
    onFee(next);
    const fresh = next.cases?.find((x) => !fee.cases.some((o) => o.id === x.id));
    if (fresh) onOpen(fee.id, fresh.id, "pointer");
  };
  const ask = (thing: number, range: boolean) => (at: HTMLElement) => {
    slot.current = at;
    setAsking((a) => (a && a.thing === thing ? null : { thing, range }));
  };
  const asked = (added: boolean) => {
    setAsking(null);
    if (!added) requestAnimationFrame(() => slot.current?.isConnected && slot.current.focus());
  };
  // where a case has no new value to ask (a split table's), "+ מקרה" copies the open case, else the last, and opens the copy
  const addOne: AddSpec = { label: c.addSlot.case, onAdd: () => addAndOpen(addCase(fee, openCase ?? undefined)) };
  const stepSlot = (t: number): AddSpec => ({ label: c.addSlot.step, onAdd: ask(t, true), expanded: asking?.thing === t });
  const valuesSlot = (t: number): AddSpec => valuesSlotAs(t, thingName(fee.kind, fee.by[t]!));
  /** An add slot that asks the new values of list thing `t` (`AskValuesOf`, the values the cases name not yet), with its own words. */
  const valuesSlotAs = (t: number, words: string): AddSpec => ({ label: words, onAdd: ask(t, false), expanded: asking?.thing === t });
  const slotOf = (t: number, range: boolean) => (range ? stepSlot(t) : valuesSlot(t));

  // ---------------------------------------------------------------- grips: what each lifts, its menu, and what its bin takes
  const removeAction = (l: Lifted): GripAction[] => (lift.binTakes(l) ? [{ label: lw.menu.remove, danger: true, onPick: () => lift.onBin(l) }] : []);
  /**
   * A grip that lifts `l`: its spoken name, its menu's other actions, the thing's own words (the bin says them), where it stands
   * (`outside`: just before a table's cell), and `still` where nothing would take the thing (its menu alone).
   */
  const grip = (l: Lifted, spoken: string, more: GripAction[] = [], o: { name?: string; place?: "inside" | "outside"; still?: boolean } = {}) => {
    const actions = [...more, ...removeAction(l)];
    return <Grip item={liftId(l)} label={spoken} actions={actions} {...(o.name ? { name: o.name } : {})} {...(o.place ? { place: o.place } : {})} {...(o.still ? { still: true } : {})} {...(lift.binTakes(l) ? { onRemove: () => lift.onBin(l) } : {})} />;
  };
  /** The sortable lists of this fee's places: a table's columns, a grid's rows and columns, the cases read as rows. */
  const list = (name: string, axis: "x" | "y") => ({ list: `${name}:${fee.id}`, axis });
  /**
   * A list thing's value moved by one place, to where the head beside it stands (`keys`: the heads' values as the page shows them), and
   * duplicated right after it, named "<value> (עותק)".
   */
  const valueActions = (t: number, key: string, words: string, keys: readonly string[], down: boolean): GripAction[] => {
    const out: GripAction[] = [];
    const k = keys.indexOf(key);
    if (k > 0) out.push({ label: down ? lw.menu.up : lw.menu.before, onPick: () => onFee(moveValue(fee, t, key, keys[k - 1]!)) });
    if (k >= 0 && k < keys.length - 1) out.push({ label: down ? lw.menu.down : lw.menu.after, onPick: () => onFee(moveValue(fee, t, key, keys[k + 1]!)) });
    out.push({ label: down ? lw.menu.duplicateRow : lw.menu.duplicateColumn, onPick: () => addAndOpen(duplicateValue(fee, t, key, copyName(words))) });
    return out;
  };
  /** A copy's name, "<value> (עותק)", its value cut first so the whole is no longer than a name may be. */
  const copyName = (words: string) => lw.copyName.replace("{name}", words.slice(0, NAME_MAX - (lw.copyName.length - "{name}".length)).trim());
  const stepName = (r: CaseRowView, t: number) => (r.bounds[t] ? stepText(r.bounds[t]!) : whenText(r.when[t]!));
  /** What a head's grip lifts: a range's step (to its bin alone), else a value of a list thing; nothing for a range's value on any size. */
  const headLifted = (h: Head, t: number): Lifted | null => {
    const words = stepName(byCase.get(h.cases[0]!)!, t);
    if (isRange(fee.by[t]!)) return typeof h.when === "number" ? { k: "step", fee: fee.id, t, step: h.when, name: words } : null;
    return { k: "value", fee: fee.id, t, key: h.key, name: words };
  };
  /** A head's grip: a range's step (its bin alone), else a value of a list thing (moved, duplicated, removed); `more`, its row's other actions. */
  const headGrip = (h: Head, t: number, heads: readonly Head[], more: GripAction[] = []) => {
    const l = headLifted(h, t);
    if (!l) return null;
    const words = stepName(byCase.get(h.cases[0]!)!, t);
    // a head's grip stands inside it: a head's words fill its column, and nothing of it may pass the column's edge (layout-check's `head`)
    const place = "inside" as const;
    if (l.k === "step") return grip(l, `${lw.grip.step}${words}`, more, { name: stepWords(words), place, still: !lift.binTakes(l) });
    return grip(l, `${t === 0 ? lw.grip.row : lw.grip.column}${words}`, [...valueActions(t, h.key, words, heads.map((x) => x.key), t === 0), ...more], { name: (t === 0 ? lw.name.row : lw.name.column).replace("{name}", words), place });
  };
  const stepWords = (words: string) => lw.name.step.replace("{name}", words);
  /** The item a head's grip lifts, for its cells to stand as its gap while it is carried. */
  const headItem = (h: Head, t: number) => {
    const l = headLifted(h, t);
    return l ? { liftItem: liftId(l) } : {};
  };

  // ---------------------------------------------------------------- a part across a whole row ("+ חלק לכל השורה", SPEC-table-3)
  const [rowMenu, setRowMenu] = useState<{ at: HTMLElement; cases: string[]; along: number } | null>(null);
  /** The parts a row's cases can all take, each an action that puts it in every one of them as one stretched cell (`partAcross`). */
  const partChoices = (cases: readonly string[], along: number): GripAction[] =>
    lift.rowParts(fee.id, cases).map((p) => ({ label: p.label, onPick: () => onFee(partAcross(fee, cases, p.id, along)) }));
  /** The strip under a row that adds a part to every case of it, and the same in its head's menu; none where no part fits them all. */
  const rowAdd = (cases: readonly string[], along: number, words: { strip: string; menu: string; spoken: string }) => {
    const choices = cases.length ? partChoices(cases, along) : [];
    if (choices.length === 0) return { strip: undefined, menu: [] as GripAction[] };
    return {
      strip: { label: words.strip, spoken: words.spoken, expanded: rowMenu?.cases.join() === cases.join(), onAdd: (at: HTMLElement) => setRowMenu((m) => (m && m.at === at ? null : { at, cases: [...cases], along })) } as AddSpec,
      menu: [{ label: words.menu, onPick: () => undefined, then: choices }] as GripAction[],
    };
  };
  const caseTarget = (caseId: string): LiftTarget => ({ k: "case", fee: fee.id, case: caseId });

  // ---------------------------------------------------------------- knobs: a cell stretched over its neighbours, or back
  const plural = (t: number) => lw.things[fee.by[t]!.kind] ?? lw.things.own!;
  /**
   * The knobs of a cell over columns `from` to `from + span - 1` of a line whose places are `cases`, in part row `row` (or the whole case)
   * along thing `t`: one on each edge that can move without overwriting a price (reach.ts), toward a case that holds nothing there (it
   * takes the cell's part) or a grid's place no case holds (filled with a copy of the case, `stretchOver`), or back where it covers more
   * than one place, which takes from the places it leaves what the stretch gave (`shrinkAway`; a table's price leaves a copy, `shrink`).
   * Each keeps an undo. While a knob is pulled, the cells it would cover show its `content` as they would hold it (`fillAt`).
   */
  const knobsOf = (rowKey: string, cases: readonly Slot[], from: number, span: number, row: PartRow | typeof WHOLE, t: number, axis: "x" | "y" = "x", content: ReactNode = null) => {
    const to = from + span - 1;
    const { lo, hi } = reachOf(cases, from, span);
    const edges = knobEdges(cases, from, span);
    const own = (cases[from] as { own: string }).own;
    const onReach = (a: number, b: number, done: boolean) => {
      if (!done) return setReach({ row: rowKey, base: from, from: a, to: b, fill: content });
      setReach(null);
      const { over, places, off } = reachEdits(cases, from, to, a, b);
      // down a grid's column only a named span merges (layout.ts): the stretch names one
      if (places.length) lift.onStretch(stretchOver(fee, own, over, places, t, axis === "y"), lw.stretched);
      else if (over.length) lift.onStretch(stretch(fee, own, over, row, t, axis === "y"), lw.stretched);
      else if (off.length && shrinkEmpties(layout.shape === "grid", row)) lift.onStretch(shrinkAway(fee, off, row), shrunk(off, row));
      else if (off.length) onFee(shrink(fee, off, row, t));
    };
    const at = reach && reach.row === rowKey && reach.base === from ? reach : null;
    const shown = at ?? { from, to };
    const props = { axis, from: shown.from, to: shown.to, min: lo, max: hi, label: axis === "x" ? lw.knob : lw.knobDown, valueText: lw.reach.replace("{k}", String(shown.to - shown.from + 1)).replace("{n}", String(cases.length)).replace("{things}", plural(t)), onReach };
    return {
      knobs: (
        <>
          {edges.before && <SpanKnob edge="before" {...props} />}
          {edges.after && <SpanKnob edge="after" {...props} />}
        </>
      ),
      // Shift with an arrow on the cell: its edge after it (left, or its foot), one column or row on, or back
      onStretch: (by: 1 | -1) => {
        const b = Math.max(from, Math.min(hi, to + by));
        if (b !== to) onReach(from, b, true);
      },
    };
  };
  /** The undo line of a cell stretched back: where it left, and what it took there ("מניות בלונדון · בסניף: המקרה הוסר."). */
  const shrunk = (off: readonly string[], row: PartRow | typeof WHOLE) =>
    lw.shrunk.replace("{where}", off.map((id) => caseText(byCase.get(id)!.when)).join(", ")).replace("{what}", row === WHOLE ? c.caseRemoved : lw.part[row]!);
  const lit = (rowKey: string, from: number, span: number) => !!reach && reach.row === rowKey && from + span - 1 >= reach.from && from <= reach.to;
  /** While a knob is pulled over a cell that is not its own: lit, with the price it would take there. */
  const fillAt = (rowKey: string, from: number, span: number) => (lit(rowKey, from, span) && reach!.base !== from ? { lit: true, fill: reach!.fill } : {});
  /** The words under a cell over every column of its row: "בכל ערוץ", "בכל גודל". */
  const wholeWords = (span: number, n: number, t: number) => (n > 1 && span === n ? (c.any[fee.by[t]!.kind] ?? null) : null);

  /** A value's words in a head: a range's step as its bounds, its top typed in place; any other value as its words. */
  const headOf = (r: CaseRowView, t: number): ReactNode => {
    const b = r.bounds[t];
    if (b) return <StepHead fee={fee} t={t} bounds={b} onFee={onFee} />;
    return (
      <>
        <WhenText words={r.when[t]!} />
        {r.mine && fee.by[t]!.kind === "track" && <Tag tone="primary">{dealCases.mine}</Tag>}
      </>
    );
  };
  const headOfValue = (h: Head, t: number) => headOf(byCase.get(h.cases[0]!)!, t);

  // the things of the head: each a grip that swaps it with another where the fee has two or more (by a drop, or "החלפה" in its menu), and
  // a drop zone that shows the swap while a pill is over it
  const headThings = band.things.map((th) => ({
    id: String(th.thing),
    name: th.words,
    removeLabel: c.thingMenu.stop.replace("{thing}", th.words),
    ...(fee.by.length > 1
      ? {
          grip: grip(
            { k: "thing", fee: fee.id, t: th.thing, name: th.words },
            `${lw.grip.thing}${th.words}`,
            band.things
              .filter((o) => o.thing !== th.thing)
              .map((o) => ({ label: fee.by.length === 2 ? lw.menu.swap : lw.menu.swapWith.replace("{thing}", o.words), onPick: () => onFee(swapThings(fee, th.thing, o.thing)) })),
            { name: th.words },
          ),
          zone: (pill: ReactNode) => zone([{ k: "thing", fee: fee.id, t: th.thing }], `thing:${th.thing}`, pill),
        }
      : {}),
  }));
  const head = { things: headThings, ...(isOpen ? { onThing: (id: string, at: HTMLElement) => onThing(Number(id), at), openThing: open.thing === null ? null : String(open.thing) } : {}), onRemoveThing: (id: string) => onRemoveBy(fee.id, Number(id)) };

  /** A one-thing table read as rows: the parts one cell holds over every column, said once above the rows, led by the thing's any-words. */
  const onceLine = (once: readonly Shared[], t: number) => (once.length ? <SharedLine lead={c.onceLead.replace("{any}", c.any[fee.by[t]!.kind] ?? "")}>{saidJoined(once)}</SharedLine> : null);

  const openView = (r: CaseRowView) => {
    const ov = open.view!;
    return zone(
      [caseTarget(r.case)],
      `open:${r.case}`,
      <OpenCase
        slots={ov.slots.map((sl) => (
          <CaseSlot key={sl.thing} range={!!sl.words.figure} open={open.menu === sl.thing} onOpen={(at) => onSlot(sl.thing, at)}>
            <WhenText words={sl.words} />
          </CaseSlot>
        ))}
        mine={ov.slots.some((sl) => sl.mine)}
        {...(ov.canCopy ? { onCopy: () => addAndOpen(copyCase(fee, r.case)) } : {})}
        {...(ov.canRemove ? { onRemove: () => onRemoveCase(fee.id, r.case) } : {})}
      >
        {openParts(`${name}, ${caseText(r.when)}`)}
      </OpenCase>,
    );
  };
  const openRow = openCase && open.view ? byCase.get(openCase) : undefined;

  /**
   * A case as a band row: its grip (`still` where nothing would take it), its words (`when`), the parts it still shows, its standing; open,
   * in place. `sort`: the rows are a sortable list (a list thing's cases), so a row carried among them lands where the pointer stands.
   */
  const bandRow = (r: CaseRowView, when: CaseWord[], l: Lifted, spoken: string, o: { more?: GripAction[]; also?: LiftTarget[]; name?: string; still?: boolean; sort?: SortOf } = {}) =>
    r.case === openCase && open.view
      ? openView(r)
      : zone(
          [...(o.also ?? []), caseTarget(r.case)],
          r.case,
          <CaseRow when={when} label={label(r)} onOpen={openIt(r.case)} grip={grip(l, spoken, o.more ?? [], { ...(o.name ? { name: o.name } : {}), ...(o.still ? { still: true } : {}) })}>
            {here(
              [r.case],
              shownParts(r.case).map((p) => <RestPart key={`${p.stage ?? 0}:${p.id}`} part={p} />),
            )}
            <RowStanding fee={fee.id} priced={r.priced} standing={r.standing} />
          </CaseRow>,
          o.sort,
        );

  const question = asking ? (asking.range ? <AskStep key={`step:${asking.thing}`} fee={fee} t={asking.thing} onFee={addAndOpen} onDone={asked} /> : <AskValuesOf key={`values:${asking.thing}`} fee={fee} t={asking.thing} onFee={addAndOpen} onDone={asked} />) : null;
  // the bin, while something of this fee is lifted: under its table, grid or band; on a phone at the foot of the screen
  const bin = <DropBin phone={lift.phone} accepts={(it) => lift.binTakesItem(fee.id, it)} onDrop={(it) => lift.onBinItem(it)} />;
  /** The menu a row's strip opens: the parts every case of the row can take. */
  const rowMenuView = rowMenu && rowMenu.at.isConnected ? <ActionMenu key={rowMenu.cases.join()} actions={partChoices(rowMenu.cases, rowMenu.along)} back={{ current: rowMenu.at }} onClose={() => setRowMenu(null)} /> : null;

  let body: ReactNode;
  if (wide && layout.shape === "table") {
    const t = layout.thing;
    const all = rows.flatMap((r) => r.parts);
    const n = layout.columns.length;
    const listThing = !layout.ladder && layout.split === null && !isRange(fee.by[t]!);
    const order = layout.columns.map((x) => x.case);
    const allCases = layout.columns.map((x) => x.case);
    const across = rowAdd(allCases, t, { strip: c.rowAdd.allCases, menu: lw.menu.addAllCases, spoken: lw.menu.addAllCases });
    /** What a column's grip lifts: a ladder's step (to its bin), a value of the table's thing where it is not the fee's first, else its case. */
    const colLifted = (col: (typeof layout.columns)[number], words: string): Lifted | null =>
      layout.ladder ? (typeof col.when === "number" ? { k: "step", fee: fee.id, t, step: col.when, name: words } : null) : t !== 0 ? { k: "value", fee: fee.id, t, key: valueKey(col.when), name: words } : { k: "col", fee: fee.id, case: col.case };
    body = (
      <>
        <ConditionHead bare {...head} />
        <CaseTable
          label={name}
          ladder={layout.ladder}
          columns={layout.columns.map((col) => {
            const r = byCase.get(col.case)!;
            const words = layout.ladder ? stepName(r, t) : caseText(r.when);
            const l = colLifted(col, words);
            const moves = listThing && n > 1;
            const more = listThing ? caseActions(col.case, order, words, t) : [];
            const still = !!l && !moves && !lift.binTakes(l);
            const spoken = layout.ladder ? `${lw.grip.step}${words}` : still ? `${lw.grip.colOnly}${words}` : `${lw.grip.col}${words}`;
            const cg = l ? grip(l, spoken, more, { name: layout.ladder ? stepWords(words) : lw.name.case.replace("{name}", words), still }) : null;
            const target: LiftTarget = l?.k === "value" ? { k: "value", fee: fee.id, t, key: l.key } : { k: "col", fee: fee.id, case: col.case };
            return {
              id: col.case,
              head: col.sub !== undefined ? <SubHead r={r} sub={layout.split!} head={headOf(r, t)} /> : headOf(r, t),
              label: label(r),
              onOpen: openIt(col.case),
              open: col.case === openCase,
              ...(cg ? { grip: cg } : {}),
              ...(l ? { liftItem: liftId(l) } : {}),
              zone: (h: ReactNode) => zone([target, caseTarget(col.case)], col.case, h, listThing ? list("cols", "x") : undefined),
            };
          })}
          rows={layout.rows.map((row) => {
            const pr = row.row as PartRow;
            const rowHeadWords = rowHead(pr, all);
            const slots = tableSlots(layout, row.cells);
            const rl: Lifted = { k: "row", fee: fee.id, row: pr };
            return {
              id: row.row,
              head: rowHeadWords,
              grip: grip(rl, `${lw.grip.partRow}${rowHeadWords}`, across.menu, { name: lw.name.partRow.replace("{name}", rowHeadWords), still: !lift.binTakes(rl) }),
              cells: row.cells.map((cell) => {
                const target: LiftTarget = { k: "cell", fee: fee.id, cases: cell.cases, row: pr, along: t };
                const cellZone = (el: ReactNode) => zone([target, caseTarget(cell.cases[0]!)], `${row.row}:${cell.from}`, el);
                if (cell.key === null) return { id: cell.cases.join("+"), from: cell.from, span: cell.span, content: null, zone: cellZone, ...fillAt(row.row, cell.from, cell.span) };
                const ww = wholeWords(cell.span, n, t);
                const content = here(cell.cases, <Joined parts={mergedParts(cell.cases, (id) => partsOf(id, pr))} bare={headSaysLead(pr)} />);
                const cl: Lifted = { k: "cell", fee: fee.id, cases: cell.cases, row: pr, along: t };
                return {
                  id: cell.cases.join("+"),
                  from: cell.from,
                  span: cell.span,
                  open: !!openCase && cell.cases.includes(openCase),
                  onOpen: openIt(cell.cases[0]!),
                  content,
                  grip: grip(cl, `${lw.grip.cell}${rowHeadWords}`, [], { name: rowHeadWords, place: "outside" }),
                  ...knobsOf(row.row, slots, cell.from, cell.span, pr, t, "x", content),
                  onRemove: () => lift.onBin(cl),
                  ...fillAt(row.row, cell.from, cell.span),
                  ...(ww ? { whole: ww } : {}),
                  zone: cellZone,
                };
              }),
            };
          })}
          add={layout.ladder ? stepSlot(t) : listThing ? valuesSlotAs(t, c.addSlot.case) : addOne}
          {...(across.strip ? { addPart: across.strip } : {})}
          foot={bin}
        />
      </>
    );
  } else if (wide && layout.shape === "grid") {
    const g = layout;
    const n = g.columns.length;
    /** The part cells under a row: each a real cell of its part row, edited in place, lifted, stretched and taken away like a table's. */
    const partLines = (row: GridRow) =>
      row.parts.map((line) => {
        const pr = line.row as PartRow;
        const slots = gridPartSlots(g, row, (id) => partsOf(id, pr).length > 0);
        const lineKey = `${row.key}|${pr}`;
        return {
          id: line.row,
          cells: line.cells.map((cell) => {
            const l: Lifted = { k: "cell", fee: fee.id, cases: cell.cases, row: pr, along: 1 };
            const shown = mergedParts(cell.cases, (id) => partsOf(id, pr));
            const ww = wholeWords(cell.span, n, 1);
            const content = here(cell.cases, <Joined parts={shown} />);
            const words = rowHead(pr, shown);
            return {
              from: cell.from,
              span: cell.span,
              open: !!openCase && cell.cases.includes(openCase),
              onOpen: openIt(cell.cases[0]!),
              content,
              grip: grip(l, `${lw.grip.cell}${words}`, [], { name: words, place: "outside" }),
              ...knobsOf(lineKey, slots, cell.from, cell.span, pr, 1, "x", content),
              ...(lift.binTakes(l) ? { onRemove: () => lift.onBin(l) } : {}),
              ...fillAt(lineKey, cell.from, cell.span),
              ...(ww ? { whole: ww } : {}),
              zone: (el: ReactNode) => zone([l as LiftTarget, caseTarget(cell.cases[0]!)], `${lineKey}:${cell.from}`, el),
            };
          }),
        };
      });
    const downList = !g.down.range ? list("grows", "y") : undefined;
    const acrossList = !g.across.range ? list("gcols", "x") : undefined;
    body = (
      <>
        <ConditionHead bare {...head} />
        <CaseGrid
          label={name}
          steps={g.across.range}
          above={g.switch && <ThingSwitch fee={fee} values={g.switch.values} chosen={g.switch.chosen} words={(h) => byCase.get(h.cases[0]!)!.when[2]!} mine={(h) => byCase.get(h.cases[0]!)!.mine} onChange={setSwitchTo} />}
          columns={g.columns.map((col) => {
            const hg = headGrip(col, 1, g.columns);
            return { id: col.key, head: headOfValue(col, 1), ...(hg ? { grip: hg } : {}), ...headItem(col, 1), zone: (h: ReactNode) => zone([{ k: "value", fee: fee.id, t: 1, key: col.key }], `col:${col.key}`, h, acrossList) };
          })}
          rows={g.rows.map((row, j) => {
            const rc = gridRowSlots(g, row);
            const inRow = row.cells.filter((x) => x.case && !x.covered && !x.whole).flatMap((x) => x.cases.filter((id) => row.cases.includes(id)));
            const words = whenText(byCase.get(row.cases[0]!)!.when[0]!);
            const strip = rowAdd(inRow, 1, { strip: c.rowAdd.strip, menu: lw.menu.addRow, spoken: `${lw.menu.addRow}${sep}${words}` });
            const hg = headGrip(row, 0, g.rows, strip.menu);
            return {
              id: row.key,
              head: headOfValue(row, 0),
              ...(hg ? { grip: hg } : {}),
              ...headItem(row, 0),
              lines: partLines(row),
              ...(strip.strip ? { addPart: strip.strip } : {}),
              zone: (h: ReactNode) => zone([{ k: "value", fee: fee.id, t: 0, key: row.key }], `row:${row.key}`, h, downList),
              cells: row.cells.filter((cell) => !cell.covered).map((cell) => {
                const col = g.columns[cell.from]!;
                if (!cell.case) {
                  const from = row.cells.find((x) => x.case)?.case ?? row.cases[0]!;
                  const fill = fillAt(row.key, cell.from, 1);
                  return {
                    from: cell.from,
                    span: cell.span,
                    ...(fill.lit ? fill : fillAt(`col:${col.key}`, j, 1)),
                    empty: { label: c.addSlot.case, spoken: `${c.emptyPlace}${whenText(byCase.get(row.cases[0]!)!.when[0]!)}${sep}${whenText(byCase.get(col.cases[0]!)!.when[1]!)}`, onAdd: () => addAndOpen(addCaseAt(fee, from, 1, col.when)) },
                    zone: (el: ReactNode) => zone([{ k: "place", fee: fee.id, row: from, t: 1, when: col.when }], `place:${row.key}:${cell.from}`, el),
                  };
                }
                const r = byCase.get(cell.case)!;
                const target: LiftTarget = { k: "cell", fee: fee.id, cases: cell.cases, row: WHOLE, along: 1 };
                const down = cell.down ?? 1;
                const ww = cell.whole ? null : (wholeWords(cell.span, n, 1) ?? wholeWords(down, g.rows.length, 0));
                const content = (
                  <>
                    {here(cell.cases, <Joined parts={mergedParts(cell.cases, cellParts)} />)}
                    <RowStanding fee={fee.id} priced={r.priced} standing={r.standing} />
                  </>
                );
                // across: a cell of one row; down: a cell one column wide
                const acrossKnobs = !cell.whole && down === 1 ? knobsOf(row.key, rc, cell.from, cell.span, WHOLE, 1, "x", content) : null;
                const colKey = `col:${col.key}`;
                const downward = !cell.whole && cell.span === 1 ? knobsOf(colKey, gridColumnSlots(g, cell.from), j, down, WHOLE, 0, "y", content) : null;
                const fill = fillAt(row.key, cell.from, cell.span);
                const cl: Lifted = { k: "cell", fee: fee.id, cases: cell.cases, row: WHOLE, along: 1 };
                return {
                  id: cell.case,
                  from: cell.from,
                  span: cell.span,
                  ...(down > 1 ? { down } : {}),
                  onOpen: openIt(cell.case),
                  open: !!openCase && cell.cases.includes(openCase),
                  content,
                  ...(cell.whole ? { across: <WhenText words={r.when[1]!} /> } : {}),
                  grip: grip(cl, `${lw.grip.cell}${caseText(r.when)}`, [], { name: lw.name.case.replace("{name}", caseText(r.when)), place: "outside" }),
                  ...(acrossKnobs || downward
                    ? {
                        knobs: (
                          <>
                            {acrossKnobs?.knobs}
                            {downward?.knobs}
                          </>
                        ),
                        ...(acrossKnobs ? { onStretch: acrossKnobs.onStretch } : {}),
                        ...(downward ? { onStretchDown: downward.onStretch } : {}),
                      }
                    : {}),
                  ...(fill.lit ? fill : fillAt(colKey, j, down)),
                  ...(lift.binTakes(cl) ? { onRemove: () => lift.onBin(cl) } : {}),
                  ...(ww ? { whole: ww } : {}),
                  zone: (el: ReactNode) => zone([target, caseTarget(cell.case!)], cell.case!, el),
                };
              }),
            };
          })}
          addRow={slotOf(g.down.thing, g.down.range)}
          addColumn={slotOf(g.across.thing, g.across.range)}
          foot={bin}
        />
      </>
    );
  } else if (layout.shape === "grid") {
    // a grid read as rows: one group per value of the first thing, its cases' rows naming the second thing alone
    const g = layout;
    const downList = !g.down.range ? list("grows", "y") : undefined;
    body = (
      <ConditionBand {...head}>
        {g.switch && (
          <div className="px-3 pt-1">
            <ThingSwitch fee={fee} values={g.switch.values} chosen={g.switch.chosen} words={(h) => byCase.get(h.cases[0]!)!.when[2]!} mine={(h) => byCase.get(h.cases[0]!)!.mine} onChange={setSwitchTo} />
          </div>
        )}
        {g.rows.map((row) => {
          const inRow = row.cells.filter((x) => x.case && !x.covered && !x.whole).flatMap((x) => x.cases.filter((id) => row.cases.includes(id)));
          const words = whenText(byCase.get(row.cases[0]!)!.when[0]!);
          const strip = rowAdd(inRow, 1, { strip: c.rowAdd.strip, menu: lw.menu.addRow, spoken: `${lw.menu.addRow}${sep}${words}` });
          const hg = headGrip(row, 0, g.rows, strip.menu);
          return (
            <CaseGroup key={row.key} head={headOfValue(row, 0)} {...(row.once.length ? { shared: saidJoined(row.once) } : {})} {...(hg ? { grip: hg } : {})} zone={(h) => zone([{ k: "value", fee: fee.id, t: 0, key: row.key }], `row:${row.key}`, h, downList)}>
              {row.cells.flatMap((cell) => {
                if (cell.case)
                  return cell.cases.filter((id) => row.cases.includes(id)).map((id) => {
                    const r = byCase.get(id)!;
                    return <div key={id}>{bandRow(r, caseWords([r.when[1]!], r.mine, band.things, r.bounds), { k: "cell", fee: fee.id, cases: [id], row: WHOLE, along: 1 }, `${lw.grip.cell}${caseText(r.when)}`, { name: lw.name.case.replace("{name}", caseText(r.when)) })}</div>;
                  });
                const col = g.columns[cell.from]!;
                const from = row.cells.find((x) => x.case)?.case ?? row.cases[0]!;
                return [
                  <div key={`empty:${cell.from}`} className="px-3">
                    {zone([{ k: "place", fee: fee.id, row: from, t: 1, when: col.when }], `place:${row.key}:${cell.from}`, <AddSlot shape="row" add={{ label: `${c.addSlot.case}${sep}${whenText(byCase.get(col.cases[0]!)!.when[1]!)}`, onAdd: () => addAndOpen(addCaseAt(fee, from, 1, col.when)) }} />)}
                  </div>,
                ];
              })}
            </CaseGroup>
          );
        })}
        <div className="flex flex-wrap gap-2 px-3 pt-1 pb-1">
          <AddSlot shape="pill" add={slotOf(g.down.thing, g.down.range)} />
          <AddSlot shape="pill" add={slotOf(g.across.thing, g.across.range)} />
        </div>
        <div className="px-3">{bin}</div>
      </ConditionBand>
    );
  } else {
    // one thing with no room for its table, or cases that do not fall one to a place of a grid: a row per case
    const t = layout.shape === "table" ? layout.thing : 0;
    const order = layout.shape === "table" ? layout.columns.map((x) => x.case) : layout.cases;
    const ladder = layout.shape === "table" && layout.ladder;
    const listThing = layout.shape === "table" && !layout.ladder && layout.split === null && t === 0 && !isRange(fee.by[t]!);
    const add = ladder ? stepSlot(t) : listThing ? valuesSlotAs(t, c.addSlot.case) : addOne;
    body = (
      <ConditionBand {...head}>
        {layout.shape === "table" && layout.once.length > 0 && <div className="px-3 pt-1">{onceLine(layout.once, t)}</div>}
        {order.map((id) => {
          const r = byCase.get(id)!;
          const words = ladder ? stepName(r, t) : caseText(r.when);
          const w = fee.cases.find((x) => x.id === id)!.when[t];
          const step = ladder && typeof w === "number" ? w : null;
          const l: Lifted = step !== null ? { k: "step", fee: fee.id, t, step, name: words } : { k: "col", fee: fee.id, case: id };
          const moves = listThing && order.length > 1;
          const still = !moves && !lift.binTakes(l);
          const spoken = step !== null ? `${lw.grip.step}${words}` : still ? `${lw.grip.colOnly}${words}` : `${lw.grip.col}${words}`;
          return (
            <div key={id}>
              {bandRow(r, caseWords(r.when, r.mine, band.things, r.bounds), l, spoken, {
                ...(listThing ? { more: caseActions(id, order, words, t), also: [{ k: "col", fee: fee.id, case: id }], sort: list("caserows", "y") } : {}),
                name: step !== null ? stepWords(words) : lw.name.case.replace("{name}", words),
                still,
              })}
            </div>
          );
        })}
        <div className="px-3 pt-1 pb-1">
          <AddSlot shape="pill" add={add} />
        </div>
        <div className="px-3">{bin}</div>
      </ConditionBand>
    );
  }
  return (
    <div ref={box} className="flex flex-col gap-2">
      {body}
      {question}
      {rowMenuView}
      {wide && openRow && openView(openRow)}
    </div>
  );

  /**
   * A table's column of a list thing (`t`) moved by one place, to where the column beside it stands (`order`: the columns' cases as the
   * page shows them), and duplicated right after it ("<value> (עותק)").
   */
  function caseActions(caseId: string, order: readonly string[], words: string, t: number): GripAction[] {
    const out: GripAction[] = [];
    const k = order.indexOf(caseId);
    const key = valueKey(fee.cases.find((x) => x.id === caseId)!.when[t]!);
    const keyOf = (id: string) => valueKey(fee.cases.find((x) => x.id === id)!.when[t]!);
    const move = (to: string) => (t === 0 && fee.by.length === 1 ? moveCase(fee, caseId, to) : moveValue(fee, t, key, keyOf(to)));
    if (k > 0) out.push({ label: lw.menu.before, onPick: () => onFee(move(order[k - 1]!)) });
    if (k >= 0 && k < order.length - 1) out.push({ label: lw.menu.after, onPick: () => onFee(move(order[k + 1]!)) });
    out.push({ label: lw.menu.duplicateColumn, onPick: () => addAndOpen(duplicateValue(fee, t, key, copyName(words))) });
    return out;
  }
}

/** A split column's head: its value of the first thing, then its value of the thing it is split by ("בחו״ל · דולר"). */
function SubHead({ r, sub, head }: { r: CaseRowView; sub: number; head: ReactNode }) {
  return (
    <>
      {head}
      <span className="text-muted-foreground">{sep}</span>
      <WhenText words={r.when[sub]!} />
    </>
  );
}

/** The switch of a fee's third thing, above its grid: its values, the one shown pressed, the person's own track saying "שלכם". */
function ThingSwitch({ fee, values, chosen, words, mine, onChange }: { fee: CasesFee; values: Head[]; chosen: string; words: (h: Head) => WhenWords; mine: (h: Head) => boolean; onChange: (key: string) => void }) {
  return <SegmentedControl fit long label={`${copy.cases.switchLabel} ${thingName(fee.kind, fee.by[2]!)}`} options={values.map((v) => ({ value: v.key, label: `${whenText(words(v))}${mine(v) ? `${sep}${dealCases.mine}` : ""}` }))} value={chosen} onChange={onChange} />;
}

/**
 * A ladder's step as its head says it: "עד {top}", "{bottom} עד {top}", or "מעל {bottom}", on one line where its column has the room, else
 * wrapped inside it, each number held to its currency's sign and "עד" to the number before it, never past the column. The top is a box
 * typed in place, its sign inside it on the number's right, kept above the top before it and below the one after; the bottom is plain words, the step before's top, so moving that
 * top moves it too and the steps keep no gap or overlap.
 */
function StepHead({ fee, t, bounds, onFee }: { fee: CasesFee; t: number; bounds: StepBounds; onFee: (f: Fee) => void }) {
  const b = fee.by[t]!;
  const c = copy.cases;
  if (!isRange(b)) return null;
  const sign = rangeSign(b.unit);
  if (!bounds.to)
    return (
      <div className="flex min-w-0 flex-wrap items-center gap-x-1">
        <span className="whitespace-nowrap">{c.over.trim()}</span>
        <bdi className="whitespace-nowrap">{numText(bounds.from!)}</bdi>
      </div>
    );
  const next = b.tops[bounds.step + 1]?.v ?? null;
  const low = (bounds.from?.value as number | undefined) ?? 0;
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1">
      <span className="whitespace-nowrap">
        {bounds.from ? (
          <>
            <bdi dir="ltr">{fmt.number(low)}</bdi>
            {c.stepBetween}
          </>
        ) : (
          c.upTo
        )}
      </span>
      {/* the top's sign in its box, on the number's right, as every figure writes its unit (design-system 2.7) */}
      <FigureField
        value={bounds.to}
        label={c.stepTop}
        unit={sign}
        sign={sign}
        tight
        validate={(n) => (n > low && (next === null || n < next) ? null : c.stepTopRange(fmt.number(low), next === null ? null : fmt.number(next)))}
        onCommit={(n) => onFee(setTop(fee, t, bounds.step, n))}
      />
    </div>
  );
}

