// A calculated figure is plain text that opens nothing; only a catch it carries shows, as a caution "?" after it, and that "?" opens a
// sheet that says the catch and nothing else (docs/design-system.md 3.2). A plain difference or sum carries only a catch none of its
// inputs carries.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { flags, help, numbers, provenance, strength } from "../copy";
import { computed, differenceOf, sumOf, type SiteValue } from "../lib/value";
import { Num, ProvenanceProvider, catchesOf, type CatchPlace } from "./provenance";
import { CatchSheet } from "./provenance-sheets";

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
    expect(kinds(v)).toEqual(["doubt", "flag", "reading"]);
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
    expect(kinds(differenceOf(["א", flagged], ["ב", stale], "F-08", { today, flags: ["G-15"] }))).toEqual(["flag"]);
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
