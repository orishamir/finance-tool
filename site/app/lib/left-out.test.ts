// What a house's documents hold and its price leaves out (D106): what the line and its sheet say, from a fixture record (the records gain
// `why_he` and `could_change_price` house by house), and that the record's English working note never reaches the reader.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { leftOut as c } from "../copy";
import { ProvenanceProvider } from "../components/provenance";
import { SheetContent } from "../components/provenance-sheets";
import { LeftOutFold } from "../components/kit";
import { leftOutOf, sheetOf } from "./left-out";

/** The view of a record that lists something left out. */
const viewOf = (snap: Parameters<typeof leftOutOf>[0]) => {
  const v = leftOutOf(snap);
  if (!v) throw new Error("the record lists nothing left out");
  return v;
};

const pdf = { url: "https://example.org/tariff.pdf", title: "תעריפון לדוגמה (BRK-12)" };
const web = { url: "https://example.org/pricing", title: "Pricing page" };
const tiered = { what: "מסלול Tiered", page: 7, why: "ENGLISH-WORKING-NOTE", why_he: "מי שקונה הרבה משלם לפי מדרגות. האתר מחשב לפי המסלול הקבוע.", could_change_price: true };
const lite = { what: "מסלול IBKR Lite", why: "ENGLISH-WORKING-NOTE-2" };
const quiet = { what: "נתוני שוק בארה\"ב", why: "ENGLISH-WORKING-NOTE-3", why_he: "לא צריך אותם כדי לקנות.", could_change_price: false };
const noReason = { what: "החזר עמלות", why: "ENGLISH-WORKING-NOTE-4", could_change_price: true };

describe("what a record leaves out", () => {
  it("is nothing where the record lists nothing", () => {
    expect(leftOutOf({ tariff: pdf })).toBeNull();
    expect(leftOutOf({ tariff: pdf, left_out: [] })).toBeNull();
    expect(leftOutOf(undefined)).toBeNull();
  });
  it("warns only of what can change a price and has a reason in Hebrew; the rest are listed by name under a second heading", () => {
    const view = viewOf({ tariff: pdf, left_out: [tiered, lite, quiet, noReason] });
    expect(view.changes.length).toBe(1);
    expect(view.others.length).toBe(3);
    const v = sheetOf(view);
    expect(v.lead).toBe(c.sheetLead);
    expect(v.parts[0]).toEqual({ head: "מסלול Tiered", text: tiered.why_he, doc: { href: "https://example.org/tariff.pdf#page=7", title: c.page("תעריפון לדוגמה", 7) } });
    // the others: their names only, a quote drawn as gershayim, under the heading
    expect(v.parts.slice(1)).toEqual([
      { text: "מסלול IBKR Lite", group: c.other },
      { text: "נתוני שוק בארה״ב", group: c.other },
      { text: "החזר עמלות", group: c.other },
    ]);
    expect(JSON.stringify(view)).not.toContain("ENGLISH-WORKING-NOTE");
  });
  it("with nothing that can change a price, lists every name with no second heading, and says so in its lead", () => {
    const view = viewOf({ tariff: pdf, left_out: [lite, quiet] });
    expect(view.changes.length).toBe(0);
    const v = sheetOf(view);
    expect(v.lead).toBe(c.sheetLeadOther);
    expect(v.parts.every((p) => p.group === "" && !p.head && !p.doc)).toBe(true);
  });
  it("an entry that names its own document links that document at its page; one that names none links the price list", () => {
    const part1 = { url: "https://example.org/part-1.pdf", title: "תעריפון, חלק 1 (BRK-66)" };
    const exempt = { what: "חשבון צל", page: 1, why: "ENGLISH-WORKING-NOTE-5", why_he: "חשבון כזה פטור.", could_change_price: true, source: part1 };
    const docs = (left_out: (typeof exempt | typeof tiered)[]) => (sheetOf(viewOf({ tariff: pdf, left_out })).parts).map((p) => p.doc);
    expect(docs([exempt, tiered])).toEqual([
      { href: "https://example.org/part-1.pdf#page=1", title: c.page("תעריפון, חלק 1", 1) },
      { href: "https://example.org/tariff.pdf#page=7", title: c.page("תעריפון לדוגמה", 7) },
    ]);
    // a web page of its own, beside a PDF price list: its address, no page in its name
    expect(docs([{ ...exempt, page: 2, source: web }])).toEqual([{ href: "https://example.org/pricing", title: "Pricing page" }]);
  });
  it("names each thing by its short name where the record gives one, both what can change a price and the others", () => {
    const v = viewOf({ tariff: pdf, left_out: [{ ...tiered, name_he: "תמחור לפי מדרגות" }, { ...lite, name_he: "מסלול לני\"ע בחו\"ל" }, quiet] });
    expect(v.changes.map((x) => x.head)).toEqual(["תמחור לפי מדרגות"]);
    expect(v.others).toEqual(["מסלול לני״ע בחו״ל", "נתוני שוק בארה״ב"]);
  });
  it("a web page's price list opens at its address, with no page in its name", () => {
    const v = sheetOf(viewOf({ tariff: web, left_out: [tiered] }));
    expect(v.parts[0]!.doc).toEqual({ href: "https://example.org/pricing", title: "Pricing page" });
  });
});

describe("the sheet the line opens", () => {
  const v = sheetOf(viewOf({ tariff: pdf, left_out: [tiered, lite, quiet] }));
  const data = { rules: {}, terms: {}, dimensions: {}, today: "2026-11-12" };
  const out = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(SheetContent, { item: { kind: "terms", ids: [], name: c.title("בית"), lead: v.lead, parts: v.parts }, data, headId: "h", descId: "d" }) })));
  it("shows each warning's name, then its reason, then the price list at its page; then the second heading over a list of names", () => {
    const at = (s: string) => out.indexOf(s);
    expect(at(c.title("בית"))).toBeGreaterThanOrEqual(0);
    expect(at("מסלול Tiered")).toBeLessThan(at(tiered.why_he));
    expect(at(tiered.why_he)).toBeLessThan(at('href="https://example.org/tariff.pdf#page=7"'));
    expect(at('href="https://example.org/tariff.pdf#page=7"')).toBeLessThan(at(`>${c.other}</h3>`));
    expect(out).toMatch(/<ul[^>]*><li>מסלול IBKR Lite<\/li><li>נתוני שוק בארה״ב<\/li><\/ul>/);
    expect(out).not.toContain("ENGLISH-WORKING-NOTE");
  });
});

describe("the fold in a house's terms", () => {
  const view = viewOf({ tariff: pdf, left_out: [tiered, lite, quiet] });
  const draw = (v: typeof view, open: boolean) => renderToStaticMarkup(createElement(LeftOutFold, { view: v, defaultOpen: open }));
  const text = (html: string) => html.replace(/<[^>]+>/g, "");
  it("folded, is one line saying how many things can change the price, or, where none can, how many there are", () => {
    const out = draw(view, false);
    expect(out).toMatch(/^<details(?![^>]*\bopen\b)/);
    expect(text(out)).toContain(`${c.lead} ${c.canChange(1)}`);
    const none = draw({ changes: [], others: view.others }, false);
    expect(text(none)).toContain(`${c.lead} ${c.some(2)}`);
  });
  it("opened, gives each thing that can change the price under its name with its reason and document, then the rest by name in a fold of their own", () => {
    const out = draw(view, true);
    const at = (x: string) => out.indexOf(x);
    expect(out).toMatch(/^<details[^>]*\bopen\b/);
    expect(at("מסלול Tiered")).toBeLessThan(at(tiered.why_he));
    expect(at(tiered.why_he)).toBeLessThan(at('href="https://example.org/tariff.pdf#page=7"'));
    expect(at('href="https://example.org/tariff.pdf#page=7"')).toBeLessThan(at(c.otherCount(2)));
    expect(at(c.otherCount(2))).toBeLessThan(at("מסלול IBKR Lite"));
    // where nothing can change the price, the names stand at once, with no second fold
    const none = draw({ changes: [], others: view.others }, true);
    expect(text(none)).toContain("מסלול IBKR Lite");
    expect(none).not.toContain(c.otherCount(2));
  });
});
