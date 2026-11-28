// A calculated figure is plain text that opens nothing; only a catch it carries shows, as a caution "?" after it, and that "?" opens a
// sheet that says the catch and nothing else (docs/design-system.md 3.2). A plain difference or sum carries only a catch none of its
// inputs carries. A catch every figure of a list carries is said once, in its head; a figure's own caveat is a catch; a figure whose source's
// terms require a line beside it keeps a way to its source, which says that line.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { flags, help, numbers, provenance, strength } from "../copy";
import { computed, differenceOf, sumOf, type SiteValue } from "../lib/value";
import { nisPer, type FxSnapshot } from "../lib/fx";
import { interestOn, type DbOffer } from "../lib/deposit-browser";
import { depositBrowser } from "../copy";
import { CatchesSaid, ListCatchMark, Num, ProvenanceProvider, catchesOf, sharedCatches, type CatchPlace } from "./provenance";
import { CatchSheet, SheetContent } from "./provenance-sheets";
import { ChartTable } from "./kit";
import type { TaxIndexStatement } from "@finance-tool/engine";

const today = "2026-11-28";
const data = { rules: {}, terms: {}, dimensions: {}, today };
const place: CatchPlace = { today, figure: false, staleSaid: false, aheadSaid: false, onPage: (v) => v };
const wrap = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data } as never, el))).split("<dialog")[0] ?? "";
const words = (html: string) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const sourced = (value: number, more: Partial<SiteValue> = {}): SiteValue => ({ value, unit: "nis", source: { url: "https://example.org/x", title: "x", publisher: "x", strength: "primary" }, checked: today, effective_from: null, effective_to: null, update_rule: "market", state: "sourced", ...more });
const company = (value: number) => sourced(value, { source: { url: "https://example.org/list.pdf", title: "תעריפון", publisher: "בנק", strength: "institution" } });
const kinds = (v: SiteValue, at: Partial<CatchPlace> = {}) => catchesOf(v, { ...place, ...at }).map((c) => c.kind);
const sheetOf = (v: SiteValue, at: Partial<CatchPlace> = {}) => words(wrap(createElement(CatchSheet, { value: v, catches: catchesOf(v, { ...place, ...at }), exact: false, data, headId: "h", descId: "d" })));

describe("a calculated figure on the page", () => {
  it("with no catch is plain text: no button, nothing to tap", () => {
    const html = wrap(createElement(Num, { value: computed(1500, "nis", "F-08", { a: sourced(1000) }, { today }) }));
    expect(html).not.toContain("<button");
    expect(words(html)).toContain("1,500");
  });
  it("with a catch carries one caution mark after its digits, and no mark before them", () => {
    const html = wrap(createElement(Num, { value: computed(1500, "nis", "F-08", { a: sourced(1000) }, { today, about: "מה נשאר", flags: ["G-14"] }) }));
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain(`aria-label="${help.catchLabel.replace("{about}", "מה נשאר")}"`);
    expect(html.indexOf("1,500")).toBeLessThan(html.indexOf("<button"));
    expect(html).not.toContain("<svg");
  });
});

describe("a calculated figure's catches", () => {
  it("are its doubt, its flags and its readings, in that order", () => {
    const v = computed(1, "nis", "F-08", { a: sourced(1) }, { today, flags: ["G-14"], labels: [{ code: "cautious", ruleId: "TXF-04", notKnown: "documents" }] });
    expect(kinds(v)).toEqual(["doubt", "flags", "reading"]);
  });
  it("count a company's document out of its own context only at figure size; a secondary source anywhere", () => {
    const v = computed(1, "nis", "F-08", { a: company(1) }, { today });
    expect(kinds(v)).toEqual([]);
    expect(kinds(v, { figure: true })).toEqual(["weak"]);
    const second = computed(1, "nis", "F-08", { a: sourced(1, { source: { url: "https://example.org/x", title: "x", publisher: "x", strength: "secondary" } }) }, { today });
    expect(kinds(second)).toEqual(["weak"]);
  });
  it("leave out staleness a notice around it already says", () => {
    const v = computed(1, "nis", "F-08", { a: sourced(1, { stale: { since: "2026-01-01", cadence: "monthly" } }) }, { today });
    expect(kinds(v)).toEqual(["stale"]);
    expect(kinds(v, { staleSaid: true })).toEqual([]);
  });
  it("on a plain difference or sum, only what none of its inputs carries", () => {
    const flagged = computed(5, "nis", "F-08", { a: sourced(5) }, { today, flags: ["G-14"] });
    const stale = sourced(2, { stale: { since: "2026-01-01", cadence: "monthly" } });
    const doubted = computed(3, "nis", "F-08", {}, { today, labels: [{ code: "cautious", ruleId: "TXF-04", notKnown: "documents" }] });
    expect(kinds(differenceOf(["א", flagged], ["ב", stale], "F-08", { today }), { figure: true })).toEqual([]);
    expect(kinds(sumOf({ א: doubted, ב: company(1) }, "F-08", { today }), { figure: true })).toEqual([]);
    // a flag of its own, which no input carries, stays
    expect(kinds(differenceOf(["א", flagged], ["ב", stale], "F-08", { today, flags: ["G-15"] }))).toEqual(["flags"]);
  });
});

describe("the catch sheet", () => {
  it("heads with the figure and what it is, then says only the catch", () => {
    const out = sheetOf(computed(1500, "nis", "F-08", { "ההפקדה": sourced(1000) }, { today, about: "מה נשאר בסוף", flags: ["G-14"] }));
    expect(out).toContain("1,500");
    expect(out).toContain("מה נשאר בסוף");
    expect(out).toContain(flags["G-14"]);
    expect(out).toContain("G-14");
    expect(out).not.toContain("ההפקדה");
    expect(out).not.toContain(numbers.legend.sourced);
  });
  it("names each weak input with its figure under its strength's line, and says a secondary strength", () => {
    const out = sheetOf(computed(1500, "nis", "F-08", { "עמלת קנייה": company(25), "ההפקדה": sourced(1000) }, { today }), { figure: true });
    expect(out).toContain(provenance.computed.weakInputs.institution);
    expect(out).toContain("עמלת קנייה");
    expect(out).toContain("25");
    expect(out).not.toContain("ההפקדה");
    expect(out).not.toContain(strength.institution.line);
    const second = sheetOf(computed(1, "nis", "F-08", { "ריבית": sourced(1, { source: { url: "https://example.org/x", title: "x", publisher: "x", strength: "secondary" } }) }, { today }));
    expect(second).toContain(strength.secondary.line);
    expect(second).toContain(provenance.computed.weakInputs.secondary);
  });
  it("tags the site's reading with the rule it reads", () => {
    const out = sheetOf(computed(1, "nis", "F-08", {}, { today, labels: [{ code: "reading", ruleId: "TXF-08" }] }));
    expect(out).toContain(numbers.reading);
  });
});

describe("a figure's caveat", () => {
  const caveat = "החישוב לפי הריבית של היום.";
  it("is a catch of its own, after its doubt, which its sheet says in words", () => {
    const v = computed(1, "nis", "F-21", { a: sourced(1) }, { today, caveat, flags: ["G-14"] });
    expect(kinds(v)).toEqual(["caveat", "flags"]);
    expect(sheetOf(v)).toContain(caveat);
    // a figure with no caveat and no other catch has none
    expect(kinds(computed(1, "nis", "F-21", { a: sourced(1) }, { today }))).toEqual([]);
  });
  it("is not carried to a figure worked out from the one that has it", () => {
    const v = computed(1, "nis", "F-21", { a: sourced(1) }, { today, caveat });
    expect(kinds(computed(2, "nis", "F-08", { v }, { today }))).toEqual([]);
  });
  it("on a variable-rate deposit's interest says the rate is today's (and none on a fixed one)", () => {
    const offer = (kind: DbOffer["kind"]) => ({ kind, term: "y1", rate_offered: sourced(4, { unit: "pct_per_year" }), paidOut: false, exits: { exists: false }, breakTerm: "not_allowed" }) as unknown as DbOffer;
    const at = (kind: DbOffer["kind"]) => interestOn(offer(kind), 10000, sourced(10000), today);
    expect(at("variable")?.caveat).toBe(depositBrowser.interest.variableNote);
    const variable = at("variable");
    if (!variable) throw new Error("the variable offer has no interest");
    expect(kinds(variable)).toEqual(["caveat"]);
    expect(at("fixed")?.caveat).toBeUndefined();
  });
});

describe("a catch every figure of a list carries", () => {
  const flagged = (...codes: string[]) => computed(1, "nis", "F-08", { a: sourced(1) }, { today, flags: codes });
  it("is what each of them carries, a flag at a time; nothing for a list of one", () => {
    const each = [flagged("G-14", "G-23"), flagged("G-14"), flagged("G-23", "G-14")].map((v) => catchesOf(v, place));
    expect(sharedCatches(each)).toEqual([{ kind: "flags", codes: ["G-14"] }]);
    expect(sharedCatches(each.slice(0, 1))).toEqual([]);
    expect(sharedCatches([catchesOf(flagged("G-14"), place), []])).toEqual([]);
  });
  it("leaves each figure's own \"?\": one with no other catch has none, one with another keeps it alone", () => {
    const said = sharedCatches([flagged("G-14"), flagged("G-14", "G-23")].map((v) => catchesOf(v, place)));
    const html = wrap(createElement(CatchesSaid, { catches: said }, createElement(Num, { key: "a", value: flagged("G-14") }), createElement(Num, { key: "b", value: flagged("G-14", "G-23") })));
    expect(html.match(/<button/g)).toHaveLength(1);
    expect(html).toContain('data-catch="flags"');
    expect(catchesOf(flagged("G-14", "G-23"), { ...place, said: new Set(["flag G-14"]) })).toEqual([{ kind: "flags", codes: ["G-23"] }]);
  });
  it("in a table's column is said once, in the column's head, and its cells keep only what is theirs", () => {
    const fees = [flagged("G-14"), flagged("G-14"), flagged("G-14", "G-23")];
    const html = wrap(createElement(ChartTable, { rowHead: "שנה", columns: [{ id: "f", head: "דמי ניהול", figures: { name: "דמי ניהול", values: fees } }], rows: fees.map((v, i) => ({ key: i, head: i + 1, cells: [createElement(Num, { value: v, size: "cell" })] })) }));
    const [head, body] = html.split("</thead>") as [string, string];
    expect(head.match(/data-catch-list/g)).toHaveLength(1);
    expect(body.match(/data-catch=/g)).toHaveLength(1);
  });
  it("is said once by a caution \"?\" whose sheet names what the figures are, that it holds for each, and the catch", () => {
    const said = sharedCatches([flagged("G-14"), flagged("G-14")].map((v) => catchesOf(v, place)));
    const mark = wrap(createElement(ListCatchMark, { catches: said, name: "דמי ניהול", scope: "column" }));
    expect(mark).toContain("data-catch-list");
    expect(mark).toContain(`aria-label="${help.catchLabel.replace("{about}", "דמי ניהול")}"`);
    expect(wrap(createElement(ListCatchMark, { catches: [], name: "דמי ניהול", scope: "column" }))).toBe("");
    const sheet = words(wrap(createElement(SheetContent, { item: { kind: "list-catch", name: "דמי ניהול", scope: "column", catches: said }, data, headId: "h", descId: "d" })));
    expect(sheet).toContain("דמי ניהול");
    expect(sheet).toContain(provenance.computed.listCatch.column);
    expect(sheet).toContain(flags["G-14"]);
  });
});

describe("a fund's own statement a figure rests on", () => {
  const statement: TaxIndexStatement = { term: "tax-index", index: "cpi", page: 7, quote: "x", source: { url: "https://example.org/annex.pdf", title: "נספח מס", publisher: "x", strength: "institution" }, checked: "2026-10-01" };
  it("is named as the fund's in the figure's catch sheet, with its document at the page and the day it was read", () => {
    const out = sheetOf(computed(1, "nis", "F-65", { a: sourced(1) }, { today, flags: ["G-14"], statements: [statement] }));
    expect(out).toContain(provenance.computed.statements);
    expect(out).toContain(provenance.computed.statement["tax-index"](statement));
    expect(out).toContain(provenance.computed.statementDoc("נספח מס", 7));
    expect(out).toContain("1.10.2026");
  });
});

describe("a calculated figure whose sources' terms require a line beside them (the ECB's rates)", () => {
  const fx: FxSnapshot = { date: "2026-11-27", checked: "2026-11-28", perEur: { USD: 1.05, ILS: 3.8 }, attribution: "מקור: הבנק המרכזי האירופי (ECB). האתר חישב מהשערים שלו.", staleAfterDays: 5, sourceUrl: "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml" };
  const found = nisPer(fx, "USD", today);
  if (!found) throw new Error("the ECB publishes the dollar");
  const rate = found;
  it("draws as a sourced figure, a button that opens its sheet", () => {
    const html = wrap(createElement(Num, { value: rate }));
    expect(html).toMatch(/<button[^>]*class="[^"]*num-sourced/);
    expect(html).not.toContain("num-plain");
  });
  it("opens a sheet with what it is, the ECB's file with its rates' date, and the line its terms require", () => {
    const sheet = words(wrap(createElement(SheetContent, { item: { kind: "obliged", value: rate, catches: [] }, data, headId: "h", descId: "d" })));
    expect(sheet).toContain(rate.about ?? "no about");
    expect(sheet).toContain(fx.attribution);
    expect(sheet).toContain(provenance.computed.obliged.dated);
    expect(sheet).toContain("27.11.2026");
    expect(wrap(createElement(SheetContent, { item: { kind: "obliged", value: rate, catches: [] }, data, headId: "h", descId: "d" }))).toContain("ecb.europa.eu");
  });
  it("is any calculated figure that carries such a line, and only one", () => {
    const own = { ...computed(2, "nis", "F-08", { a: sourced(1) }, { today }), obligation: "שורה שהמקור מחייב." };
    expect(wrap(createElement(Num, { value: own }))).toMatch(/<button[^>]*class="[^"]*num-sourced/);
    expect(wrap(createElement(Num, { value: computed(2, "nis", "F-08", { a: sourced(1) }, { today }) }))).not.toContain("<button");
  });
});
