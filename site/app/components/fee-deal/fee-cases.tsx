// A fee whose price changes by things, laid out by its shape (method §10.6, F-114; lib/fee-deal/band-layout.ts and layout.ts): its
// condition's head, then, where its block has the room, a table of its cases (one thing; a range as a ladder whose step tops are typed in
// place) or a grid (two things; a third a switch above it), the parts said once above the cases, the case open under them; narrower, or
// past five cases, the same cases as rows in the cases' band, a grid's in one group per value of its first thing. Each add slot stands
// where the new case, step, row or column will: "+ מקרה" copies the open case (else the last) and opens the copy; "+ מדרגה" asks only the
// new boundary (`AskStep`); a grid's row and column ask their new values (`AskValuesOf`), and a place of a grid no case holds takes a copy
// of its row's case. Every case shows, in the fee's order, the person's own marked "שלכם" and none set apart for not being theirs. A
// toolbox part dragged here drops on a case's head, cell or row, or on the open case.
import { useMemo, useRef, useState, type ReactNode } from "react";
import { dealCases, feeDeal as copy } from "../../copy";
import type { CaseRow as CaseRowView, FeeBlock as BlockView } from "../../lib/fee-deal/rows";
import type { SlimPart, WhenWords } from "../../lib/fee-deal/case-words";
import { thingName } from "../../lib/fee-deal/case-words";
import { addCase, addCaseAt, copyCase, setTop } from "../../lib/fee-deal/edits/case";
import { bandLayout, headSaysLead, partsByRow, rangeSign, rowHead, sharedLead, type PartRow, type StepBounds } from "../../lib/fee-deal/band-layout";
import { valueKey, type FeeLayout, type Head, type Shared } from "../../lib/fee-deal/layout";
import { isRange, type CasesFee, type Fee } from "../../lib/fee-deal/model";
import type { StandingView } from "../../lib/fee-deal/deal-read";
import { fmt } from "../../lib/format";
import { AddSlot, CaseGrid, CaseGroup, CaseRow, CaseSlot, CaseTable, ConditionBand, ConditionHead, FigureField, OpenCase, PartChip, SegmentedControl, SharedLine, Tag, monthText, useWidth, type AddSpec, type CaseWord } from "../kit";
import { Num } from "../provenance";
import { AskStep, AskValuesOf } from "./ask-thing";
import { LawTag } from "./links";
import { WhenText, numText, whenText } from "./open-case";
import { PART_MARK } from "./part-edit";
import { Fig } from "./words";
import type { BlockActions, OpenHere } from "./fee-block";

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
    <PartChip kind={part.kind} mark={PART_MARK[part.id]} lead={w.lead?.trim()} figure={w.figure ? <Fig value={w.figure} /> : undefined} words={tail || undefined}>
      {w.mid && <span className="text-muted-foreground">{w.mid.trim()}</span>}
      {w.second && <Fig value={w.second} />}
      {w.month && <bdi dir="ltr">{monthText(w.month)}</bdi>}
    </PartChip>
  );
}

/** A part as words in a table's cell or a line said once: its first word (left out under a head that says it, `bare`), its figures, its tail. */
function PartText({ part, bare }: { part: SlimPart; bare?: boolean }) {
  const w = part.words;
  return (
    <span>
      {!bare && w.lead}
      {w.figure && <Fig value={w.figure} />}
      {w.mid}
      {w.second && <Fig value={w.second} />}
      {w.month && <bdi dir="ltr">{monthText(w.month)}</bdi>}
      {w.tail}
      {w.quiet && <span className="text-muted-foreground">{w.quiet}</span>}
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

/** The room a table or a grid needs, in px: a head column, each case's or value's, and the add column; less than that reads as rows. */
function fits(layout: FeeLayout, width: number): boolean {
  if (layout.shape === "table") return layout.fit === "columns" && width >= 96 + layout.columns.length * (layout.ladder ? STEP_COLUMN : 128) + 120;
  if (layout.shape === "grid") return width >= 152 + layout.columns.length * (layout.across.range ? STEP_COLUMN : 136) + 104;
  return false;
}

/** A ladder's column, in px: room for its head on one line, "100,000 עד" and its top's box (`CaseTable`'s and `CaseGrid`'s `steps`). */
const STEP_COLUMN = 184;

/** The question of an add slot open: the thing it adds a value of, and whether it adds a step. */
type Asking = { thing: number; range: boolean } | null;

export function FeeCases({
  fee,
  band,
  open,
  name,
  onFee,
  actions,
  caseZone,
  openParts,
}: {
  fee: CasesFee;
  band: Extract<BlockView, { kind: "band" }>;
  open: OpenHere;
  name: string;
  onFee: (f: Fee) => void;
  actions: BlockActions;
  /** A case's drop zone around `el`: it takes a toolbox part. */
  caseZone: (caseId: string, key: string, el: ReactNode) => ReactNode;
  /** The open case's parts in edit, with the spoken name of its boxes. */
  openParts: (spoken: string) => ReactNode;
}) {
  const { onOpen, onSlot, onThing, onRemoveCase, onRemoveBy } = actions;
  const isOpen = open.fee === fee.id;
  const openCase = isOpen ? open.case : null;
  // the switch starts on the person's own case's value, where a case is theirs (their track), else on the first
  const mineOn = fee.cases.find((c) => c.mine)?.when[2];
  const [switchTo, setSwitchTo] = useState<string | null>(mineOn !== undefined && mineOn !== "any" ? valueKey(mineOn) : null);
  const [asking, setAsking] = useState<Asking>(null);
  const slot = useRef<HTMLElement | null>(null);
  const [box, width] = useWidth(326);
  // every case, in the fee's order: none is set apart for not being the person's
  const rows = band.rows;
  const byCase = new Map(rows.map((r) => [r.case, r]));
  const layout = useMemo(() => bandLayout(fee, rows, switchTo), [fee, rows, switchTo]);
  const wide = fits(layout, width);

  const partsOf = (caseId: string, row: PartRow) => partsByRow(byCase.get(caseId)!.parts).get(row) ?? [];
  const shownParts = (caseId: string) => layout.shows[caseId]!.flatMap((row) => partsOf(caseId, row as PartRow));
  const saidParts = (said: readonly Shared[]) => said.flatMap((s) => partsOf(s.cases[0]!, s.row as PartRow));
  const label = (r: CaseRowView) => `${copy.cases.openCase}${caseText(r.when)}`;
  const openIt = (caseId: string) => () => onOpen(fee.id, caseId, "pointer");
  // a case or a step added opens: the first case the fee did not have
  const addAndOpen = (next: Fee) => {
    onFee(next);
    const fresh = next.cases?.find((c) => !fee.cases.some((o) => o.id === c.id));
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
  const addOne: AddSpec = { label: copy.cases.addSlot.case, onAdd: () => addAndOpen(addCase(fee, openCase ?? undefined)) };
  const stepSlot = (t: number): AddSpec => ({ label: copy.cases.addSlot.step, onAdd: ask(t, true), expanded: asking?.thing === t });
  const valuesSlot = (t: number): AddSpec => ({ label: thingName(fee.kind, fee.by[t]!), onAdd: ask(t, false), expanded: asking?.thing === t });
  const slotOf = (t: number, range: boolean) => (range ? stepSlot(t) : valuesSlot(t));

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

  const head = { things: band.things.map((t) => ({ id: String(t.thing), name: t.words, removeLabel: copy.cases.thingMenu.stop.replace("{thing}", t.words) })), ...(isOpen ? { onThing: (id: string, at: HTMLElement) => onThing(Number(id), at), openThing: open.thing === null ? null : String(open.thing) } : {}), onRemoveThing: (id: string) => onRemoveBy(fee.id, Number(id)) };

  // the parts said once, one line per currency they hold in (every case's first)
  const sharedLines = (said: readonly Shared[]) => {
    const groups = [...new Set(said.map((s) => s.currency))].sort((a, b) => (a === null ? -1 : b === null ? 1 : 0));
    return groups.map((cur) => (
      <SharedLine key={cur ?? "all"} lead={sharedLead(cur)}>
        <Joined parts={saidParts(said.filter((s) => s.currency === cur))} />
      </SharedLine>
    ));
  };

  const openView = (r: CaseRowView) => {
    const ov = open.view!;
    return caseZone(
      r.case,
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

  /** A case as a band row: its words (`when`), the parts it still shows, its standing; open, in place. */
  const bandRow = (r: CaseRowView, when: CaseWord[]) =>
    r.case === openCase && open.view
      ? openView(r)
      : caseZone(
          r.case,
          r.case,
          <CaseRow when={when} label={label(r)} onOpen={openIt(r.case)}>
            {shownParts(r.case).map((p) => (
              <RestPart key={`${p.stage ?? 0}:${p.id}`} part={p} />
            ))}
            <RowStanding fee={fee.id} priced={r.priced} standing={r.standing} />
          </CaseRow>,
        );

  const question = asking ? (asking.range ? <AskStep key={`step:${asking.thing}`} fee={fee} t={asking.thing} onFee={addAndOpen} onDone={asked} /> : <AskValuesOf key={`values:${asking.thing}`} fee={fee} t={asking.thing} onFee={addAndOpen} onDone={asked} />) : null;

  let body: ReactNode;
  if (wide && layout.shape === "table") {
    const t = layout.thing;
    const all = rows.flatMap((r) => r.parts);
    body = (
      <>
        <ConditionHead bare {...head} />
        {sharedLines(layout.shared)}
        <CaseTable
          ladder={layout.ladder}
          columns={layout.columns.map((col) => {
            const r = byCase.get(col.case)!;
            return { id: col.case, head: headOf(r, t), label: label(r), onOpen: openIt(col.case), open: col.case === openCase, zone: (h: ReactNode) => caseZone(col.case, col.case, h) };
          })}
          rows={layout.rows.map((row) => ({
            id: row.row,
            head: rowHead(row.row as PartRow, all),
            cells: row.cells.map((cell) => ({
              from: cell.from,
              span: cell.span,
              open: !!openCase && cell.cases.includes(openCase),
              onOpen: openIt(cell.cases[0]!),
              content: cell.key === null ? null : <Joined parts={partsOf(cell.cases[0]!, row.row as PartRow)} bare={headSaysLead(row.row as PartRow)} />,
            })),
          }))}
          add={layout.ladder ? stepSlot(t) : addOne}
        />
      </>
    );
  } else if (wide && layout.shape === "grid") {
    const g = layout;
    body = (
      <>
        <ConditionHead bare {...head} />
        {sharedLines(g.shared)}
        <CaseGrid
          steps={g.across.range}
          above={g.switch && <ThingSwitch fee={fee} values={g.switch.values} chosen={g.switch.chosen} words={(h) => byCase.get(h.cases[0]!)!.when[2]!} mine={(h) => byCase.get(h.cases[0]!)!.mine} onChange={setSwitchTo} />}
          columns={g.columns.map((col) => ({ id: col.key, head: headOfValue(col, 1), ...(col.shared.length ? { shared: <Joined parts={saidParts(col.shared)} /> } : {}) }))}
          rows={g.rows.map((row) => ({
            id: row.key,
            head: headOfValue(row, 0),
            ...(row.shared.length ? { shared: <Joined parts={saidParts(row.shared)} /> } : {}),
            cells: row.cells.map((cell) => {
              if (!cell.case) {
                const from = row.cells.find((x) => x.case)?.case ?? row.cases[0]!;
                const col = g.columns[cell.from]!;
                return { from: cell.from, span: cell.span, empty: { label: copy.cases.addSlot.case, spoken: `${copy.cases.emptyPlace}${whenText(byCase.get(row.cases[0]!)!.when[0]!)}${sep}${whenText(byCase.get(col.cases[0]!)!.when[1]!)}`, onAdd: () => addAndOpen(addCaseAt(fee, from, 1, col.when)) } };
              }
              const r = byCase.get(cell.case)!;
              return {
                from: cell.from,
                span: cell.span,
                label: label(r),
                onOpen: openIt(cell.case),
                open: cell.case === openCase,
                content: (
                  <>
                    <Joined parts={shownParts(cell.case)} />
                    <RowStanding fee={fee.id} priced={r.priced} standing={r.standing} />
                  </>
                ),
                ...(cell.whole ? { across: <WhenText words={r.when[1]!} /> } : {}),
                zone: (el: ReactNode) => caseZone(cell.case!, cell.case!, el),
              };
            }),
          }))}
          addRow={slotOf(g.down.thing, g.down.range)}
          addColumn={slotOf(g.across.thing, g.across.range)}
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
        {g.rows.map((row) => (
          <CaseGroup key={row.key} head={headOfValue(row, 0)} {...(row.shared.length ? { shared: <Joined parts={saidParts(row.shared)} /> } : {})}>
            {row.cells.map((cell) => {
              if (cell.case) {
                const r = byCase.get(cell.case)!;
                return <div key={cell.case}>{bandRow(r, caseWords([r.when[1]!], r.mine, band.things, r.bounds))}</div>;
              }
              const col = g.columns[cell.from]!;
              const from = row.cells.find((x) => x.case)?.case ?? row.cases[0]!;
              return (
                <div key={`empty:${cell.from}`} className="px-3">
                  <AddSlot shape="row" add={{ label: `${copy.cases.addSlot.case}${sep}${whenText(byCase.get(col.cases[0]!)!.when[1]!)}`, onAdd: () => addAndOpen(addCaseAt(fee, from, 1, col.when)) }} />
                </div>
              );
            })}
          </CaseGroup>
        ))}
        <div className="flex flex-col gap-1.5 px-3 pt-1 pb-1">
          <AddSlot shape="row" add={slotOf(g.down.thing, g.down.range)} />
          <AddSlot shape="row" add={slotOf(g.across.thing, g.across.range)} />
        </div>
      </ConditionBand>
    );
  } else {
    // one thing past five cases or with no room for its table, or cases that do not fall one to a place of a grid: a row per case
    const order = layout.shape === "table" ? layout.columns.map((c) => c.case) : layout.cases;
    const add = layout.shape === "table" && layout.ladder ? stepSlot(layout.thing) : addOne;
    body = (
      <ConditionBand {...head}>
        {layout.shared.length > 0 && <div className="px-3 pt-1">{sharedLines(layout.shared)}</div>}
        {order.map((id) => {
          const r = byCase.get(id)!;
          return <div key={id}>{bandRow(r, caseWords(r.when, r.mine, band.things, r.bounds))}</div>;
        })}
        <div className="px-3 pt-1 pb-1">
          <AddSlot shape="row" add={add} />
        </div>
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
}

/** The switch of a fee's third thing, above its grid: its values, the one shown pressed, the person's own track saying "שלכם". */
function ThingSwitch({ fee, values, chosen, words, mine, onChange }: { fee: CasesFee; values: Head[]; chosen: string; words: (h: Head) => WhenWords; mine: (h: Head) => boolean; onChange: (key: string) => void }) {
  return <SegmentedControl fit label={`${copy.cases.switchLabel} ${thingName(fee.kind, fee.by[2]!)}`} options={values.map((v) => ({ value: v.key, label: `${whenText(words(v))}${mine(v) ? `${sep}${dealCases.mine}` : ""}` }))} value={chosen} onChange={onChange} />;
}

/**
 * A ladder's step as its head says it, on one line: "עד {top}", "{bottom} עד {top}", or "מעל {bottom}". The top is a box typed in place,
 * kept above the top before it and below the one after; the bottom is plain words, the step before's top, so moving that top moves it too
 * and the steps keep no gap or overlap.
 */
function StepHead({ fee, t, bounds, onFee }: { fee: CasesFee; t: number; bounds: StepBounds; onFee: (f: Fee) => void }) {
  const b = fee.by[t]!;
  const c = copy.cases;
  if (!isRange(b)) return null;
  const sign = rangeSign(b.unit);
  if (!bounds.to)
    return (
      <div className="flex flex-nowrap items-center whitespace-nowrap">
        {c.over}
        <bdi dir="ltr">{numText(bounds.from!)}</bdi>
      </div>
    );
  const next = b.tops[bounds.step + 1]?.v ?? null;
  const low = (bounds.from?.value as number | undefined) ?? 0;
  return (
    <div className="flex flex-nowrap items-center gap-1 whitespace-nowrap">
      {bounds.from ? (
        <span>
          <bdi dir="ltr">{fmt.number(low)}</bdi>
          {c.stepBetween}
        </span>
      ) : (
        <span>{c.upTo}</span>
      )}
      <span data-lift="" className="inline-block">
        <FigureField
          value={bounds.to}
          label={c.stepTop}
          unit=""
          sign={sign}
          tight
          validate={(n) => (n > low && (next === null || n < next) ? null : c.stepTopRange(fmt.number(low), next === null ? null : fmt.number(next)))}
          onCommit={(n) => onFee(setTop(fee, t, bounds.step, n))}
        />
      </span>
      <span>{sign}</span>
    </div>
  );
}

