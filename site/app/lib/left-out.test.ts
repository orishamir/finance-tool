// What a house's documents hold and its price leaves out (D106): what the line and its sheet say, from a fixture record (the records gain
// `why_he` and `could_change_price` house by house), and that the record's English working note never reaches the reader.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { leftOut as c } from "../copy";
import { ProvenanceProvider } from "../components/provenance";
import { SheetContent } from "../components/provenance-sheets";
import { leftOutOf } from "./left-out";

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
    const v = leftOutOf({ tariff: pdf, left_out: [tiered, lite, quiet, noReason] })!;
    expect(v.warn).toBe(1);
    expect(v.other).toBe(3);
    expect(v.lead).toBe(c.sheetLead);
    expect(v.parts[0]).toEqual({ head: "מסלול Tiered", text: tiered.why_he, doc: { href: "https://example.org/tariff.pdf#page=7", title: c.page("תעריפון לדוגמה", 7) } });
    // the others: their names only, a quote drawn as gershayim, under the heading
    expect(v.parts.slice(1)).toEqual([
      { text: "מסלול IBKR Lite", group: c.other },
      { text: "נתוני שוק בארה״ב", group: c.other },
      { text: "החזר עמלות", group: c.other },
    ]);
    expect(JSON.stringify(v)).not.toContain("ENGLISH-WORKING-NOTE");
  });
  it("with nothing that can change a price, lists every name with no second heading, and says so in its lead", () => {
    const v = leftOutOf({ tariff: pdf, left_out: [lite, quiet] })!;
    expect(v.warn).toBe(0);
    expect(v.lead).toBe(c.sheetLeadOther);
    expect(v.parts.every((p) => p.group === "" && !p.head && !p.doc)).toBe(true);
  });
  it("a web page's price list opens at its address, with no page in its name", () => {
    const v = leftOutOf({ tariff: web, left_out: [tiered] })!;
    expect(v.parts[0]!.doc).toEqual({ href: "https://example.org/pricing", title: "Pricing page" });
  });
});

describe("the sheet the line opens", () => {
  const v = leftOutOf({ tariff: pdf, left_out: [tiered, lite, quiet] })!;
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
