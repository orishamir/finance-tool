// The fee page's columns and its reading as drawn, on the site's data read on 11.2026: a fee against its cap is one block, read from its
// row of the reading's law card, so the glance, the chosen fee's panel and the law card say the same; and the reading's cards.
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { feeDeal } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { panel } from "../../lib/fee-deal/builder";
import { glance } from "../../lib/fee-deal/glance";
import { typed, type FeeDeal } from "../../lib/fee-deal/model";
import { readDealFor } from "../../lib/fee-deal/parts";
import { readingOf } from "../../lib/fee-deal/reading";
import { ProvenanceProvider } from "../provenance";
import { GlanceColumn } from "./glance";
import { PanelColumn } from "./panel";
import { ReadingCards } from "./reading";

const data = feesData();
const TODAY = "2026-11-12";

const account = (): FeeDeal => ({
  id: "deal-a",
  name: "",
  kind: "brokerage-account",
  held: { place: "abroad", currency: "USD", payout: "accumulating" },
  fees: [
    { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25), min: typed(15) } }] },
    { id: "fee-custody", kind: "custody", stages: [{ price: { form: "free" }, until: "2028-03" }, { price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] },
    { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "free" }, until: "2027-03" }, { price: { form: "sum", amount: typed(10), every: 1 } }] },
    { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2) } }] },
    { id: "fee-fund", kind: "fund_management", stages: [{ price: { form: "held", rate: typed(0.07), per: 12, every: 12 } }] },
  ],
});

const provident = (): FeeDeal => ({
  id: "deal-p",
  name: "",
  kind: "kupat-gemel-lehashkaa",
  fees: [
    { id: "fee-balance", kind: "balance", stages: [{ price: { form: "held", rate: typed(0.6), per: 12, every: 1 }, until: "2028-03" }, { price: { form: "held", rate: typed(1.05), per: 12, every: 1 } }] },
    { id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) } }] },
  ],
});

/** A provident fund whose fee on the savings was 2% a year, above the cap, until 01.2026, and is 0.6% since. */
const passedAbove = (): FeeDeal => ({
  id: "deal-q",
  name: "",
  kind: "kupat-gemel-lehashkaa",
  fees: [{ id: "fee-balance", kind: "balance", stages: [{ price: { form: "held", rate: typed(2), per: 12, every: 12 }, until: "2026-01" }, { price: { form: "held", rate: typed(0.6), per: 12, every: 12 } }] }],
});

const text = (el: ReactElement) => {
  const provenance = { rules: {}, terms: {}, dimensions: {}, today: TODAY };
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: provenance, children: el })));
  return html.replace(/<[^>]+>/g, "").replace(/[⁦-⁩‎‏]/g, "");
};

const saves = (deal: FeeDeal) => deal.kind !== "brokerage-account";

const drawPanel = (deal: FeeDeal, feeId: string) => {
  const r = readDealFor(deal, data.kinds, TODAY);
  const reading = readingOf(r, data.fx);
  const fee = deal.fees.find((f) => f.id === feeId) ?? null;
  const law = reading.law.find((x) => x.fee === feeId) ?? null;
  return text(createElement(PanelColumn, { panel: panel(r, feeId), fee, law, first: reading.from, saved: saves(deal), onFee: () => {}, onRemove: () => {} }));
};

const drawGlance = (deal: FeeDeal) => {
  const r = readDealFor(deal, data.kinds, TODAY);
  return text(createElement(GlanceColumn, { glance: glance(r), law: readingOf(r, data.fx).law, saved: saves(deal), empty: deal.fees.length === 0, names: (id: string) => id }));
};

const drawReading = (deal: FeeDeal) => text(createElement(ReadingCards, { reading: readingOf(readDealFor(deal, data.kinds, TODAY), data.fx), saved: saves(deal), fx: data.fx }));

const count = (hay: string, needle: string) => hay.split(needle).length - 1;

describe("a fee against its cap", () => {
  it("is tagged in the panel by the price of today, not by a price that has passed", () => {
    const shown = drawPanel(passedAbove(), "fee-balance");
    expect(shown).toContain(feeDeal.panel.law);
    expect(shown).toContain(feeDeal.standing.tag.below);
    expect(shown).not.toContain(feeDeal.standing.tag.above);
    expect(shown).not.toContain(feeDeal.standing.above);
  });
  it("carries the same tag in the glance, the panel and the law card: at the cap from 03.2028", () => {
    const deal = provident();
    for (const shown of [drawGlance(deal), drawPanel(deal, "fee-balance"), drawReading(deal)]) expect(count(shown, "בתקרה ממרץ 2028")).toBe(1);
  });
});

describe("the glance", () => {
  it("says where the sums on the account and custody meet, where both hold throughout", () => {
    const d = account();
    d.fees = [
      { id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] },
      { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(10), every: 1 } }] },
    ];
    const shown = drawGlance(d);
    expect(shown).toContain(feeDeal.marks.meet.before);
    expect(shown).toContain(feeDeal.marks.meet.after);
  });
});

describe("the reading on screen", () => {
  it("reads the account: three periods, today's marked, the two curves, the points and that no fee has a cap", () => {
    const shown = drawReading(account());
    const r = feeDeal.read;
    expect(shown).toContain(r.periods.kicker);
    expect(shown).toContain("שתי עמלות מתחילות אחרי תקופת פטור");
    expect(shown).toContain(r.periods.here);
    expect(shown).toContain(r.curves.kicker.trade);
    expect(shown).toContain(r.curves.kicker.held);
    expect(shown).toContain(r.curves.conversion);
    expect(shown).toContain(r.points.title);
    // the sums on the account meet custody from 03.2028
    expect(shown).toContain(feeDeal.marks.meet.before);
    expect(shown).toContain("לעמלות שבעסקה אין תקרה בחוק");
  });
  it("reads the provident fund: two periods with the rise to the cap, no curve, the monthly charge, and the law rows", () => {
    const shown = drawReading(provident());
    expect(shown).toContain("עד התקרה");
    expect(shown).toContain("עמלה אחת מגיעה למקסימום שמותר לגבות");
    expect(shown).not.toContain(feeDeal.read.curves.kicker.held);
    // the fee on the savings is a yearly rate charged each month: the one point the library states
    expect(shown).toContain("נגבה כל חודש: חלק אחד מ־12 בכל פעם.");
  });
});
