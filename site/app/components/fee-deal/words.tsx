// The fee page's shared words and marks: a fee's name and its one colour, a price written out around its figures, and a price's standing
// against its cap (F-113) as a tag and as a sentence. Every column of the page writes these through here, so a fee reads the same in each.
import type { ReactNode } from "react";
import type { DealSide } from "@finance-tool/engine";
import { feeDeal as copy, guideBlocks } from "../../copy";
import type { BanSaid, CapLine } from "../../lib/fee-deal/kinds";
import type { MonthKey } from "../../lib/fee-deal/model";
import { unreadReason, type FeeRef, type MarkView, type PriceView, type StandingView } from "../../lib/fee-deal/deal-read";
import type { LawRow } from "../../lib/fee-deal/reading";
import type { FeeKindId } from "../../lib/fee-deal/shapes";
import { computedSum, fmt, formatValue, typedSum, wholeSum } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { Swatch, Tag, When, cx } from "../kit";
import { Num, RulesChip } from "../provenance";

/** A fee's name: the person's own for a fee of their own, the guide's for a base the records list, else the page's. */
export function feeName(kind: FeeKindId, own?: string): string {
  if (kind === "own" && own) return own;
  const base = guideBlocks.fees[kind] as { name?: string } | undefined;
  return base?.name ?? copy.names[kind] ?? kind;
}

/** A sum as plain words, isolated left to right inside Hebrew, as its unit writes it (a whole sum without cents, "100 $"). */
export const sumText = (v: SiteValue): string => `\u2066${formatValue(v.value as number, v.unit)}\u2069`;

/**
 * A fee's name, with its stretch of sizes where it is one step of a fee read across sizes (F-115): "המרת מטבע, עד 100 ₪", "המרת מטבע, מעל
 * 100 ₪", so two steps of one fee never read alike.
 */
export const refName = (r: FeeRef): string => {
  const name = feeName(r.kind, r.name);
  const s = r.step;
  if (!s) return name;
  return `${name}${s.from ? `${copy.cases.step.from}${sumText(s.from)}` : ""}${s.to ? `${copy.cases.step.to}${sumText(s.to)}` : ""}`;
};

/** What a price charged on each action is per ("לכל פעולה"), by the fee's kind. */
export const perActionWord = (kind: FeeKindId): string => copy.price.perAction[kind] ?? copy.price.perAction.default!;

/**
 * Each fee's one colour on the whole page (theme.css, the `--fee-*` roles): a `bg-*` for its swatch, a `fill-*` and a `stroke-*` for its
 * band on a curve. Written out whole, so the stylesheet keeps every class.
 */
const COLOUR: Record<FeeKindId, { bg: string; fill: string; stroke: string }> = {
  trade: { bg: "bg-fee-trade", fill: "fill-fee-trade", stroke: "stroke-fee-trade" },
  spread: { bg: "bg-fee-spread", fill: "fill-fee-spread", stroke: "stroke-fee-spread" },
  creation_redemption: { bg: "bg-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  load: { bg: "bg-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  redemption_deduction: { bg: "bg-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  fx: { bg: "bg-fee-fx", fill: "fill-fee-fx", stroke: "stroke-fee-fx" },
  fx_spread: { bg: "bg-fee-spread", fill: "fill-fee-spread", stroke: "stroke-fee-spread" },
  deposit: { bg: "bg-fee-deposit", fill: "fill-fee-deposit", stroke: "stroke-fee-deposit" },
  distribution_handling: { bg: "bg-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  corporate_event: { bg: "bg-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  transfer_out: { bg: "bg-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  exit: { bg: "bg-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  balance: { bg: "bg-fee-balance", fill: "fill-fee-balance", stroke: "stroke-fee-balance" },
  custody: { bg: "bg-fee-custody", fill: "fill-fee-custody", stroke: "stroke-fee-custody" },
  variable_management: { bg: "bg-fee-manager", fill: "fill-fee-manager", stroke: "stroke-fee-manager" },
  trustee: { bg: "bg-fee-manager", fill: "fill-fee-manager", stroke: "stroke-fee-manager" },
  direct_expenses: { bg: "bg-fee-direct", fill: "fill-fee-direct", stroke: "stroke-fee-direct" },
  fund_management: { bg: "bg-fee-fund", fill: "fill-fee-fund", stroke: "stroke-fee-fund" },
  fixed_period: { bg: "bg-fee-fixed", fill: "fill-fee-fixed", stroke: "stroke-fee-fixed" },
  current_account: { bg: "bg-fee-account", fill: "fill-fee-account", stroke: "stroke-fee-account" },
  insurance_premium: { bg: "bg-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  own: { bg: "bg-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
};

export const feeColour = (kind: FeeKindId) => COLOUR[kind];

/** A fee's swatch and name, the swatch never alone; `before` and `after`: words held to the name, after the swatch ("מתחילים ", ": "). */
export function FeeName({ fee, className, before, after }: { fee: FeeRef; className?: string; before?: string; after?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2 min-w-0", className)}>
      <Swatch shape="box" className={cx("shrink-0", COLOUR[fee.kind].bg)} />
      <span className="min-w-0">
        {before}
        {refName(fee)}
        {after}
      </span>
    </span>
  );
}

/**
 * How the page shows a sum: one the person typed as they typed it (`typedSum`), one the site works out in whole units of its currency
 * (`computedSum`); any other figure as its unit's rules say (a price list's sum whole where it is whole, "8 $", `fmt.usd`).
 */
export const sumDisplay = (v: SiteValue): ((n: number) => string | undefined) | undefined =>
  v.state === "entered" ? (n) => typedSum(n, v.unit) : v.state === "computed" ? (n) => computedSum(n, v.unit) : undefined;

/** A figure on the page: a sum as `sumDisplay` shows it. */
export const Fig = ({ value, prefix }: { value: SiteValue; prefix?: string }) => <Num value={value} prefix={prefix} display={sumDisplay(value)} />;

/** How the page shows the sum a flat price holds up to: whole, as the price list prints it ("50 $"), else as any sum (`sumDisplay`). */
export const upToDisplay = (v: SiteValue) => (n: number): string | undefined => wholeSum(v.unit)(n) ?? sumDisplay(v)?.(n);

/** A figure with a lead held to it on one line (", מינימום 15 ₪"), and the period it is printed per where it has one (", מינימום 40 ₪ בחודש"). */
const Bound = ({ lead, value, per }: { lead: string; value: SiteValue; per?: string }) => (
  <>
    , <Fig value={value} prefix={lead} />
    {per && <> {per}</>}
  </>
);

/**
 * A price in words around its figures: "0.25% מהפעולה, מינימום 15 ₪, מקסימום 25% מהפעולה", "0.005 $ לכל יחידה", "0.4% בשנה ממה
 * שמוחזק", "10 ₪ בחודש", "חינם". A flat price for a small action comes first: "2.85 $ לכל המרה עד 50 $. מעל זה 0.133% מההמרה, …". A
 * share of nothing whose minimum and maximum are one sum is that sum on each action ("11 $ לכל פעולה"), as the price lists print it.
 * `saved`: the product saves (its fees are charged from what has built up), so a share of what is held reads "ממה שנצבר". A fee charged
 * inside a fund says so in place of what it is a share of.
 */
export function PriceWords({ price, kind, saved, insideFund }: { price: PriceView; kind: FeeKindId; saved?: boolean; insideFund?: boolean }) {
  const p = copy.price;
  const f = price.figures;
  const of = p.of[kind] ?? p.of.default;
  let body: ReactNode;
  switch (price.form) {
    case "free":
      // a free price a template filled opens its record's source, as a sourced figure does
      body = price.free ? <Fig value={price.free} /> : p.free;
      break;
    case "action":
    case "perUnit": {
      const fixed = price.form === "action" && f.rate?.value === 0 && f.min && f.max && f.min.value === f.max.value;
      body = (
        <>
          {f.flat && f.upTo && (
            <>
              <Fig value={f.flat} /> {perActionWord(kind)}
              {p.flat.upTo}
              <Num value={f.upTo} display={upToDisplay(f.upTo)} />
              {p.flat.above}
            </>
          )}
          {fixed ? (
            <>
              <Fig value={f.min!} /> {perActionWord(kind)}
            </>
          ) : (
            <>
              {price.form === "action" ? (
                <>
                  <Num value={f.rate!} /> {of}
                </>
              ) : (
                <>
                  <Num value={f.amount!} /> {p.perUnit}
                </>
              )}
              {f.min && <Bound lead={p.min} value={f.min} />}
              {f.max && <Bound lead={p.max} value={f.max} />}
            </>
          )}
          {/* the percent maximum and what it is a share of are one bound's phrase, never broken inside ("מקסימום 2% מהפעולה") */}
          {f.cap && (
            <>
              ,{" "}
              <span className="whitespace-nowrap">
                <Fig value={f.cap} prefix={p.max} /> {of}
              </span>
            </>
          )}
        </>
      );
      break;
    }
    case "held":
      body = (
        <>
          <Num value={f.rate!} /> {p.per[price.per!]} {insideFund ? p.insideFund : saved ? p.heldSaved : p.held}
          {price.every !== price.per && <>, {p.charged[price.every!]}</>}
          {f.min && <Bound lead={p.min} value={f.min} {...(price.boundsEvery ? { per: p.per[price.boundsEvery] } : {})} />}
          {f.max && <Bound lead={p.max} value={f.max} {...(price.boundsEvery ? { per: p.per[price.boundsEvery] } : {})} />}
        </>
      );
      break;
    case "sum":
      body = (
        <>
          <Fig value={f.amount!} /> {p.per[price.every!]}
        </>
      );
      break;
    case "perAction":
      body = (
        <>
          <Fig value={f.amount!} /> {perActionWord(kind)}
          {/* a percent maximum over the sum, said as a share's is ("11 $ לכל פעולה, מקסימום 2% מהפעולה") */}
          {f.cap && (
            <>
              ,{" "}
              <span className="whitespace-nowrap">
                <Fig value={f.cap} prefix={p.max} /> {of}
              </span>
            </>
          )}
        </>
      );
      break;
  }
  return <span>{body}</span>;
}

/** The tag of a price's standing against its cap; none where nothing is judged. Never colour alone: the tag is its words. */
export function StandingTag({ standing }: { standing: StandingView }) {
  const s = standing.standing;
  if (!s.judged) return null;
  const tone = s.standing === "above" ? "blocked" : s.standing === "at" ? "neutral" : "outline";
  return (
    <Tag tone={tone} shape="pill">
      {copy.standing.tag[s.standing]}
    </Tag>
  );
}

/**
 * What one price's standing says, after the price: below the cap, its share ("שהם 57% מהתקרה"); at it, that it is the most that may be
 * charged; above it, that the law allows less and the typed price stays; not judged, why. `binds` says whom a cap binds where it binds
 * some providers only. A cap with a caveat says nothing per price: the cap's line says it once, in the caveat's words (`CapCaveat`).
 */
export function StandingWords({ standing, binds }: { standing: StandingView; binds?: string }) {
  const s = standing.standing;
  const w = copy.standing;
  if (s.judged) {
    if (s.standing === "below" && standing.share)
      return (
        <>
          {w.share.before}
          <Num value={standing.share} display={fmt.share} />
          {w.share.after}
        </>
      );
    if (s.standing === "at") return <>. {w.at}</>;
    if (s.standing === "above") return <>. {standing.share ? w.above : w.banned}</>;
    return <>.</>;
  }
  if (s.why === "binds") return <>. {binds ? w.binds[binds] : ""}{w.bindsUnjudged}</>;
  if (s.why === "other-form") return <>. {w.otherForm}</>;
  if (s.why === "not-sourced") return <>. {w.notSourced}</>;
  return <>.</>;
}

/** What a cap that holds only in a case the deal does not state says, after the cap's figure or "לא נמצאה תקרה בחוק" (F-113); none without one. */
export function CapCaveat({ caveat }: { caveat?: string | undefined }) {
  const words = caveat ? copy.standing.caveat[caveat] : undefined;
  return words ? <>. {words}</> : null;
}

/**
 * That a bank may not charge a fee here, read as nothing charged (the rule table's `ban`), with the rules that ban it: as the rules' words,
 * or as the site's reading of them (`reading`); that a new bank is outside those rules for its first five years (BANK-51, among each ban's rules); and, where the
 * rules leave one, the distribution fee a bank may still charge on the units (MF-71). What a fee's card, its line in the glance and the law
 * card say in place of "no price".
 */
export function BannedWords({ ban, fee }: { ban: BanSaid; fee?: string }) {
  const w = copy.cases.ban;
  return (
    <>
      {ban.reading ? w.reading : w.law} {w.newBank}
      {ban.distribution && <> {w.distribution}</>} <RulesChip ids={ban.rules} {...(fee ? { name: copy.standing.bannedRules(fee) } : {})} />
    </>
  );
}

/** Why a fee is not read (`unreadReason`), as its card and its line in the glance say it. `fee`: its name, for the ban's rules chip. */
export function UnreadWords({ banned, noCurrency, unmatched, fee }: { banned?: BanSaid | undefined; noCurrency?: boolean; unmatched?: boolean; fee?: string }) {
  const why = unreadReason({ banned, noCurrency, unmatched });
  if (why === "banned") return <BannedWords ban={banned!} {...(fee ? { fee } : {})} />;
  return <>{why === "noCurrency" ? copy.cases.noCurrency : why === "unmatched" ? copy.cases.unmatched : copy.builder.facts.noPrice}</>;
}

/**
 * The cap's line: its figure with its caveat, that the law sets none (F-113), or that it bans the fee here; nothing where the kind has no
 * line for the fee. The figure, or the words "לא נמצאה תקרה בחוק", is the control: its sheet holds the cap's source and the rules that set it, so
 * the line carries no rules chip of its own; a ban's words carry one. `fee`: the fee's name, which the control's spoken name says with what
 * it opens.
 */
export function CapRules({ cap, fee }: { cap: CapLine; fee: string }) {
  if (cap.state === "absent") return null;
  if (cap.state === "banned")
    return (
      <p className="text-xs text-muted-foreground">
        <BannedWords ban={cap.ban} fee={fee} />
      </p>
    );
  return (
    <p className="text-xs text-muted-foreground">
      {cap.state === "none" ? (
        <Num value={cap.value} display={copy.standing.tag.none} name={copy.standing.noCapRules(fee)} />
      ) : (
        <>
          {copy.standing.capLine}
          <CapFigure value={cap.value} name={copy.standing.capRules(fee)} />
        </>
      )}
      <CapCaveat caveat={cap.caveat} />
    </p>
  );
}

/**
 * Each price of a fee in the reading against its cap, a line each: the side where a sale is priced apart, and where a side has several
 * prices, "now" for the one in the reading's first month (`first`) and its month for each later one; then the price and its standing.
 */
function LawPrices({ row, saved, first }: { row: LawRow; saved: boolean; first: MonthKey }) {
  const binds = row.cap.state === "value" ? row.cap.binds : undefined;
  const many = (side: DealSide) => row.prices.filter((x) => x.side === side).length > 1;
  return (
    <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
      {row.prices.map((x, k) => {
        const side = x.side === "all" ? "" : `${copy.sides[x.side]} `;
        const lead = !many(x.side) ? side : x.from === first ? `${side}${copy.standing.now}` : null;
        return (
          <li key={k}>
            {lead === null ? <When iso={x.from} lead={`${side}${copy.read.law.from}`} /> : lead}
            {lead === null && " "}
            <PriceWords price={x.price} kind={row.kind} saved={saved} />
            <StandingWords standing={x.standing} {...(binds ? { binds } : {})} />
          </li>
        );
      })}
    </ul>
  );
}

/**
 * A fee against its cap (F-113), the one block the glance and the law card draw: its name and the tag of its standing now (a later price's
 * standing is said with that price), then `children` (its price or prices in words, and the cap's line where the place says it). It
 * reads the fee's law row of the reading, so the two never disagree. The standing is said in words only: no bar. Its container lays the
 * pieces out as a column. Nothing where the cap has no figure.
 */
export function CapBlock({ row, name, tag, children }: { row: LawRow; /** The fee's name as the place draws it (one that chooses the fee); its plain name otherwise. */ name?: ReactNode; /** The standing's tag as the place draws it (one that leads to the law card); the plain tag otherwise. */ tag?: ReactNode; children?: ReactNode }) {
  if (row.cap.state !== "value") return null;
  return (
    <>
      <span className="flex flex-wrap items-center gap-2">
        {name ?? <FeeName fee={row} className="font-medium" />}
        {tag !== undefined ? tag : row.now && <StandingTag standing={row.now} />}
      </span>
      {children}
    </>
  );
}

/** A fee's law row whole, as the law card shows it: the block against its cap, each price from the reading's month on, and the cap's line. */
export function LawBlock({ row, saved, first, name }: { row: LawRow; saved: boolean; first: MonthKey; name?: ReactNode }) {
  return (
    <CapBlock row={row} name={name}>
      <LawPrices row={row} saved={saved} first={first} />
      <CapRules cap={row.cap} fee={refName(row)} />
    </CapBlock>
  );
}

/** The value held at which the yearly sums on the account and the custody rate cost the same (F-112), as a sentence's words and figures. */
export function MeetSentence({ mark }: { mark: Extract<MarkView, { kind: "meet" }> }) {
  const m = copy.marks.meet;
  return (
    <>
      {m.before}
      <Fig value={mark.sum} />
      {m.sum}
      <Num value={mark.rate} />
      {m.rate}
      <Fig value={mark.amount} />
      {mark.largest ? m.after : `${m.smaller}${custodyName(mark.against)}.`}
    </>
  );
}

/** The custody fees a meet mark weighs the sums against, by name with the article where the deal has one ("דמי ניהול פיקדון ניירות הערך"). */
export function custodyName(against: readonly FeeRef[]): string {
  if (against.length !== 1) return copy.marks.meet.custody;
  const one = against[0]!;
  return (one.kind !== "own" && copy.nameForms[one.kind]?.the) || refName(one);
}

/** A cap's figure with its unit's words ("1.05% בשנה"), as the guide writes a cap. */
export function CapFigure({ value, name }: { value: SiteValue; /** As `Num`'s. */ name?: string }) {
  const after = (guideBlocks.fees.unitAfter as Record<string, string>)[value.unit] ?? "";
  return (
    <>
      <Num value={value} name={name} />
      {after && ` ${after}`}
    </>
  );
}
