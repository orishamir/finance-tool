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
  const groups = { state: "no_mention", entries: [] };
  const base = { provider: { class: "bank" }, price_for_he: "לקוח רגיל", left_out: [], groups, lines: [{ base: "trade", applies_to: ["etf_units"] }] };
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

describe("group prices stay beside the ranking (D43)", () => {
  const lines = [{ base: "custody", applies_to: ["etf_units"], rate: { value: 0.15 } }, { base: "trade", applies_to: ["etf_units"], rate: { value: 0.52 } }];
  const base = { provider: { class: "bank" }, price_for_he: "לקוח רגיל", left_out: [], lines, availability: [] };
  const entry = { name_he: "סטודנט", ends_printed: false, prices: [{ price_he: "0.1% לרבעון", holdings_he: "מניות ואגרות חוב", names_fund: false }] };
  const withRow = (row_he: string, entries: unknown[] = [entry]) => checkPricePremises({ ...base, groups: { state: "prices", row_he, entries } } as never).filter((x) => x.startsWith("groups")).join();
  it("refuses a record that says nothing, a state that does not fit, and an end with no place", () => {
    expect(checkPricePremises(base as never).join()).toMatch(/groups: a bank/);
    expect(checkPricePremises({ ...base, groups: { state: "prices", entries: [] } } as never).join()).toMatch(/does not fit/);
    expect(withRow("ש", [{ ...entry, ends_printed: true }])).toMatch(/does not say where/);
  });
  it("reads words after an exclusion as taking funds out, and refuses a fund read into a row that does not name one", () => {
    const words = (holdings_he: string, names_fund: boolean) => [{ ...entry, prices: [{ ...entry.prices[0], holdings_he, names_fund }] }];
    expect(withRow("ש", words("מניות ואגרות חוב", true))).toMatch(/names_fund/);
    expect(withRow("ש", words("מניות (למעט קרנות נאמנות)", false))).toBe("");
    expect(withRow("ש", words("מניות (למעט קרנות נאמנות)", true))).toMatch(/names_fund/);
    expect(withRow("ש", words('מניות לרבות "קרן מחקה" (למעט קרנות נאמנות)', true))).toBe("");
  });
  it("holds a row line's comparison to the record: the ordinary price on the same fee, the lower one in an entry", () => {
    expect(withRow("דמי ניהול 0.1% לרבעון במקום 0.15%")).toBe("");
    expect(withRow("דמי ניהול 0.1% לרבעון במקום 0.2%")).toMatch(/no custody rate/);
    expect(withRow("דמי ניהול 0.1% לרבעון במקום 0.52%")).toMatch(/no custody rate/);
    expect(withRow("דמי ניהול 0.07% לרבעון במקום 0.15%")).toMatch(/stands in no entry/);
    expect(withRow("קנייה ומכירה 0.1% במקום 0.52%")).toBe("");
  });
  it("every bank and broker accounts for its groups, and no house's sources are another's", () => {
    type Src = { url: string };
    const hostsOf = new Map<string, Set<string>>();
    for (const s of latest.values()) {
      if (!["bank", "broker", "foreign_broker"].includes(s.provider.class)) continue;
      const g = (s as unknown as { groups?: { read: Src[]; entries: { who_source: Src; ends_source?: Src; prices: { source: Src }[] }[] } }).groups;
      expect(g, s.id).toBeTruthy();
      const urls = [...g!.read, ...g!.entries.flatMap((e) => [e.who_source, ...(e.ends_source ? [e.ends_source] : []), ...e.prices.map((x) => x.source)])].map((x) => x.url);
      hostsOf.set(s.id, new Set(urls.map((u) => new URL(u).hostname.replace(/^(www|lp)\./, ""))));
    }
    const shared = [...hostsOf].flatMap(([a, x], i) => [...hostsOf].slice(i + 1).flatMap(([b, y]) => [...x].filter((h) => y.has(h)).map((h) => `${a} and ${b}: ${h}`)));
    expect(shared).toEqual([]);
  });
  it("the page's calculation never reads a group price", () => {
    const dirs = ["../../engine/src", "../../../site/app/lib"];
    for (const rel of dirs) {
      const dir = fileURLToPath(new URL(rel + "/", import.meta.url));
      for (const f of readdirSync(dir, { recursive: true }) as string[]) {
        if (!/\.tsx?$/.test(f) || /\.test\./.test(f)) continue;
        expect(readFileSync(dir + f, "utf8"), f).not.toMatch(/row_he|feeGroups|snapshots?\??\.groups|\bs\.groups\b|\{[^}]*\bgroups\b[^}]*\}\s*=\s*(snap|s\b)/);
      }
    }
  });
});
