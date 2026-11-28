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
import { ruleFigure, type SiteValue } from "../lib/value";
import { ProvenanceProvider, valueItem, type ProvenanceData } from "./provenance";
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
});

describe("a missing figure's sheet", () => {
  it("carries no state tag", () => {
    expect(sheet(sourced(5))).toContain(numbers.legend.sourced);
    expect(sheet(sourced(null), { display: "לא דווח" })).not.toContain(numbers.legend.sourced);
  });

  it("a sourced one says the source does not hold it, once, with the source where it was looked for", () => {
    const out = sheet(sourced(null, { source: { url: "https://example.org/file", title: "קובץ הרשות", publisher: "x", strength: "primary" } }), { display: "לא דווח" });
    expect(count(out, provenance.sourced.noValue)).toBe(1);
    expect(out).toContain("קובץ הרשות");
  });

  it("a sourced one says the reason its record gives for the gap, once, in place of 'not found in the source'", () => {
    for (const why of ["too-young", "not-reported", "not-collected", "not-applicable", "unknown"] as const) {
      const out = sheet(sourced(null, { empty_because: why }), { display: "לא דווח" });
      const reason = provenance.sourced.emptyBecause[why];
      if (reason === null) throw new Error(`no words for ${why}`);
      expect(count(out, reason)).toBe(1);
      expect(out).not.toContain(provenance.sourced.noValue);
    }
  });

  it("a note in Hebrew is its reason, before the reason its record gives", () => {
    const out = sheet(sourced(null, { empty_because: "unknown", notes_he: "החברה הפסיקה לפרסם את הנתון." }), { display: "לא דווח" });
    expect(count(out, "החברה הפסיקה לפרסם את הנתון.")).toBe(1);
    expect(out).not.toContain(provenance.sourced.emptyBecause.unknown);
  });
});

describe("a figure's note", () => {
  it("shows the Hebrew note, and of an English one only the open questions it names, each as its chip", () => {
    expect(sheet(sourced(5, { notes: "Taken from the March file.", notes_he: "נלקח מהקובץ של מרץ." }))).toContain("נלקח מהקובץ של מרץ.");
    const english = sheet(sourced(5, { notes: "Rate as of March; see TXI OQ19 for the cap." }));
    expect(english).not.toContain("Rate as of March");
    expect(english).toContain(provenance.idRef.questionChip);
  });
});

describe("a figure's head, as the figure was tapped", () => {
  it("is the words a number was shown in, with no unit word after them, and the figure's name under it", () => {
    const span = sourced(2, { unit: "years" });
    const item = valueItem(span, "שנתיים", false, [], "תקופת הפיקדון");
    if (item.kind !== "value") throw new Error("a figure opens a value's sheet");
    const out = sheet(item.value, item.display === undefined ? {} : { display: item.display });
    expect(out).toContain("שנתיים");
    expect(out).not.toContain(provenance.unit.years);
    expect(out).toContain("תקופת הפיקדון");
  });
});

describe("a stale figure", () => {
  it("says how often it is updated only where its record says, and the day it was last read either way", () => {
    const past = { ...record("TXI-03"), recheck_date: "2026-01-01", checked: "2025-06-01" };
    const key = Object.keys(past.figures ?? {})[0];
    if (!key) throw new Error("TXI-03 has a figure");
    const fixed = ruleFigure(past, key, today);
    if (!fixed?.stale) throw new Error("a figure of a rule past its re-check date is stale");
    const said = sheet({ ...fixed, update_rule: "fixed in law", stale: { since: "2025-06-01" } });
    expect(said).toContain(provenance.stale.before);
    expect(said).not.toContain(provenance.stale.middle);
    expect(sheet({ ...fixed, stale: { since: "2025-06-01", cadence: "yearly" } })).toContain(`${provenance.stale.middle} ${provenance.stale.cadence.yearly}`);
    expect(ruleFigure({ ...past, figures: { [key]: { ...(past.figures?.[key] as object), update_rule: "fixed in law" } } } as RuleRecord, key, today)?.stale?.cadence).toBeUndefined();
    expect(ruleFigure({ ...past, figures: { [key]: { ...(past.figures?.[key] as object), update_rule: "cpi-linked 1 jan" } } } as RuleRecord, key, today)?.stale?.cadence).toBe("yearly");
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
