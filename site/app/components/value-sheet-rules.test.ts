// What a figure's sheet names beside the figure (docs/design-system.md 3.2): the rules that set it, less those the place it was opened from
// already opens and those its doubt opens, under the label for one rule or for several; a missing figure's reason said once, with no state
// tag; no "from" date beside the line that says the figure is not in force yet; and on the rules page, a re-check date in the caution
// colour only once it has passed.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { numbers, provenance } from "../copy";
import { loadRules } from "../lib/data.server";
import { fmt } from "../lib/format";
import { ruleTitle } from "../lib/rule-title";
import { computed, type SiteValue } from "../lib/value";
import { ProvenanceProvider, type ProvenanceData } from "./provenance";
import { RuleDetail, ValueSheet } from "./provenance-sheets";

const today = "2026-11-26";
const all = loadRules();
/** A rule's record from the rule base; the test's rules are all there. */
const record = (id: string): RuleRecord => {
  const r = all[id];
  if (!r) throw new Error(`the rule base has no ${id}`);
  return r;
};
const ids = ["CAT-24", "CAT-44", "CAT-36", "CAT-37", "TXI-03"] as const;
const data: ProvenanceData = { rules: Object.fromEntries(ids.map((id) => [id, record(id)])), terms: {}, dimensions: {}, today };
const title = (id: string) => ruleTitle(record(id), data).text;

const wrap = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data } as never, el)));
/** The sheet's words in order, its markup's text alone. */
const words = (html: string) =>
  (html.split("<dialog")[0] ?? "")
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
const sheet = (value: SiteValue, more: { shown?: readonly string[]; display?: string } = {}) => words(wrap(createElement(ValueSheet, { value, exact: false, data, headId: "h", descId: "d", ...more })));
const count = (text: string, part: string) => text.split(part).length - 1;

const sourced = (value: number | null, more: Partial<SiteValue> = {}): SiteValue => ({
  value,
  unit: "pct",
  source: { url: "https://example.org/x", title: "x", publisher: "x", strength: "primary" },
  checked: today,
  effective_from: null,
  effective_to: null,
  update_rule: "market",
  state: "sourced",
  ...more,
});

describe("the rules a figure's sheet names", () => {
  it("leaves out a rule the place it was opened from opens, and the row with it when none is left", () => {
    const one = sourced(15, { rule_ids: ["TXI-03"] });
    expect(sheet(one)).toContain(title("TXI-03"));
    const out = sheet(one, { shown: ["TXI-03"] });
    expect(out).not.toContain(title("TXI-03"));
    expect(out).not.toContain(provenance.sourced.rule);
  });

  it("says one rule's label over one chip and the plural over more", () => {
    const two = sheet(sourced(0.71, { rule_ids: ["CAT-36", "CAT-37"] }));
    expect(two).toContain(provenance.sourced.rules);
    expect(two).not.toContain(provenance.sourced.rule);
    const one = sheet(sourced(0.71, { rule_ids: ["CAT-36", "CAT-37"] }), { shown: ["CAT-37"] });
    expect(one).toContain(provenance.sourced.rule);
    expect(one).not.toContain(provenance.sourced.rules);
  });

  it("names a rule its doubt opens once, under the doubt", () => {
    const out = sheet(sourced(0.71, { rule_ids: ["CAT-36", "CAT-37"], doubt: "ספק", doubtRules: ["CAT-37"] }));
    expect(count(out, title("CAT-37"))).toBe(1);
    expect(count(out, title("CAT-36"))).toBe(1);
  });

  it("leaves out of a computed figure's rules what the place opens", () => {
    const share = computed(97.43, "pct", "F-87", { a: sourced(1) }, { today, rules: [{ id: "CAT-44", strength: "primary" }] });
    expect(sheet(share)).toContain(title("CAT-44"));
    expect(sheet(share, { shown: ["CAT-44"] })).not.toContain(title("CAT-44"));
  });
});

describe("a missing figure's sheet", () => {
  const inputs = (a: number | null) => ({ "סך נכסי המסלול": sourced(a), "החשיפה לשוק המניות": sourced(5) });
  it("prints a computed figure's note once, and never the source's 'not found'", () => {
    const out = sheet(computed(null, "pct", "F-87", inputs(null), { today, notes: "המסלול לא דיווח לרשות את סך הנכסים." }), { display: "לא דווח" });
    expect(count(out, "המסלול לא דיווח לרשות את סך הנכסים.")).toBe(1);
    expect(out).not.toContain(provenance.sourced.noValue);
  });

  it("says an input is missing only where one is", () => {
    expect(sheet(computed(null, "pct", "F-87", inputs(null), { today }), { display: "לא דווח" })).toContain(provenance.computed.inputMissing);
    const none = sheet(computed(null, "pct", "F-87", inputs(0), { today }), { display: "לא דווח" });
    expect(none).not.toContain(provenance.computed.inputMissing);
    expect(none).not.toContain(provenance.sourced.noValue);
    expect(none).toContain(provenance.computed.inputs);
  });

  it("carries no state tag, sourced or computed", () => {
    expect(sheet(sourced(5))).toContain(numbers.legend.sourced);
    expect(sheet(sourced(null), { display: "לא דווח" })).not.toContain(numbers.legend.sourced);
    expect(sheet(computed(null, "pct", "F-87", inputs(null), { today }), { display: "לא דווח" })).not.toContain(numbers.legend.computed);
  });

  it("a sourced one says the source does not hold it, once, with the source where it was looked for", () => {
    const out = sheet(sourced(null, { source: { url: "https://example.org/file", title: "קובץ הרשות", publisher: "x", strength: "primary" } }), { display: "לא דווח" });
    expect(count(out, provenance.sourced.noValue)).toBe(1);
    expect(out).toContain("קובץ הרשות");
  });
});

describe("a figure not in force yet", () => {
  it("says its first day in the line above, with no 'from' row beside it", () => {
    const later = sheet(sourced(5, { effective_from: "2027-01-01" }));
    expect(later).toContain(provenance.sourced.notYetInForce);
    expect(later).not.toContain(provenance.sourced.from);
    expect(sheet(sourced(5, { effective_from: "2026-01-01" }))).toContain(provenance.sourced.from);
  });
});

describe("a rule's re-check date on the rules page", () => {
  const rule = (recheck: string): RuleRecord => ({ ...record("TXI-03"), recheck_date: recheck });
  /** The classes of the element that holds the re-check date, by its date as the page writes it. */
  const recheckClass = (recheck: string) => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(RuleDetail, { id: "TXI-03", data: { ...data, rules: { "TXI-03": rule(recheck) } }, products: [] })));
    const at = html.indexOf(fmt.date(recheck));
    const open = html.lastIndexOf('<span class="', at);
    return html.slice(open, html.indexOf(">", open));
  };
  it("is in the caution colour only once it has passed", () => {
    expect(recheckClass("2027-06-01")).not.toContain("caution");
    expect(recheckClass("2026-06-01")).toContain("caution");
  });
});
