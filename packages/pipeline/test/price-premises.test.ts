// No price from analogy (founder, 2026-10-31; D42). Two guards: the record's premises, and doubts written in free text on a
// priced line. A doubt in a note changes nothing on the page, so it becomes an `availability` entry that greys the row, or it
// is settled and leaves the note. Today's leftovers are listed by name; the list only shrinks.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkPricePremises } from "../src/validate.ts";

const dir = fileURLToPath(new URL("../../../data/fees", import.meta.url));
type Line = { id: string; base: string; applies_to: string[]; [k: string]: unknown };
type Snap = { id: string; snapshot: string; provider: { class: string }; lines: Line[]; availability?: { applies_to: string[]; available: boolean | "unknown"; source: { quote?: string } }[] };
const latest = new Map<string, Snap>();
for (const f of readdirSync(dir).sort()) {
  const s = JSON.parse(readFileSync(join(dir, f), "utf8")) as Snap;
  latest.set(s.id, s);
}
const CLASSES = ["mutual_fund_units", "etf_units", "tase_foreign_fund_units", "foreign_securities"];
const DOUBT = /not stated|not named|unconfirmed|not collected|Read as|could not be fetched|for a person to check|no document says|not confirmed/i;
const LEFTOVERS = [
  "altshuler-trade-custody",
  "interactive-brokers-buy-sell-lse-usd-tiered",
  "interactive-brokers-buy-sell-tase-fixed",
  "interactive-brokers-buy-sell-tase-tiered",
  "leumi-tracking-fund-standing-order",
  "massad-standing-order-tase-direct",
  "massad-standing-order-tase-branch",
  "mizrahi-custody-foreign",
];

describe("what a ranked price rests on", () => {
  it("a doubt written in a note on a priced line is on the list, and the list only shrinks", () => {
    const found: string[] = [];
    for (const s of latest.values()) {
      if (!["bank", "broker", "foreign_broker"].includes(s.provider.class)) continue;
      for (const l of s.lines) {
        if (!l.applies_to.some((c) => CLASSES.includes(c))) continue;
        const notes = ["rate", "min", "max", "spread"].map((k) => (l[k] as { notes?: string } | null | undefined)?.notes ?? "").join(" ");
        if (DOUBT.test(notes)) found.push(l.id);
      }
    }
    expect(found.sort()).toEqual([...LEFTOVERS].sort());
  });
  const base = { provider: { class: "bank" }, price_for_he: "לקוח רגיל", left_out: [], lines: [{ base: "trade", applies_to: ["etf_units"] }] };
  const entry = (quote: string, available: boolean | "unknown" = true) => ({ applies_to: ["etf_units"], available, source: { quote } });
  it("passes a price whose document names the holding", () => {
    expect(checkPricePremises({ ...base, availability: [entry("מניות, אגרות חוב וקרנות סל")] })).toEqual([]);
  });
  it("refuses a price with no entry, a line stretched from words that name something else, and a doubt with no reason", () => {
    expect(checkPricePremises({ ...base })[0]).toMatch(/no entry/);
    expect(checkPricePremises({ ...base, availability: [entry("מניות, מק״מ ואגרות חוב")] })[0]).toMatch(/does not name/);
    expect(checkPricePremises({ ...base, availability: [entry("x", "unknown")] })[0]).toMatch(/no reason_he/);
  });
  it("does not count what the words exclude, or a place with no holding", () => {
    const mf = { ...base, lines: [{ base: "trade", applies_to: ["mutual_fund_units"] }] };
    expect(checkPricePremises({ ...mf, availability: [{ ...entry("למעט קרנות נאמנות"), applies_to: ["mutual_fund_units"] }] })[0]).toMatch(/does not name/);
    const abroad = { ...base, lines: [{ base: "trade", applies_to: ["foreign_securities"] }] };
    expect(checkPricePremises({ ...abroad, availability: [{ ...entry("ניירות ערך בחוץ לארץ -מניות"), applies_to: ["foreign_securities"] }] })[0]).toMatch(/does not name/);
    expect(checkPricePremises({ ...abroad, availability: [{ ...entry("מניות, אגרות חוב וקרנות נאמנות"), applies_to: ["foreign_securities"] }] })).toEqual([]);
  });
  it("refuses a trade line that names no kind of holding", () => {
    expect(checkPricePremises({ ...base, lines: [{ base: "trade", applies_to: ["all"] }] }).join(" ")).toMatch(/names every holding/);
  });
  it("refuses a record that does not say who pays or what it left out", () => {
    const { price_for_he: _p, left_out: _l, ...bare } = base;
    const got = checkPricePremises({ ...bare, availability: [entry("קרנות סל")] });
    expect(got.join(" ")).toMatch(/price_for_he/);
    expect(got.join(" ")).toMatch(/left_out/);
  });
});
