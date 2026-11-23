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
