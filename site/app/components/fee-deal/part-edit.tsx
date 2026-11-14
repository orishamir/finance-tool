// One part of a price in the case open in place (method §10.6): its body, a small component looked up by the part's id (`BODIES`), around
// the boxes of its figures (`PriceFigure`); and a part the toolbox added that still asks for what it needs (a figure, a month, a fee),
// asking for it by what it asks (`PendingEdit`, the part registry's `ask`).
import { useEffect, type ComponentType, type ReactNode } from "react";
import { dealCases, feeDeal as copy } from "../../copy";
import type { OpenPart, PartField } from "../../lib/fee-deal/builder";
import { setUntil, withDiscountOnMin, withMonths, withOffset, withThirdForm, withThirdWho, type Side } from "../../lib/fee-deal/edit";
import { MONTHS, pricesOn, untilRange, type Fee, type FeeDeal, type MonthKey, type Months, type Price, type Stage, type ThirdPrice } from "../../lib/fee-deal/model";
import { charged, hasCurrency, onAction, ON_ACTION_FORMS } from "../../lib/fee-deal/offers/capabilities";
import { PARTS, setPart, type PartId } from "../../lib/fee-deal/offers/parts";
import { FEE_KIND_IDS, type FeeKindId } from "../../lib/fee-deal/shapes";
import { FigureField, InlineSelect, MonthField, PartEdit, Switch, TextField, type PartMark } from "../kit";
import { partFieldId, signText } from "./figures";
import { bringIntoView } from "./in-view";
import { feeName, perActionWord } from "./words";

const cp = copy.cases.parts;

/** The icon before a part's first word: a minimum's, a maximum's (a percent maximum's too), a link's. */
export const PART_MARK: Partial<Record<PartId, PartMark>> = { min: "min", max: "max", cap: "max", maxPerSecurity: "max", offset: "link", refund: "link" };

/** A part the toolbox added that cannot stand until it has what it asks for (`PARTS[id].ask`): a figure, a month or a fee. */
export type PendingPart = "min" | "max" | "cap" | "maxPerSecurity" | "until" | "offset";

/** Where a pending part stands: its fee, its case (null for a slim fee), and the part. */
export interface Pending {
  fee: string;
  case: string | null;
  part: PendingPart;
}

/** A word of a part trimmed of the spaces it carries to stand in a sentence. */
export const bare = (s: string | undefined) => s?.trim();

/** Words said fainter beside a part's boxes. */
const quiet = (t: ReactNode) => (t ? <span className="text-muted-foreground">{t}</span> : null);

const monthOptions = (words: Record<number, string>) => MONTHS.map((m) => ({ id: String(m), name: words[m]! }));

/** Each figure's name in its box's spoken name. */
export const SPOKEN: Readonly<Record<PartField["figure"], string>> = {
  rate: copy.panel.howMuch,
  amount: copy.panel.howMuch,
  min: copy.panel.min,
  max: copy.panel.max,
  cap: copy.panel.cap,
  flat: copy.panel.parts.flat,
  upTo: copy.panel.parts.upTo,
  discount: copy.panel.parts.discount,
  third: copy.panel.parts.third,
  thirdMin: copy.panel.parts.thirdMin,
  thirdMax: copy.panel.parts.thirdMax,
  refund: copy.panel.parts.refund,
  perSecurity: copy.panel.parts.perSecurity,
};

/**
 * Where a part's body stands, and what it can do there: the fee, its case and the price (price `k` on `side`, ending at `until`, among
 * `stages`), the deal (an offset names its fees), a field's spoken name (`label`), an edit of the price (`edit`) or of the fee (`onFee`),
 * a figure's box (`box`), and the price's currency chooser with the part it stands beside (`chooserOn`).
 */
export interface PartPlace {
  fee: Fee;
  caseId?: string;
  side: Side;
  k: number;
  until?: MonthKey;
  stages: readonly Stage[];
  price: Price;
  deal: FeeDeal;
  label: (field: string) => string;
  edit: (fn: (p: Price) => Price) => void;
  onFee: (f: Fee) => void;
  box: (part: PartId, f: PartField, opts?: { optional?: boolean }) => ReactNode;
  chooser: ReactNode;
  chooserOn: PartId | null;
}

interface BodyProps {
  part: OpenPart;
  at: PartPlace;
}

/** A price's figure, a share's or a sum's, with the currency chooser where it stands beside it, and the words after it. */
const MainBody = ({ part, at }: BodyProps) => (
  <>
    {at.box(part.id, part.fields[0]!)}
    {at.chooserOn === part.id && at.chooser}
    {quiet(bare(part.words.tail))}
  </>
);

/** A share of what is held: its rate, the months it is for, and how often it is charged. */
function HeldBody({ part, at }: BodyProps) {
  const price = at.price;
  if (price.form !== "held") return null;
  return (
    <>
      {at.box(part.id, part.fields[0]!)}
      <InlineSelect chip label={at.label(copy.panel.per)} options={monthOptions(copy.panel.perOptions)} value={String(price.per)} onChange={(v) => v && at.edit((x) => withMonths(x, "per", Number(v) as Months))} />
      <InlineSelect label={copy.panel.every} options={monthOptions(copy.panel.everyOptions)} value={String(price.every)} onChange={(v) => v && at.edit((x) => withMonths(x, "every", Number(v) as Months))} />
    </>
  );
}

/** A sum per period: its sum and its period. */
function SumBody({ part, at }: BodyProps) {
  const price = at.price;
  if (price.form !== "sum") return null;
  return (
    <>
      {at.box(part.id, part.fields[0]!)}
      <InlineSelect chip label={at.label(copy.panel.sumEvery)} options={monthOptions(copy.panel.sumEveryOptions)} value={String(price.every)} onChange={(v) => v && at.edit((x) => withMonths(x, "every", Number(v) as Months))} />
    </>
  );
}

/** A discount: its share, and whether it is off the minimum too (F-116). */
function DiscountBody({ part, at }: BodyProps) {
  const price = at.price;
  return (
    <>
      {at.box(part.id, part.fields[0]!)}
      {quiet(bare(cp.discount.tail))}
      {onAction(price) && price.discount && <Switch label={cp.discountOnMin} checked={!!price.discount.alsoMin} onChange={(on) => at.edit((x) => withDiscountOnMin(x, on))} />}
    </>
  );
}

/** A third party's fee (F-117): whose it is, its figure's form or none, and its figures. */
function ThirdBody({ part, at }: BodyProps) {
  const price = at.price;
  if (!onAction(price) || !price.third) return null;
  return (
    <>
      <TextField inline labelHidden label={at.label(cp.thirdWho)} placeholder={cp.thirdWho} value={price.third.who ?? ""} onChange={(v) => at.edit((x) => withThirdWho(x, v))} />
      <InlineSelect
        chip
        label={at.label(cp.thirdForm)}
        options={[{ id: "none", name: cp.thirdNone }, ...ON_ACTION_FORMS.map((f) => ({ id: f, name: copy.panel.forms[f]! }))]}
        value={price.third.price?.form ?? "none"}
        onChange={(v) => v && at.edit((x) => withThirdForm(x, v === "none" ? null : (v as ThirdPrice["form"])))}
      />
      {part.fields.map((f) => (
        <span key={f.figure} className="inline-flex items-center gap-2">
          {f.figure !== "third" && quiet(f.figure === "thirdMin" ? copy.panel.min : copy.panel.max)}
          {at.box(part.id, f, { optional: f.figure !== "third" })}
        </span>
      ))}
    </>
  );
}

/** A price for a limited time: the month it ends. */
const UntilBody = ({ at }: BodyProps) => <MonthField value={at.until ?? null} label={at.label(copy.panel.until)} tight {...untilRange(at.stages, at.k)} onCommit={(m) => at.onFee(setUntil(at.fee, at.side, at.k, m, at.caseId))} />;

/** A minimum or a maximum: its sum, which may be emptied, with the currency chooser where it stands beside it. */
const BoundBody = ({ part, at }: BodyProps) => (
  <>
    {at.box(part.id, part.fields[0]!, { optional: true })}
    {at.chooserOn === part.id && at.chooser}
    {quiet(bare(part.words.tail))}
  </>
);

/** A percent maximum: its percent, which may be emptied. */
const CapBody = ({ part, at }: BodyProps) => (
  <>
    {at.box(part.id, part.fields[0]!, { optional: true })}
    {quiet(bare(part.words.tail))}
  </>
);

/** A flat price for a small action: its price, and the sum it holds up to. */
const FlatBody = ({ part, at }: BodyProps) => (
  <>
    {at.box(part.id, part.fields[0]!)}
    {quiet(bare(perActionWord(at.fee.kind)))}
    {quiet(copy.panel.upTo[at.fee.kind] ?? copy.panel.upTo.default)}
    {at.box(part.id, part.fields[1]!)}
  </>
);

/** An offset: the fee it is offset against, said around its choice. */
function OffsetBody({ at }: BodyProps) {
  const price = at.price;
  if (!charged(price) || !price.offset) return null;
  return (
    <>
      <OffsetChoice deal={at.deal} fee={at.fee} value={price.offset.kind} label={at.label(cp.offset)} onChange={(kind) => at.edit((x) => withOffset(x, kind))} />
      {quiet(bare(cp.offsetOf.tail))}
    </>
  );
}

/** A refund: its sum. */
const RefundBody = ({ part, at }: BodyProps) => <>{at.box(part.id, part.fields[0]!)}</>;

/** A part said in words alone (a note, a sale priced apart, free), with what it says fainter. */
const QuietBody = ({ part }: BodyProps) => <>{part.words.quiet ? quiet(bare(part.words.quiet)) : null}</>;

/** Each part's body, and the words it leads with where they are not its words' own (an offset's: its choice of fee is said around it). */
const BODIES: Readonly<Record<PartId, { Body: ComponentType<BodyProps>; lead?: string }>> = {
  share: { Body: MainBody },
  perUnit: { Body: MainBody },
  perAction: { Body: MainBody },
  held: { Body: HeldBody },
  sum: { Body: SumBody },
  free: { Body: QuietBody },
  discount: { Body: DiscountBody },
  third: { Body: ThirdBody },
  until: { Body: UntilBody },
  min: { Body: BoundBody },
  max: { Body: BoundBody },
  cap: { Body: CapBody },
  flat: { Body: FlatBody },
  maxPerSecurity: { Body: CapBody },
  offset: { Body: OffsetBody, lead: cp.offsetOf.lead },
  refund: { Body: RefundBody },
  unfilled: { Body: QuietBody },
  unfilledClerk: { Body: QuietBody },
  unfilledClerkAbroad: { Body: QuietBody },
  partial: { Body: QuietBody },
  inTrade: { Body: QuietBody },
  sale: { Body: QuietBody },
};

/** One part of the open case's price in edit: its icon and lead, its body, and its ✕ (`onRemove`; none for a free price). */
export function PartLine({ part, at, onRemove }: { part: OpenPart; at: PartPlace; onRemove: (() => void) | undefined }) {
  const { Body, lead } = BODIES[part.id];
  return (
    <PartEdit kind={part.kind} mark={PART_MARK[part.id]} lead={bare(lead ?? part.words.lead)} onRemove={onRemove} removeLabel={at.label(dealCases.removePart)}>
      <Body part={part} at={at} />
    </PartEdit>
  );
}

/** The fee an offset is against: the deal's other fees, else every fee the site names (the reading states it, as method §10.6 says under "What the page states and does not compute"; it reads no figure of it). */
function OffsetChoice({ deal, fee, value, label, onChange }: { deal: FeeDeal; fee: Fee; value: FeeKindId | null; label: string; onChange: (kind: FeeKindId) => void }) {
  const others = [...new Set(deal.fees.filter((f) => f.id !== fee.id).map((f) => f.kind))];
  const kinds = others.length ? others : FEE_KIND_IDS.filter((k) => k !== "own");
  return <InlineSelect chip label={label} all={value === null ? copy.cases.parts.offsetPick : undefined} options={kinds.map((k) => ({ id: k, name: feeName(k) }))} value={value} onChange={(v) => v && onChange(v as FeeKindId)} />;
}

/**
 * A part the toolbox added that asks, where it will stand, for what it needs (`PARTS[part].ask`): a later price its month, an offset its
 * fee, a bound or a percent maximum its figure, whose box takes the focus as it appears.
 */
export function PendingEdit({ fee, caseId, side, k, part, deal, name, onFee, onDone }: { fee: Fee; caseId?: string; side: Side; k: number; part: PendingPart; deal: FeeDeal; name: string; onFee: (f: Fee) => void; onDone: () => void }) {
  const at = { side, k, ...(caseId ? { caseId } : {}) };
  const label = (field: string) => copy.builder.fieldName(name, field);
  const price = pricesOn(fee, side, caseId)[k]!.price;
  const ask = PARTS[part].ask;
  const figure = ask === "sum" || ask === "pct";
  // the part asks where it stands: its box takes the focus as it appears (a month's box takes it itself), above a phone's pinned sheet
  useEffect(() => {
    if (!figure) return;
    const box = document.getElementById(partFieldId(fee.id, `${part}-pending`));
    box?.focus({ preventScroll: true });
    bringIntoView(box?.closest("[data-lift]"));
  }, [fee.id, part, figure]);
  const cur = hasCurrency(price) ? (price.currency ?? "ILS") : "ILS";
  // the bound's box is drawn anew as the bound it now is: the focus goes on to it, where the typing goes on
  const done = (next: Fee, box?: string) => {
    onFee(next);
    onDone();
    if (box)
      requestAnimationFrame(() => {
        const el = document.getElementById(partFieldId(fee.id, box)) as HTMLInputElement | null;
        el?.focus();
        el?.setSelectionRange(el.value.length, el.value.length);
      });
  };
  let body: ReactNode;
  let lead: string | undefined;
  if (ask === "month") {
    lead = bare(cp.until);
    body = <MonthField value={null} label={label(copy.panel.until)} tight waits autoFocus {...untilRange(pricesOn(fee, side, caseId), k)} onCommit={(m) => done(setPart(fee, part, true, { ...at, month: m }))} />;
  } else if (ask === "fee") {
    lead = bare(cp.offsetOf.lead);
    body = (
      <>
        <OffsetChoice deal={deal} fee={fee} value={null} label={label(cp.offset)} onChange={(kind) => done(setPart(fee, part, true, { ...at, against: kind }))} />
        <span className="text-muted-foreground">{bare(cp.offsetOf.tail)}</span>
      </>
    );
  } else {
    lead = part === "min" ? bare(cp.min) : bare(cp.max);
    const pct = ask === "pct";
    const period = price.form === "held" ? (price.boundsEvery ? copy.price.per[price.boundsEvery]! : copy.panel.perCharge) : (cp.boundPer[fee.kind] ?? cp.boundPer.default);
    // a maximum on each security says so before its period
    const tail = pct ? (copy.price.of[fee.kind] ?? copy.price.of.default) : part === "maxPerSecurity" ? `${bare(cp.perSecurity.each)} ${period}` : period;
    body = (
      <FigureField
        value={null}
        label={label(pct ? copy.panel.cap : part === "min" ? copy.panel.min : part === "maxPerSecurity" ? copy.panel.parts.perSecurity : copy.panel.max)}
        unit={pct ? "%" : signText(copy.panel.signs[price.form === "held" ? "ILS" : cur] ?? "₪")}
        sign={pct ? "%" : (copy.panel.signs[cur] ?? "₪")}
        tight
        id={partFieldId(fee.id, `${part}-pending`)}
        words={<span className="text-muted-foreground">{tail}</span>}
        onCommit={(n) => done(setPart(fee, part, true, { ...at, value: n }), `${side}${k}-${part}-${PARTS[part].figures[0]}`)}
      />
    );
  }
  return (
    <PartEdit kind={PARTS[part].kind} mark={PART_MARK[part]} lead={lead} onRemove={onDone} removeLabel={label(dealCases.removePart)}>
      {body}
    </PartEdit>
  );
}
