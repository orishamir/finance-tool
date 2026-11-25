// What a house's documents hold and its price leaves out (D106; the founder, 2026-11-12: "i would have expected some note about
// interactive brokers that says the tiered fee system is ignored"): on the indices page in each ranked house's terms, which the file icon
// beside its name opens, and in the receipt's line that opens them; on a company's price card under its prices. Rendered on the collected
// data with a fixture record: the records gain `why_he` and `could_change_price` house by house, so a page must read well both before and
// after.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { invest, leftOut as c } from "../../copy";
import { buildInvest, hasKinds, indexById, knownIndices, type InvestView } from "../../lib/invest";
import { stretchOf } from "../../lib/stretch";
import { listFunds } from "../../lib/deal-account/tiles";
import type { IndicesBundle } from "../../lib/providers";
import { brokeragePart } from "../../lib/institutions.server";
import { leftOutOf } from "../../lib/left-out";
import { ProvenanceProvider } from "../provenance";
import { BrokerageGroupCard } from "../decoder/institutions/brokerage-card";
import { allFunds, pickOfHeadline } from "./pair";
import { PairReceipt } from "./receipt";
import { PairLists } from "./lists";
import { termsLeftOut } from "./deal-account";
import { bundle, html, inHost, plan, shown, t } from "./render-fixtures";

const WHY = "מי שקונה הרבה משלם לפי מדרגות. האתר מחשב לפי המסלול הקבוע.";
/** The collected data with one house's record marking its first left-out thing as one that can change the price, with its reason. */
const marked = (house: string): IndicesBundle => ({
  ...bundle,
  snapshots: bundle.snapshots.map((s) => (s.id === house && s.left_out?.length ? { ...s, left_out: s.left_out.map((e, i) => (i === 0 ? { ...e, why_he: WHY, could_change_price: true } : e)) } : s)),
});
const termsLabel = (short: string) => `aria-label="${invest.dealAccount.terms.title(short)}"`;

describe("the indices page", () => {
  const index = indexById(bundle, "index-sp500")!;
  const view0 = buildInvest({ bundle, index, plan });
  const fund = pickOfHeadline(view0)!.fund;
  it("every ranked house with a price list carries the button that opens its terms, and no other row does; the list says nothing of what a price leaves out", () => {
    const b = marked("interactive-brokers");
    let unranked = 0;
    for (const ref of knownIndices(b)) {
      const view = buildInvest({ bundle: b, index: ref, plan });
      const pick = pickOfHeadline(view);
      if (!pick) continue;
      const out = html(inHost(createElement(PairLists, { view, bundle: b, plan, livePlan: plan, today: t, pick, chosen: true, onPick: () => undefined, moved: null })));
      // the rows the list ranks: each account with a stretch over the funds of the pair's fund's kind
      const ranked = new Set(view.providers.filter((p) => stretchOf(listFunds(allFunds(view), pick.fund, hasKinds(view) && !!b.dollarRange), p.id)).map((p) => p.id));
      // the account list's rows (the fund list's rows carry their own keys)
      const rows = [...new Set([...out.matchAll(/data-pick-key="([^"]+)"/g)].map((m) => m[1]!))].filter((k) => view.providers.some((p) => p.id === k));
      unranked += rows.filter((k) => !ranked.has(k)).length;
      for (const k of rows) {
        const p = view.providers.find((x) => x.id === k)!;
        const row = out.slice(out.indexOf(`data-pick-key="${k}"`));
        const own = row.slice(0, row.indexOf("data-pick-key=", 10));
        const priceList = !p.custom && b.snapshots.some((s) => s.id === k);
        expect(own.includes(termsLabel(p.short)), `${ref.id} ${k}`).toBe(ranked.has(k) && priceList);
      }
      expect(shown(out), ref.id).not.toContain(c.lead);
    }
    // some index has a row the list does not rank
    expect(unranked).toBeGreaterThan(0);
  });
  it("the receipt's account part says, under its price list's line, how many things its price leaves out can change it, its words a button; with none it says nothing", () => {
    const b = marked("leumi");
    const view = buildInvest({ bundle: b, index, plan });
    const receipt = (bb: IndicesBundle, v: InvestView) => html(inHost(createElement(PairReceipt, { view: v, bundle: bb, plan, pick: { house: "leumi", fund }, chosen: true, layout: "ticket" })));
    const n = termsLeftOut(b.snapshots.find((s) => s.id === "leumi"), allFunds(view).find((f) => f.rec.id === fund)?.byHouse.leumi)!.changes.length;
    expect(n).toBeGreaterThan(0);
    const out = receipt(b, view);
    expect(shown(out)).toContain(`${c.lead} ${c.canChange(n)}`);
    expect(out).toMatch(new RegExp(`<button[^>]*>${c.canChange(n)}</button>`));
    expect(shown(out).indexOf(invest.chosen.collected)).toBeLessThan(shown(out).indexOf(c.lead));
    // a house whose terms say nothing can change its price: no line
    const quiet: IndicesBundle = { ...bundle, snapshots: bundle.snapshots.map((s) => (s.id === "leumi" ? { ...s, left_out: [], lines: s.lines.map(({ not_ranked: _, ...l }) => l) } : s)) };
    expect(shown(receipt(quiet, buildInvest({ bundle: quiet, index, plan })))).not.toContain(c.lead);
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
