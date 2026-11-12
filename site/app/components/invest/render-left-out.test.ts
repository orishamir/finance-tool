// What a house's documents hold and its price leaves out, beside its price (D106; the founder, 2026-11-12: "i would have expected some
// note about interactive brokers that says the tiered fee system is ignored"). Rendered on the collected data with a fixture record: the
// records gain `why_he` and `could_change_price` house by house, so a page must read well both before and after.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { leftOut as c } from "../../copy";
import { buildInvest, indexById } from "../../lib/invest";
import type { IndicesBundle } from "../../lib/providers";
import { brokeragePart, latestSnapshots } from "../../lib/institutions.server";
import { housesOf, leftOutData, leftOutOf } from "../../lib/left-out";
import { ProvenanceProvider } from "../provenance";
import { BrokerageGroupCard } from "../decoder/institutions/brokerage-card";
import { LeftOutLine } from "../kit";
import { pickOfHeadline } from "./pair";
import { PairReceipt } from "./receipt";
import { bundle, html, lists, plan, shown } from "./render-fixtures";

const WHY = "מי שקונה הרבה משלם לפי מדרגות. האתר מחשב לפי המסלול הקבוע.";
/** The collected data with one house's record marking its first left-out thing as one that can change the price, with its reason. */
const marked = (house: string): IndicesBundle => ({
  ...bundle,
  snapshots: bundle.snapshots.map((s) => (s.id === house && s.left_out?.length ? { ...s, left_out: s.left_out.map((e, i) => (i === 0 ? { ...e, why_he: WHY, could_change_price: true } : e)) } : s)),
});
const markLabel = `<span class="sr-only">${c.mark}</span>`;

describe("the indices page", () => {
  const index = indexById(bundle, "index-sp500")!;
  const view0 = buildInvest({ bundle, index, plan });
  const fund = pickOfHeadline(view0)!.fund;
  it("the receipt says under the chosen account's lines what its price leaves out, its words opening the sheet", () => {
    const b = marked("leumi");
    const view = buildInvest({ bundle: b, index, plan });
    const out = html(createElement(PairReceipt, { view, bundle: b, plan, pick: { house: "leumi", fund }, chosen: true }));
    // the record's own marked things count too, now that the records carry them
    const warn = leftOutOf(b.snapshots.find((s) => s.id === "leumi"))!.warn;
    expect(warn).toBeGreaterThan(0);
    expect(out).toContain(`data-left-out="${warn}"`);
    expect(shown(out)).toContain(`${c.lead} ${c.canChange(warn)}`);
    expect(out).toMatch(new RegExp(`class="term"[^>]*>${c.canChange(warn)}<`));
  });
  it("before the records say what can change a price, the line counts what the documents hold, and no account carries the mark", () => {
    const n = leftOutOf(bundle.snapshots.find((s) => s.id === "leumi"))!;
    const out = html(createElement(PairReceipt, { view: view0, bundle, plan, pick: { house: "leumi", fund }, chosen: true }));
    if (n.warn === 0) expect(shown(out)).toContain(`${c.lead} ${c.some(n.other)}`);
    const listsOut = lists(view0, bundle, plan, { house: "leumi", fund }, { chosen: true });
    if (bundle.snapshots.every((s) => !leftOutOf(s)?.warn)) {
      expect(listsOut).not.toContain(markLabel);
      expect(shown(listsOut)).not.toContain(c.markKey);
    }
  });
  it("an account whose record has something that can change its price carries a mark in its row, and the list says what the mark is", () => {
    const b = marked("interactive-brokers");
    const view = buildInvest({ bundle: b, index, plan });
    const out = lists(view, b, plan, { house: "leumi", fund }, { chosen: true });
    const row = out.slice(out.indexOf('data-pick-key="interactive-brokers"'));
    expect(row.slice(0, row.indexOf("data-pick-key=", 10))).toContain(markLabel);
    // one mark for each account in the list whose record marks something, and none on the others
    const rows = [...new Set([...out.matchAll(/data-pick-key="([^"]+)"/g)].map((m) => m[1]!))];
    const warned = rows.filter((k) => (leftOutOf(b.snapshots.find((s) => s.id === k))?.warn ?? 0) > 0);
    expect(warned).toContain("interactive-brokers");
    expect(out.split(markLabel).length - 1).toBe(warned.length);
    expect(shown(out)).toContain(c.markKey);
  });
});

describe("a company's price card", () => {
  it("says under its prices what they leave out, as the indices page does", () => {
    const part = brokeragePart("interactive-brokers")!;
    expect(part.tariff.leftOut).toEqual(leftOutOf(bundle.snapshots.find((s) => s.id === "interactive-brokers")));
    const data = { rules: part.rules, terms: {}, dimensions: {}, today: bundle.today };
    const out = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(BrokerageGroupCard, { id: "interactive-brokers", tariff: part.tariff, kind: part.kind }) })));
    expect(shown(out)).toContain(c.lead);
    expect(out).toContain(`data-left-out="${part.tariff.leftOut!.warn}"`);
  });
});

describe("the fees page", () => {
  const data = leftOutData(latestSnapshots());
  const leumi = bundle.snapshots.find((s) => s.id === "leumi")!;
  it("finds the house whose price list a fee line cites, by an address only that house's record names", () => {
    const line = (url: string) => ({ rate: { source: { url } } });
    expect(housesOf([line(leumi.tariff.url), line(leumi.tariff.url), { rate: null }], data).map((h) => h.house)).toEqual([leumi.provider.name_he]);
    // an address no record names, or several do, names no house
    expect(housesOf([line("https://example.org/nobody")], data)).toEqual([]);
    // Pepper prints Leumi's own price list: the address is Leumi's, the house it is part of
    expect(bundle.snapshots.find((s) => s.id === "pepper")?.tariff.url).toBe(leumi.tariff.url);
  });
  it("ships to the browser only the houses the page's prices cite", () => {
    expect(Object.keys(leftOutData(latestSnapshots(), new Set([leumi.tariff.url])).byHouse)).toEqual(["leumi"]);
  });
  it("under the fees, the line names the house it is about", () => {
    const h = housesOf([{ rate: { source: { url: leumi.tariff.url } } }], data)[0]!;
    const out = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, terms: {}, dimensions: {}, today: bundle.today }, children: createElement(LeftOutLine, { view: h.view, house: h.house, named: true }) })));
    expect(shown(out)).toContain(c.leadOf(h.house));
  });
});
