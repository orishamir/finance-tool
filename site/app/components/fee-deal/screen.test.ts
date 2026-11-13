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
import { FeesColumn, feeGroup } from "./builder";
import { GlanceCard } from "./glance";
import { feeName } from "./words";
import { PanelColumn } from "./panel";
import { markLabel, ReadingCards } from "./reading";

const data = feesData();
const TODAY = "2026-11-12";

const account = (): FeeDeal => ({
  id: "deal-a",
  name: "",
  kind: "brokerage-account",
  readFor: [{ by: "what", is: "us" }],
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
  const fee = deal.fees.find((f) => f.id === feeId)!;
  return createElement(PanelColumn, { panel: panel(r, feeId)!, fee, product: deal.kind, fill: null, line: null, onFee: () => {}, onRemove: () => {}, onRemoveStage: () => {}, onHoldOn: () => {}, onClose: () => {} });
};
const drawPanel = (deal: FeeDeal, feeId: string) => text(panelOf(deal, feeId));

const drawBuilder = (deal: FeeDeal, chosen: string | null) => {
  const r = readDealFor(deal, data.kinds, TODAY);
  return markup(
    createElement(FeesColumn, {
      deal,
      view: builder(r),
      groupOf: (fee) => feeGroup(r, fee, saves(deal)),
      chosen,
      panel: null,
      line: null,
      focus: null,
      onFocused: () => {},
      onDeal: () => {},
      onChoose: () => {},
      onAdd: () => {},
      onRemove: () => {},
    }),
  );
};

const drawGlance = (deal: FeeDeal) => {
  const r = readDealFor(deal, data.kinds, TODAY);
  return text(createElement(GlanceCard, { glance: glance(r), law: readingOf(r, data.fx).law, saved: saves(deal), names: (id: string) => id }));
};

const drawReading = (deal: FeeDeal) => text(createElement(ReadingCards, { reading: readingOf(readDealFor(deal, data.kinds, TODAY), data.fx), saved: saves(deal), fx: data.fx }));

const count = (hay: string, needle: string) => hay.split(needle).length - 1;

describe("a fee against its cap", () => {
  it("is tagged in the glance by the price of today, not by a price that has passed", () => {
    const shown = drawGlance(passedAbove());
    expect(shown).toContain(feeDeal.standing.tag.below);
    expect(shown).not.toContain(feeDeal.standing.tag.above);
  });
  it("carries the same tag of now in the glance, the builder and the law card, below the cap, never a later price's; the panel says nothing of the law", () => {
    const deal = provident();
    const builderText = drawBuilder(deal, null).replace(/<[^>]+>/g, "");
    for (const shown of [drawGlance(deal), drawReading(deal)]) {
      expect(shown).toContain(feeDeal.standing.tag.below);
      expect(shown).not.toContain("בתקרה ממרץ 2028");
    }
    expect(builderText).not.toContain("בתקרה מ");
    const panelText = drawPanel(deal, "fee-balance");
    expect(panelText).not.toContain("בתקרה");
    expect(panelText).not.toContain(feeDeal.standing.tag.below);
  });
});

describe("the glance", () => {
  it("names a fee whose price is not given yet, apart from the fees it reads", () => {
    const deal = provident();
    const blank: FeeDeal = { ...deal, fees: [deal.fees[0]!, { id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: { v: 0, blank: true } } }] }] };
    const shown = drawGlance(blank);
    expect(shown).toContain(`${feeName("deposit")}${feeDeal.price.sep}${feeDeal.builder.facts.noPrice}`);
    expect(drawGlance(deal)).not.toContain(feeDeal.builder.facts.noPrice);
  });
  it("leaves where a bound takes over or the sums on the account meet custody to the points, and keeps a group's rate", () => {
    const d = account();
    d.fees = [
      { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25), min: typed(15) } }] },
      { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2) } }] },
      { id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] },
      { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(10), every: 1 } }] },
    ];
    const shown = drawGlance(d);
    expect(shown).toContain(feeDeal.glance.together);
    expect(shown).not.toContain(feeDeal.marks.meet.before);
    // a bound's sentence, in the summary's old words or the points' ("עד פעולה של 6,000 ₪ המינימום קובע", "…, קובע בכל פעולה עד …")
    expect(shown).not.toContain("קובע");
    const reading = drawReading(d);
    expect(reading).toContain(feeDeal.marks.meet.before);
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
  it("says nothing of the law for a fee with no cap either, and draws no field twice", () => {
    const shown = drawPanel(account(), "fee-trade");
    expect(count(shown, feeDeal.standing.tag.none!)).toBe(0);
    expect(shown).not.toContain(feeDeal.builder.optional);
    expect(shown).toContain(feeDeal.panel.when);
    expect(shown).toContain(feeDeal.panel.remove);
    // each box once: the maximum's box is not drawn again for a phone, and the bounds' currency is chosen in one of them
    const html = markup(panelOf(account(), "fee-trade"));
    const name = feeName("trade");
    for (const field of [feeDeal.panel.howMuch, feeDeal.panel.min, feeDeal.panel.max]) expect(count(html, `aria-label="${feeDeal.builder.fieldName(name, field)}"`)).toBe(1);
    expect(count(html, `>${feeDeal.builder.fieldName(name, feeDeal.panel.currency)}</label>`)).toBe(1);
  });
  it("asks how long each price holds whatever its form, a free one too; a later price is headed by its month and can be taken away", () => {
    const d = provident();
    d.fees = [{ id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "free" } }] }];
    const free = drawPanel(d, "fee-deposit");
    expect(count(free, feeDeal.panel.when)).toBe(1);
    expect(free).toContain(feeDeal.panel.limited);
    expect(free).not.toContain(feeDeal.panel.removeStage);
    d.fees = [{ id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) }, until: "2027-06" }, { price: { form: "free" } }] }];
    const two = drawPanel(d, "fee-deposit");
    expect(count(two, feeDeal.panel.when)).toBe(2);
    expect(two).toContain("מיוני 2027");
    const html = markup(panelOf(d, "fee-deposit"));
    expect(count(html, `aria-label="${feeDeal.panel.removeStage}, `)).toBe(1);
    // the later price's fields say which price they are
    expect(html).toContain(`>${feeDeal.builder.fieldName(`${feeName("deposit")}, מיוני 2027`, feeDeal.panel.form)}</label>`);
  });
  it("names a fee of the person's own once, in the heading typed in place, with its spoken name", () => {
    const d = account();
    d.fees = [{ id: "fee-own", kind: "own", name: "עמלת בדיקה", stages: [{ price: { form: "sum", amount: typed(10), every: 1 } }] }];
    const html = markup(panelOf(d, "fee-own"));
    expect(count(html, `value="עמלת בדיקה"`)).toBe(1);
    // the label is spoken, not shown: the heading is the name
    expect(count(html, `class="sr-only">${feeDeal.panel.ownName}</label>`)).toBe(1);
  });
  it("draws a price not given yet as an empty box", () => {
    const d = provident();
    d.fees = [{ id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: { v: 0, blank: true } } }] }];
    const html = markup(panelOf(d, "fee-deposit"));
    expect(html).toMatch(/aria-label="[^"]*, כמה"[^>]*value=""|value=""[^>]*aria-label="[^"]*, כמה"/);
  });
});

describe("the fees' column", () => {
  it("names each card's bin by its fee", () => {
    const html = drawBuilder(account(), "fee-trade");
    for (const f of account().fees) expect(count(html, `aria-label="${feeDeal.builder.fieldName(feeName(f.kind), feeDeal.panel.remove)}"`)).toBe(1);
  });
  it("groups the fees under the summary's headings, a group only where the deal has a fee in it, and leaves a sale priced as a purchase unsaid", () => {
    const shown = drawBuilder(account(), null).replace(/<[^>]+>/g, "");
    // what is held is in dollars: the conversion stands with the trade fee
    for (const key of ["action:trade", "held", "account"]) expect(count(shown, feeDeal.on[key]!)).toBe(1);
    for (const key of ["action:conversion", "action:transfer_out", "action:none"]) expect(shown).not.toContain(feeDeal.on[key]!);
    expect(shown.indexOf(feeDeal.on.held!)).toBeLessThan(shown.indexOf(feeDeal.on.account!));
    expect(shown).not.toContain(feeDeal.panel.saleSame);
  });
  it("says a sale priced apart by its own line of figures alone, with no note", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25) } }], sale: [{ price: { form: "action", rate: typed(0.3) } }] }];
    const shown = drawBuilder(d, null).replace(/<[^>]+>/g, "");
    expect(shown).toContain(feeDeal.sides.sell);
    expect(shown).not.toContain(feeDeal.panel.saleApart);
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
  it("offers no switch where only one period has a curve, and names that period on the card's small line", () => {
    const html = markup(createElement(ReadingCards, { reading: readingOf(readDealFor(account(), data.kinds, TODAY), data.fx), saved: false, fx: data.fx }));
    // today both the sums and custody are free, from 03.2027 only the sums cost: no curve meets a mark until custody starts in 03.2028
    expect(html).not.toContain(`aria-label="${feeDeal.read.curves.choose}"`);
    expect(text(createElement(ReadingCards, { reading: readingOf(readDealFor(account(), data.kinds, TODAY), data.fx), saved: false, fx: data.fx }))).toContain("ממרץ 2028");
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

describe("a price per unit in the points and the cards", () => {
  /** Interactive Brokers, IBKR Pro Fixed, US: 0.005 $ a unit, at least 1 $, at most 1% of the action; its conversion free. */
  const ib = (): FeeDeal => ({
    ...account(),
    fees: [
      { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0) } }] },
      { id: "fee-trade", kind: "trade", stages: [{ price: { form: "perUnit", amount: typed(0.005), min: typed(1), cap: typed(1), currency: "USD" } }] },
    ],
  });
  it("says a minimum in units holds above the percent maximum's sum, so the two points agree", () => {
    const p = feeDeal.read.points;
    const decides = p.decides.replace("{noun}", "פעולה");
    const shown = drawReading(ib());
    expect(shown).toContain(decides + p.unitsFrom.above + "100");
    expect(shown).toContain(p.unitsFrom.upTo + "200 יחידות");
    expect(shown).not.toContain(decides + p.unitsUpTo + "200");
  });
  it("puts the trade fee's card before the conversion's in their group, whatever order the deal holds them in", () => {
    const shown = drawBuilder(ib(), null);
    expect(shown.indexOf(feeName("trade"))).toBeLessThan(shown.indexOf(feeName("fx")));
  });
});

describe("a sum on the page", () => {
  const at = (value: number, unit: string, state: "computed" | "entered", kind = "min", units?: true) => ({ kind, on: "action", amount: { value, unit, state, as_of: TODAY }, ...(units ? { units } : {}) }) as unknown as Parameters<typeof markLabel>[0];
  it("the site works out shows in whole units of its currency, under ten with its cents; one typed shows as typed", () => {
    expect(markLabel(at(3529.41, "usd", "computed"))).toBe("3,529 $");
    expect(markLabel(at(1250.5, "eur", "computed"))).toBe("1,251 €");
    expect(markLabel(at(3.2, "usd", "computed"))).toBe("3.20 $");
    expect(markLabel(at(7, "usd", "entered"))).toBe("7 $");
    expect(markLabel(at(7.5, "usd", "entered"))).toBe("7.50 $");
    expect(markLabel(at(2400.4, "nis", "computed"))).toBe("2,400 ₪");
  });
  it("a price per unit's bound shows its count of units, and a flat price's sum shows whole", () => {
    expect(markLabel(at(200, "count", "computed", "min", true))).toBe("200 יחידות");
    expect(markLabel(at(1, "count", "computed", "max", true))).toBe("יחידה אחת");
    expect(markLabel(at(50, "usd", "entered", "flat"))).toBe("50 $");
  });
});
