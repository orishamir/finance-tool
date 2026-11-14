// A deposit's figures in words, drawn the same on every page that shows a deposit (the deposits page, the bank page's table and its
// single-product card): a variable rate's anchor and spread, and the amounts the bank takes. Each figure is its record's sourced value;
// the words come from lib/deposit-kind.ts, which the pages' plain-text places (a chip) use too. In the kit because three feature folders
// draw them (deposits, company, decoder), and a feature never imports from a neighbouring one.
import { r4catalogue as copy } from "../../copy";
import { amountRangeForm } from "../../lib/deposit-kind";
import { fmt } from "../../lib/format";
import { numberOf, type SiteValue } from "../../lib/value";
import { Num } from "../provenance";
import { MixedName } from "./name";

const LOOK = {
  under: "block text-sm text-muted-foreground font-normal",
  after: "text-xs text-muted-foreground font-normal",
  words: "",
} as const;

/**
 * A variable rate's anchor and spread in words, "פריים פחות 1.5": a minus sign misreads in Hebrew (BANK-47). The figure goes without its
 * unit's words, "נקודות אחוז", which its sheet says, so the line stays one line in a rate column. Nothing for a fixed rate, and nothing
 * where the record names no anchor: a spread alone says nothing.
 * `look`: `under` a rate, muted on a line of its own; `after` a rate on the same line, smaller (a phone's list of amounts); `words` inside
 * a sentence (a card's "סוג הריבית").
 */
export function AnchorSpread({ variable, anchor, spread, look = "under" }: { variable: boolean; anchor: string | null; spread: SiteValue | null; look?: keyof typeof LOOK }) {
  const v = numberOf(spread);
  if (!variable || !spread || v === null || !anchor) return null;
  return (
    <span className={LOOK[look] || undefined}>
      {anchor === "prime" ? copy.rateType.prime : <MixedName>{anchor}</MixedName>} {v < 0 ? copy.rateType.less : copy.rateType.more} <Num value={spread} display={fmt.number(Math.abs(v))} />
    </span>
  );
}

/**
 * The amounts a deposit takes, each figure sourced, in the words of `amountRangeForm`: "מ־1,000 ₪", "1,000 עד 50,000 ₪", "עד 50,000 ₪",
 * "ללא מינימום". A range with two ends breaks, where it must, between them. A top the record holds with no number is unknown, not no top
 * (F-108): "50,000 עד לא ידוע", the unknown figure opening its source.
 */
export function AmountRange({ min, max, fromOnly }: { min: SiteValue; max: SiteValue | null; /** Ranges that follow one another with no gap: each said by where it starts. */ fromOnly?: boolean }) {
  const low = numberOf(min);
  const unknownTop = !fromOnly && max !== null && numberOf(max) === null && low !== null && low > 0;
  const form = unknownTop ? "between" : amountRangeForm(low, numberOf(max), fromOnly);
  if (form === "none") return <>{copy.amount.noMin}</>;
  if (form === "from")
    return (
      <span className="whitespace-nowrap">
        {copy.amount.from}
        <Num value={min} />
      </span>
    );
  if (form === "upTo")
    return (
      <span className="whitespace-nowrap">
        {copy.amount.to} <Num value={max!} />
      </span>
    );
  return (
    <span>
      <span className="whitespace-nowrap">
        <Num value={min} display={fmt.number(low!)} /> {copy.amount.to}
      </span>{" "}
      <span className="whitespace-nowrap">
        <Num value={max!} />
      </span>
    </span>
  );
}
