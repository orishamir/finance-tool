// What a house's documents hold and its price leaves out (D106; the founder, 2026-11-12: "i would have expected some note about
// interactive brokers that says the tiered fee system is ignored"): on the indices page in each ranked house's terms, which the file icon
// beside its name, and the same icon in the receipt's account part, open; on a company's price card under its prices. Rendered on the collected
// data with a fixture record: the records gain `why_he` and `could_change_price` house by house, so a page must read well both before and
// after.
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { invest, leftOut as c } from "../../copy";
import { buildInvest, hasKinds, indexById, knownIndices } from "../../lib/invest";
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
import { bundle, html, inHost, plan, shown, t } from "./render-fixtures";
import { feesData } from "../../lib/fees.server";
import { dealFromTemplate } from "../../lib/fee-deal/templates";
import { newDeal } from "../../lib/fee-deal/model";
import { ACCOUNT_KIND } from "../../lib/fee-deal/kinds";
import { startsDeal } from "../../lib/providers";

const WHY = "מי שקונה הרבה משלם לפי מדרגות. האתר מחשב לפי המסלול הקבוע.";
/** The collected data with one house's record marking its first left-out thing as one that can change the price, with its reason. */
const marked = (house: string): IndicesBundle => ({
  ...bundle,
  snapshots: bundle.snapshots.map((s) => (s.id === house && s.left_out?.length ? { ...s, left_out: s.left_out.map((e, i) => (i === 0 ? { ...e, why_he: WHY, could_change_price: true } : e)) } : s)),
});
const termsLabel = (short: string) => `aria-label="${invest.dealAccount.terms.title(short)}"`;
const fees = feesData();
/** Whether house `id`'s latest price list fills a deal, as the terms are filled. */
const fills = (id: string) => dealFromTemplate(newDeal(ACCOUNT_KIND), `house:${id}`, fees, t) !== null;

describe("the indices page", () => {
  const index = indexById(bundle, "index-sp500")!;
  const view0 = buildInvest({ bundle, index, plan });
  const fund = pickOfHeadline(view0)!.fund;
  it("a house's terms are offered where its latest price list fills a deal, and nowhere else (`startsDeal`)", () => {
    for (const s of bundle.snapshots) expect(startsDeal(s), s.id).toBe(fills(s.id));
    // some house has a price list that fills no deal
    expect(bundle.snapshots.some((s) => !fills(s.id))).toBe(true);
  });
  it("every ranked house whose price list fills a deal carries the button that opens its terms, and no other row does; the list says nothing of what a price leaves out", () => {
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
      for (const p of view.providers.filter((x) => rows.includes(x.id))) {
        const row = out.slice(out.indexOf(`data-pick-key="${p.id}"`));
        const own = row.slice(0, row.indexOf("data-pick-key=", 10));
        expect(own.includes(termsLabel(p.short)), `${ref.id} ${p.id}`).toBe(ranked.has(p.id) && !p.custom && fills(p.id));
      }
      expect(shown(out), ref.id).not.toContain(c.lead);
    }
    // some index has a row the list does not rank
    expect(unranked).toBeGreaterThan(0);
  });
  it("the receipt's account part carries the list's file icon, opening the house's terms, in place of its price list's line and of any line of what its price leaves out", () => {
    const b = marked("leumi");
    const view = buildInvest({ bundle: b, index, plan });
    const out = html(inHost(createElement(PairReceipt, { view, bundle: b, plan, pick: { house: "leumi", fund }, chosen: true, layout: "ticket" })));
    const short = view.providers.find((p) => p.id === "leumi")?.short ?? "leumi";
    expect(out).toContain(`aria-label="${invest.dealAccount.terms.title(short)}"`);
    expect(shown(out)).not.toContain(invest.chosen.collected);
    expect(shown(out)).not.toContain(c.lead);
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
