import { describe, expect, it } from "vitest";
import type { ValueObject } from "@finance-tool/schema";
import { company as copy } from "../copy";
import { compactHoldings, holdingsTemplate, stockShare, stockShareText, type Holdings } from "./track-exposure";

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
const h = (assets: number | null, exposure: number | null): Holdings => ({ total_assets: amount(assets), stock_market_exposure: amount(exposure) });

function share(x: Holdings, list: Holdings[] = [x]) {
  const t = holdingsTemplate(list, "2026-09", "2026-10-26");
  return stockShare(compactHoldings(x, t), t, "2026-09", "2026-10-26");
}

describe("F-87 on the site", () => {
  it("computes the share with both inputs and the note on the measure", () => {
    const v = share(h(25706.14, 12378.07))!;
    expect(v.state).toBe("computed");
    expect(v.value as number).toBeCloseTo(48.152, 3);
    expect(v.computed_from?.formula).toBe("F-87");
    expect(Object.keys(v.computed_from!.inputs)).toEqual(["stock_market_exposure", "total_assets"]);
    expect(v.notes).toBe(copy.stock.note);
    expect(stockShareText(v)).toBe(stockShareText({ ...v, value: 48 }));
  });

  it("an amount not reported is a null share that says so, also against another track's template", () => {
    const missing = h(100, null);
    const v = share(missing, [h(10, 5), missing])!;
    expect(v.value).toBeNull();
    expect(v.notes).toBe(copy.stock.noteMissing);
    expect(stockShareText(v)).toBe(copy.stock.missing);
  });

  it("assets of 0 are not 'not reported'", () => {
    const v = share(h(0, 0))!;
    expect(v.value).toBeNull();
    expect(stockShareText(v)).toBe(copy.stock.noAssets);
  });

  it("a share under 1% keeps one decimal; zero reads as zero", () => {
    expect(stockShareText(share(h(1000, 3))!)).not.toBe(stockShareText(share(h(1000, 0))!));
  });

  it("no amounts at all: no value", () => {
    expect(share(undefined as unknown as Holdings, [])).toBeNull();
  });
});
