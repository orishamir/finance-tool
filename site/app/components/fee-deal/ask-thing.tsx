// The one question a thing to change by asks before it is added to a fee (method §10.6, F-114; `byQuestion`), in place: in the fee's block
// in the fees' column, where the thing's band will stand, not in the toolbox, which only lists the parts. The questions of a fee's add
// slot that asks stands in its block too, under its cases: a ladder's new boundary (`AskStep`).
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { feeDeal as copy } from "../../copy";
import { byQuestion, copiesWords } from "../../lib/fee-deal/things";
import { addBy, addStep, nameTaken, newBy, splitCase } from "../../lib/fee-deal/edits/case";
import { metLimit } from "../../lib/fee-deal/limits";
import { isRange, NAME_MAX, type CasesFee, type Fee, type OwnPlace } from "../../lib/fee-deal/model";
import { rangeSign } from "../../lib/fee-deal/band-layout";
import { thingName } from "../../lib/fee-deal/case-words";
import type { ByKind, RangeUnit } from "../../lib/fee-deal/offers/conditions";
import { AskValues, FigureField, InlineSelect, TextField } from "../kit";
import { fmt } from "../../lib/format";
import { bringIntoView } from "./in-view";
import { NEW_OWN, OwnValueForm, type OwnTyped } from "./own-value";

/**
 * The one question a thing to change by asks before it is added: for a list, its values to tick and one of the person's own
 * ("+ ערוץ אחר"); for a track or a condition, the values in the person's words (a condition with its name first); for a range, its first
 * top and its unit. What adding does to the cases is said under it. It stands in place, in the fee's block where the thing's band will
 * stand: the focus goes into it as it opens, and Escape closes it as "ביטול" does.
 */
export function AskThing({ fee, kind, split, onFee, onDone }: { fee: Fee; kind: ByKind; /** The case it splits alone (`splitCase`); none: the whole fee. */ split?: string; onFee: (f: Fee) => void; /** The question closed: with the thing added, or not. */ onDone: (added: boolean) => void }) {
  const q = byQuestion(fee, kind);
  // the question takes the focus where it opens, in its first field or value, and is brought into view (above a phone's folded sheet)
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    el?.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true });
    bringIntoView(el);
  }, []);
  const c = copy.cases;
  const [chosen, setChosen] = useState<string[]>([]);
  const [extra, setExtra] = useState<string[]>([]);
  const [own, setOwn] = useState<OwnPlace[]>([]);
  const [typing, setTyping] = useState<OwnTyped | null>(q.typed?.open ? NEW_OWN : null);
  const [label, setLabel] = useState("");
  const [top, setTop] = useState<number | null>(null);
  const [unit, setUnit] = useState<RangeUnit | null>(q.units?.[0]?.unit ?? null);
  const [refused, setRefused] = useState(false);
  const toggle = (id: string) => setChosen((x) => (x.includes(id) ? x.filter((v) => v !== id) : [...x, id]));
  const place = !!q.typed?.place;
  // a name the list has already, by its id or its words, or one typed here before, is refused (the form says so)
  const taken = (name: string) => nameTaken([...(q.values ?? []).flatMap((v) => [v.id, v.words]), ...extra], name);
  const typed = () => {
    const name = typing?.name.trim();
    if (!typing || !name || taken(name)) return;
    if (!extra.includes(name) && !q.values?.some((v) => v.id === name)) setExtra((x) => [...x, name]);
    if (place) setOwn((x) => [...x.filter((o) => o.name !== name), { name, place: typing.place, currency: typing.currency }]);
    setChosen((x) => (x.includes(name) ? x : [...x, name]));
    setTyping(q.typed?.open ? { ...typing, name: "" } : null);
  };
  const range = !!q.units;
  const copies = copiesWords(fee, kind, chosen.length);
  const note = split ? (
    <>{refused ? c.lifted.splitRefused : c.lifted.splitNote}</>
  ) : (
    <>
      {copies.line}
      {/* how many cases there will be, once a value is ticked (a range's two steps are known at once) */}
      {copies.count && (range || chosen.length > 0) && <> {copies.count.replace("{from}", String(copies.from)).replace("{to}", String(copies.to))}</>}
    </>
  );
  const add = () => {
    const n = newBy(kind, { values: chosen, own, label, top, unit });
    if (!n) return;
    const next = split ? splitCase(fee, split, n) : addBy(fee, n);
    // a split that would change which case another set of values reads is refused, and says so; one past a limit the page says (limits.ts)
    if (split && next === fee && !metLimit(fee)) return setRefused(true);
    onFee(next);
    onDone(true);
  };
  const ownForm = typing && <OwnValueForm value={typing} nameLabel={q.typed?.name ?? c.slot.ownName} place={place} add={c.addValue} onChange={setTyping} onAdd={typed} taken={taken} />;
  const field = range ? (
    <FigureField
      value={null}
      label={q.ask}
      unit={q.units && q.units.length > 1 ? <InlineSelect chip label={c.slot.unit} options={q.units.map((u) => ({ id: u.unit, name: u.words }))} value={unit} onChange={(v) => v && setUnit(v as RangeUnit)} /> : (q.units?.[0]?.words ?? "")}
      sign={q.units?.find((u) => u.unit === unit)?.words ?? ""}
      tight
      words={<span className="text-muted-foreground">{c.upTo.trim()}</span>}
      asks
      onCommit={setTop}
      onClear={() => setTop(null)}
    />
  ) : q.label ? (
    <TextField label={q.label} value={label} maxLength={NAME_MAX} onChange={setLabel} />
  ) : undefined;
  return (
    <div
      ref={root}
      data-ask-thing=""
      onKeyDown={(e) => {
        if (e.key !== "Escape" || e.defaultPrevented) return;
        e.preventDefault();
        e.stopPropagation();
        onDone(false);
      }}
    >
    <AskValues
      question={q.ask}
      field={field}
      options={[...(q.values ?? []).map((v) => ({ id: v.id, label: v.words })), ...extra.map((v) => ({ id: v, label: v }))]}
      chosen={chosen}
      onToggle={toggle}
      {...(q.other ? { other: { label: q.other, open: !!typing, onClick: () => setTyping(typing ? null : NEW_OWN) } } : {})}
      otherField={ownForm}
      note={note}
      {...(range ? { ready: top !== null && top > 0 && !!unit } : q.label ? { ready: label.trim() !== "" && chosen.length > 0 } : {})}
      onAdd={add}
      onCancel={() => onDone(false)}
    />
    </div>
  );
}

/**
 * The page's question of a thing to change by (`asking`, its fee and thing, and the case it splits alone where a card was dropped on one):
 * asked in the open fee's block (`onAsk`), the phone's sheet
 * folding to its tabs while it is open (`fold`). Closed (`onAskDone`), the focus goes to the new thing's pill where it was added, else back
 * to the toolbox's part it was asked from. `drop` closes it without a word, as another fee or the toolbox closing does.
 */
export function useAskThing(chosen: string | null, phone: boolean, fold: (folded: boolean) => void) {
  const [asking, setAsking] = useState<{ fee: string; kind: ByKind; split?: string } | null>(null);
  /** The question of thing `kind`, for the open fee, or for its case `split` alone. */
  const onAsk = (kind: ByKind, split?: string) => {
    if (!chosen) return;
    setAsking({ fee: chosen, kind, ...(split ? { split } : {}) });
    if (phone) fold(true);
  };
  const onAskDone = (added: boolean) => {
    const was = asking;
    setAsking(null);
    if (phone) fold(false);
    if (!was) return;
    requestAnimationFrame(() => {
      const li = document.querySelector(`li[data-fee="${CSS.escape(was.fee)}"]`);
      const pills = li?.querySelectorAll<HTMLElement>("[data-thing]");
      const el = added && pills?.length ? pills[pills.length - 1]! : document.querySelector<HTMLElement>(`[data-part="by:${was.kind}"]`);
      el?.focus({ preventScroll: true });
      bringIntoView(el);
    });
  };
  return { asking, onAsk, onAskDone, drop: () => setAsking(null) };
}

/**
 * Once a step or a value is added, the focus goes to what was made: the case the page opened for it (its first box, else its first
 * control), brought into view, else the fee's open case as it stands; never left on the question that is gone.
 */
function focusOpened(feeId: string) {
  requestAnimationFrame(() => {
    const open = document.querySelector(`li[data-fee="${CSS.escape(feeId)}"] [data-open-case]`);
    const el = open?.querySelector<HTMLElement>("input[data-figure]") ?? open?.querySelector<HTMLElement>("button, input");
    if (!el) return;
    el.focus({ preventScroll: true });
    if (el instanceof HTMLInputElement) el.select();
    bringIntoView(el.closest("[data-open-case]") as HTMLElement | null);
  });
}

/** The question opens with the focus in its first field or value, brought into view; Escape closes it as "ביטול" does. */
function useAskFocus() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    el?.querySelector<HTMLElement>("input, button")?.focus({ preventScroll: true });
    bringIntoView(el);
  }, []);
  return root;
}
const escapeCloses = (onDone: (added: boolean) => void) => (e: KeyboardEvent) => {
  if (e.key !== "Escape" || e.defaultPrevented) return;
  e.preventDefault();
  e.stopPropagation();
  onDone(false);
};

/**
 * A ladder's new step: the new boundary alone, in the range's unit. The step it falls in splits in two at it, both halves keeping its
 * price (`addStep`); a boundary the range has already is refused. Asked between two steps (`within`), the boundary falls between the
 * first one's bottom and the second one's top, so one of the two splits.
 */
export function AskStep({ fee, t, within, onFee, onDone }: { fee: CasesFee; t: number; within?: { low: number; high: number | null }; onFee: (f: Fee) => void; onDone: (added: boolean) => void }) {
  const root = useAskFocus();
  const c = copy.cases;
  const b = fee.by[t]!;
  const [top, setTop] = useState<number | null>(null);
  if (!isRange(b)) return null;
  const sign = rangeSign(b.unit);
  const taken = (n: number) => b.tops.some((x) => x.v === n);
  const inside = (n: number) => !within || (n > within.low && (within.high === null || n < within.high));
  return (
    <div ref={root} data-ask-thing="" onKeyDown={escapeCloses(onDone)}>
      <AskValues
        question={c.addStep.ask.replace("{thing}", thingName(fee.kind, b))}
        field={<FigureField value={null} label={c.addStep.field} unit={sign} sign={sign} tight asks validate={(n) => (taken(n) ? c.addStep.taken : !inside(n) ? c.stepTopRange(fmt.number(within!.low), within!.high === null ? null : fmt.number(within!.high)) : null)} onCommit={setTop} onClear={() => setTop(null)} />}
        options={[]}
        chosen={[]}
        onToggle={() => undefined}
        note={c.addStep.note}
        ready={top !== null && top > 0 && !taken(top) && inside(top)}
        onAdd={() => {
          if (top === null) return;
          onFee(addStep(fee, t, top));
          onDone(true);
          focusOpened(fee.id);
        }}
        onCancel={() => onDone(false)}
      />
    </div>
  );
}

