// The fee page's columns and its reading as drawn, on the site's data read on 11.2026: a fee against its cap is one block, read from its
// row of the reading's law card, so the glance, the chosen fee's panel and the law card say the same; and the reading's cards.
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { feeDeal } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { builder, panel } from "../../lib/fee-deal/builder";
import { glance } from "../../lib/fee-deal/glance";
import { typed, type FeeDeal } from "../../lib/fee-deal/model";
import { readDealFor } from "../../lib/fee-deal/parts";
import { readingOf } from "../../lib/fee-deal/reading";
import { ProvenanceProvider } from "../provenance";
import { BuilderColumn } from "./builder";
import { GlanceColumn } from "./glance";
import { feeName } from "./words";
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

const markup = (el: ReactElement) => {
  const provenance = { rules: {}, terms: {}, dimensions: {}, today: TODAY };
  return renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: provenance, children: el })));
};
const text = (el: ReactElement) => markup(el).replace(/<[^>]+>/g, "").replace(/[⁦-⁩‎‏]/g, "");

const saves = (deal: FeeDeal) => deal.kind !== "brokerage-account";

const panelOf = (deal: FeeDeal, feeId: string) => {
  const r = readDealFor(deal, data.kinds, TODAY);
  const reading = readingOf(r, data.fx);
  const fee = deal.fees.find((f) => f.id === feeId)!;
  const law = reading.law.find((x) => x.fee === feeId) ?? null;
  return createElement(PanelColumn, { panel: panel(r, feeId)!, fee, product: deal.kind, law, first: reading.from, saved: saves(deal), fill: null, stageLine: null, onFee: () => {}, onRemove: () => {}, onRemoveStage: () => {} });
};
const drawPanel = (deal: FeeDeal, feeId: string) => text(panelOf(deal, feeId));

const drawBuilder = (deal: FeeDeal, chosen: string | null) =>
  markup(
    createElement(BuilderColumn, {
      deal,
      view: builder(readDealFor(deal, data.kinds, TODAY)),
      kinds: data.kinds,
      chosen,
      onPickTrack: null,
      left: null,
      line: null,
      focusFee: null,
      onFocused: () => {},
      onDeal: () => {},
      onChoose: () => {},
      onAdd: () => {},
      onRemove: () => {},
    }),
  );

const drawGlance = (deal: FeeDeal) => {
  const r = readDealFor(deal, data.kinds, TODAY);
  return text(createElement(GlanceColumn, { glance: glance(r), law: readingOf(r, data.fx).law, saved: saves(deal), names: (id: string) => id }));
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

describe("the glance's changes", () => {
  it("says a fee starts after its free time with a verb that agrees with its name", () => {
    const shown = drawGlance(account());
    expect(shown).toContain(`${feeDeal.glance.starts.mp}${feeName("fixed_period")}, `);
    expect(shown).not.toContain(`${feeName("fixed_period")}: `);
  });
  it("keeps the form that agrees with nothing for a fee the person named", () => {
    const d = account();
    d.fees = [{ id: "fee-own", kind: "own", name: "עמלת בדיקה", stages: [{ price: { form: "free" }, until: "2027-03" }, { price: { form: "sum", amount: typed(10), every: 1 } }] }];
    const shown = drawGlance(d);
    expect(shown).toContain("עמלת בדיקה: ");
    expect(shown).toContain(feeDeal.glance.instead);
  });
});

describe("the panel", () => {
  it("says a fee with no cap in one line, with no heading of its own, and no field twice", () => {
    const shown = drawPanel(account(), "fee-trade");
    expect(count(shown, feeDeal.standing.tag.none!)).toBe(1);
    expect(shown).not.toContain(feeDeal.bar.optional);
    expect(shown).toContain(feeDeal.panel.when);
    expect(shown).toContain(feeDeal.panel.remove);
    // each box once: the maximum's box is not drawn again for a phone, and the bounds' currency is chosen in one of them
    const html = markup(panelOf(account(), "fee-trade"));
    const name = feeName("trade");
    for (const field of [feeDeal.panel.howMuch, feeDeal.panel.min, feeDeal.panel.max]) expect(count(html, `aria-label="${feeDeal.builder.fieldName(name, field)}"`)).toBe(1);
    expect(count(html, `>${feeDeal.builder.fieldName(name, feeDeal.panel.currency)}</label>`)).toBe(1);
  });
  it("draws a price for a time as how long it holds, not as two stages", () => {
    const d = provident();
    d.fees = [{ id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) }, until: "2027-06" }, { price: { form: "free" } }] }];
    const shown = drawPanel(d, "fee-deposit");
    expect(shown).toContain(feeDeal.panel.limited);
    expect(shown).not.toContain(feeDeal.panel.stage.first);
  });
});

describe("the builder", () => {
  it("names each card's bin by its fee", () => {
    const html = drawBuilder(account(), "fee-trade");
    for (const f of account().fees) expect(count(html, `aria-label="${feeDeal.builder.fieldName(feeName(f.kind), feeDeal.panel.remove)}"`)).toBe(1);
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
    // past the minimum, a trade costs the group's rate: the trade fee's 0.25% and the conversion's 0.2%
    expect(shown).toContain(`${feeDeal.read.curves.head.minRate.lead}${feeDeal.read.curves.head.minRate.above.trade}${feeDeal.read.curves.head.minRate.cost}0.45%`);
    // one fee on the account is a sum per period: the headline names it
    expect(shown).toContain(`${feeDeal.nameForms.fixed_period!.the}${feeDeal.read.curves.head.meetOne.mp}`);
  });
  it("offers each period on the held curve's switch, the ones with no mark on the curve disabled, and opens on the first with one", () => {
    const html = markup(createElement(ReadingCards, { reading: readingOf(readDealFor(account(), data.kinds, TODAY), data.fx), saved: false, fx: data.fx }));
    const groups = html.split(`role="group" aria-label="${feeDeal.read.curves.choose}"`).slice(1);
    expect(groups).toHaveLength(1);
    const options = groups[0]!.slice(0, groups[0]!.indexOf("</div>")).split("<button").slice(1);
    // today both the sums and custody are free, from 03.2027 only the sums cost: no curve meets a mark until custody starts in 03.2028
    expect(options.map((o) => [o.includes(`disabled=""`), o.includes(`aria-pressed="true"`)])).toEqual([
      [true, false],
      [true, false],
      [false, true],
    ]);
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
