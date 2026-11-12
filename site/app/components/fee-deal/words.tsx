// The fee page's shared words and marks: a fee's name and its one colour, a price written out around its figures, and a price's standing
// against its cap (F-113) as a tag and as a sentence. Every column of the page writes these through here, so a fee reads the same in each.
import type { ReactNode } from "react";
import { feeDeal as copy, guideBlocks } from "../../copy";
import type { FeeRef, PriceView, StandingView } from "../../lib/fee-deal/parts";
import type { FeeKindId } from "../../lib/fee-deal/shapes";
import { fmt } from "../../lib/format";
import type { SiteValue } from "../../lib/value";
import { CapBar, Swatch, Tag, When, cx } from "../kit";
import { Num } from "../provenance";

/** A fee's name: the person's own for a fee of their own, the guide's for a base the records list, else the page's. */
export function feeName(kind: FeeKindId, own?: string): string {
  if (kind === "own" && own) return own;
  const base = guideBlocks.fees[kind] as { name?: string } | undefined;
  return base?.name ?? copy.names[kind] ?? kind;
}

export const refName = (r: FeeRef) => feeName(r.kind, r.name);

/**
 * Each fee's one colour on the whole page (theme.css, the `--fee-*` roles): a `bg-*` for its swatch and its bar against the cap, a
 * `border-*` for a later price's outline, a `fill-*` and a `stroke-*` for its band on a curve. Written out whole, so the stylesheet keeps
 * every class.
 */
const COLOUR: Record<FeeKindId, { bg: string; border: string; fill: string; stroke: string }> = {
  trade: { bg: "bg-fee-trade", border: "border-fee-trade", fill: "fill-fee-trade", stroke: "stroke-fee-trade" },
  spread: { bg: "bg-fee-spread", border: "border-fee-spread", fill: "fill-fee-spread", stroke: "stroke-fee-spread" },
  creation_redemption: { bg: "bg-fee-other", border: "border-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  load: { bg: "bg-fee-other", border: "border-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  redemption_deduction: { bg: "bg-fee-other", border: "border-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  fx: { bg: "bg-fee-fx", border: "border-fee-fx", fill: "fill-fee-fx", stroke: "stroke-fee-fx" },
  fx_spread: { bg: "bg-fee-spread", border: "border-fee-spread", fill: "fill-fee-spread", stroke: "stroke-fee-spread" },
  deposit: { bg: "bg-fee-deposit", border: "border-fee-deposit", fill: "fill-fee-deposit", stroke: "stroke-fee-deposit" },
  distribution_handling: { bg: "bg-fee-other", border: "border-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  corporate_event: { bg: "bg-fee-other", border: "border-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  transfer_out: { bg: "bg-fee-other", border: "border-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  exit: { bg: "bg-fee-other", border: "border-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  balance: { bg: "bg-fee-balance", border: "border-fee-balance", fill: "fill-fee-balance", stroke: "stroke-fee-balance" },
  custody: { bg: "bg-fee-custody", border: "border-fee-custody", fill: "fill-fee-custody", stroke: "stroke-fee-custody" },
  variable_management: { bg: "bg-fee-manager", border: "border-fee-manager", fill: "fill-fee-manager", stroke: "stroke-fee-manager" },
  trustee: { bg: "bg-fee-manager", border: "border-fee-manager", fill: "fill-fee-manager", stroke: "stroke-fee-manager" },
  direct_expenses: { bg: "bg-fee-direct", border: "border-fee-direct", fill: "fill-fee-direct", stroke: "stroke-fee-direct" },
  fund_management: { bg: "bg-fee-fund", border: "border-fee-fund", fill: "fill-fee-fund", stroke: "stroke-fee-fund" },
  fixed_period: { bg: "bg-fee-fixed", border: "border-fee-fixed", fill: "fill-fee-fixed", stroke: "stroke-fee-fixed" },
  current_account: { bg: "bg-fee-account", border: "border-fee-account", fill: "fill-fee-account", stroke: "stroke-fee-account" },
  insurance_premium: { bg: "bg-fee-other", border: "border-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
  own: { bg: "bg-fee-other", border: "border-fee-other", fill: "fill-fee-other", stroke: "stroke-fee-other" },
};

export const feeColour = (kind: FeeKindId) => COLOUR[kind];

/** A fee's swatch and name, the swatch never alone. */
export function FeeName({ fee, className }: { fee: FeeRef; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2 min-w-0", className)}>
      <Swatch shape="box" className={cx("shrink-0", COLOUR[fee.kind].bg)} />
      <span className="min-w-0">{refName(fee)}</span>
    </span>
  );
}

/** A figure with a lead held to it on one line (", לא פחות מ־15 ₪"). */
const Bound = ({ lead, value }: { lead: string; value: SiteValue }) => (
  <>
    , <Num value={value} prefix={lead} />
  </>
);

/**
 * A price in words around its figures: "0.25% מהפעולה, לא פחות מ־15 ₪", "0.4% בשנה ממה שמוחזק", "10 ₪ בחודש", "חינם". `saved`: the
 * product saves (its fees are charged from what has built up), so a share of what is held reads "ממה שנצבר". A fee charged inside a fund
 * says so in place of what it is a share of.
 */
export function PriceWords({ price, kind, saved, insideFund }: { price: PriceView; kind: FeeKindId; saved?: boolean; insideFund?: boolean }) {
  const p = copy.price;
  const f = price.figures;
  let body: ReactNode;
  switch (price.form) {
    case "free":
      body = p.free;
      break;
    case "action":
      body = (
        <>
          <Num value={f.rate!} /> {p.of[kind] ?? p.of.default}
          {f.min && <Bound lead={p.min} value={f.min} />}
          {f.max && <Bound lead={p.max} value={f.max} />}
        </>
      );
      break;
    case "held":
      body = (
        <>
          <Num value={f.rate!} /> {p.per[price.per!]} {insideFund ? p.insideFund : saved ? p.heldSaved : p.held}
          {price.every !== price.per && <>, {p.charged[price.every!]}</>}
          {f.min && <Bound lead={p.min} value={f.min} />}
          {f.max && <Bound lead={p.max} value={f.max} />}
        </>
      );
      break;
    case "sum":
      body = (
        <>
          <Num value={f.amount!} /> {p.per[price.every!]}
        </>
      );
      break;
    case "perAction":
      body = (
        <>
          <Num value={f.amount!} /> {p.perAction[kind] ?? p.perAction.default}
        </>
      );
      break;
  }
  return <span>{body}</span>;
}

/** The tag of a price's standing against its cap, or of the first later price whose standing differs ("בתקרה ממרץ 2028"); none where
 *  nothing is judged. Never colour alone: the tag is its words. */
export function StandingTag({ standing, from }: { standing: StandingView; from?: string }) {
  const s = standing.standing;
  if (!s.judged) return null;
  const tone = s.standing === "above" ? "blocked" : s.standing === "at" ? "neutral" : "outline";
  return (
    <Tag tone={tone} shape="pill">
      {from ? <When iso={from} lead={copy.standing.tagFrom[s.standing]!} /> : copy.standing.tag[s.standing]}
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

const shareOf = (s: StandingView): number | null => (s.standing.judged ? s.standing.share : null);

/**
 * A fee's price against its cap as a bar in the fee's colour: the price now filled, a later price's outline behind it where `later` is
 * judged, and the cap's figure at the end. None where the price now has no share of the cap (not judged, or a cap of zero).
 */
export function FeeCapBar({ kind, now, later, cap, className }: { kind: FeeKindId; now: StandingView; later?: StandingView; cap: SiteValue; className?: string }) {
  const share = shareOf(now);
  if (share === null) return null;
  const next = later ? shareOf(later) : null;
  return (
    <CapBar
      share={share}
      {...(next !== null ? { later: next } : {})}
      fill={COLOUR[kind].bg}
      edge={COLOUR[kind].border}
      cap={<Num value={cap} prefix={copy.standing.capMark} />}
      className={className}
    />
  );
}

/** What a cap that holds only in a case the deal does not state says, after the cap's figure or "אין תקרה בחוק" (F-113); none without one. */
export function CapCaveat({ caveat }: { caveat?: string | undefined }) {
  const words = caveat ? copy.standing.caveat[caveat] : undefined;
  return words ? <>. {words}</> : null;
}

/** A cap's figure with its unit's words ("1.05% בשנה"), as the guide writes a cap. */
export function CapFigure({ value }: { value: SiteValue }) {
  const after = (guideBlocks.fees.unitAfter as Record<string, string>)[value.unit] ?? "";
  return (
    <>
      <Num value={value} />
      {after && ` ${after}`}
    </>
  );
}
