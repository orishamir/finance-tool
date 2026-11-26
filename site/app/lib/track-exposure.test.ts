import { describe, expect, it } from "vitest";
import type { ValueObject } from "@finance-tool/schema";
import { cmaAbout, company as copy } from "../copy";
import { compactHoldings, exposureShares, holdingsTemplate, shareFraction, shareText, type Holdings } from "./track-exposure";
import type { SiteValue } from "./value";

const amount = (value: number | null): ValueObject => ({
  value,
  unit: "nis_millions",
  source: { url: "https://data.gov.il/he/datasets/cma/gemelnet", title: "field", publisher: "CMA", strength: "primary" },
  checked: "2026-10-26",
  effective_from: "2026-09-01",
  effective_to: "2026-09-30",
  tax_year: null,
  update_rule: "market",
  rule_ids: ["CAT-24"],
  state: "sourced",
  notes: value === null ? "לא דווח." : "x",
});
const h = (assets: number | null, exposure: number | null, currency?: number | null): Holdings => ({
  total_assets: amount(assets),
  stock_market_exposure: amount(exposure),
  ...(currency !== undefined ? { foreign_currency_exposure: amount(currency) } : {}),
});

function shares(x: Holdings, list: Holdings[] = [x]) {
  const t = holdingsTemplate(list, "2026-09", "2026-10-26");
  return exposureShares(compactHoldings(x, t), t, "2026-09", "2026-10-26");
}

describe("F-87 and F-88 on the site", () => {
  it("computes both shares with their inputs (track 103, 2026-09)", () => {
    const s = shares(h(25706.14, 12378.07, 5156.92))!;
    expect(s.stock!.value as number).toBeCloseTo(48.152, 3);
    expect(s.stock!.computed_from?.formula).toBe("F-87");
    expect(Object.keys(s.stock!.computed_from!.inputs)).toEqual(["stock_market_exposure", "total_assets"]);
    expect(s.currency!.value as number).toBeCloseTo(20.061, 3);
    expect(s.currency!.computed_from?.formula).toBe("F-88");
    expect(Object.keys(s.currency!.computed_from!.inputs)).toEqual(["foreign_currency_exposure", "total_assets"]);
    expect(shareText(s.stock!)).toBe(shareText({ ...s.stock!, value: 48 }));
  });

  /** One track's stock and currency shares, by its amounts. */
  const stock = (assets: number | null, exposure: number | null) => shares(h(assets, exposure))?.stock;
  const ruleIds = (v: SiteValue | null | undefined) => v?.rulesUsed?.map((r) => r.id);

  it("a share names CAT-44 alone and has no note up to 100% (track 15256, 2026-10: 97.43%)", () => {
    const s = stock(699.8, 681.81);
    expect(s?.value as number).toBeCloseTo(97.43, 2);
    expect(ruleIds(s)).toEqual(["CAT-44"]);
    expect(s?.notes).toBeUndefined();
  });

  it("above 100% the share says why exposure can pass the assets", () => {
    const s = shares(h(100, 104, 104));
    expect(ruleIds(s?.stock)).toEqual(["CAT-44"]);
    expect(s?.stock?.notes).toBe(copy.stock.above100);
    expect(s?.currency?.notes).toBe(copy.stock.above100);
    expect(stock(100, 100)?.notes).toBeUndefined();
  });

  it("a share with no figure names no rule", () => {
    expect(ruleIds(stock(100, null))).toEqual([]);
    expect(ruleIds(stock(0, 0))).toEqual([]);
  });

  it("each amount's sheet says what it is and at which month's end", () => {
    const t = holdingsTemplate([h(699.8, 681.81, 10)], "2026-10", "2026-11-26");
    expect(t?.assets.about).toBe(cmaAbout.total_assets("אוקטובר 2026"));
    expect(t?.exposure.about).toBe(cmaAbout.stock_market_exposure("אוקטובר 2026"));
    expect(t?.currency?.about).toBe(cmaAbout.foreign_currency_exposure("אוקטובר 2026"));
    const inputs = stock(699.8, 681.81)?.computed_from?.inputs as Record<string, SiteValue> | undefined;
    expect(inputs?.total_assets?.about).toBe(cmaAbout.total_assets("ספטמבר 2026"));
  });

  it("a file without the currency amount gives the stock share alone", () => {
    const s = shares(h(100, 50))!;
    expect(s.stock!.value).toBe(50);
    expect(s.currency).toBeNull();
  });

  it("an amount not reported is a null share that says so, also against another track's template", () => {
    const missing = h(100, null, 3);
    const s = shares(missing, [h(10, 5, 1), missing])!;
    expect(s.stock!.value).toBeNull();
    expect(s.stock!.notes).toBe(copy.stock.noteMissing);
    expect(shareText(s.stock!)).toBe(copy.stock.missing);
    expect(s.currency!.value).toBeCloseTo(3, 9);
  });

  it("assets of 0 are not 'not reported'", () => {
    const s = shares(h(0, 0, 0))!;
    expect(shareText(s.stock!)).toBe(copy.stock.noAssets);
    expect(shareText(s.currency!)).toBe(copy.stock.noAssets);
  });

  it("a share under 1% keeps one decimal; zero reads as zero", () => {
    expect(shareText(shares(h(1000, 3))!.stock!)).not.toBe(shareText(shares(h(1000, 0))!.stock!));
  });

  it("a share's bar is full above 100% and empty without a figure", () => {
    expect(shareFraction(shares(h(100, 108.7))!.stock)).toBe(1);
    expect(shareFraction(shares(h(100, null))!.stock)).toBe(0);
    expect(shareFraction(null)).toBe(0);
  });

  it("no amounts at all: no value", () => {
    expect(shares(undefined as unknown as Holdings, [])).toBeNull();
  });
});
