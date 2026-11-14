// The one question a thing to change by asks before it is added to a fee (method §10.6, F-114; `byQuestion`), in place: in the fee's block
// in the fees' column, where the thing's band will stand, not in the toolbox, which only lists the parts.
import { useEffect, useRef, useState } from "react";
import { feeDeal as copy } from "../../copy";
import { byQuestion, copiesWords } from "../../lib/fee-deal/builder";
import { addBy, type NewBy } from "../../lib/fee-deal/edit";
import { BOUND_CURRENCIES, NAME_MAX, type BoundCurrency, type Fee, type OwnPlace } from "../../lib/fee-deal/model";
import { isRangeKind, type ByKind, type RangeUnit } from "../../lib/fee-deal/shapes";
import { AskValues, Button, FigureField, InlineSelect, TextField } from "../kit";
import { bringIntoView } from "./in-view";

const p = copy.panel;

/** A value of the person's own typed while a thing is added: its name, and for what is bought or held, where it is bought and its currency. */
interface Own {
  name: string;
  place: OwnPlace["place"];
  currency: BoundCurrency;
}

/**
 * The one question a thing to change by asks before it is added: for a list, its values to tick and one of the person's own
 * ("+ ערוץ אחר"); for a track or a condition, the values in the person's words (a condition with its name first); for a range, its first
 * top and its unit. What adding does to the cases is said under it. It stands in place, in the fee's block where the thing's band will
 * stand: the focus goes into it as it opens, and Escape closes it as "ביטול" does.
 */
export function AskThing({ fee, kind, onFee, onDone }: { fee: Fee; kind: ByKind; onFee: (f: Fee) => void; /** The question closed: with the thing added, or not. */ onDone: (added: boolean) => void }) {
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
  const [typing, setTyping] = useState<Own | null>(kind === "track" || kind === "own" ? { name: "", place: "abroad", currency: "USD" } : null);
  const [label, setLabel] = useState("");
  const [top, setTop] = useState<number | null>(null);
  const [unit, setUnit] = useState<RangeUnit | null>(q.units?.[0]?.unit ?? null);
  const toggle = (id: string) => setChosen((x) => (x.includes(id) ? x.filter((v) => v !== id) : [...x, id]));
  const place = kind === "what" || kind === "held";
  const typed = () => {
    const name = typing?.name.trim();
    if (!typing || !name) return;
    if (!extra.includes(name) && !q.values?.some((v) => v.id === name)) setExtra((x) => [...x, name]);
    if (place) setOwn((x) => [...x.filter((o) => o.name !== name), { name, place: typing.place, currency: typing.currency }]);
    setChosen((x) => (x.includes(name) ? x : [...x, name]));
    setTyping(kind === "track" || kind === "own" ? { ...typing, name: "" } : null);
  };
  const range = isRangeKind(kind);
  const copies = copiesWords(fee, kind, chosen.length);
  const note = (
    <>
      {copies.line}
      {/* how many cases there will be, once a value is ticked (a range's two steps are known at once) */}
      {copies.count && (range || chosen.length > 0) && <> {copies.count.replace("{from}", String(copies.from)).replace("{to}", String(copies.to))}</>}
    </>
  );
  const add = () => {
    let n: NewBy;
    if (range) {
      if (top === null || !unit) return;
      n = { kind, unit, top };
    } else if (kind === "own") n = { kind, label, values: chosen };
    else if (place) n = { kind, values: chosen, ...(own.length ? { own: own.filter((o) => chosen.includes(o.name)) } : {}) };
    else n = { kind: kind as "channel" | "currency" | "track", values: chosen };
    onFee(addBy(fee, n));
    onDone(true);
  };
  const ownForm = typing && (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <TextField label={kind === "track" ? c.slot.trackName : c.slot.ownName} value={typing.name} maxLength={NAME_MAX} onChange={(name) => setTyping({ ...typing, name })} />
        <Button variant="outline" disabled={!typing.name.trim()} onClick={typed}>
          {c.addValue}
        </Button>
      </div>
      {place && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <InlineSelect label={c.slot.ownPlace} options={(["israel", "abroad"] as const).map((x) => ({ id: x, name: c.slot[x] }))} value={typing.place} onChange={(v) => v && setTyping({ ...typing, place: v as OwnPlace["place"] })} />
          <InlineSelect label={c.slot.ownCurrency} options={BOUND_CURRENCIES.map((x) => ({ id: x, name: p.currencies[x]! }))} value={typing.currency} onChange={(v) => v && setTyping({ ...typing, currency: v as BoundCurrency })} />
        </div>
      )}
    </div>
  );
  const field = range ? (
    <FigureField
      value={null}
      label={q.ask}
      unit={q.units && q.units.length > 1 ? <InlineSelect chip label={c.slot.unit} options={q.units.map((u) => ({ id: u.unit, name: u.words }))} value={unit} onChange={(v) => v && setUnit(v as RangeUnit)} /> : (q.units?.[0]?.words ?? "")}
      sign={q.units?.find((u) => u.unit === unit)?.words ?? ""}
      tight
      words={<span className="text-muted-foreground">{c.upTo.trim()}</span>}
      onCommit={setTop}
      onClear={() => setTop(null)}
    />
  ) : kind === "own" ? (
    <TextField label={c.ownLabel} value={label} maxLength={NAME_MAX} onChange={setLabel} />
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
      {...(q.other ? { other: { label: q.other, open: !!typing, onClick: () => setTyping(typing ? null : { name: "", place: "abroad", currency: "USD" }) } } : {})}
      otherField={ownForm}
      note={note}
      {...(range ? { ready: top !== null && top > 0 && !!unit } : kind === "own" ? { ready: label.trim() !== "" && chosen.length > 0 } : {})}
      onAdd={add}
      onCancel={() => onDone(false)}
    />
    </div>
  );
}

