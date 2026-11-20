// The fee page's columns and its reading as drawn, on the site's data read on 11.2026: a fee against its cap is one block, read from its
// row of the reading's law card, so the glance and the law card say the same and the open case and the toolbox say nothing of it; the
// fees' column with its slim fees, bands and the case open in place; the toolbox; and the reading's cards.
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { dealCases, feeDeal } from "../../copy";
import { fmt, formatValue } from "../../lib/format";
import { feesData } from "../../lib/fees.server";
import { builder } from "../../lib/fee-deal/rows";
import { panel } from "../../lib/fee-deal/panel";
import { toolbox } from "../../lib/fee-deal/toolbox";
import { leftOut } from "../../lib/fee-deal/left-out";
import { hasCases, typed, type FeeDeal } from "../../lib/fee-deal/model";
import type { ByKind } from "../../lib/fee-deal/offers/conditions";
import { readDealFor } from "../../lib/fee-deal/deal-read";
import { readingOf } from "../../lib/fee-deal/reading";
import { ProvenanceProvider } from "../provenance";
import { FeesColumn, feeGroup, paletteItems } from "./builder";
import { LeftOutCard } from "./left-out";
import { feeName } from "./words";
import { ToolboxColumn } from "./toolbox";
import { ReadingCards } from "./reading";
import { sumDisplay, upToDisplay } from "./words";

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
    line: null,
    caseLine: null,
    focus: null,
    onFocused: () => {},
    onDeal: () => {},
    onAdd: () => {},
    actions: { onOpen: () => {}, onSlot: () => {}, onThing: () => {}, onRemoveCase: () => {}, onRemoveFee: () => {}, drop: { accepts: () => false, onDrop: () => {}, acceptsCases: () => false, onDropCases: () => {} }, onRemoveChange: () => {}, onEditPrice: () => {}, pendingHands: { onDone: () => {}, fresh: () => false, onShown: () => {} }, onAskDone: () => {}, lift: { takes: () => false, why: () => null, onDrop: () => {}, binTakes: () => false, onBin: () => {}, binTakesItem: () => false, onBinItem: () => {}, onStretch: () => {}, preview: () => {}, rowParts: () => [], onResult: () => undefined, phone: false } },
    ask: ask ? { kind: ask } : null,
    adding: "line",
  });
};
const drawBuilder = (deal: FeeDeal, chosen: string | null) => markup(builderOf(deal, chosen));

const drawLeftOut = (deal: FeeDeal) => text(createElement(LeftOutCard, { left: leftOut(readDealFor(deal, data.kinds, TODAY)), names: (id: string) => id }));

const drawReading = (deal: FeeDeal) => text(createElement(ReadingCards, { reading: readingOf(readDealFor(deal, data.kinds, TODAY), data.fx), saved: saves(deal), fx: data.fx }));

const count = (hay: string, needle: string) => hay.split(needle).length - 1;

describe("a fee against its cap", () => {
  it("is tagged in the reading's law card by the price of today, not by a price that has passed", () => {
    const shown = drawReading(passedAbove());
    expect(shown).toContain(feeDeal.standing.tag.below);
    expect(shown).not.toContain(feeDeal.standing.tag.above);
  });
  it("carries the same tag of now in the builder and the law card, below the cap, never a later price's; the panel says nothing of the law", () => {
    const deal = provident();
    const builderText = drawBuilder(deal, null).replace(/<[^>]+>/g, "");
    const shown = drawReading(deal);
    expect(shown).toContain(feeDeal.standing.tag.below);
    expect(shown).not.toContain("בתקרה ממרץ 2028");
    expect(builderText).not.toContain("בתקרה מ");
    const open = text(builderOf(deal, "fee-balance"));
    const tools = drawToolbox(deal, "fee-balance");
    for (const x of [open, tools]) expect(x).not.toContain("בתקרה");
  });
});

describe("the fees the reading leaves out", () => {
  it("names a fee whose price is not given yet, apart from the fees it reads", () => {
    const deal = provident();
    const blank: FeeDeal = { ...deal, fees: [deal.fees[0]!, { id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: { v: 0, blank: true } } }] }] };
    expect(drawLeftOut(blank)).toContain(`${feeName("deposit")}${feeDeal.price.sep}${feeDeal.builder.facts.noPrice}`);
    expect(drawLeftOut(deal)).not.toContain(feeDeal.builder.facts.noPrice);
  });
});

describe("the panels' headlines", () => {
  it("say where a minimum gives way to the rates on an action, and up to where the fixed sums cost more than every share", () => {
    const d = account();
    d.fees = [
      { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25), min: typed(15) } }] },
      { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0.2) } }] },
      { id: "fee-custody", kind: "custody", stages: [{ price: { form: "held", rate: typed(0.4), per: 12, every: 12 } }] },
      { id: "fee-fixed", kind: "fixed_period", stages: [{ price: { form: "sum", amount: typed(10), every: 1 } }] },
    ];
    const shown = drawReading(d);
    const r = feeDeal.read;
    // the minimum of 15 ₪ meets 0.25% at 6,000 ₪; above it a purchase costs 0.25% and 0.2%
    expect(shown).toContain(`${r.action.noun.trade}${r.action.below.f.small}6,000 ₪${r.action.below.f.more}0.45%${r.action.below.f.of}`);
    expect(shown).toContain(`${r.action.above.lead}${r.action.noun.trade}${r.action.above.costs}0.45%`);
    // 120 ₪ a year against 0.4% meet at 30,000 ₪
    expect(shown).toContain(`${r.held.cross.lead}30,000 ₪${r.held.cross.after}`);
  });
});

describe("what changes and when", () => {
  it("draws each price that changes from its old price to its new one", () => {
    const shown = drawReading(account());
    expect(shown).toContain(`${feeName("fixed_period")}${feeDeal.price.sep}${feeDeal.price.free}${feeDeal.read.timeline.arrow}`);
  });
  it("names a fee the person named by its name", () => {
    const d = account();
    d.fees = [...d.fees.slice(0, 1), { id: "fee-own", kind: "own", name: "עמלת בדיקה", stages: [{ price: { form: "free" }, until: "2027-03" }, { price: { form: "sum", amount: typed(10), every: 1 } }] }];
    expect(drawReading(d)).toContain(`עמלת בדיקה${feeDeal.price.sep}${feeDeal.price.free}${feeDeal.read.timeline.arrow}`);
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
  it("opens a price that changes with time as its prices in order, a divider with the change's month and its bin between them, and no slot that adds a change after them", () => {
    const d = provident();
    d.fees = [{ id: "fee-deposit", kind: "deposit", stages: [{ price: { form: "action", rate: typed(1) }, until: "2027-06" }, { price: { form: "action", rate: { v: 0, blank: true } } }] }];
    const html = markup(builderOf(d, "fee-deposit"));
    expect(count(html, "data-change-divider")).toBe(1);
    expect(html).toContain(`aria-label="${feeDeal.builder.fieldName(feeName("deposit"), feeDeal.panel.change.month)}"`);
    expect(html).toContain(`aria-label="${feeDeal.builder.fieldName(`${feeName("deposit")}, 06.2027`, feeDeal.panel.change.remove)}"`);
    expect(html).not.toContain("data-add-change");
    expect(html).toMatch(/aria-label="[^"]*, 06\.2027[^"]*, כמה"[^>]*value=""|value=""[^>]*aria-label="[^"]*, כמה"/);
  });
  it("opens a sale priced apart under its own head with its bin, never as a part of the purchase, and says its price at rest", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25) } }], sale: [{ price: { form: "action", rate: typed(0.3) } }] }];
    expect(text(builderOf(d, null))).toContain(`${feeDeal.cases.buySaid.trim()}0.25%`);
    expect(text(builderOf(d, null))).toContain(`${feeDeal.cases.saleSaid}0.3% לכל פעולה`);
    const open = text(builderOf(d, "fee-trade"));
    expect(open).toContain(feeDeal.panel.salePrices);
    expect(open).toContain(feeDeal.panel.buyPrices);
    expect(open).not.toContain(feeDeal.cases.parts.notes.sale!);
    expect(markup(builderOf(d, "fee-trade"))).toContain(`aria-label="${feeDeal.panel.saleRemove}"`);
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
    d.fees = [{ id: "fee-trade", kind: "trade", by: [{ kind: "what", values: [] }], cases: [{ id: "c1", when: [["tase"]], stages: [{ price: { form: "action", rate: typed(0.4) } }] }, { id: "c2", when: ["any"], stages: [{ price: { form: "action", rate: typed(0.1) } }] }] }];
    const banded = markup(builderOf(d, "fee-trade", "channel"));
    expect(banded.indexOf(feeDeal.cases.ask.channel!)).toBeLessThan(banded.indexOf(dealCases.changesBy));
  });
});

describe("the toolbox", () => {
  it("names the fee and offers the parts in their five groups, a small action's flat price not among them; taking the fee away is not its", () => {
    const shown = drawToolbox(account(), "fee-trade");
    for (const g of ["charge", "off", "bound", "by", "rule"]) expect(shown).toContain(feeDeal.cases.groups[g]!);
    // a small action's own price is the first size of the action, not a card of its own
    expect(markup(toolboxOf(account(), "fee-trade"))).not.toContain('data-part="flat"');
    expect(shown).toContain(feeDeal.cases.byRows.what);
    expect(shown).toContain(feeDeal.cases.byRows.size);
    expect(shown).toContain(feeDeal.cases.actionSize.default!);
    expect(shown).toContain(feeDeal.cases.things.own!);
    expect(shown).toContain(dealCases.toolbox.hint);
    expect(shown).not.toContain(feeDeal.panel.remove);
  });
  it("takes a thing the fee changes by away on a second tap, named by what it does", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", by: [{ kind: "track", values: [] }], cases: [{ id: "c1", when: [["מסלול 1"]], stages: [{ price: { form: "action", rate: typed(0.4) } }] }] }];
    const html = markup(toolboxOf(d, "fee-trade"));
    const stop = feeDeal.cases.thingMenu.stop.replace("{thing}", feeDeal.cases.things.track!);
    expect(html).toMatch(new RegExp(`<button[^>]*data-part="by:track"[^>]*aria-label="${stop}"`));
    expect(html).not.toMatch(/<button[^>]*data-part="by:track"[^>]*disabled/);
  });
  it("words a conversion's parts and its size by the conversion, never by a purchase", () => {
    const shown = drawToolbox(account(), "fee-fx");
    // a sum on each conversion is one of its forms, which a small conversion's flat price is filled as (fold-flat.ts)
    expect(markup(toolboxOf(account(), "fee-fx"))).toContain('data-part="perAction"');
    expect(shown).toContain(feeDeal.price.perAction.fx!);
    expect(shown).toContain("גודל ההמרה");
    expect(shown).not.toContain("גודל הפעולה");
    expect(shown).not.toContain("לפעולה");
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
        by: [{ kind: "what", values: [] }, { kind: "track", values: [] }],
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
    // the open case ends with no slot of its own (a change of its price with time is the toolbox's line)
    expect(count(drawBuilder(d, "fee-trade"), "data-add-slot=")).toBe(1);
    // the open case's actions and the open fee's bin are icons, named by what they do; no bin stands beside a thing
    const html = drawBuilder(d, "fee-trade");
    for (const w of [dealCases.copyCase, dealCases.removeCase, feeDeal.panel.remove]) expect(count(html, `aria-label="${w}"`), w).toBe(1);
    for (const t of [feeDeal.cases.things.what!, feeDeal.cases.things.track!]) expect(count(html, `aria-label="${feeDeal.cases.thingMenu.stop.replace("{thing}", t)}"`), t).toBe(0);
    for (const w of [dealCases.copyCase, dealCases.removeCase, feeDeal.panel.remove]) expect(shown).not.toContain(w);
    // the person's track is the open case here, its rows' words said once in its slots; the other track is a case like any other, never
    // folded away for not being theirs
    expect(count(shown, "מסלול 1")).toBe(1);
    expect(count(shown, "מסלול 2")).toBe(1);
    // open or closed, each thing of its band's head is a pill that opens its menu, where it is taken away; the open fee adds its case's slots
    const pills = (html: string) => count(html, 'aria-haspopup="dialog" aria-expanded="false"');
    const open = drawBuilder(d, "fee-trade");
    const closed = drawBuilder(d, null);
    expect(pills(open) - pills(closed)).toBe(2);
    expect(count(closed, "data-thing=")).toBe(2);
    for (const t of [feeDeal.cases.things.what!, feeDeal.cases.things.track!]) expect(count(closed, `aria-label="${feeDeal.cases.thingMenu.stop.replace("{thing}", t)}"`), t).toBe(0);
  });
  it("says each case's standing against the cap beside it, as a slim line's", () => {
    const d = provident();
    d.readFor = [{ by: "channel", is: "branch" }];
    d.fees = [
      {
        id: "fee-deposit",
        kind: "deposit",
        by: [{ kind: "channel", values: [] }],
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
  it("says a third party's fee with no figure under the action's chart, after the fee's name", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25), min: typed(15), third: {} } }] }];
    expect(drawReading(d)).toContain(`${feeName("trade")}${feeDeal.price.sep}${feeDeal.cases.stated.third}`);
  });
});

describe("the reading on screen", () => {
  it("reads the account: what an action costs, what holding costs, what changes and when, and that no fee has a cap", () => {
    const shown = drawReading(account());
    const r = feeDeal.read;
    expect(shown).toContain(r.action.kicker);
    expect(shown).toContain(r.held.kicker);
    expect(shown).toContain(r.timeline.kicker);
    expect(shown).toContain("שתי עמלות מתחילות אחרי תקופת פטור");
    expect(shown).toContain(r.periods.here);
    expect(shown).toContain("לעמלות שבעסקה לא נמצאה תקרה בחוק");
    // past the minimum, a trade costs the group's rate: the trade fee's 0.25% and the conversion's 0.2%
    expect(shown).toContain(`${r.action.above.costs}0.45%`);
  });
  it("offers the holding chart a tab per run of periods whose prices differ", () => {
    const html = markup(createElement(ReadingCards, { reading: readingOf(readDealFor(account(), data.kinds, TODAY), data.fx), saved: false, fx: data.fx }));
    expect(html).toContain(`aria-label="${feeDeal.read.held.periodsName}"`);
  });
  it("reads the provident fund: two periods with the rise to the cap, and the law rows", () => {
    const shown = drawReading(provident());
    expect(shown).toContain("עד התקרה");
    expect(shown).toContain("עמלה אחת מגיעה למקסימום שמותר לגבות");
  });
});

describe("a price per unit", () => {
  /** Interactive Brokers, IBKR Pro Fixed, US: 0.005 $ a unit, at least 1 $, at most 1% of the action; its conversion free. */
  const ib = (): FeeDeal => ({
    ...account(),
    fees: [
      { id: "fee-fx", kind: "fx", stages: [{ price: { form: "action", rate: typed(0) } }] },
      { id: "fee-trade", kind: "trade", stages: [{ price: { form: "perUnit", amount: typed(0.005), min: typed(1), cap: typed(1), currency: "USD" } }] },
    ],
  });
  it("asks the unit's price beside the chart, which waits for it", () => {
    const shown = drawReading(ib());
    expect(shown).toContain(feeDeal.read.chart.unitPrice);
    expect(shown).toContain(feeDeal.read.chart.unitWhy.replace("{name}", feeName("trade")));
  });
  it("puts the trade fee's card before the conversion's in their group, whatever order the deal holds them in", () => {
    const shown = drawBuilder(ib(), null);
    expect(shown.indexOf(feeName("trade"))).toBeLessThan(shown.indexOf(feeName("fx")));
  });
});

describe("a sum on the page", () => {
  const v = (value: number, unit: string, state: "computed" | "entered" | "sourced") => ({ value, unit, state, as_of: TODAY }) as unknown as Parameters<typeof sumDisplay>[0];
  const shown = (x: ReturnType<typeof v>) => sumDisplay(x)?.(x.value as number);
  it("the site works out shows in whole units of its currency, under ten with its cents; one typed shows as typed", () => {
    expect(shown(v(3529.41, "usd", "computed"))).toBe("3,529 $");
    expect(shown(v(1250.5, "eur", "computed"))).toBe("1,251 €");
    expect(shown(v(3.2, "usd", "computed"))).toBe("3.20 $");
    expect(shown(v(7, "usd", "entered"))).toBe("7 $");
    expect(shown(v(7.5, "usd", "entered"))).toBe("7.50 $");
    expect(shown(v(2400.4, "nis", "computed"))).toBe("2,400 ₪");
  });
  it("a flat price's sum shows whole, and a whole sum a price list prints shows without cents, as the list writes it", () => {
    const upTo = (x: ReturnType<typeof v>) => upToDisplay(x)(x.value as number) ?? formatValue(x.value as number, x.unit, x.state);
    expect(upTo(v(50, "usd", "entered"))).toBe("50 $");
    expect(upTo(v(8, "usd", "sourced"))).toBe("8 $");
    expect(upTo(v(35, "usd", "sourced"))).toBe("35 $");
    expect(upTo(v(9.9, "nis", "sourced"))).toBe("9.90 ₪");
  });
});

describe("a sum per action under a percent maximum", () => {
  it("marks where the maximum gives way to the sum, and draws one number where nothing varies", () => {
    const d = account();
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "perAction", amount: typed(11), cap: typed(2), currency: "USD" } }] }];
    expect(drawReading(d)).toContain("550 $");
    d.fees = [{ id: "fee-trade", kind: "trade", stages: [{ price: { form: "perAction", amount: typed(11), currency: "USD" } }] }];
    expect(drawReading(d)).not.toContain("550 $");
  });
});

describe("a fee read across sizes", () => {
  it("draws its steps as the parts of one lane, with a mark where the price changes", () => {
    const d = account();
    d.fees = [
      { id: "fee-trade", kind: "trade", stages: [{ price: { form: "action", rate: typed(0.25), min: typed(15) } }] },
      {
        id: "fee-fx",
        kind: "fx",
        by: [{ kind: "actionSize", unit: "ILS", tops: [typed(100_000)] }],
        cases: [
          { id: "c1", when: [0], stages: [{ price: { form: "action", rate: typed(0.1) } }] },
          { id: "c2", when: [1], stages: [{ price: { form: "action", rate: typed(0.2) } }] },
        ],
      },
    ];
    const shown = drawReading(d);
    expect(count(shown, feeName("fx"))).toBeGreaterThan(0);
    expect(shown).toContain("0.1%");
    expect(shown).toContain("0.2%");
    expect(shown).toContain("100,000 ₪");
  });
});

describe("the workbench's closed fees and the fees to add", () => {
  it("a closed fee with a later price reads its sequence in its card: the first price, the line with the month the next starts, the next", () => {
    const html = markup(builderOf(account(), null));
    const card = html.slice(html.indexOf(feeName("fixed_period")));
    const shown = card.replace(/<[^>]+>/g, " ").replace(/[\u2066-\u2069\u200e\u200f]/g, "").replace(/\s+/g, " ");
    // the account fee: free, and from March 2027 10 ₪ a month
    const from = `${feeDeal.cases.parts.from.replace("־", "")}${fmt.date("2027-03")}`;
    expect(count(card, "data-when-rule")).toBeGreaterThan(0);
    expect(shown).not.toContain(`ו${from}`);
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
