// A fee whose price changes by things, laid out by its shape (method §10.6, F-114; lib/fee-deal/band-layout.ts and layout.ts): its
// condition's head, then, where its block has the room, a table of its cases (one thing; a range as a ladder whose step tops are typed in
// place) or a grid (two things; a third a switch above it; under a row's cells, a cell for each part its cells hold alike), the case open
// under them; on a block narrower than a computer's, the same cases as rows in the cases' band, a grid's in one group per value of its first thing,
// a part one cell holds for every case said once above them. Each add is a plus knob beside the heads (at the end of the column heads,
// under the row heads, and on the line between two heads, which adds exactly there; the head's menu adds before or after it), a row of
// its own after a band's rows: on a list thing's table and a grid's row and column it adds one value at once (`nextValue`: the site's
// next, else one in the person's words, whose head opens for its name; what is bought or held asks once the site's run out,
// `AskValuesOf`), and a head in the person's words is renamed by a double-click or its menu; on a split table it copies the open case (else the last); on a ladder it asks only the new boundary (`AskStep`),
// between two steps one that splits one of them; a new value starts with no case. A place of a grid no case holds takes a copy of its
// row's case; a place in a row or a column whose value no case names (a grid's row, a table's column) takes a case whose price is not
// given yet (`addBlankCase`). Every
// case shows, in the fee's order, the person's own marked "שלכם" and none set apart for not being theirs. Every head, row, cell and thing
// of the head has a grip (⋮⋮, lifted.ts says where each drops and what the bin takes), whose menu moves, duplicates or removes by
// keyboard; a table's columns, a grid's rows and columns and the cases read as rows are sortable lists, the others opening the gap where
// the pointer stands, and every place shows what a drop would do while a thing is over it (the page draws the deal as it would leave it).
// Every cell of a table or a grid has knobs that stretch it where nothing is overwritten (reach.ts), the cells it would cover showing its
// price while it is pulled, a cell over its whole row saying so. Under a grid's row, or a table's last row, a strip drawn while the
// pointer is there adds a part to every case of it as one stretched cell (`partAcross`), as its head's menu does. A toolbox part dragged
// here drops on a case's head, cell or row, or on the open case; a thing to change by, on a case's head, splits that case alone.
// Ctrl+C copies a cell and Ctrl+V pastes it on another cell, a head or the fee's head (paste.ts).
import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { dealCases, feeDeal as copy } from "../../copy";
import type { CaseRow as CaseRowView, FeeBlock as BlockView } from "../../lib/fee-deal/rows";
import type { SlimPart, WhenWords } from "../../lib/fee-deal/case-words";
import { thingName } from "../../lib/fee-deal/case-words";
import { addBlankCase, addCase, addCaseAt, addValuesAt, canRename, copyCase, renameValue, setTop } from "../../lib/fee-deal/edits/case";
import { nextValue } from "../../lib/fee-deal/things";
import { duplicateValue, moveCase, moveValue, swapThings } from "../../lib/fee-deal/edits/arrange";
import { currencyClash, partAcross, shrink, shrinkAway, shrinkEmpties, stretch, stretchOver } from "../../lib/fee-deal/edits/cells";
import { bandLayout, laterChanges, mergedParts, partsByRow, rangeSign, rowHead, type PartRow, type StepBounds } from "../../lib/fee-deal/band-layout";
import { valueKey, WHOLE, type FeeLayout, type GridRow, type Head, type Shared } from "../../lib/fee-deal/layout";
import { clashWords, liftId, type Lifted, type LiftTarget } from "../../lib/fee-deal/lifted";
import { isRange, NAME_MAX, type CasesFee, type Fee, type When } from "../../lib/fee-deal/model";
import { gridColumnSlots, gridPartSlots, gridRowSlots, knobEdges, reachEdits, reachOf, type Slot } from "../../lib/fee-deal/reach";
import type { StandingView } from "../../lib/fee-deal/deal-read";
import { fmt } from "../../lib/format";
import { ActionMenu, AddSlot, RenameInput, KnobButton, CaseGrid, CaseGroup, CaseRow, CaseSlot, CaseTable, ConditionBand, ConditionHead, DropBin, FigureField, Grip, OpenCase, PartChip, SegmentedControl, SharedLine, SpanKnob, Tag, KindDot, monthText, useWidth, type AddSpec, type CaseWord, type GripAction, type SortOf } from "../kit";
import { IdRef, Num } from "../provenance";
import { AskStep, AskValuesOf } from "./ask-thing";
import { LawTag } from "./links";
import { WhenText, numText, whenText } from "./open-case";
import { PART_MARK } from "./part-edit";
import { PARTS, setPart } from "../../lib/fee-deal/offers/parts";
import { clipOf, pasteOn, type PastePlace } from "../../lib/fee-deal/paste";
import { clipboard } from "./clipboard";
import { ROW_OF } from "../../lib/fee-deal/part-rows";
import { EditHere, PartFig } from "./edit-here";
import type { BlockActions, HeadApply, OpenHere, ZoneOf } from "./fee-block";

const sep = copy.cases.sep;

/** A case's value for each thing in plain words, joined, for its spoken name and the toolbox's line ("ניירות ערך בחו״ל, בארה״ב · מסלול 1"). */
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

/** What the ✕ at a part line's end does: its spoken name and title, and the part taken away. */
type PartOff = { label: string; onOff: () => void };

/**
 * Parts as words, one after the other, each after a small dot of its kind's colour (theme.css, `data-kind`), the colour of the toolbox's
 * card that adds it and of its line in the open case; " · " between them is said, not drawn. `off`: each part that can be taken away alone carries a ✕ at its line's
 * end, drawn only after a fine pointer has rested on that line a while and gone at once when it leaves (app.css, `data-part-line`), on
 * a zero-wide place after its words, so it moves nothing and takes no room.
 */
function Joined({ parts, bare, lines, off }: { parts: readonly SlimPart[]; bare?: boolean; lines?: boolean; off?: (p: SlimPart) => PartOff | null }) {
  return (
    <>
      {parts.map((p, k) => {
        const x = off?.(p) ?? null;
        return (
          <span key={`${p.stage ?? 0}:${p.id}`} {...(x ? { "data-part-line": "" } : {})} className={lines ? "basis-full" : undefined}>
            {k > 0 && <span className="sr-only">{sep}</span>}
            <KindDot kind={p.kind} after={k > 0 && !lines} />
            <PartText part={p} bare={bare} />
            {x && (
              <span data-part-off="" className="relative inline-block h-[1lh] w-0 align-top">
                <span className="absolute start-1 top-1/2 z-[1] -translate-y-1/2">
                  <KnobButton icon={X} label={x.label} tabIndex={-1} onClick={x.onOff} />
                </span>
              </span>
            )}
          </span>
        );
      })}
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

/**
 * The question of an add open: the thing it adds a value of, whether it adds a step, and where (`where`: "end", or the place between two
 * heads it was asked at); a value then stands right before value `before`, a step's boundary falls `within` its two neighbours.
 */
type Asking = { thing: number; range: boolean; where: string; before?: string; within?: { low: number; high: number | null } } | null;

/** Where an add puts what it adds: at the end, or at place `k` among the heads (before head `k`), with what that place asks. */
type Place = { where: string; before?: string; within?: { low: number; high: number | null } };

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
  /** The open case's parts in edit, with the spoken name of its boxes and the heads over it its parts' menus apply them to. */
  openParts: (spoken: string, heads?: readonly HeadApply[]) => ReactNode;
}) {
  const { onOpen, onSlot, onThing, onRemoveCase, onRemoveBy, lift } = actions;
  const isOpen = open.fee === fee.id;
  const openCase = isOpen ? open.case : null;
  // the switch starts on the person's own case's value, where a case is theirs (their track), else on the first
  const mineOn = fee.cases.find((c) => c.mine)?.when[2];
  const [switchTo, setSwitchTo] = useState<string | null>(mineOn !== undefined && mineOn !== "any" ? valueKey(mineOn) : null);
  const [asking, setAsking] = useState<Asking>(null);
  // the head whose value is typed again in place: a double-click on it, "לשנות שם" in its grip's menu, or a value the "+" just added
  const [renaming, setRenaming] = useState<{ t: number; key: string } | null>(null);
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
  /** What the person tapped to open the case: only that is outlined, not every cell and line its price stands in. */
  const [picked, setPicked] = useState<{ key: string; case: string } | null>(null);
  const openIt = (caseId: string, key?: string) => () => {
    setPicked(key ? { key, case: caseId } : null);
    onOpen(fee.id, caseId, "pointer");
  };
  /** Whether a cell or line over `cases` shows as the open case's: the one tapped, or, where the case was opened otherwise, its own cell. */
  const shownOpen = (cases: readonly string[], key: string | null) =>
    !!openCase && cases.includes(openCase) && (picked?.case === openCase ? picked.key === key : key === null);
  // a case or a step added opens: the first case the fee did not have
  const addAndOpen = (next: Fee) => {
    onFee(next);
    const fresh = next.cases?.find((x) => !fee.cases.some((o) => o.id === x.id));
    if (fresh) onOpen(fee.id, fresh.id, "pointer");
  };
  const ask = (thing: number, range: boolean, place: Place = { where: "end" }) => (at: HTMLElement | null) => {
    slot.current = at;
    setAsking((a) => (a && a.thing === thing && a.where === place.where ? null : { thing, range, ...place }));
  };
  /** A head's value where it names one alone, by its key (`valueKey`); null for several values, any value or a range's step. */
  const soleValue = (key: string): string | null => {
    const w = JSON.parse(key) as When;
    return Array.isArray(w) && w.length === 1 ? w[0]! : null;
  };
  /** Whether head `key` of thing `t` may be renamed: one value, in the person's words (`canRename`). */
  const renamable = (t: number, key: string) => {
    const v = soleValue(key);
    return v !== null && !!fee.by[t] && canRename(fee.by[t]!, v);
  };
  /** A head's double-click, where its value may be renamed. */
  const renameOn = (t: number, key: string) => (renamable(t, key) ? { onRename: () => setRenaming({ t, key }) } : {});
  /** A head's words, or, while it is renamed, the field its name is typed in (Enter or leaving it keeps the name, Escape goes back). */
  const named = (t: number, key: string, words: string, body: ReactNode): ReactNode => {
    const v = soleValue(key);
    if (v === null || renaming?.t !== t || renaming.key !== key || !renamable(t, key)) return body;
    return (
      <RenameInput
        initial={words}
        placeholder={words}
        label={c.renameLabel.replace("{name}", words)}
        onDone={(name) => {
          setRenaming(null);
          if (name && name !== words) onFee(renameValue(fee, t, v, name));
        }}
      />
    );
  };
  /**
   * The "+" beside a list thing's heads (and between two, and a head's menu): a value added at once (`nextValue`), its head then renamed
   * where it is the person's words; where only a value with its place would do, it asks (`AskValuesOf`).
   */
  const addNow = (t: number, place: Place) => (at: HTMLElement | null) => {
    const v = nextValue(fee, t);
    if (v === null) return ask(t, false, place)(at);
    const next = addValuesAt(fee, t, [v], [], place.before);
    if (next === fee) return;
    onFee(next);
    if (canRename(fee.by[t]!, v)) setRenaming({ t, key: valueKey([v]) });
  };
  const askedHere = (t: number, where: string) => asking?.thing === t && asking.where === where;
  const asked = (added: boolean) => {
    setAsking(null);
    if (!added) requestAnimationFrame(() => slot.current?.isConnected && slot.current.focus());
  };
  // where a case has no new value to ask (a split table's), "+ מקרה" copies the open case, else the last, and opens the copy
  const addOne: AddSpec = { label: c.addKnob.case, onAdd: () => addAndOpen(addCase(fee, openCase ?? undefined)) };
  /** The add that asks a ladder's new boundary (`AskStep`), at the end or at `place`. */
  const stepSlot = (t: number, place: Place = { where: "end" }): AddSpec => ({ label: c.addKnob.step, onAdd: ask(t, true, place), expanded: askedHere(t, place.where) });
  /** The add that asks new values of list thing `t` (`AskValuesOf`, the values the cases name not yet), at the end or at `place`. */
  const valuesSlot = (t: number, place: Place = { where: "end" }, words = c.addKnob.value[fee.by[t]!.kind] ?? c.addKnob.value.own!): AddSpec => ({ label: words, onAdd: addNow(t, place), expanded: askedHere(t, place.where) });
  const slotOf = (t: number, range: boolean) => (range ? stepSlot(t) : valuesSlot(t));
  /** An add read as rows, where it stands as a row of its own: its words after the plus ("+ מקרה", "+ מדרגה", "+ הערוץ"). */
  const asRow = (add: AddSpec, words: string): AddSpec => ({ ...add, label: words });
  const rowWords = (t: number, range: boolean) => (range ? c.addSlot.step : thingName(fee.kind, fee.by[t]!));
  /**
   * Place `k` among heads of thing `t` (before head `k`; `k` = their count, the end), the heads given by their keys and, for a range, each
   * step's bounds: a value added there stands before head `k`; a step's boundary falls between head `k - 1`'s bottom and head `k`'s top.
   */
  const placeAt = (t: number, k: number, heads: readonly { key: string; bounds: StepBounds | null }[]): Place | null => {
    const n = heads.length;
    if (k >= n) return { where: "end" };
    if (!isRange(fee.by[t]!)) return { where: `at:${k}`, before: heads[k]!.key };
    const prev = k > 0 ? heads[k - 1]!.bounds : null;
    const next = heads[k]!.bounds;
    if ((k > 0 && !prev) || !next) return null;
    return { where: `at:${k}`, within: { low: (prev?.from?.value as number | undefined) ?? 0, high: (next.to?.value as number | undefined) ?? null } };
  };
  /** The plus between head `k - 1` and head `k` of thing `t`: the add that puts its value or step exactly there, named by the two. */
  const insertAt = (t: number, heads: readonly { key: string; bounds: StepBounds | null; words: string }[]) => (k: number): AddSpec | null => {
    const place = placeAt(t, k, heads);
    if (!place) return null;
    const add = isRange(fee.by[t]!) ? stepSlot(t, place) : valuesSlot(t, place);
    return { ...add, spoken: c.addKnob.between.replace("{add}", add.label).replace("{a}", heads[k - 1]!.words).replace("{b}", heads[k]!.words) };
  };
  /** A head's menu inserts, before it and after it (keyboard and touch: what the plus between heads does). */
  const insertActions = (t: number, k: number, heads: readonly { key: string; bounds: StepBounds | null }[]): GripAction[] =>
    [k, k + 1].flatMap((p, i) => {
      const place = placeAt(t, p, heads);
      if (!place) return [];
      return [{ label: i === 0 ? c.insertMenu.before : c.insertMenu.after, onPick: () => (isRange(fee.by[t]!) ? ask(t, true, place) : addNow(t, place))(null) }];
    });

  // ---------------------------------------------------------------- grips: what each lifts, its menu, and what its bin takes
  /** A cell's own bin's spoken name: "למחוק: מקסימום · מק״מ". */
  const binWords = (where: string) => lw.binCell.replace("{where}", where);
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
    if (renamable(t, key)) out.push({ label: c.renameValue, onPick: () => setRenaming({ t, key }) });
    return out;
  };
  /** A copy's name, "<value> (עותק)", its value cut first so the whole is no longer than a name may be. */
  const copyName = (words: string) => lw.copyName.replace("{name}", words.slice(0, NAME_MAX - (lw.copyName.length - "{name}".length)).trim());
  const stepName = (r: CaseRowView, t: number) => (r.bounds[t] ? stepText(r.bounds[t]!) : whenText(r.when[t]!));
  /** A head's value of thing `t` in words: its first case's, or, for a value no case names, the thing's own (`unnamed`). */
  const headWhen = (h: Head, t: number): WhenWords => (h.cases[0] ? byCase.get(h.cases[0])!.when[t]! : band.unnamed[t]![h.key]!);
  /** A head's value as plain words: a range's step as its bounds, any other value as its words. */
  const headName = (h: Head, t: number): string => (h.cases[0] ? stepName(byCase.get(h.cases[0])!, t) : whenText(headWhen(h, t)));
  /** What a head's grip lifts: a range's step (to its bin alone), else a value of a list thing; nothing for a range's value on any size. */
  const headLifted = (h: Head, t: number): Lifted | null => {
    const words = headName(h, t);
    if (isRange(fee.by[t]!)) return typeof h.when === "number" ? { k: "step", fee: fee.id, t, step: h.when, name: words } : null;
    return { k: "value", fee: fee.id, t, key: h.key, name: words };
  };
  /** A head's grip: a range's step (its bin alone), else a value of a list thing (moved, duplicated, removed); `more`, its row's other actions. */
  const headGrip = (h: Head, t: number, heads: readonly Head[], more: GripAction[] = []) => {
    const l = headLifted(h, t);
    if (!l) return null;
    const words = headName(h, t);
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
  /** A head's cases, standing along thing `along`, as the place a part dropped on the head goes into each of (lifted.ts), each named by what tells it apart. */
  const headCases = (cases: readonly string[], along: number): LiftTarget => {
    const named = namedAmong(cases);
    return { k: "cases", fee: fee.id, cases: [...cases], along, names: Object.fromEntries(cases.map((id) => [id, named(id)])) };
  };
  /** The thing every case of the fee stands along in its layout: a grid's row's, a table's own. */
  const allAlong = layout.shape === "grid" ? 1 : layout.shape === "table" ? layout.thing : 0;
  const everyCase = headCases(fee.cases.map((x) => x.id), allAlong);
  /**
   * The heads a part may be applied to from a menu, each with its words, the first that covers the same cases kept: `row` (a grid's row),
   * `column` (a grid's column, drawn as one), then every case of the fee; a head over one case alone is no wider than the case.
   */
  const applyTo = (heads: readonly (readonly [string, readonly string[], number] | null)[]): HeadApply[] => {
    const seen = new Set<string>();
    return heads.flatMap((h) => {
      if (!h || h[1].length < 2 || seen.has([...h[1]].sort().join())) return [];
      seen.add([...h[1]].sort().join());
      return [{ label: h[0], on: headCases(h[1], h[2]) }];
    });
  };
  const allHead = [lw.menu.applyAll, fee.cases.map((x) => x.id), allAlong] as const;
  /** A part cell's grip's menu: its part applied to each head over the cell that takes it. */
  const applyActions = (l: Lifted, heads: readonly HeadApply[]): GripAction[] => heads.filter((h) => lift.takes(l, h.on)).map((h) => ({ label: h.label, onPick: () => lift.onDrop(l, h.on, { copy: false }) }));

  // ---------------------------------------------------------------- one part line taken out of a cell (its ✕)
  /**
   * The ✕ of a part line in a cell over cases `cases` that shows more than one part: the part taken out of each of them as the open case's
   * bin does (`setPart`), kept for the undo with its line. None for a free price, a part of a later price or of the fee's prices as a
   * whole (a sale priced apart), nor where the cell shows one part (its bin does it).
   */
  const partOff = (cases: readonly string[], shown: number) => (p: SlimPart): PartOff | null => {
    if (shown < 2 || p.id === "free" || p.stage || PARTS[p.id].apply.on === "fee") return null;
    const row = ROW_OF[p.id];
    const name = row === "notes" ? [p.words.lead, p.words.tail].filter(Boolean).join("").trim() : (c.rowHeads[row] ?? p.id);
    return {
      label: c.partOff.replace("{part}", name),
      onOff: () => lift.onStretch(cases.reduce<Fee>((f, id) => setPart(f, p.id, false, { side: "buy", k: 0, caseId: id }), fee), row === "notes" ? lw.noteRemoved : (lw.part[row] ?? null)),
    };
  };

  // ---------------------------------------------------------------- copy and paste (Ctrl+C on a cell, Ctrl+V on a cell or a head)
  /** The cells of a table or a grid, by their copy keys: what each lifts as its grip does, and the place a paste on it goes into. */
  const cellsByKey = new Map<string, { l: Extract<Lifted, { k: "cell" }>; place: PastePlace }>();
  /** A cell registered by its key (`copyKey`): it can be copied and pasted on. */
  const copyable = (key: string, l: Extract<Lifted, { k: "cell" }>) => {
    // a cell of one case is named by the case's values, so the undo line says where it replaced
    const one = l.cases.length === 1 ? byCase.get(l.cases[0]!) : undefined;
    const place = (one ? { ...headCases(l.cases, l.along), names: { [l.cases[0]!]: caseText(one.when) } } : headCases(l.cases, l.along)) as PastePlace;
    cellsByKey.set(key, { l, place });
    return { copyKey: key };
  };
  // the head a paste on lands in, by the head pressed (a table's column, a grid's row or column, the fee's own head); set by the layout drawn
  let headPlace: (el: HTMLElement) => PastePlace | null = () => null;
  /**
   * The keys of copy and paste, outside a field: Ctrl+C copies the cell that has the focus; Ctrl+V pastes the copy on the cell or the head
   * that has it, as one change with its undo line.
   */
  const onKeys = (e: KeyboardEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, select, [contenteditable]:not([contenteditable=false])")) return;
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
    const cellKey = t.closest<HTMLElement>("[data-copy-key]")?.dataset.copyKey;
    const here = cellKey !== undefined ? cellsByKey.get(cellKey) : undefined;
    if (e.code === "KeyC" || e.key.toLowerCase() === "c") {
      const clip = here && clipOf(fee, here.l);
      if (!clip) return;
      e.preventDefault();
      clipboard.set(clip);
      return;
    }
    if (e.code === "KeyV" || e.key.toLowerCase() === "v") {
      const clip = clipboard.get();
      const place = here?.place ?? headPlace(t);
      if (!clip || !place) return;
      e.preventDefault();
      lift.onResult((d) => pasteOn(d, clip, place));
    }
  };

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
      else if (over.length) lift.onStretch(stretch(fee, own, over, row, t, axis === "y"), [lw.stretched, ...leftOut(own, over, row)].join(" "));
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
  /** The cases a part cell stretched over leaves as they are, since they count their sums in another currency, each named with why. */
  const leftOut = (own: string, over: readonly string[], row: PartRow | typeof WHOLE): string[] => {
    const src = fee.cases.find((x) => x.id === own);
    if (!src || row === WHOLE) return [];
    return over.flatMap((id) => {
      const clash = currencyClash(fee.kind, src, fee.cases.find((x) => x.id === id)!, row);
      return clash ? [lw.currency.leftOut.replace("{where}", namedAmong([own, ...over])(id)).replace("{why}", clashWords(clash))] : [];
    });
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
  const headOfValue = (h: Head, t: number) => (h.cases[0] ? headOf(byCase.get(h.cases[0])!, t) : <WhenText words={headWhen(h, t)} />);
  /**
   * The values of a new case at a place whose row or column no case names: the place's for the things the layout draws (`at`, by thing),
   * the value of a thing it does not draw as the switch shows it, or any value.
   */
  const placeWhen = (at: Record<number, When>, switchOn?: When): When[] => fee.by.map((_, j) => at[j] ?? (j === 2 && switchOn !== undefined ? switchOn : "any"));
  /**
   * A grid's place no case holds, in row `row` and column `col`: its spoken name, its add, and the place a case dropped there takes. In a
   * row with a case, the add copies the row's case (`addCaseAt`); in a row no case names, it adds a case whose price is not given yet
   * (`addBlankCase`), on the switch's value where the grid has a third thing.
   */
  const emptyPlace = (row: GridRow, col: Head): { spoken: string; onAdd: () => void; target: LiftTarget } => {
    const g = layout as Extract<FeeLayout, { shape: "grid" }>;
    const from = row.cells.find((x) => x.case)?.case ?? row.cases[0];
    const spoken = `${c.emptyPlace}${headName(row, 0)}${sep}${headName(col, 1)}`;
    if (from) return { spoken, onAdd: () => addAndOpen(addCaseAt(fee, from, 1, col.when)), target: { k: "place", fee: fee.id, row: from, t: 1, when: col.when } };
    const on = g.switch ? g.switch.values.find((v) => v.key === g.switch!.chosen)?.when : undefined;
    return { spoken, onAdd: () => addAndOpen(addBlankCase(fee, placeWhen({ 0: row.when, 1: col.when }, on))), target: { k: "place", fee: fee.id, row: "", t: 1, when: col.when, other: row.when } };
  };

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
  const head = { things: headThings, zone: (h: ReactNode) => zone([everyCase], `all:${fee.id}`, h), ...(isOpen ? { onThing: (id: string, at: HTMLElement) => onThing(Number(id), at), openThing: open.thing === null ? null : String(open.thing) } : {}), onRemoveThing: (id: string) => onRemoveBy(fee.id, Number(id)) };

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
        {openParts(`${name}, ${caseText(r.when)}`, openHeads(r.case))}
      </OpenCase>,
    );
  };
  const openRow = openCase && open.view ? byCase.get(openCase) : undefined;
  /** The heads over an open case its parts' menus apply them to: a grid's row and, drawn as a grid, its column; every case of the fee. */
  function openHeads(id: string): HeadApply[] {
    if (layout.shape !== "grid") return applyTo([allHead]);
    const row = layout.rows.find((x) => x.cases.includes(id));
    const col = wide ? layout.columns.find((x) => x.cases.includes(id)) : undefined;
    return applyTo([row ? [lw.menu.applyRow, row.cases, 1] : null, col ? [lw.menu.applyColumn, col.cases, 0] : null, allHead]);
  }

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

  const question = asking ? (asking.range ? <AskStep key={`step:${asking.thing}:${asking.where}`} fee={fee} t={asking.thing} {...(asking.within ? { within: asking.within } : {})} onFee={addAndOpen} onDone={asked} /> : <AskValuesOf key={`values:${asking.thing}:${asking.where}`} fee={fee} t={asking.thing} {...(asking.before !== undefined ? { before: asking.before } : {})} onFee={addAndOpen} onDone={asked} />) : null;
  // the bin, while something of this fee is lifted: under its table, grid or band, laid over what follows (its wrapper places it); on a
  // phone at the foot of the screen
  const bin = <DropBin phone={lift.phone} accepts={(it) => lift.binTakesItem(fee.id, it)} onDrop={(it) => lift.onBinItem(it)} />;
  /** The menu a row's strip opens: the parts every case of the row can take. */
  const rowMenuView = rowMenu && rowMenu.at.isConnected ? <ActionMenu key={rowMenu.cases.join()} actions={partChoices(rowMenu.cases, rowMenu.along)} back={{ current: rowMenu.at }} onClose={() => setRowMenu(null)} /> : null;

  let body: ReactNode;
  if (wide && layout.shape === "table") {
    const t = layout.thing;
    const n = layout.columns.length;
    const listThing = !layout.ladder && layout.split === null && !isRange(fee.by[t]!);
    const allCases = layout.columns.flatMap((x) => (x.case ? [x.case] : []));
    const across = rowAdd(allCases, t, { strip: c.rowAdd.allCases, menu: lw.menu.addAllCases, spoken: lw.menu.addAllCases });
    /** A column's value in words: its case's (a ladder's step as its bounds), or, with no case, its thing's own. */
    const colWords = (col: (typeof layout.columns)[number]) => {
      if (!col.case) return whenText(band.unnamed[t]![valueKey(col.when)]!);
      const r = byCase.get(col.case)!;
      return layout.ladder ? stepName(r, t) : caseText(r.when);
    };
    // the columns' heads as an insert between two of them reads them: a list's values, a ladder's steps
    const heads = layout.columns.map((col) => ({ key: valueKey(col.when), bounds: col.case ? (byCase.get(col.case)!.bounds[t] ?? null) : null, words: colWords(col) }));
    const inserts = listThing || layout.ladder;
    // a paste on a column's head goes into its case; on a part row's head or the fee's own head, into every case
    headPlace = (el) => {
      const col = el.closest<HTMLElement>("[role=columnheader]");
      const x = col ? layout.columns[Number(col.dataset.col)] : undefined;
      if (x) return x.case ? (headCases([x.case], t) as PastePlace) : null;
      return el.closest("[role=rowheader], [data-paste-head]") ? (everyCase as PastePlace) : null;
    };
    /**
     * What a column's grip lifts: a ladder's step (to its bin), a value of the table's thing where it is not the fee's first or no case names
     * it, else its case.
     */
    const colLifted = (col: (typeof layout.columns)[number], words: string): Lifted | null =>
      layout.ladder ? (typeof col.when === "number" ? { k: "step", fee: fee.id, t, step: col.when, name: words } : null) : t !== 0 || !col.case ? { k: "value", fee: fee.id, t, key: valueKey(col.when), name: words } : { k: "col", fee: fee.id, case: col.case };
    // a column with no case: its values for a new case, the table's other thing as its cases name it (one value along the second) or any
    const otherWhen = t === 1 ? fee.cases[0]!.when[0]! : "any";
    body = (
      <>
        <div data-paste-head="" className="contents">
          <ConditionHead bare {...head} />
        </div>
        <CaseTable
          label={name}
          ladder={layout.ladder}
          columns={layout.columns.map((col, k) => {
            const words = colWords(col);
            const l = colLifted(col, words);
            const moves = listThing && n > 1;
            const more = [...(listThing ? caseActions(k, layout.columns, words, t) : []), ...(inserts ? insertActions(t, k, heads) : [])];
            const still = !!l && !moves && !lift.binTakes(l);
            const spoken = layout.ladder ? `${lw.grip.step}${words}` : still ? `${lw.grip.colOnly}${words}` : `${lw.grip.col}${words}`;
            const cg = l ? grip(l, spoken, more, { name: layout.ladder ? stepWords(words) : (col.case ? lw.name.case : lw.name.column).replace("{name}", words), still }) : null;
            const valueTarget: LiftTarget = { k: "value", fee: fee.id, t, key: valueKey(col.when) };
            if (!col.case)
              return {
                id: `value:${valueKey(col.when)}`,
                head: named(t, valueKey(col.when), words, <WhenText words={band.unnamed[t]![valueKey(col.when)]!} />),
                ...(listThing ? renameOn(t, valueKey(col.when)) : {}),
                label: words,
                onOpen: () => undefined,
                empty: { label: c.addSlot.case, spoken: `${c.emptyPlace}${words}`, onAdd: () => addAndOpen(addBlankCase(fee, placeWhen({ [t]: col.when, [1 - t]: otherWhen }))) },
                ...(cg ? { grip: cg } : {}),
                ...(l ? { liftItem: liftId(l) } : {}),
                zone: (h: ReactNode) => zone([valueTarget], `value:${valueKey(col.when)}`, h, listThing ? list("cols", "x") : undefined),
              };
            const r = byCase.get(col.case)!;
            const target: LiftTarget = l?.k === "value" ? valueTarget : { k: "col", fee: fee.id, case: col.case };
            const caseCol = col.case;
            return {
              id: col.case,
              head: col.sub !== undefined ? <SubHead r={r} sub={layout.split!} head={headOf(r, t)} /> : named(t, valueKey(col.when), words, headOf(r, t)),
              ...(listThing && col.sub === undefined ? renameOn(t, valueKey(col.when)) : {}),
              label: label(r),
              onOpen: openIt(caseCol),
              open: shownOpen([caseCol], null),
              ...(cg ? { grip: cg } : {}),
              ...(l ? { liftItem: liftId(l) } : {}),
              zone: (h: ReactNode) => zone([target, ...(listThing && l?.k !== "value" ? [valueTarget] : []), caseTarget(caseCol)], caseCol, h, listThing ? list("cols", "x") : undefined),
            };
          })}
          rows={[
            {
              // one row: each case's whole price in its cell, a part a line, its own words (no part row heads, no "בכל …")
              id: "price",
              head: null,
              cells: layout.columns.flatMap((col, k) => {
                if (!col.case) return [];
                const id = col.case;
                const r = byCase.get(id)!;
                const parts = layout.rows.flatMap((row) => partsOf(id, row.row as PartRow));
                const cl: Lifted = { k: "cell", fee: fee.id, cases: [id], row: WHOLE, along: t };
                return [
                  {
                    id,
                    from: k,
                    span: 1,
                    open: shownOpen([id], null),
                    onOpen: openIt(id),
                    content: parts.length ? here([id], <Joined parts={parts} lines off={partOff([id], parts.length)} />) : null,
                    ...(lift.binTakes(cl) ? { onRemove: () => lift.onBin(cl), removeLabel: binWords(caseText(r.when)) } : {}),
                    zone: (el: ReactNode) => zone([caseTarget(id)], `case:${id}`, el),
                    ...copyable(`case:${id}`, cl as Extract<Lifted, { k: "cell" }>),
                  },
                ];
              }),
            },
          ]}
          add={layout.ladder ? stepSlot(t) : listThing ? valuesSlot(t, undefined, c.addKnob.case) : addOne}
          {...(inserts ? { insert: insertAt(t, heads) } : {})}
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
              open: shownOpen(cell.cases, `line:${lineKey}:${cell.from}`),
              onOpen: openIt(cell.cases[0]!, `line:${lineKey}:${cell.from}`),
              content,
              grip: grip(l, `${lw.grip.cell}${words}`, applyActions(l, applyTo([[lw.menu.applyRow, row.cases, 1], allHead])), { name: words, place: "outside" }),
              ...knobsOf(lineKey, slots, cell.from, cell.span, pr, 1, "x", content),
              ...(lift.binTakes(l) ? { onRemove: () => lift.onBin(l), removeLabel: binWords(`${words}${sep}${whenText(byCase.get(row.cases[0]!)!.when[0]!)}`) } : {}),
              ...fillAt(lineKey, cell.from, cell.span),
              ...(ww ? { whole: ww } : {}),
              zone: (el: ReactNode) => zone([l as LiftTarget, caseTarget(cell.cases[0]!)], `${lineKey}:${cell.from}`, el),
              ...copyable(`${lineKey}:${cell.from}`, l as Extract<Lifted, { k: "cell" }>),
            };
          }),
        };
      });
    const downList = !g.down.range ? list("grows", "y") : undefined;
    const acrossList = !g.across.range ? list("gcols", "x") : undefined;
    // the heads of each side as an insert between two of them reads them
    const headsOf = (hs: readonly Head[], t: number) => hs.map((h) => ({ key: h.key, bounds: h.cases[0] ? (byCase.get(h.cases[0])!.bounds[t] ?? null) : null, words: headName(h, t) }));
    const colHeads = headsOf(g.columns, 1);
    const rowHeads = headsOf(g.rows, 0);
    /** The place a whole case dropped at row `j`, column `k` lands on: another case's cell (the two swap) or a place no case holds; none off the grid or under a cell spanning down over it. */
    const placeAtCell = (j: number, k: number): LiftTarget | null => {
      const row = g.rows[j];
      const x = row?.cells.find((c) => c.from <= k && k < c.from + c.span);
      if (!row || !x || x.covered) return null;
      if (!x.case) return emptyPlace(row, g.columns[x.from]!).target;
      return x.cases.length === 1 ? { k: "cell", fee: fee.id, cases: [x.case], row: WHOLE, along: 1 } : null;
    };
    /**
     * A case's cell moved by its grip's menu one place to each side where something takes it, as a drop there does: into a place no case
     * holds, or swapped with the case there (before and after across, the page right to left; up and down).
     */
    const cellMoves = (l: Lifted, j: number, cell: GridRow["cells"][number]): GripAction[] =>
      (
        [
          [lw.menu.before, placeAtCell(j, cell.from - 1)],
          [lw.menu.after, placeAtCell(j, cell.from + cell.span)],
          [lw.menu.up, placeAtCell(j - 1, cell.from)],
          [lw.menu.down, placeAtCell(j + (cell.down ?? 1), cell.from)],
        ] as const
      ).flatMap(([label, on]) => (on && lift.takes(l, on) ? [{ label, onPick: () => lift.onDrop(l, on, { copy: false }) }] : []));
    // a paste on a column's or a row's head goes into the cases it covers; on the fee's own head, into every case
    headPlace = (el) => {
      const col = el.closest<HTMLElement>("[role=columnheader]");
      const row = el.closest<HTMLElement>("[role=rowheader]");
      const x = col ? g.columns[Number(col.dataset.col)] : undefined;
      const y = row ? g.rows[Number(row.dataset.rowpos)] : undefined;
      if (x) return headCases(x.cases, 0) as PastePlace;
      if (y) return headCases(y.cases, 1) as PastePlace;
      return el.closest("[data-paste-head]") ? (everyCase as PastePlace) : null;
    };
    body = (
      <>
        <div data-paste-head="" className="contents">
          <ConditionHead bare {...head} />
        </div>
        <CaseGrid
          label={name}
          steps={g.across.range}
          above={g.switch && <ThingSwitch fee={fee} values={g.switch.values} chosen={g.switch.chosen} words={(h) => headWhen(h, 2)} mine={(h) => !!h.cases[0] && byCase.get(h.cases[0])!.mine} onChange={setSwitchTo} />}
          columns={g.columns.map((col, k) => {
            const hg = headGrip(col, 1, g.columns, insertActions(1, k, colHeads));
            return { id: col.key, head: named(1, col.key, headName(col, 1), headOfValue(col, 1)), ...renameOn(1, col.key), ...(hg ? { grip: hg } : {}), ...headItem(col, 1), zone: (h: ReactNode) => zone([{ k: "value", fee: fee.id, t: 1, key: col.key }, headCases(col.cases, 0)], `col:${col.key}`, h, acrossList) };
          })}
          rows={g.rows.map((row, j) => {
            const rc = gridRowSlots(g, row);
            const inRow = row.cells.filter((x) => x.case && !x.covered && !x.whole).flatMap((x) => x.cases.filter((id) => row.cases.includes(id)));
            const words = headName(row, 0);
            const strip = rowAdd(inRow, 1, { strip: c.rowAdd.strip, menu: lw.menu.addRow, spoken: `${lw.menu.addRow}${sep}${words}` });
            const hg = headGrip(row, 0, g.rows, [...strip.menu, ...insertActions(0, j, rowHeads)]);
            return {
              id: row.key,
              head: named(0, row.key, words, headOfValue(row, 0)),
              ...renameOn(0, row.key),
              ...(hg ? { grip: hg } : {}),
              ...headItem(row, 0),
              lines: partLines(row),
              ...(strip.strip ? { addPart: strip.strip } : {}),
              zone: (h: ReactNode) => zone([{ k: "value", fee: fee.id, t: 0, key: row.key }, headCases(row.cases, 1)], `row:${row.key}`, h, downList),
              cells: row.cells.filter((cell) => !cell.covered).map((cell) => {
                const col = g.columns[cell.from]!;
                if (!cell.case) {
                  const p = emptyPlace(row, col);
                  const fill = fillAt(row.key, cell.from, 1);
                  return {
                    from: cell.from,
                    span: cell.span,
                    ...(fill.lit ? fill : fillAt(`col:${col.key}`, j, 1)),
                    empty: { label: c.addSlot.case, spoken: p.spoken, onAdd: p.onAdd },
                    zone: (el: ReactNode) => zone([p.target], `place:${row.key}:${cell.from}`, el),
                  };
                }
                const r = byCase.get(cell.case)!;
                const target: LiftTarget = { k: "cell", fee: fee.id, cases: cell.cases, row: WHOLE, along: 1 };
                const down = cell.down ?? 1;
                const ww = cell.whole ? null : (wholeWords(cell.span, n, 1) ?? wholeWords(down, g.rows.length, 0));
                const content = (
                  <>
                    {here(cell.cases, <Joined parts={mergedParts(cell.cases, cellParts)} off={partOff(cell.cases, mergedParts(cell.cases, cellParts).length)} />)}
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
                  open: shownOpen(cell.cases, null),
                  content,
                  ...(cell.whole ? { across: <WhenText words={r.when[1]!} /> } : {}),
                  grip: grip(cl, `${lw.grip.cell}${caseText(r.when)}`, cellMoves(cl, j, cell), { name: lw.name.case.replace("{name}", caseText(r.when)), place: "outside" }),
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
                  ...(lift.binTakes(cl) ? { onRemove: () => lift.onBin(cl), removeLabel: binWords(caseText(r.when)) } : {}),
                  ...(ww ? { whole: ww } : {}),
                  zone: (el: ReactNode) => zone([target, caseTarget(cell.case!)], cell.case!, el),
                  ...copyable(`case:${cell.case}`, cl as Extract<Lifted, { k: "cell" }>),
                };
              }),
            };
          })}
          addRow={slotOf(g.down.thing, g.down.range)}
          addColumn={slotOf(g.across.thing, g.across.range)}
          insertRow={insertAt(0, rowHeads)}
          insertColumn={insertAt(1, colHeads)}
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
            <ThingSwitch fee={fee} values={g.switch.values} chosen={g.switch.chosen} words={(h) => headWhen(h, 2)} mine={(h) => !!h.cases[0] && byCase.get(h.cases[0])!.mine} onChange={setSwitchTo} />
          </div>
        )}
        {g.rows.map((row) => {
          const inRow = row.cells.filter((x) => x.case && !x.covered && !x.whole).flatMap((x) => x.cases.filter((id) => row.cases.includes(id)));
          const words = headName(row, 0);
          const strip = rowAdd(inRow, 1, { strip: c.rowAdd.strip, menu: lw.menu.addRow, spoken: `${lw.menu.addRow}${sep}${words}` });
          const hg = headGrip(row, 0, g.rows, strip.menu);
          return (
            <CaseGroup key={row.key} head={headOfValue(row, 0)} {...(row.once.length ? { shared: saidJoined(row.once) } : {})} {...(hg ? { grip: hg } : {})} zone={(h) => zone([{ k: "value", fee: fee.id, t: 0, key: row.key }, headCases(row.cases, 1)], `row:${row.key}`, h, downList)}>
              {row.cells.flatMap((cell) => {
                if (cell.case)
                  return cell.cases.filter((id) => row.cases.includes(id)).map((id) => {
                    const r = byCase.get(id)!;
                    // a case carried onto another's row swaps with it, as on the grid
                    const cl: Lifted = { k: "cell", fee: fee.id, cases: [id], row: WHOLE, along: 1 };
                    return <div key={id}>{bandRow(r, caseWords([r.when[1]!], r.mine, band.things, r.bounds), cl, `${lw.grip.cell}${caseText(r.when)}`, { name: lw.name.case.replace("{name}", caseText(r.when)), also: [cl as LiftTarget] })}</div>;
                  });
                const col = g.columns[cell.from]!;
                const p = emptyPlace(row, col);
                return [
                  <div key={`empty:${cell.from}`} className="px-3">
                    {zone([p.target], `place:${row.key}:${cell.from}`, <AddSlot add={{ label: `${c.addSlot.case}${sep}${headName(col, 1)}`, spoken: p.spoken, onAdd: p.onAdd }} />)}
                  </div>,
                ];
              })}
            </CaseGroup>
          );
        })}
        <div className="flex flex-col gap-1 px-3 pt-1 pb-1">
          <AddSlot add={asRow(slotOf(g.down.thing, g.down.range), rowWords(g.down.thing, g.down.range))} />
          <AddSlot add={asRow(slotOf(g.across.thing, g.across.range), rowWords(g.across.thing, g.across.range))} />
        </div>
        <div className="relative mx-3">{bin}</div>
      </ConditionBand>
    );
  } else {
    // one thing with no room for its table, or cases that do not fall one to a place of a grid: a row per case
    const t = layout.shape === "table" ? layout.thing : 0;
    const columns = layout.shape === "table" ? layout.columns : layout.cases.map((id) => ({ case: id as string | null, when: fee.cases.find((x) => x.id === id)!.when[0]! }));
    const ladder = layout.shape === "table" && layout.ladder;
    const listThing = layout.shape === "table" && !layout.ladder && layout.split === null && t === 0 && !isRange(fee.by[t]!);
    const add = asRow(ladder ? stepSlot(t) : listThing ? valuesSlot(t) : addOne, ladder ? c.addSlot.step : c.addSlot.case);
    // a column with no case: its values for a new case, the table's other thing as its cases name it (one value along the second) or any
    const otherWhen = t === 1 ? fee.cases[0]!.when[0]! : "any";
    body = (
      <ConditionBand {...head}>
        {layout.shape === "table" && layout.once.length > 0 && <div className="px-3 pt-1">{onceLine(layout.once, t)}</div>}
        {columns.map((col, k) => {
          const id = col.case;
          if (id === null) {
            // a value no case names: its grip (moved, duplicated, taken away as a value) and the slot that adds its case
            const key = valueKey(col.when);
            const words = whenText(band.unnamed[t]![key]!);
            const l: Lifted = { k: "value", fee: fee.id, t, key, name: words };
            return (
              <div key={`value:${key}`} className="flex items-center gap-1 px-3">
                {grip(l, `${lw.grip.col}${words}`, listThing ? caseActions(k, columns, words, t) : [], { name: lw.name.column.replace("{name}", words) })}
                <AddSlot add={{ label: `${c.addSlot.case}${sep}${words}`, spoken: `${c.emptyPlace}${words}`, onAdd: () => addAndOpen(addBlankCase(fee, placeWhen({ [t]: col.when, [1 - t]: otherWhen }))) }} />
              </div>
            );
          }
          const r = byCase.get(id)!;
          const words = ladder ? stepName(r, t) : caseText(r.when);
          const w = fee.cases.find((x) => x.id === id)!.when[t];
          const step = ladder && typeof w === "number" ? w : null;
          const l: Lifted = step !== null ? { k: "step", fee: fee.id, t, step, name: words } : { k: "col", fee: fee.id, case: id };
          const moves = listThing && columns.length > 1;
          const still = !moves && !lift.binTakes(l);
          const spoken = step !== null ? `${lw.grip.step}${words}` : still ? `${lw.grip.colOnly}${words}` : `${lw.grip.col}${words}`;
          return (
            <div key={id}>
              {bandRow(r, caseWords(r.when, r.mine, band.things, r.bounds), l, spoken, {
                ...(listThing ? { more: caseActions(k, columns, words, t), also: [{ k: "col", fee: fee.id, case: id }], sort: list("caserows", "y") } : {}),
                name: step !== null ? stepWords(words) : lw.name.case.replace("{name}", words),
                still,
              })}
            </div>
          );
        })}
        <div className="px-3 pt-1 pb-1">
          <AddSlot add={add} />
        </div>
        <div className="relative mx-3">{bin}</div>
      </ConditionBand>
    );
  }
  return (
    <div ref={box} className="flex flex-col gap-2" onKeyDown={onKeys}>
      {body}
      {question}
      {rowMenuView}
      {wide && openRow && openView(openRow)}
    </div>
  );

  /**
   * Column `k` of a table of list thing `t` (`columns`, as the page shows them, a value no case names a column with no case) moved by one
   * place, to where the column beside it stands, and duplicated right after it ("<value> (עותק)"). A column moves its value, and a case
   * among columns of its own value (`moveCase`).
   */
  function caseActions(k: number, columns: readonly { case: string | null; when: When }[], words: string, t: number): GripAction[] {
    const out: GripAction[] = [];
    const col = columns[k]!;
    const key = valueKey(col.when);
    const move = (to: { case: string | null; when: When }) => (t === 0 && fee.by.length === 1 && col.case && to.case ? moveCase(fee, col.case, to.case) : moveValue(fee, t, key, valueKey(to.when)));
    if (k > 0) out.push({ label: lw.menu.before, onPick: () => onFee(move(columns[k - 1]!)) });
    if (k < columns.length - 1) out.push({ label: lw.menu.after, onPick: () => onFee(move(columns[k + 1]!)) });
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

