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
import { brokeragePart } from "../../lib/institutions.server";
import { leftOutOf } from "../../lib/left-out";
import { ProvenanceProvider } from "../provenance";
import { BrokerageGroupCard } from "../decoder/institutions/brokerage-card";
import { allFunds, pickOfHeadline } from "./pair";
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
  it("the receipt has no line under the account's lines saying what its price leaves out: the mark in the account's row says it", () => {
    const b = marked("leumi");
    const view = buildInvest({ bundle: b, index, plan });
    const out = html(createElement(PairReceipt, { view, bundle: b, plan, pick: { house: "leumi", fund }, chosen: true, layout: "ticket" }));
    expect(shown(out)).not.toContain(c.lead);
    expect(out).not.toContain("data-left-out=");
  });
  it("before the records say what can change a price, no account carries the mark", () => {
    const listsOut = lists(view0, bundle, plan, { house: "leumi", fund }, { chosen: true });
    if (bundle.snapshots.every((s) => !leftOutOf(s)?.changes.length)) {
      expect(listsOut).not.toContain(markLabel);
    }
  });
  it("an account whose record has something that can change its price carries a mark in its row, and no line under the list explains it", () => {
    const b = marked("interactive-brokers");
    const view = buildInvest({ bundle: b, index, plan });
    const out = lists(view, b, plan, { house: "leumi", fund }, { chosen: true });
    const row = out.slice(out.indexOf('data-pick-key="interactive-brokers"'));
    expect(row.slice(0, row.indexOf("data-pick-key=", 10))).toContain(markLabel);
    // one mark for each account in the list that prices a fund on the index and whose record marks something, and none on the others:
    // a row with no price has no price to change (One Zero, whose Israeli funds are unknown, BRK-38)
    const rows = [...new Set([...out.matchAll(/data-pick-key="([^"]+)"/g)].map((m) => m[1]!))];
    const pricesAny = (k: string) => allFunds(view).some((f) => "valueN" in (f.byHouse[k] ?? {}));
    const warned = rows.filter((k) => pricesAny(k) && (leftOutOf(b.snapshots.find((s) => s.id === k))?.changes.length ?? 0) > 0);
    expect(warned).toContain("interactive-brokers");
    expect(out.split(markLabel).length - 1).toBe(warned.length);
    expect(shown(out)).not.toContain("סמל המסמך");
  });
});

describe("a company's price card", () => {
  it("says under its prices what they leave out, as the indices page does", () => {
    const part = brokeragePart("interactive-brokers")!;
    expect(part.tariff.leftOut).toEqual(leftOutOf(bundle.snapshots.find((s) => s.id === "interactive-brokers")));
    const data = { rules: part.rules, terms: {}, dimensions: {}, today: bundle.today };
    const out = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: createElement(BrokerageGroupCard, { id: "interactive-brokers", tariff: part.tariff, kind: part.kind }) })));
    expect(shown(out)).toContain(c.lead);
    expect(out).toContain(`data-left-out="${part.tariff.leftOut!.changes.length}"`);
  });
});
