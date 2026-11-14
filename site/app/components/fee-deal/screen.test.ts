// The fee page's columns and its reading as drawn, on the site's data read on 11.2026: a fee against its cap is one block, read from its
// row of the reading's law card, so the glance and the law card say the same and the open case and the toolbox say nothing of it; the
// fees' column with its slim fees, bands and the case open in place; the toolbox; and the reading's cards.
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { dealCases, feeDeal } from "../../copy";
import { fmt } from "../../lib/format";
import { feesData } from "../../lib/fees.server";
import { builder } from "../../lib/fee-deal/rows";
import { panel } from "../../lib/fee-deal/panel";
import { toolbox } from "../../lib/fee-deal/toolbox";
import { glance } from "../../lib/fee-deal/glance";
import { hasCases, typed, type FeeDeal } from "../../lib/fee-deal/model";
import type { ByKind } from "../../lib/fee-deal/offers/conditions";
import { readDealFor } from "../../lib/fee-deal/deal-read";
import { readingOf } from "../../lib/fee-deal/reading";
import { ProvenanceProvider } from "../provenance";
import { FeesColumn, feeGroup, paletteItems } from "./builder";
import { GlanceCard } from "./glance";
import { feeName } from "./words";
import { ToolboxColumn } from "./toolbox";
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

const toolboxOf = (deal: FeeDeal, feeId: string) => {
  const r = readDealFor(deal, data.kinds, TODAY);
  const fee = deal.fees.find((f) => f.id === feeId)!;
  return createElement(ToolboxColumn, {
    view: toolbox(r, feeId)!,
    fee,
    caseId: null,
    sheet: false,
    product: deal.kind,
    fill: null,
    line: null,
    folded: false,
    onFold: () => {},
    onAsk: () => {},
    onFee: () => {},
    onPart: () => {},
    onForm: () => {},
    onPending: () => {},
    onStopBy: () => {},
    onClose: () => {},
  });
};
const drawToolbox = (deal: FeeDeal, feeId: string) => text(toolboxOf(deal, feeId));

/** The fees' column, `chosen` open in place (its first case, where it has cases). */
const builderOf = (deal: FeeDeal, chosen: string | null, ask: ByKind | null = null) => {
  const r = readDealFor(deal, data.kinds, TODAY);
  const fee = deal.fees.find((f) => f.id === chosen);
  const caseId = fee && hasCases(fee) ? fee.cases[0]!.id : null;
  return createElement(FeesColumn, {
    deal,
    view: builder(r, null, chosen ? { fee: chosen, case: caseId } : null),
    groupOf: (f) => feeGroup(r, f, saves(deal)),
    open: { fee: chosen, case: caseId, view: chosen ? panel(r, chosen)!.open : null, menu: null, thing: null },
    toolbox: null,
    line: null,
    caseLine: null,
    focus: null,
    onFocused: () => {},
    onDeal: () => {},
    onAdd: () => {},
    actions: { onOpen: () => {}, onSlot: () => {}, onThing: () => {}, onRemoveCase: () => {}, onRemoveFee: () => {}, onRemoveBy: () => {}, drop: { accepts: () => false, onDrop: () => {} }, onRemoveChange: () => {}, onEditPrice: () => {}, pendingHands: { onDone: () => {}, fresh: () => false, onShown: () => {} }, onAskDone: () => {}, lift: { takes: () => false, why: () => null, onDrop: () => {}, binTakes: () => false, onBin: () => {}, binTakesItem: () => false, onBinItem: () => {}, onStretch: () => {}, phone: false } },
    ask: ask ? { kind: ask } : null,
    adding: "line",
  });
};
const drawBuilder = (deal: FeeDeal, chosen: string | null) => markup(builderOf(deal, chosen));

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
    const open = text(builderOf(deal, "fee-balance"));
    const tools = drawToolbox(deal, "fee-balance");
    for (const shown of [open, tools]) expect(shown).not.toContain("בתקרה");
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

describe("the case open in place", () => {
  it("draws each box once, its spoken name the fee's and the figure's, and chooses the price's currency in one place", () => {
    const html = markup(builderOf(account(), "fee-trade"));
    const name = feeName("trade");
    for (const field of [feeDeal.panel.howMuch, feeDeal.panel.min]) expect(count(html, `aria-label="${feeDeal.builder.fieldName(name, field)}"`)).toBe(1);
    expect(count(html, `>${feeDeal.builder.fieldName(name, feeDeal.panel.currency)}</label>`)).toBe(1);
    expect(text(builderOf(account(), "fee-trade"))).toContain(dealCases.chosen);
  });
  it("opens a price that changes with time as its prices in order, a divider with the change's month and its bin between them, and the slot that adds a change after them", () => {
    const d = provident();
    d.fees = [{ id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) }, until: "2027-06" }, { price: { form: "action", rate: { v: 0, blank: true } } }] }];
    const html = markup(builderOf(d, "fee-deposit"));
    expect(count(html, "data-change-divider")).toBe(1);
    expect(html).toContain(`aria-label="${feeDeal.builder.fieldName(feeName("deposit"), feeDeal.panel.change.month)}"`);
    expect(html).toContain(`aria-label="${feeDeal.builder.fieldName(`${feeName("deposit")}, 06.2027`, feeDeal.panel.change.remove)}"`);
    expect(text(builderOf(d, "fee-deposit"))).toContain(feeDeal.panel.change.add);
    expect(html).toMatch(/aria-label="[^"]*, 06\.2027[^"]*, כמה"[^>]*value=""|value=""[^>]*aria-label="[^"]*, כמה"/);
  });
  it("opens a sale priced apart under its own head, and says it at rest as a note", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25) } }], sale: [{ price: { form: "action", rate: typed(0.3) } }] }];
    expect(text(builderOf(d, null))).toContain(feeDeal.cases.parts.notes.sale!);
    expect(text(builderOf(d, "fee-trade"))).toContain(feeDeal.panel.salePrices);
  });
});

describe("the question that adds a thing to change by", () => {
  it("stands in the fee's block in the fees' column, in place, before its cases or its price, and never in the toolbox", () => {
    const d = account();
    // a fee with one price: the question above its parts, in its own open line
    const slim = markup(builderOf(d, "fee-trade", "what"));
    const q = feeDeal.cases.ask.what!;
    expect(slim).toContain(q);
    const block = slim.slice(slim.indexOf('data-fee="fee-trade"'));
    expect(block.indexOf(q)).toBeGreaterThan(-1);
    expect(block.indexOf(q)).toBeLessThan(block.indexOf('data-figure=""'));
    expect(slim).toContain("data-ask-thing");
    // another fee's block holds none, and the toolbox never draws it
    expect(slim.slice(slim.indexOf('data-fee="fee-fx"')).includes(q)).toBe(false);
    expect(drawToolbox(d, "fee-trade")).not.toContain(q);
    expect(markup(toolboxOf(d, "fee-trade"))).toContain('data-part="by:what"');
    // a fee with cases: the question before its band
    d.fees = [{ id: "fee-trade", kind: "trade", by: [{ kind: "what" }], cases: [{ id: "c1", when: [["tase"]], stages: [{ price: { form: "action", rate: typed(0.4) } }] }, { id: "c2", when: ["any"], stages: [{ price: { form: "action", rate: typed(0.1) } }] }] }];
    const banded = markup(builderOf(d, "fee-trade", "channel"));
    expect(banded.indexOf(feeDeal.cases.ask.channel!)).toBeLessThan(banded.indexOf(dealCases.changesBy));
  });
});

describe("the toolbox", () => {
  it("names the fee and offers the parts in their groups with the flat price among the price's; taking the fee away is not its", () => {
    const shown = drawToolbox(account(), "fee-trade");
    for (const g of ["price", "bound", "by", "link", "more"]) expect(shown).toContain(feeDeal.cases.groups[g]!);
    expect(shown).toContain(feeDeal.cases.parts.flatSmall.default!.trim());
    expect(shown).toContain(feeDeal.cases.actionSize.default!);
    expect(shown).toContain(feeDeal.cases.things.own!);
    expect(shown).toContain(dealCases.toolbox.hint);
    expect(shown).not.toContain(feeDeal.panel.remove);
  });
  it("takes a thing the fee changes by away on a second tap, named by what it does", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", by: [{ kind: "track" }], cases: [{ id: "c1", when: [["מסלול 1"]], stages: [{ price: { form: "action", rate: typed(0.4) } }] }] }];
    const html = markup(toolboxOf(d, "fee-trade"));
    const stop = feeDeal.cases.thingMenu.stop.replace("{thing}", feeDeal.cases.things.track!);
    expect(html).toMatch(new RegExp(`<button[^>]*data-part="by:track"[^>]*aria-label="${stop}"`));
    expect(html).not.toMatch(/<button[^>]*data-part="by:track"[^>]*disabled/);
  });
  it("words a conversion's parts and its size by the conversion, never by a purchase", () => {
    const shown = drawToolbox(account(), "fee-fx");
    expect(shown).toContain("מחיר קבוע להמרה קטנה, עד");
    expect(shown).toContain("גודל ההמרה");
    expect(shown).not.toContain("גודל הפעולה");
    expect(shown).not.toContain("לפעולה קטנה");
  });
  it("names a fee of the person's own once, in the heading typed in place, with its spoken name", () => {
    const d = account();
    d.fees = [{ id: "fee-own", kind: "own", name: "עמלת בדיקה", stages: [{ price: { form: "sum", amount: typed(10), every: 1 } }] }];
    const html = markup(toolboxOf(d, "fee-own"));
    expect(count(html, `value="עמלת בדיקה"`)).toBe(1);
    expect(count(html, `class="sr-only">${feeDeal.panel.ownName}</label>`)).toBe(1);
  });
});

describe("the fees' column", () => {
  it("draws a fee whose price changes by nothing as one line, its whole line the button that opens it, named by its fee", () => {
    const html = drawBuilder(account(), null);
    for (const f of account().fees) expect(count(html, `aria-label="${feeDeal.builder.open(feeName(f.kind))}"`)).toBe(1);
    expect(html).not.toContain(feeDeal.cases.changesBy);
  });
  it("groups the fees under the summary's headings, a group only where the deal has a fee in it", () => {
    const shown = drawBuilder(account(), null).replace(/<[^>]+>/g, "");
    // what is held is in dollars: the conversion stands with the trade fee
    for (const key of ["action:trade", "held", "account"]) expect(count(shown, feeDeal.on[key]!)).toBe(1);
    for (const key of ["action:conversion", "action:transfer_out", "action:none"]) expect(shown).not.toContain(feeDeal.on[key]!);
    expect(shown.indexOf(feeDeal.on.held!)).toBeLessThan(shown.indexOf(feeDeal.on.account!));
  });
  it("draws a fee whose price changes by two things, read as rows where it has no room, the person's own track open and every other case shown", () => {
    const d = account();
    d.fees = [
      {
        id: "fee-trade",
        kind: "trade",
        by: [{ kind: "what" }, { kind: "track" }],
        cases: [
          { id: "c1", when: [["tase"], "any"], stages: [{ price: { form: "action", rate: typed(0.4), min: typed(10) } }] },
          { id: "c2", when: [["us"], ["מסלול 1"]], mine: true, stages: [{ price: { form: "perUnit", amount: typed(0.03), currency: "USD", min: typed(8) } }] },
          { id: "c3", when: [["us"], ["מסלול 2"]], stages: [{ price: { form: "perUnit", amount: typed(0.02), currency: "USD" } }] },
        ],
      },
    ];
    const shown = text(builderOf(d, "fee-trade"));
    for (const w of [feeDeal.cases.changesBy, feeDeal.cases.things.what!, feeDeal.cases.things.track!, feeDeal.cases.values.what.tase!, feeDeal.cases.any.track!])
      expect(shown).toContain(w);
    // one value of what is bought split by the track: a table, a case added beside its heads, the fee's head holding no add of its own;
    // the open case ends with its own slot, a change of its price with time
    expect(count(drawBuilder(d, "fee-trade"), "data-add-slot=")).toBe(2);
    expect(text(builderOf(d, "fee-trade"))).toContain(feeDeal.panel.change.add);
    // the open case's actions, the open fee's bin and each thing's bin are icons, named by what they do
    const html = drawBuilder(d, "fee-trade");
    for (const w of [dealCases.copyCase, dealCases.removeCase, feeDeal.panel.remove, feeDeal.cases.thingMenu.stop.replace("{thing}", feeDeal.cases.things.what!), feeDeal.cases.thingMenu.stop.replace("{thing}", feeDeal.cases.things.track!)])
      expect(count(html, `aria-label="${w}"`), w).toBe(1);
    for (const w of [dealCases.copyCase, dealCases.removeCase, feeDeal.panel.remove]) expect(shown).not.toContain(w);
    // the person's track is the open case here, its rows' words said once in its slots; the other track is a case like any other, never
    // folded away for not being theirs
    expect(count(shown, "מסלול 1")).toBe(1);
    expect(count(shown, "מסלול 2")).toBe(1);
    // the fee open, each thing of its band's head is a slot that opens its menu; closed, the things are words
    const pills = (html: string) => count(html, 'aria-haspopup="dialog" aria-expanded="false"');
    const open = drawBuilder(d, "fee-trade");
    const closed = drawBuilder(d, null);
    expect(pills(open) - pills(closed)).toBe(2 + 2);
    expect(count(closed, `>${feeDeal.cases.things.what}</span>`)).toBe(1);
    // closed too, each thing has its bin, which takes it away without opening the fee
    for (const t of [feeDeal.cases.things.what!, feeDeal.cases.things.track!]) expect(count(closed, `aria-label="${feeDeal.cases.thingMenu.stop.replace("{thing}", t)}"`), t).toBe(1);
  });
  it("says each case's standing against the cap beside it, as a slim line's", () => {
    const d = provident();
    d.readFor = [{ by: "channel", is: "branch" }];
    d.fees = [
      {
        id: "fee-deposit",
        kind: "deposit",
        by: [{ kind: "channel" }],
        cases: [
          { id: "d1", when: [["branch"]], stages: [{ price: { form: "action", rate: typed(1) } }] },
          { id: "d2", when: [["direct"]], stages: [{ price: { form: "action", rate: typed(9) } }] },
        ],
      },
    ];
    const shown = text(builderOf(d, null));
    expect(count(shown, feeDeal.standing.shareShort.trim())).toBe(1);
    expect(shown).toContain(feeDeal.standing.tag.above);
  });
});

describe("what the reading states without computing", () => {
  it("says a third party's fee with no figure in the points, after the fee's name", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25), third: {} } }] }];
    expect(drawReading(d)).toContain(`${feeName("trade")}${feeDeal.price.sep}${feeDeal.cases.stated.third}`);
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
    expect(shown).toContain("לעמלות שבעסקה לא נמצאה תקרה בחוק");
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
  it("a whole sum a price list prints shows without cents, as the list writes it", () => {
    expect(markLabel(at(8, "usd", "sourced" as "entered"))).toBe("8 $");
    expect(markLabel(at(35, "usd", "sourced" as "entered"))).toBe("35 $");
    expect(markLabel(at(9.9, "nis", "sourced" as "entered"))).toBe("9.90 ₪");
  });
});

describe("a sum per action under a percent maximum", () => {
  it("says where the maximum gives way to the sum, in the words of a point where the price changes", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "perAction", amount: typed(11), cap: typed(2), currency: "USD" } }] }];
    expect(drawReading(d)).toContain(`ב־550 $ משתנה המחיר של ${feeName("trade")}.`);
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "perAction", amount: typed(11), currency: "USD" } }] }];
    expect(drawReading(d)).not.toContain("משתנה המחיר של");
  });
});

describe("a fee read across sizes", () => {
  it("names each step by its stretch in the glance, so its two prices never read alike, and says where the price changes", () => {
    const d = account();
    d.fees = [
      {
        id: "fee-fx",
        kind: "fx",
        by: [{ kind: "actionSize", unit: "ILS", tops: [typed(100)] }],
        cases: [
          { id: "c1", when: [0], stages: [{ price: { form: "action", rate: typed(0.1) } }] },
          { id: "c2", when: [1], stages: [{ price: { form: "action", rate: typed(0.2) } }] },
        ],
      },
    ];
    const name = feeName("fx");
    const shown = drawGlance(d);
    expect(shown).toContain(`${name}, עד 100 ₪`);
    expect(shown).toContain(`${name}, מעל 100 ₪`);
    expect(drawReading(d)).toContain(`ב־100 ₪ משתנה המחיר של ${name}.`);
  });
});

describe("the workbench's closed fees and the fees to add", () => {
  it("a closed fee with a later price reads its sequence on one line, in its card: the first price, the month the next starts, the next", () => {
    const html = markup(builderOf(account(), null));
    const card = html.slice(html.indexOf(feeName("fixed_period")));
    const shown = card.replace(/<[^>]+>/g, " ").replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\s+/g, " ");
    // the account fee: free, and from March 2027 10 ₪ a month
    const from = `${feeDeal.cases.parts.from.replace("־", "")}${fmt.date("2027-03")}`;
    expect(shown.indexOf(feeDeal.price.free)).toBeLessThan(shown.indexOf(from));
    expect(shown.indexOf(from)).toBeLessThan(shown.indexOf("10"));
    // the line says it all: no note of the change under or after the card
    expect(shown).not.toContain("מתחיל ב");
  });
  it("a rate a price list prints or the person typed shows with all its decimals", () => {
    const d = account();
    d.fees = [{ id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.0875) } }] }];
    expect(text(builderOf(d, null))).toContain("0.0875%");
  });
  it("the palette offers each fee the deal can still take, with the heading of what it is charged on", () => {
    const d = account();
    const r = readDealFor(d, data.kinds, TODAY);
    const items = paletteItems(builder(r), r, data.kinds.find((k) => k.id === d.kind)!, false);
    expect(items.map((x) => x.id)).not.toContain("trade");
    for (const it of items) expect(Object.values(feeDeal.on)).toContain(it.line);
    expect(items.find((x) => x.id === "transfer_out")?.line).toBe(feeDeal.on["action:transfer_out"]);
  });
});
