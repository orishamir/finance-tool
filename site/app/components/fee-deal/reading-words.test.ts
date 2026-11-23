// The reading's words as drawn, on deals made for each case: what each sentence under a chart and on its card says, and where it says
// nothing because it would not be true. Each deal is typed here; the figures come from its prices and the site's rates.
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { feeDeal } from "../../copy";
import { feesData } from "../../lib/fees.server";
import { typed, type FeeDeal } from "../../lib/fee-deal/model";
import { readDealFor } from "../../lib/fee-deal/deal-read";
import { readingOf } from "../../lib/fee-deal/reading";
import { ProvenanceProvider } from "../provenance";
import { ReadingCards } from "./reading";
import { feeName } from "./words";

const data = feesData();
const TODAY = "2026-11-12";
const w = feeDeal.read;

const text = (el: ReactElement) =>
  renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data: { rules: {}, terms: {}, dimensions: {}, today: TODAY }, children: el })))
    .replace(/<[^>]+>/g, "")
    .replace(/[⁦-⁩‎‏]/g, "");
const deal = (fees: FeeDeal["fees"], extra: Partial<FeeDeal> = {}): FeeDeal => ({ id: "deal-x", name: "", kind: "brokerage-account", fees, ...extra });
const drawn = (d: FeeDeal, unitPrice: number | null = null) => text(createElement(ReadingCards, { reading: readingOf(readDealFor(d, data.kinds, TODAY), data.fx, unitPrice), saved: false, fx: data.fx }));
const held = (rate: number, extra = {}) => ({ price: { form: "held", rate: typed(rate), per: 12, every: 12, ...extra } }) as const;
const sum = (amount: number, extra = {}) => ({ price: { form: "sum", amount: typed(amount), every: 1, ...extra } }) as const;
const action = (rate: number, extra = {}) => ({ price: { form: "action", rate: typed(rate), ...extra } }) as const;

describe("an offset fee (§10.6, F-127)", () => {
  it("is said beside its fee under the holding chart in today's period, where it is charged, and the chart is not said to show a year without an action", () => {
    const shown = drawn(
      deal([
        { id: "fee-t", kind: "trade", stages: [action(0.1, { min: typed(5) })] },
        { id: "fee-f", kind: "fixed_period", stages: [sum(15, { offset: { kind: "trade" } })] },
        { id: "fee-c", kind: "custody", stages: [held(0.2)] },
      ] as FeeDeal["fees"]),
    );
    const holding = shown.slice(shown.indexOf(w.held.kicker));
    expect(holding).toContain(feeDeal.cases.stated.offset.tail);
    expect(shown).not.toContain("ולכן הגרף מראה שנה בלי");
  });
});

describe("a sale beside a purchase on one tab (F-112)", () => {
  const us = { readFor: [{ by: "what", is: "us" }] } as Partial<FeeDeal>;
  const trade = { id: "fee-t", kind: "trade", stages: [action(0.25, { min: typed(39), currency: "USD" })] } as FeeDeal["fees"][number];
  it("is said to cost the same where the conversion has no step: the sale converts what it sells as the purchase converts its cash", () => {
    expect(drawn(deal([trade, { id: "fee-x", kind: "fx", stages: [action(0.2)] }], us))).toContain(w.action.sameSale);
  });
  it("is not said to cost the same where the purchase's conversion is read in steps of what it buys", () => {
    const fx = {
      id: "fee-x",
      kind: "fx",
      by: [{ kind: "actionSize", unit: "USD", tops: [typed(10), typed(100)] }],
      cases: [
        { id: "x1", when: [0], stages: [{ price: { form: "free" } }] },
        { id: "x2", when: [1], stages: [action(0.085, { min: typed(3), currency: "USD" })] },
        { id: "x3", when: [2], stages: [action(0.17, { min: typed(6), currency: "USD" })] },
      ],
    } as FeeDeal["fees"][number];
    expect(drawn(deal([trade, fx], us))).not.toContain(w.action.sameSale);
  });
});

describe("a stretch the axis does not reach (F-112)", () => {
  it("is said in words under the chart, by the part that decides it", () => {
    const shown = drawn(
      deal([
        {
          id: "fee-t",
          kind: "trade",
          by: [{ kind: "actionSize", unit: "ILS", tops: [typed(50_000)] }],
          cases: [
            { id: "c0", when: [0], stages: [action(0.1, { flat: { amount: typed(4), upTo: typed(100) } })] },
            { id: "c1", when: [1], stages: [action(0.05)] },
          ],
        },
      ] as FeeDeal["fees"]),
    );
    expect(shown).toContain(`${w.action.under.upTo}100 ₪${w.action.under.sep}${w.action.part.flat}${w.action.why.sep}4 ₪${w.action.why.decides}${w.action.under.end}`);
  });
});

describe("a maximum in the headline, beside other fees", () => {
  it("on an action, names the fee whose maximum it is and what it stops at, not that the maximum decides the cost", () => {
    const shown = drawn(deal([{ id: "fee-t", kind: "trade", stages: [action(0.1, { max: typed(50) })] }, { id: "fee-x", kind: "fx", stages: [action(0.2)] }] as FeeDeal["fees"], { readFor: [{ by: "what", is: "us" }] }));
    expect(shown).toContain(`${w.action.max.before}50,000 ₪${w.action.max.of}${feeName("trade")}${w.action.max.stops}50 ₪`);
    expect(shown).not.toContain(w.action.max.after);
  });
  it("on holding, names the fee whose maximum or minimum it is, and keeps the short words where the chart has one fee", () => {
    const custody = { id: "fee-c", kind: "custody", stages: [held(0.1, { max: typed(1000) })] } as FeeDeal["fees"][number];
    const two = drawn(deal([custody, { id: "fee-m", kind: "fund_management", stages: [held(0.1)] }] as FeeDeal["fees"]));
    expect(two).not.toContain(w.held.mark.maxStart.after);
    expect(two).toContain(w.held.mark.maxStart.named.split("{name}")[1]!);
    expect(drawn(deal([custody]))).toContain(w.held.mark.maxStart.after);
  });
});
