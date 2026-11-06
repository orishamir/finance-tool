// No price from analogy (founder, 2026-10-31; D42). Two guards: the record's premises, and doubts written in free text on a
// priced line. A doubt in a note changes nothing on the page, so it becomes an `availability` entry that greys the row, or it
// is settled and leaves the note. Today's leftovers are listed by name; the list only shrinks.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { checkAdvertising, checkGroupValues, checkPricePremises } from "../src/validate.ts";

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
  "leumi-tracking-fund-standing-order",
  "massad-standing-order-tase-direct",
  "massad-standing-order-tase-branch",
];

describe("what a ranked price rests on", () => {
  it("a doubt written in a note on a priced line is on the list, and the list only shrinks", () => {
    const found: string[] = [];
    for (const s of latest.values()) {
      if (!["bank", "broker", "foreign_broker"].includes(s.provider.class)) continue;
      // a doubt already turned into an availability entry that greys every kind the line prices is what this guard asks for (2026-11-04)
      const greyed = new Set(((s as { availability?: { applies_to: string[]; available: unknown }[] }).availability ?? []).filter((a) => a.available !== true).flatMap((a) => a.applies_to));
      for (const l of s.lines) {
        const kinds = l.applies_to.filter((c) => CLASSES.includes(c));
        if (kinds.length === 0 || kinds.every((c) => greyed.has(c))) continue;
        const notes = ["rate", "min", "max", "spread"].map((k) => (l[k] as { notes?: string } | null | undefined)?.notes ?? "").join(" ");
        if (DOUBT.test(notes)) found.push(l.id);
      }
    }
    expect(found.sort()).toEqual([...LEFTOVERS].sort());
  });
  const groups = { state: "no_mention", entries: [] };
  const base = { provider: { class: "bank" }, current_account: { monthly_minimum: { value: 5.3, unit: "nis_per_month", source: { quote: "5.30 בפיקוח" } } }, price_for_he: "לקוח רגיל", left_out: [], groups, lines: [{ base: "trade", applies_to: ["etf_units"] }] };
  const entry = (quote: string, available: boolean | "unknown" = true) => ({ applies_to: ["etf_units"], available, source: { quote } });
  it("asks a bank for its current account's monthly cost, and no other house (D64)", () => {
    const named = { ...base, availability: [entry("מניות, אגרות חוב וקרנות סל")] };
    const { current_account: _, ...noAccount } = named;
    expect(checkPricePremises(noAccount)[0]).toMatch(/^current_account: a bank's record/);
    expect(checkPricePremises({ ...named, provider: { class: "broker" } })[0]).toMatch(/^current_account: only a bank's own record/);
    expect(checkPricePremises({ ...noAccount, provider: { class: "bank", part_of: "leumi" } })).toEqual([]);
    expect(checkPricePremises({ ...named, current_account: { monthly_minimum: { value: 5.3, unit: "nis" } } })[0]).toMatch(/nis_per_month/);
    // a counted minimum quotes its price list; a free account may not
    expect(checkPricePremises({ ...named, current_account: { monthly_minimum: { value: 5.3, unit: "nis_per_month", source: {} } } })[0]).toMatch(/source\.quote/);
    expect(checkPricePremises({ ...named, current_account: { monthly_minimum: { value: 0, unit: "nis_per_month", source: {} } } })).toEqual([]);
  });
  it("records a group's free current account only where its quote names the minimum (lens review M2, D56)", () => {
    const named = { ...base, availability: [entry("מניות, אגרות חוב וקרנות סל")] };
    const group = (quote: string) => ({ ...named, groups: { state: "found", entries: [{ name_he: "סטודנטים", ends_printed: true, ends_he: "למשך 48 חודשים", prices: [], current_account: { price_he: "פטור", exempt: true, for_months: 48, source: { quote } } }] } });
    const minimum = (quote: string) => checkPricePremises(group(quote)).filter((m) => m.includes("current_account"));
    expect(minimum("עמלת מינימום פעולות פטור")).toEqual([]);
    // Mercantile's annex: the teller action is free, the minimum is not printed for the group
    expect(minimum("פעולה על ידי פקיד ... פטור")[0]).toMatch(/does not name the minimum/);
  });
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
  const entry = {
    kind: "student",
    name_he: "סטודנט",
    who_he: "סטודנטים עד גיל 35",
    ends_printed: false,
    ends_he: "3 שנים מההצטרפות",
    who_short_he: "סטודנטים, עד גיל 35",
    cheaper_he: "דמי ניהול 0.1% במקום 0.15%",
    ends_short_he: "3 שנים",
    prices: [{ fee: "custody_israel", price_he: "0.1% לרבעון", holdings_he: "מניות ואגרות חוב", names_fund: false }],
  };
  const withEntries = (entries: unknown[] = [entry]) => checkPricePremises({ ...base, groups: { state: "prices", entries } } as never).filter((x) => x.startsWith("groups")).join();
  const saying = (words: Partial<typeof entry>) => withEntries([{ ...entry, ...words }]);
  it("refuses a record that says nothing, a state that does not fit, and an end with no place", () => {
    expect(checkPricePremises(base as never).join()).toMatch(/groups: a bank/);
    expect(checkPricePremises({ ...base, groups: { state: "prices", entries: [] } } as never).join()).toMatch(/does not fit/);
    expect(saying({ ends_printed: true })).toMatch(/does not say where/);
  });
  it("reads words after an exclusion as taking funds out, and refuses a fund read into a row that does not name one", () => {
    const words = (holdings_he: string, names_fund: boolean) => [{ ...entry, prices: [{ ...entry.prices[0]!, holdings_he, names_fund }] }];
    expect(withEntries(words("מניות ואגרות חוב", true))).toMatch(/names_fund/);
    expect(withEntries(words("מניות (למעט קרנות נאמנות)", false))).toBe("");
    expect(withEntries(words("מניות (למעט קרנות נאמנות)", true))).toMatch(/names_fund/);
    expect(withEntries(words('מניות לרבות "קרן מחקה" (למעט קרנות נאמנות)', true))).toBe("");
  });
  it("holds the sub-row's comparison to the record: the ordinary price on a line of the same fee, the lower one in the entry", () => {
    expect(withEntries()).toBe("");
    expect(saying({ cheaper_he: "דמי ניהול 0.1% במקום 0.2%" })).toMatch(/no custody rate/);
    expect(saying({ cheaper_he: "דמי ניהול 0.1% במקום 0.52%" })).toMatch(/no custody rate/);
    expect(saying({ cheaper_he: "דמי ניהול 0.07% במקום 0.15%" })).toMatch(/0.07 is not in the entry's prices/);
    // the lower figure must be a price of the same fee: the entry's 0.1% is custody, so it cannot stand for a trade price (2026-11-04)
    expect(saying({ cheaper_he: "דמי ניהול 0.1% במקום 0.15%; קנייה ומכירה 0.1% במקום 0.52%" })).toMatch(/0.1% is no trade price/);
    const trade = { ...entry.prices[0]!, fee: "trade_israel", price_he: "0.1%" };
    expect(withEntries([{ ...entry, prices: [...entry.prices, trade], cheaper_he: "דמי ניהול 0.1% במקום 0.15%; קנייה ומכירה 0.1% במקום 0.52%" }])).toBe("");
    expect(saying({ cheaper_he: "קנייה ומכירה 0.6% במקום 0.52%" })).toMatch(/not cheaper/);
    expect(saying({ cheaper_he: "פטור מדמי ניהול" })).toMatch(/פטור/);
  });
  it("holds the who and until-when words to the long ones, and asks for all three", () => {
    expect(saying({ who_short_he: "סטודנטים, עד גיל 30" })).toMatch(/who_short_he's 30/);
    expect(saying({ ends_short_he: "4 שנים" })).toMatch(/ends_short_he's 4/);
    expect(saying({ ends_short_he: undefined })).toMatch(/needs who_short_he/);
    expect(saying({ kind: "other", who_short_he: "המשקיע הצעיר" })).toMatch(/article/);
    expect(saying({ kind: "other", who_short_he: "לקוחות פפר" })).toBe("");
  });
  it("makes entries with the same prices one sub-row, and only entries that name the same fees", () => {
    expect(withEntries([entry, { ...entry, name_he: "אחר", cheaper_he: "דמי ניהול 0.1% לרבעון במקום 0.15%" }])).toMatch(/not one sub-row/);
    const trade = { ...entry, name_he: "אחר", prices: [{ fee: "trade_israel", price_he: "0.1%", holdings_he: "מניות", names_fund: false }] };
    expect(withEntries([entry, trade])).toMatch(/names other fees/);
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
  // 2026-11-04 (F-101): the one reader is own-account.ts, which lists a house's groups as starting points for an account on the person's own terms and
  // copies the one chosen into that entry; the ranking, the comparison and the engine still never read a group price.
  // 2026-11-04 (founder, D43 (5)): group-pick.ts names a house's group the person picked in its fold and prices it the same way, marked so no
  // ranking, cheapest pair or stairs reads it (isGroupPrice, isGroupProvider).
  const READERS = ["own-account.ts", "group-pick.ts"];
  it("the page's calculation never reads a group price", () => {
    const dirs = ["../../engine/src", "../../../site/app/lib"];
    for (const rel of dirs) {
      const dir = fileURLToPath(new URL(rel + "/", import.meta.url));
      for (const f of readdirSync(dir, { recursive: true }) as string[]) {
        if (!/\.tsx?$/.test(f) || /\.test\./.test(f) || READERS.includes(f)) continue;
        expect(readFileSync(dir + f, "utf8"), f).not.toMatch(/who_short_he|cheaper_he|ends_short_he|feeGroups|snapshots?\??\.groups|\bs\.groups\b|\{[^}]*\bgroups\b[^}]*\}\s*=\s*(snap|s\b)/);
      }
    }
  });
});

describe("advertising stays beside the ranking (D57)", () => {
  const tariff = "https://www.house.co.il/media/taarifon.pdf";
  const base = { provider: { class: "broker" }, snapshot: "2026-11-04", tariff: { url: tariff }, lines: [{ base: "custody", applies_to: ["etf_units"], rate: { value: 0.1, source: { url: tariff } } }] };
  const claim = { url: "https://www.house.co.il/trade/", seen: "2026-11-04" };
  const binding = { kind: "price_list", url: `${tariff}#page=3`, dated: "2026-07-01", checked: "2026-11-04" };
  const entry = { fee: "custody", verdict: "contradicted", claim_he: "ללא דמי משמרת", claim_source: claim, binding_he: "דמי משמרת 0.1% לרבעון", binding_source: binding };
  const check = (...advertising: unknown[]) => checkAdvertising({ ...base, advertising } as never).join(" ");
  it("passes a claim set against the record's own price list, and terms on the house's own site", () => {
    expect(check(entry)).toBe("");
    expect(check({ ...entry, verdict: "offer", binding_source: { ...binding, kind: "promotion_terms", url: "https://campaign.house.co.il/terms.pdf" } })).toBe("");
    expect(check({ ...entry, verdict: "not_found", binding_he: undefined })).toBe("");
  });
  it("refuses a contradiction or an offer without the document's words, and a claim not found that has them", () => {
    expect(check({ ...entry, binding_he: undefined })).toMatch(/needs the binding document's words/);
    expect(check({ ...entry, verdict: "offer", binding_he: undefined })).toMatch(/needs the binding document's words/);
    expect(check({ ...entry, verdict: "not_found" })).toMatch(/not_found has no binding words/);
  });
  it("refuses an advert as its own binding document, a price list the record does not cite, and terms on another site", () => {
    expect(check({ ...entry, binding_source: { ...binding, kind: "promotion_terms", url: "https://www.house.co.il/trade" } })).toMatch(/advert's own page/);
    expect(check({ ...entry, binding_source: { ...binding, url: "https://www.house.co.il/old-taarifon.pdf" } })).toMatch(/neither the record's tariff/);
    expect(check({ ...entry, binding_source: { ...binding, kind: "promotion_terms", url: "https://market.tase.co.il/he/market_data/trading_fees" } })).toMatch(/not on the house's own site/);
  });
  it("refuses a date after the reading, a reading after the record, and the same claim twice", () => {
    expect(check({ ...entry, binding_source: { ...binding, dated: "2026-12-01" } })).toMatch(/dated after/);
    expect(check({ ...entry, claim_source: { ...claim, seen: "2026-11-05" } })).toMatch(/after the record's snapshot/);
    expect(check(entry, entry)).toMatch(/the same claim twice/);
  });
  it("runs on every bank's and broker's record with the other premises", () => {
    const groups = { state: "no_mention", entries: [] };
    const premises = { ...base, price_for_he: "לקוח רגיל", left_out: [], groups, availability: [{ applies_to: ["etf_units"], available: true, source: { quote: "קרנות סל" } }] };
    expect(checkPricePremises({ ...premises, advertising: [{ ...entry, binding_he: undefined }] } as never).join(" ")).toMatch(/needs the binding document's words/);
  });
  it("the page's calculation never reads the advertising", () => {
    const dirs = ["../../engine/src", "../../../site/app/lib"];
    for (const rel of dirs) {
      const dir = fileURLToPath(new URL(rel + "/", import.meta.url));
      for (const f of readdirSync(dir, { recursive: true }) as string[]) {
        if (!/\.tsx?$/.test(f) || /\.test\./.test(f)) continue;
        expect(readFileSync(dir + f, "utf8"), f).not.toMatch(/advertising|claim_he|binding_he/);
      }
    }
  });
});

describe("a group price's numbers (F-101)", () => {
  const entry = (price_he: string, value: Record<string, unknown>, extra: Record<string, unknown> = {}, ends_he = "3 שנים ממועד ההצטרפות לקבוצה", fee = "trade_israel", quote = "") => ({
    state: "prices",
    entries: [{ name_he: "קבוצה", ends_printed: true, ends_he, prices: [{ fee, price_he, holdings_he: "מניות", names_fund: false, value: { ...value, ...extra }, source: { quote } }] }],
  });
  const check = (groups: ReturnType<typeof entry>) => checkGroupValues({ provider: { class: "bank" }, lines: [], groups } as never);
  it("passes a value whose numbers, period and currency are the words'", () => {
    expect(check(entry("0.12%, מינימום 10 ש״ח", { rate_pct: 0.12, per: "trade", min: 10, currency: "ILS", for_months: 36 }))).toEqual([]);
    expect(check(entry("0.075% לרבעון", { rate_pct: 0.075, per: "quarter" }, {}, "x", "custody_israel"))).toEqual([]);
    expect(check(entry("פטור, לשנה", { exempt: true, for_months: 12 }, {}, "x", "custody_abroad"))).toEqual([]);
    expect(check(entry("1 סנט למניה, מינימום 6 דולר", { per_share_cents: 1, min: 6, currency: "USD" }))).toEqual([]);
  });
  it("refuses a number the words do not hold, a period or currency they do not say, and an end nobody printed", () => {
    expect(check(entry("0.12%, מינימום 10 ש״ח", { rate_pct: 0.2, per: "trade" }))[0]).toMatch(/rate_pct 0.2 is in neither/);
    expect(check(entry("0.12%, מינימום 10 ש״ח", { rate_pct: 0.12, per: "trade", min: 10, currency: "USD" }))[0]).toMatch(/currency USD/);
    expect(check(entry("0.075% לרבעון", { rate_pct: 0.075, per: "year" }, {}, "x", "custody_israel"))[0]).toMatch(/per year/);
    expect(check(entry("0.075% לרבעון", { rate_pct: 0.075, per: "trade" }, {}, "x", "custody_israel"))[0]).toMatch(/does not fit a custody fee/);
    expect(check(entry("0.12%", { rate_pct: 0.12, per: "trade", for_months: 24 }))[0]).toMatch(/for_months 24/);
    expect(check(entry("פטור", { exempt: true }, {}, "x", "trade_israel", "x"))).toEqual([]);
    expect(check(entry("0.12%", { exempt: true }))[0]).toMatch(/do not say פטור/);
  });
  it("holds a side to the words: a purchase named alone needs side buy, a price for both has none", () => {
    const words = "0.15%, כפוף למינימום";
    const quote = 'עמלת קניה בחו"ל 0.15%';
    expect(check(entry(words, { rate_pct: 0.15, per: "trade", side: "buy" }, {}, "x", "trade_abroad", quote))).toEqual([]);
    expect(check(entry(words, { rate_pct: 0.15, per: "trade" }, {}, "x", "trade_abroad", quote))[0]).toMatch(/one side of a trade alone/);
    expect(check(entry(words, { rate_pct: 0.15, per: "trade", side: "sell" }, {}, "x", "trade_abroad", quote))[0]).toMatch(/side sell/);
    expect(check(entry("0.15%", { rate_pct: 0.15, per: "trade", side: "buy" }, {}, "x", "trade_abroad", "קניה ומכירה 0.15%"))[0]).toMatch(/side buy/);
    expect(check(entry("0.075% לרבעון", { rate_pct: 0.075, per: "quarter", side: "buy" }, {}, "x", "custody_israel", "קניה"))[0]).toMatch(/belongs to a trade fee/);
    expect(check(entry("0.15%", { rate_pct: 0.15, per: "trade" }, {}, "x", "trade_abroad", "קניה ומכירה 0.15%"))).toEqual([]);
  });
  it("takes an end only from an entry that prints one", () => {
    const g = entry("0.12%", { rate_pct: 0.12, per: "trade", for_months: 36 });
    g.entries[0]!.ends_printed = false;
    expect(check(g)[0]).toMatch(/for_months 36/);
  });
});
