// The toolbox for the case open in place (method §10.6, `toolbox`): on a computer the column "העמלה שבחרתם", the fee's name as its head and
// the parts to add to the open case in groups by kind, the one question a thing to change by asks before it is added, and at its end
// filling the fee from a price list and taking the fee away; on a phone the same in the short sheet pinned to the foot of the screen.
// A tap on a part adds it; a part that needs its figure, month or fee first asks for it in the open case (`onPending`).
import { useState, type ReactNode } from "react";
import { feeDeal as copy } from "../../copy";
import { byQuestion, copiesWords, type Toolbox as ToolboxView, type ToolPart as ToolPartView } from "../../lib/fee-deal/builder";
import { addBy, setFeeName, setPart, type NewBy } from "../../lib/fee-deal/edit";
import { BOUND_CURRENCIES, NAME_MAX, type BoundCurrency, type Fee, type OwnPlace } from "../../lib/fee-deal/model";
import { isRangeKind, ONE_SIDE, type ByKind, type RangeUnit } from "../../lib/fee-deal/shapes";
import { termKey } from "../../lib/fee-page-data";
import { IconBin, IconClose, IconPencil } from "../icons";
import { AskValues, Button, FigureField, HelpMark, InlineSelect, MenuPicker, Section, Swatch, Tag, TextField, ToolBlank, Toolbox, cx, type ToolGroup, type ToolKind } from "../kit";
import { useProvenanceData } from "../provenance";
import { type PendingPart } from "./open-case";
import { UndoLine } from "./undo-line";
import { caseText } from "./builder";
import { FeeName, feeColour, feeName } from "./words";

const p = copy.panel;

/** The kit's kind of each of the view's groups. */
const KIND: Record<string, ToolKind> = { price: "price", bound: "bound", by: "when", link: "link", more: "note" };

/** A part's card as it will read, its boxes drawn empty: "☐ % לכל פעולה", "מינימום ☐ ☐", "לזמן מוגבל, עד ☐". */
function partLabel(part: ToolPartView): { label: ReactNode; spoken: string } {
  const w = part.words;
  const lead = w.lead?.trim();
  const tail = w.tail?.trim();
  const sign = part.box === "pct" ? "%" : typeof part.box === "object" ? part.box.sign : "";
  // a minimum's and a maximum's sum come with the choice of its currency, drawn as a second, wider box
  const bound = part.id === "min" || part.id === "max";
  const box = part.used ? null : part.box === "month" ? (
    <ToolBlank wide />
  ) : part.box ? (
    <>
      {bound ? (
        <>
          <ToolBlank /> <ToolBlank wide />
        </>
      ) : (
        <>
          <ToolBlank /> {sign}
        </>
      )}
    </>
  ) : null;
  return {
    label: (
      <>
        {lead && <span>{lead}</span>}
        {box}
        {part.used && sign && !bound && <span>{sign}</span>}
        {tail && <span className="text-muted-foreground">{tail}</span>}
      </>
    ),
    spoken: [lead, sign, tail].filter(Boolean).join(" "),
  };
}

/** The view's groups as the kit's: each part's card and spoken name, and why a part that cannot be added cannot. */
function kitGroups(view: ToolboxView): ToolGroup[] {
  return view.groups.map((g) => {
    const why = g.parts.find((x) => x.off)?.off;
    return { id: g.group, kind: KIND[g.group]!, name: g.head, parts: g.parts.map((x) => ({ id: x.id, ...partLabel(x), used: x.used, off: !!x.off })), ...(why ? { offWhy: why } : {}) };
  });
}

/** The parts the toolbox adds only once they have their figure, month or fee: they ask for it in the open case. */
const PENDING: readonly string[] = ["min", "max", "cap", "until", "offset"];

/** A value of the person's own typed while a thing is added: its name, and for what is bought or held, where it is bought and its currency. */
interface Own {
  name: string;
  place: OwnPlace["place"];
  currency: BoundCurrency;
}

/**
 * The one question a thing to change by asks before it is added: for a list, its values to tick and one of the person's own
 * ("+ ערוץ אחר"); for a track or a condition, the values in the person's words (a condition with its name first); for a range, its first
 * top and its unit. What adding does to the cases is said under it.
 */
function AskThing({ fee, kind, onFee, onDone }: { fee: Fee; kind: ByKind; onFee: (f: Fee) => void; onDone: () => void }) {
  const q = byQuestion(fee, kind);
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
    onDone();
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
      onCancel={onDone}
    />
  );
}

/** The houses whose price list has a line for the fee, and what filling the fee from one does. */
export interface PanelFill {
  houses: readonly { id: string; name: string }[];
  onFill: (houseId: string) => void;
}

/** The page's undo line of the fee just filled from a price list, in the foot where the fill was chosen. */
export interface FillUndoLine {
  words: string;
  onUndo: () => void;
  onHold: (held: boolean) => void;
  /** Whether the line takes the focus as it appears (`UndoLine`). */
  take: () => boolean;
}

/**
 * The toolbox for the open case of `fee`: the column on a computer (`sheet` false), the pinned short sheet on a phone. `view` is the
 * toolbox's view (`toolbox`); `asking` the thing whose values are asked, where one is; `product` the deal's product, whose sense of the fee's
 * name "מה זה" opens; `fill` the price lists that can fill it; `line` the undo line of a fill just made; `folded`, whether the phone's sheet
 * is folded to its groups' names, which the page holds (`onFold`). `onPending` hands a part that needs its figure, month or fee to the open
 * case; `onClose` un-chooses the fee.
 */
export function ToolboxColumn({
  view,
  fee,
  caseId,
  sheet,
  asking,
  product,
  fill,
  line,
  folded,
  onFold,
  onAsk,
  onFee,
  onPending,
  onRemove,
  onClose,
}: {
  view: ToolboxView;
  fee: Fee;
  caseId: string | null;
  sheet: boolean;
  asking: ByKind | null;
  product: string | null;
  fill: PanelFill | null;
  line: FillUndoLine | null;
  folded: boolean;
  onFold: (folded: boolean) => void;
  onAsk: (kind: ByKind | null) => void;
  onFee: (f: Fee) => void;
  onPending: (part: PendingPart) => void;
  onRemove: (feeId: string) => void;
  onClose: () => void;
}) {
  const terms = useProvenanceData()?.terms;
  const onAdd = (_group: string, part: string) => {
    if (part.startsWith("by:")) return onAsk(part.slice(3) as ByKind);
    if (PENDING.includes(part)) return onPending(part as PendingPart);
    onFee(setPart(fee, part as Parameters<typeof setPart>[1], true, caseId ? { caseId } : {}));
  };
  const target = view.addTo.when ? caseText(view.addTo.when) : view.addTo.name;
  const ask = asking ? <AskThing key={`${fee.id}:${asking}`} fee={fee} kind={asking} onFee={onFee} onDone={() => onAsk(null)} /> : undefined;
  const foot = (
    <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
      {line ? (
        <UndoLine key="undo:fill" as="div" onUndo={line.onUndo} onHold={line.onHold} take={line.take} refocusOnUndo refocus={() => document.querySelector<HTMLElement>("[data-fill-picker] button")}>
          {line.words}
        </UndoLine>
      ) : (
        fill &&
        fill.houses.length > 0 && (
          <span data-fill-picker="" className="contents">
            <MenuPicker name={p.fill} items={fill.houses.map((h) => ({ id: h.id, label: h.name }))} value={null} placeholder={p.fill} onSelect={fill.onFill} />
          </span>
        )
      )}
      <Button variant="ghost" onClick={() => onRemove(fee.id)}>
        <IconBin size={18} />
        {p.remove}
      </Button>
    </div>
  );
  const box = <Toolbox key={fee.id} target={target} groups={kitGroups(view)} onAdd={onAdd} ask={ask} foot={foot} sheet={sheet} docked={sheet} {...(sheet ? { folded, onFold } : {})} />;
  if (sheet) return box;
  // the site's own explanation of the fee: its glossary card by the fee's name, in the deal's product's sense where the glossary gives
  // that product one of its own
  const term = fee.kind === "own" ? null : feeName(fee.kind);
  const owned = term && product ? termKey(term, product) : null;
  const explained = owned && terms?.[owned] ? owned : term && terms?.[term] ? term : null;
  const side = ONE_SIDE[fee.kind];
  return (
    <Section
      title={p.title}
      level="kick"
      heading="h2"
      gap="tight"
      action={
        <Button variant="icon" size="sm" aria-label={p.close} title={p.close} onClick={onClose} className="-my-2">
          <IconClose size={18} />
        </Button>
      }
    >
      {/* clear of the head's close button by the 6 px its tap area reaches under its face, so the two areas never meet */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1.5">
        {fee.kind === "own" ? (
          // a fee of the person's own: its heading is its name, typed in place (an empty name reads as the page names such a fee)
          <>
            <h3 className="sr-only">{feeName(fee.kind, fee.name)}</h3>
            <span className="flex min-w-0 flex-[1_1_14rem] items-center gap-2">
              <Swatch shape="box" className={cx("shrink-0", feeColour(fee.kind).bg)} />
              <TextField inline grow labelHidden label={p.ownName} value={fee.name ?? ""} placeholder={feeName("own")} maxLength={NAME_MAX} icon={<IconPencil size={16} />} onChange={(v) => onFee(setFeeName(fee, v))} />
            </span>
          </>
        ) : (
          <h3 className="text-lg font-semibold">
            <FeeName fee={{ fee: fee.id, kind: fee.kind }} />
          </h3>
        )}
        {side && <Tag tone="outline">{p.oneSide[side]}</Tag>}
        {explained && term && <HelpMark term={explained} about={term} words={p.whatIs} className="ms-auto" />}
      </div>
      {box}
    </Section>
  );
}
