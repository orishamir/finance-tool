// A fee whose price changes by things, laid out by its shape (method §10.6, F-114; lib/fee-deal/band-layout.ts and layout.ts): its
// condition's head, then, where its block has the room, a table of its cases (one thing; a range as a ladder whose step tops are typed in
// place) or a grid (two things; a third a switch above it), the parts said once above the cases, the case open under them; narrower, or
// past five cases, the same cases as rows in the cases' band, a grid's in one group per value of its first thing. Each add slot stands
// beside the heads (at the end of the column heads, under the row heads): "+ מקרה" copies the open case (else the last) and opens the copy;
// "+ מדרגה" asks only the new boundary (`AskStep`); a grid's row and column ask their new values (`AskValuesOf`), and a place of a grid no
// case holds takes a copy of its row's case. Every case shows, in the fee's order, the person's own marked "שלכם" and none set apart for
// not being theirs. Every head, row, cell and thing of the head has a grip (⋮⋮, lifted.ts says where each drops and what the bin takes),
// whose menu moves, duplicates or removes by keyboard; every cell of a table or a grid has knobs that stretch it over its neighbours, a
// cell over its whole row saying so. A toolbox part dragged here drops on a case's head, cell or row, or on the open case; a thing to
// change by, on a case's head, splits that case alone.
import { useMemo, useRef, useState, type ReactNode } from "react";
import { dealCases, feeDeal as copy } from "../../copy";
import type { CaseRow as CaseRowView, FeeBlock as BlockView } from "../../lib/fee-deal/rows";
import type { SlimPart, WhenWords } from "../../lib/fee-deal/case-words";
import { thingName } from "../../lib/fee-deal/case-words";
import { addCase, addCaseAt, copyCase, setTop } from "../../lib/fee-deal/edits/case";
import { duplicateValue, moveCase, moveValue } from "../../lib/fee-deal/edits/arrange";
import { shrink, stretch, stretchTakes } from "../../lib/fee-deal/edits/cells";
import { bandLayout, headSaysLead, partsByRow, rangeSign, rowHead, sharedLead, type PartRow, type StepBounds } from "../../lib/fee-deal/band-layout";
import { valueKey, WHOLE, type FeeLayout, type GridCell, type Head, type Shared } from "../../lib/fee-deal/layout";
import { liftId, type Lifted, type LiftTarget } from "../../lib/fee-deal/lifted";
import { isRange, NAME_MAX, type CasesFee, type Fee } from "../../lib/fee-deal/model";
import type { StandingView } from "../../lib/fee-deal/deal-read";
import { fmt } from "../../lib/format";
import { AddSlot, CaseGrid, CaseGroup, CaseRow, CaseSlot, CaseTable, ConditionBand, ConditionHead, DropBin, FigureField, Grip, OpenCase, PartChip, SegmentedControl, SharedLine, SpanKnob, Tag, monthText, useWidth, type AddSpec, type CaseWord, type GripAction } from "../kit";
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

/** The room a table or a grid needs, in px: a head column, each case's or value's, and the add pill; less than that reads as rows. */
function fits(layout: FeeLayout, width: number): boolean {
  if (layout.shape === "table") return layout.fit === "columns" && width >= 96 + layout.columns.length * (layout.ladder ? STEP_COLUMN : 128) + 96;
  if (layout.shape === "grid") return width >= 152 + layout.columns.length * (layout.across.range ? STEP_COLUMN : 136) + 96;
  return false;
}

/** A ladder's column, in px: room for its head on one line, "100,000 עד" and its top's box (`CaseTable`'s and `CaseGrid`'s `steps`). */
const STEP_COLUMN = 184;

/** The question of an add slot open: the thing it adds a value of, and whether it adds a step. */
type Asking = { thing: number; range: boolean } | null;

/**
 * A knob being dragged: the line it stands in (a part row, a grid's row by its key, or a grid's column as `col:` and its key), where its
 * cell starts (`base`), and the columns or rows the cell would reach now.
 */
type Reach = { row: string; base: number; from: number; to: number } | null;

/** The cases of one row of a table or a grid by column: the case at each column, null at a place no case holds or a case on any value. */
type RowCases = (string | null)[];

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
  // every case, in the fee's order: none is set apart for not being the person's
  const rows = band.rows;
  const byCase = new Map(rows.map((r) => [r.case, r]));
  const layout = useMemo(() => bandLayout(fee, rows, switchTo), [fee, rows, switchTo]);
  const wide = fits(layout, width);
  const c = copy.cases;
  const lw = c.lifted;

  const partsOf = (caseId: string, row: PartRow) => partsByRow(byCase.get(caseId)!.parts).get(row) ?? [];
  const shownParts = (caseId: string) => layout.shows[caseId]!.flatMap((row) => partsOf(caseId, row as PartRow));
  /** Figures drawn inside are edited in place for these cases (`EditHere`). */
  const here = (cases: readonly string[], el: ReactNode) => <EditHere.Provider value={{ fee, cases, onFee }}>{el}</EditHere.Provider>;
  /** The parts said once for many cases, each edited for all of them. */
  const saidJoined = (said: readonly Shared[]) => (
    <>
      {said.map((x, k) => (
        <span key={`${x.row}:${x.currency ?? ""}`}>
          {k > 0 && <span className="text-muted-foreground">{sep}</span>}
          {here(x.cases, <Joined parts={partsOf(x.cases[0]!, x.row as PartRow)} />)}
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
  // "+ מקרה" copies the open case, else the last, and opens the copy
  const addOne: AddSpec = { label: c.addSlot.case, onAdd: () => addAndOpen(addCase(fee, openCase ?? undefined)) };
  const stepSlot = (t: number): AddSpec => ({ label: c.addSlot.step, onAdd: ask(t, true), expanded: asking?.thing === t });
  const valuesSlot = (t: number): AddSpec => ({ label: thingName(fee.kind, fee.by[t]!), onAdd: ask(t, false), expanded: asking?.thing === t });
  const slotOf = (t: number, range: boolean) => (range ? stepSlot(t) : valuesSlot(t));

  // ---------------------------------------------------------------- grips: what each lifts, its menu, and what its bin takes
  const removeAction = (l: Lifted): GripAction[] => (lift.binTakes(l) ? [{ label: lw.menu.remove, danger: true, onPick: () => lift.onBin(l) }] : []);
  const grip = (l: Lifted, spoken: string, more: GripAction[] = []) => {
    const actions = [...more, ...removeAction(l)];
    return <Grip item={liftId(l)} label={spoken} actions={actions} {...(lift.binTakes(l) ? { onRemove: () => lift.onBin(l) } : {})} />;
  };
  /** A list thing's value moved by one place, and duplicated right after it, named "<value> (עותק)". */
  const valueActions = (t: number, key: string, words: string, k: number, count: number, down: boolean): GripAction[] => {
    const out: GripAction[] = [];
    if (k > 0) out.push({ label: down ? lw.menu.up : lw.menu.before, onPick: () => onFee(moveValue(fee, t, key, k - 1)) });
    if (k < count - 1) out.push({ label: down ? lw.menu.down : lw.menu.after, onPick: () => onFee(moveValue(fee, t, key, k + 1)) });
    out.push({ label: down ? lw.menu.duplicateRow : lw.menu.duplicateColumn, onPick: () => addAndOpen(duplicateValue(fee, t, key, copyName(words))) });
    return out;
  };
  /** A copy's name, "<value> (עותק)", its value cut first so the whole is no longer than a name may be. */
  const copyName = (words: string) => lw.copyName.replace("{name}", words.slice(0, NAME_MAX - (lw.copyName.length - "{name}".length)).trim());
  const stepName = (r: CaseRowView, t: number) => (r.bounds[t] ? stepText(r.bounds[t]!) : whenText(r.when[t]!));
  /** A head's grip: a range's step (its bin alone), else a value of a list thing (moved, duplicated, removed). */
  const headGrip = (h: Head, t: number, k: number, count: number) => {
    const r = byCase.get(h.cases[0]!)!;
    const words = stepName(r, t);
    if (isRange(fee.by[t]!)) return typeof h.when === "number" ? grip({ k: "step", fee: fee.id, t, step: h.when, name: words }, `${lw.grip.step}${words}`) : null;
    return grip({ k: "value", fee: fee.id, t, key: h.key, name: words }, `${t === 0 ? lw.grip.row : lw.grip.column}${words}`, valueActions(t, h.key, words, k, count, t === 0));
  };
  const caseTarget = (caseId: string): LiftTarget => ({ k: "case", fee: fee.id, case: caseId });

  // ---------------------------------------------------------------- knobs: a cell stretched over its neighbours, or back
  const plural = (t: number) => lw.things[fee.by[t]!.kind] ?? lw.things.own!;
  /**
   * The knobs of a cell over columns `from` to `from + span - 1` of a row whose cases by column are `cases`, in part row `row` (or the whole
   * case) along thing `t`: one on each edge that can move, toward a neighbour it may take, or back where it covers more than one column. A
   * stretch that takes a different price from a neighbour keeps an undo.
   */
  const knobsOf = (rowKey: string, cases: RowCases, from: number, span: number, row: PartRow | typeof WHOLE, t: number, axis: "x" | "y" = "x") => {
    const to = from + span - 1;
    let lo = from, hi = to;
    while (lo > 0 && cases[lo - 1] !== null) lo--;
    while (hi < cases.length - 1 && cases[hi + 1] !== null) hi++;
    const own = cases[from]!;
    const onReach = (a: number, b: number, done: boolean) => {
      if (!done) return setReach({ row: rowKey, base: from, from: a, to: b });
      setReach(null);
      const over = cases.slice(a, b + 1).filter((x, k) => x !== null && (a + k < from || a + k > to)) as string[];
      const off = cases.slice(from, to + 1).filter((x, k) => x !== null && (from + k < a || from + k > b)) as string[];
      // down a grid's column only a named span merges (layout.ts): the stretch names one
      if (over.length) lift.onStretch(stretch(fee, own, over, row, t, axis === "y"), stretchTakes(fee, own, over, row) ? lw.stretched : null);
      else if (off.length) onFee(shrink(fee, off, row, t));
    };
    const at = reach && reach.row === rowKey && reach.base === from ? reach : null;
    const shown = at ?? { from, to };
    const props = { axis, from: shown.from, to: shown.to, min: lo, max: hi, label: axis === "x" ? lw.knob : lw.knobDown, valueText: lw.reach.replace("{k}", String(shown.to - shown.from + 1)).replace("{n}", String(cases.length)).replace("{things}", plural(t)), onReach };
    return {
      knobs: (
        <>
          {(lo < from || span > 1) && <SpanKnob edge="before" {...props} />}
          {(hi > to || span > 1) && <SpanKnob edge="after" {...props} />}
        </>
      ),
      // Shift with an arrow on the cell: its edge after it (left, or its foot), one column or row on, or back
      onStretch: (by: 1 | -1) => {
        const b = Math.max(from, Math.min(hi, to + by));
        if (b !== to) onReach(from, b, true);
      },
    };
  };
  const lit = (rowKey: string, from: number, span: number) => !!reach && reach.row === rowKey && from + span - 1 >= reach.from && from <= reach.to;
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

  // the things of the head: each a grip that swaps it with another where the fee has two or more, and a drop zone for that
  const headThings = band.things.map((th) => ({
    id: String(th.thing),
    name: th.words,
    removeLabel: c.thingMenu.stop.replace("{thing}", th.words),
    ...(fee.by.length > 1
      ? {
          grip: grip({ k: "thing", fee: fee.id, t: th.thing }, `${lw.grip.thing}${th.words}`),
          zone: (pill: ReactNode) => zone([{ k: "thing", fee: fee.id, t: th.thing }], `thing:${th.thing}`, pill),
        }
      : {}),
  }));
  const head = { things: headThings, ...(isOpen ? { onThing: (id: string, at: HTMLElement) => onThing(Number(id), at), openThing: open.thing === null ? null : String(open.thing) } : {}), onRemoveThing: (id: string) => onRemoveBy(fee.id, Number(id)) };

  // the parts said once, one line per currency they hold in (every case's first)
  const sharedLines = (said: readonly Shared[]) => {
    const groups = [...new Set(said.map((x) => x.currency))].sort((a, b) => (a === null ? -1 : b === null ? 1 : 0));
    return groups.map((cur) => (
      <SharedLine key={cur ?? "all"} lead={sharedLead(cur)}>
        {saidJoined(said.filter((x) => x.currency === cur))}
      </SharedLine>
    ));
  };

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

  /** A case as a band row: its grip, its words (`when`), the parts it still shows, its standing; open, in place. */
  const bandRow = (r: CaseRowView, when: CaseWord[], l: Lifted, spoken: string, more: GripAction[] = [], also: LiftTarget[] = []) =>
    r.case === openCase && open.view
      ? openView(r)
      : zone(
          [...also, caseTarget(r.case)],
          r.case,
          <CaseRow when={when} label={label(r)} onOpen={openIt(r.case)} grip={grip(l, spoken, more)}>
            {here(
              [r.case],
              shownParts(r.case).map((p) => <RestPart key={`${p.stage ?? 0}:${p.id}`} part={p} />),
            )}
            <RowStanding fee={fee.id} priced={r.priced} standing={r.standing} />
          </CaseRow>,
        );

  const question = asking ? (asking.range ? <AskStep key={`step:${asking.thing}`} fee={fee} t={asking.thing} onFee={addAndOpen} onDone={asked} /> : <AskValuesOf key={`values:${asking.thing}`} fee={fee} t={asking.thing} onFee={addAndOpen} onDone={asked} />) : null;
  // the bin, while something of this fee is lifted: under its table, grid or band; on a phone at the foot of the screen
  const bin = <DropBin phone={lift.phone} accepts={(it) => lift.binTakesItem(fee.id, it)} onDrop={(it) => lift.onBinItem(it)} />;

  let body: ReactNode;
  if (wide && layout.shape === "table") {
    const t = layout.thing;
    const all = rows.flatMap((r) => r.parts);
    const n = layout.columns.length;
    const colCases: RowCases = layout.columns.map((col) => col.case);
    const listThing = !layout.ladder && layout.split === null;
    body = (
      <>
        <ConditionHead bare {...head} />
        {sharedLines(layout.shared)}
        <CaseTable
          label={name}
          ladder={layout.ladder}
          columns={layout.columns.map((col, k) => {
            const r = byCase.get(col.case)!;
            const words = layout.ladder ? stepName(r, t) : caseText(r.when);
            const cg = layout.ladder
              ? typeof col.when === "number"
                ? grip({ k: "step", fee: fee.id, t, step: col.when, name: words }, `${lw.grip.step}${words}`)
                : null
              : grip({ k: "col", fee: fee.id, case: col.case }, `${lw.grip.col}${words}`, listThing ? caseActions(col.case, k, n, words) : []);
            return {
              id: col.case,
              head: col.sub !== undefined ? <SubHead r={r} sub={layout.split!} head={headOf(r, t)} /> : headOf(r, t),
              label: label(r),
              onOpen: openIt(col.case),
              open: col.case === openCase,
              ...(cg ? { grip: cg } : {}),
              zone: (h: ReactNode) => zone([{ k: "col", fee: fee.id, case: col.case }, caseTarget(col.case)], col.case, h),
            };
          })}
          rows={layout.rows.map((row) => {
            const pr = row.row as PartRow;
            const rowHeadWords = rowHead(pr, all);
            return {
              id: row.row,
              head: rowHeadWords,
              grip: grip({ k: "row", fee: fee.id, row: pr }, `${lw.grip.partRow}${rowHeadWords}`),
              cells: row.cells.map((cell) => {
                const target: LiftTarget = { k: "cell", fee: fee.id, cases: cell.cases, row: pr, along: t };
                const cellZone = (el: ReactNode) => zone([target, caseTarget(cell.cases[0]!)], `${row.row}:${cell.from}`, el);
                if (cell.key === null) return { from: cell.from, span: cell.span, content: null, zone: cellZone };
                const ww = wholeWords(cell.span, n, t);
                return {
                  from: cell.from,
                  span: cell.span,
                  open: !!openCase && cell.cases.includes(openCase),
                  onOpen: openIt(cell.cases[0]!),
                  content: here(cell.cases, <Joined parts={partsOf(cell.cases[0]!, pr)} bare={headSaysLead(pr)} />),
                  grip: grip({ k: "cell", fee: fee.id, cases: cell.cases, row: pr, along: t }, `${lw.grip.cell}${rowHeadWords}`),
                  ...knobsOf(row.row, colCases, cell.from, cell.span, pr, t),
                  onRemove: () => lift.onBin({ k: "cell", fee: fee.id, cases: cell.cases, row: pr, along: t }),
                  lit: lit(row.row, cell.from, cell.span),
                  ...(ww ? { whole: ww } : {}),
                  zone: cellZone,
                };
              }),
            };
          })}
          add={layout.ladder ? stepSlot(t) : addOne}
          foot={bin}
        />
      </>
    );
  } else if (wide && layout.shape === "grid") {
    const g = layout;
    const n = g.columns.length;
    /** A grid row's cases by column: a place no case holds, and a case on any value across, take no stretch. */
    // a cell down over several rows, and a cell it covers, take no stretch across
    const casesBy = (cells: GridCell[]): RowCases => Array.from({ length: n }, (_, k) => {
      const cell = cells.find((x) => x.from <= k && k < x.from + x.span)!;
      return cell.case && !cell.whole && !cell.covered && !cell.down ? cell.cases[k - cell.from]! : null;
    });
    /** A grid column's cases by row, for a stretch down: a place held by a one-column case cell (or a row of a cell down over rows). */
    const columnCases = (k: number): RowCases =>
      g.rows.map((r) => {
        const cell = r.cells.find((x) => x.from <= k && k < x.from + x.span)!;
        return cell.case && !cell.whole && cell.span === 1 ? cell.case : null;
      });
    body = (
      <>
        <ConditionHead bare {...head} />
        {sharedLines(g.shared)}
        <CaseGrid
          label={name}
          steps={g.across.range}
          above={g.switch && <ThingSwitch fee={fee} values={g.switch.values} chosen={g.switch.chosen} words={(h) => byCase.get(h.cases[0]!)!.when[2]!} mine={(h) => byCase.get(h.cases[0]!)!.mine} onChange={setSwitchTo} />}
          columns={g.columns.map((col, k) => {
            const hg = headGrip(col, 1, k, n);
            return { id: col.key, head: headOfValue(col, 1), ...(col.shared.length ? { shared: saidJoined(col.shared) } : {}), ...(hg ? { grip: hg } : {}), zone: (h: ReactNode) => zone([{ k: "value", fee: fee.id, t: 1, key: col.key }], `col:${col.key}`, h) };
          })}
          rows={g.rows.map((row, j) => {
            const rc = casesBy(row.cells);
            const hg = headGrip(row, 0, j, g.rows.length);
            return {
              id: row.key,
              head: headOfValue(row, 0),
              ...(row.shared.length ? { shared: saidJoined(row.shared) } : {}),
              ...(hg ? { grip: hg } : {}),
              zone: (h: ReactNode) => zone([{ k: "value", fee: fee.id, t: 0, key: row.key }], `row:${row.key}`, h),
              cells: row.cells.filter((cell) => !cell.covered).map((cell) => {
                const col = g.columns[cell.from]!;
                if (!cell.case) {
                  const from = row.cells.find((x) => x.case)?.case ?? row.cases[0]!;
                  return {
                    from: cell.from,
                    span: cell.span,
                    empty: { label: c.addSlot.case, spoken: `${c.emptyPlace}${whenText(byCase.get(row.cases[0]!)!.when[0]!)}${sep}${whenText(byCase.get(col.cases[0]!)!.when[1]!)}`, onAdd: () => addAndOpen(addCaseAt(fee, from, 1, col.when)) },
                    zone: (el: ReactNode) => zone([{ k: "place", fee: fee.id, row: from, t: 1, when: col.when }], `place:${row.key}:${cell.from}`, el),
                  };
                }
                const r = byCase.get(cell.case)!;
                const target: LiftTarget = { k: "cell", fee: fee.id, cases: cell.cases, row: WHOLE, along: 1 };
                const down = cell.down ?? 1;
                const ww = cell.whole ? null : (wholeWords(cell.span, n, 1) ?? wholeWords(down, g.rows.length, 0));
                // across: a cell of one row; down: a cell one column wide
                const across = !cell.whole && down === 1 ? knobsOf(row.key, rc, cell.from, cell.span, WHOLE, 1) : null;
                const colKey = `col:${col.key}`;
                const downward = !cell.whole && cell.span === 1 ? knobsOf(colKey, columnCases(cell.from), j, down, WHOLE, 0, "y") : null;
                return {
                  from: cell.from,
                  span: cell.span,
                  ...(down > 1 ? { down } : {}),
                  label: label(r),
                  onOpen: openIt(cell.case),
                  open: !!openCase && cell.cases.includes(openCase),
                  content: (
                    <>
                      {here(cell.cases, <Joined parts={shownParts(cell.case)} />)}
                      <RowStanding fee={fee.id} priced={r.priced} standing={r.standing} />
                    </>
                  ),
                  ...(cell.whole ? { across: <WhenText words={r.when[1]!} /> } : {}),
                  grip: grip({ k: "cell", fee: fee.id, cases: cell.cases, row: WHOLE, along: 1 }, `${lw.grip.cell}${caseText(r.when)}`),
                  ...(across || downward
                    ? {
                        knobs: (
                          <>
                            {across?.knobs}
                            {downward?.knobs}
                          </>
                        ),
                        ...(across ? { onStretch: across.onStretch } : {}),
                        ...(downward ? { onStretchDown: downward.onStretch } : {}),
                        lit: lit(row.key, cell.from, cell.span) || lit(colKey, j, down),
                      }
                    : {}),
                  ...(lift.binTakes({ k: "cell", fee: fee.id, cases: cell.cases, row: WHOLE, along: 1 }) ? { onRemove: () => lift.onBin({ k: "cell", fee: fee.id, cases: cell.cases, row: WHOLE, along: 1 }) } : {}),
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
    body = (
      <ConditionBand {...head}>
        {g.switch && (
          <div className="px-3 pt-1">
            <ThingSwitch fee={fee} values={g.switch.values} chosen={g.switch.chosen} words={(h) => byCase.get(h.cases[0]!)!.when[2]!} mine={(h) => byCase.get(h.cases[0]!)!.mine} onChange={setSwitchTo} />
          </div>
        )}
        {g.shared.length > 0 && <div className="px-3 pt-1">{sharedLines(g.shared)}</div>}
        {g.rows.map((row, j) => {
          const hg = headGrip(row, 0, j, g.rows.length);
          return (
            <CaseGroup key={row.key} head={headOfValue(row, 0)} {...(row.shared.length ? { shared: saidJoined(row.shared) } : {})} {...(hg ? { grip: hg } : {})} zone={(h) => zone([{ k: "value", fee: fee.id, t: 0, key: row.key }], `row:${row.key}`, h)}>
              {row.cells.flatMap((cell) => {
                if (cell.case)
                  return cell.cases.filter((id) => row.cases.includes(id)).map((id) => {
                    const r = byCase.get(id)!;
                    return <div key={id}>{bandRow(r, caseWords([r.when[1]!], r.mine, band.things, r.bounds), { k: "cell", fee: fee.id, cases: [id], row: WHOLE, along: 1 }, `${lw.grip.cell}${caseText(r.when)}`)}</div>;
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
    // one thing past five cases or with no room for its table, or cases that do not fall one to a place of a grid: a row per case
    const order = layout.shape === "table" ? layout.columns.map((x) => x.case) : layout.cases;
    const ladder = layout.shape === "table" && layout.ladder;
    const listThing = layout.shape === "table" && !layout.ladder && layout.split === null;
    const add = ladder ? stepSlot(0) : addOne;
    body = (
      <ConditionBand {...head}>
        {layout.shared.length > 0 && <div className="px-3 pt-1">{sharedLines(layout.shared)}</div>}
        {order.map((id, k) => {
          const r = byCase.get(id)!;
          const words = ladder ? stepName(r, 0) : caseText(r.when);
          const w0 = fee.cases.find((x) => x.id === id)!.when[0];
          const step = ladder && typeof w0 === "number" ? w0 : null;
          const l: Lifted = step !== null ? { k: "step", fee: fee.id, t: 0, step, name: words } : { k: "col", fee: fee.id, case: id };
          return <div key={id}>{bandRow(r, caseWords(r.when, r.mine, band.things, r.bounds), l, `${step !== null ? lw.grip.step : lw.grip.col}${words}`, listThing ? caseActions(id, k, order.length, words) : [], listThing ? [{ k: "col", fee: fee.id, case: id }] : [])}</div>;
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
      {wide && openRow && openView(openRow)}
    </div>
  );

  /** A table's column of a list thing moved by one place, and duplicated right after it ("<value> (עותק)"). */
  function caseActions(caseId: string, k: number, count: number, words: string): GripAction[] {
    const out: GripAction[] = [];
    if (k > 0) out.push({ label: lw.menu.before, onPick: () => onFee(moveCase(fee, caseId, k - 1)) });
    if (k < count - 1) out.push({ label: lw.menu.after, onPick: () => onFee(moveCase(fee, caseId, k + 1)) });
    const key = valueKey(fee.cases.find((x) => x.id === caseId)!.when[0]!);
    out.push({ label: lw.menu.duplicateColumn, onPick: () => addAndOpen(duplicateValue(fee, 0, key, copyName(words))) });
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
 * typed in place, kept above the top before it and below the one after; the bottom is plain words, the step before's top, so moving that
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
      <span data-lift="" className="inline-flex items-center gap-1 whitespace-nowrap">
        <FigureField
          value={bounds.to}
          label={c.stepTop}
          unit=""
          sign={sign}
          tight
          validate={(n) => (n > low && (next === null || n < next) ? null : c.stepTopRange(fmt.number(low), next === null ? null : fmt.number(next)))}
          onCommit={(n) => onFee(setTop(fee, t, bounds.step, n))}
        />
        <span>{sign}</span>
      </span>
    </div>
  );
}

