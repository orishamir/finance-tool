// A fund the person types (D44): where they buy it and where it is registered make its kind, exchange and currency (F-65); a fund bought in
// euros runs in euros (F-84, F-109); and what they say of an index they added, its region and dividend yield, feeds F-107 and says what is
// not counted. The expected answers are the panel's table as the method states it, the ECB's own rate (data/series/ecb-fx.json), TXF-16's
// rate from the rule base and F-107's formula; none is copied from what the code printed.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { countriesAt, customFundGaps, draftWithPlace, fundDraftOf, fundErrors, fundFromDraft, recordOfFund, validCustomFunds, withCustomEntries, type BuyAt, type CustomFund, type FundCountry } from "./custom-entries";
import type { CustomIndex } from "./invest";
import { fundWayAt, indexById, indexSeenBy, pairCosts, refOfCustom, type FundWay, type WayPrice } from "./invest";
import { dividendTaxLabel, fundLabels } from "./labels";
import { invest as copy } from "../copy";
import { buildIndicesBundle } from "./providers.server";
import type { WorkbenchInputs } from "./providers";
import { validCustomIndices } from "./state";
import { entered, ruleFigure, type SiteValue } from "./value";

const bundle = buildIndicesBundle();
const t = bundle.today;
const plan: WorkbenchInputs = {
  amountNow: 20_000, monthly: 1_000, years: 15, grossReturn: 0.06, inflation: 0.02, age: null, income: null,
  values: { amount: entered(20_000, "nis", t), monthly: entered(1_000, "nis_per_month", t), years: entered(15, "years", t), returnV: entered(6, "pct_per_year", t), inflation: entered(2, "pct_per_year", t) },
};
const SP = "index-sp500";

function must<T>(v: T | null | undefined, what: string): T {
  if (v === null || v === undefined) throw new Error(`missing: ${what}`);
  return v;
}

/** An accumulating unhedged fund with its yearly fee typed, bought and registered as the two answers say. */
const fundAt = (buyAt: BuyAt, country: FundCountry | null, more: Partial<Parameters<typeof fundFromDraft>[0]> = {}, indexId = SP, id = `custom-fund-${buyAt}-${(country ?? "none").toLowerCase()}`): CustomFund =>
  fundFromDraft({ ...fundDraftOf(null, { buyAt, country }), buyAt, name: id, fixed: 0.07, variable: 0, trustee: 0, payout: "accumulating", hedged: false, ...more }, id, indexId, t, "USD");

const priced = (w: FundWay) => Object.entries(w.byHouse).flatMap(([h, at]) => ("valueN" in at ? [[h, at as WayPrice] as const] : []));

describe("where the person buys a fund and where it is registered make its kind, exchange and currency (F-65)", () => {
  it("each answer gives the kind, the exchange and the currency the method names", () => {
    const cases: [BuyAt, FundCountry | null, string, string | undefined, string | null][] = [
      ["manager", "IL", "il-tracking", undefined, "ILS"],
      ["tase", "IL", "il-etf", undefined, "ILS"],
      ["tase", "IE", "tase-foreign", undefined, "ILS"],
      ["tase", null, "tase-foreign", undefined, "ILS"],
      ["us-usd", "US", "abroad", "us", "USD"],
      ["europe-eur", "IE", "abroad", "europe", "EUR"],
      ["europe-usd", "IE", "abroad", "europe", "USD"],
      ["abroad", null, "abroad", undefined, null],
    ];
    for (const [buyAt, country, kind, exchange, tradesIn] of cases) {
      const f = fundAt(buyAt, country);
      expect([buyAt, country, f.kind, f.exchange, f.tradesIn]).toEqual([buyAt, country, kind, exchange, tradesIn]);
    }
  });

  it("a fund bought abroad is in the currency it is bought in; one in Tel Aviv, or abroad not sure where, stands in by its index's", () => {
    expect(recordOfFund(fundAt("europe-eur", "IE"), "USD").currency).toBe("EUR");
    expect(recordOfFund(fundAt("us-usd", "US"), "EUR").currency).toBe("USD");
    expect(recordOfFund(fundAt("abroad", null), "EUR").currency).toBe("EUR");
    expect(recordOfFund(fundAt("tase", "IE"), "EUR").currency).toBe("EUR");
    expect(recordOfFund(fundAt("manager", "IL"), "USD").currency).toBe("NIS");
  });

  it("Israel is closed abroad, and the only country from the manager; a closed country gives way as the answer changes", () => {
    for (const at of ["us-usd", "europe-eur", "europe-usd", "abroad"] as const) expect(countriesAt(at)).not.toContain("IL");
    expect(countriesAt("manager")).toEqual(["IL"]);
    expect(countriesAt("tase")).toEqual(expect.arrayContaining(["IL", "IE", "US"]));
    const inTase = { ...fundDraftOf(null, { buyAt: "tase", country: "IL" }), name: "x" };
    expect(draftWithPlace(inTase, { buyAt: "europe-eur", country: "IL" }, "USD").country).toBeNull();
    expect(draftWithPlace(inTase, { buyAt: "manager", country: null }, "USD").country).toBe("IL");
    expect(draftWithPlace({ ...inTase, country: "IE" }, { buyAt: "us-usd", country: "IE" }, "USD").country).toBe("IE");
  });

  it("a fund not yet told where it is bought is not saved", () => {
    expect(fundErrors({ ...fundDraftOf(null), name: "א", hedged: false }, [], null)).toEqual(["place-none"]);
  });

  it("in Tel Aviv with no country said it is listed with its reason, never priced: whether it is Israeli is not known", () => {
    const f = fundAt("tase", null);
    const b = withCustomEntries(bundle, [f]);
    const w = must(fundWayAt({ bundle: b, index: must(indexById(b, SP), "S&P 500"), plan, fundId: f.id }), "the fund on the S&P 500");
    expect(w.reason).toEqual({ code: "tase-country-unknown" });
    expect(priced(w)).toEqual([]);
    expect(copy.lists.funds.whyCode["tase-country-unknown"]).toBeTruthy();
  });

  it("every reason a typed fund has no price is listed, not only the first", () => {
    const f = fundAt("tase", null, { fixed: null, payout: null, hedged: true });
    expect(customFundGaps(recordOfFund(f, "USD"))).toEqual(["fee-unknown", "tase-country-unknown", "payout-unknown", "no-hedge-entered"]);
    expect(customFundGaps(recordOfFund(fundAt("europe-eur", "IE"), "USD"))).toEqual([]);
  });
});

describe("a fund bought in euros runs in euros (F-65, F-84, F-109)", () => {
  const eur = fundAt("europe-eur", "IE", { unitPrice: { value: 100, unit: "eur" } }, SP, "custom-fund-in-eur");
  const usd = fundAt("europe-usd", "IE", { unitPrice: { value: 100, unit: "usd" } }, SP, "custom-fund-in-usd");
  const b = withCustomEntries(bundle, [eur, usd]);
  const sp = must(indexById(b, SP), "S&P 500");
  const wayEur = must(fundWayAt({ bundle: b, index: sp, plan, fundId: eur.id }), "the euro fund");
  const wayUsd = must(fundWayAt({ bundle: b, index: sp, plan, fundId: usd.id }), "the dollar fund");

  it("its unit price is typed and kept in euros, and the houses buy it in whole units", () => {
    expect(eur.unitPrice).toMatchObject({ value: 100, unit: "eur", state: "entered" });
    expect(must(validCustomFunds([JSON.parse(JSON.stringify(eur))])[0], "read back")).toEqual(eur);
    expect(priced(wayEur).some(([, at]) => at.units !== null)).toBe(true);
  });

  it("it is priced where the same fund in dollars on the same exchange is, and its conversion is at the ECB's shekels per euro", () => {
    expect(priced(wayEur).map(([h]) => h)).toEqual(priced(wayUsd).map(([h]) => h));
    // F-84: S_EUR = E_ILS, the ECB's shekels per euro on the reference day
    const ecb = JSON.parse(readFileSync(join(import.meta.dirname, "../../../data/series/ecb-fx.json"), "utf8")) as { observations: { key: string; value: number; date: string }[] };
    const ils = ecb.observations.filter((o) => o.key === "ILS").sort((x, y) => x.date.localeCompare(y.date)).at(-1);
    const [house] = must(priced(wayEur)[0], "a house that prices it");
    const costs = must(pairCosts({ bundle: b, index: sp, plan, fundId: eur.id, providerId: house }), "the pair's costs");
    const inputs = costs.left.computed_from?.inputs as Record<string, SiteValue>;
    expect(inputs[copy.pair.rateInput("EUR")]?.value).toBeCloseTo(must(ils, "the ECB's shekel").value, 4);
    expect(inputs[copy.pair.rateInput("USD")]).toBeUndefined();
  });

  it("on an index in dollars it is a fund in another currency than its index, as a collected one is", () => {
    expect(wayEur.currencyMismatch).toBe(true);
    expect(wayUsd.currencyMismatch).toBe(false);
  });

  it("on an index the person added, whose currency is not known, it moves with the euro, and its label names it", () => {
    const custom: CustomIndex = { id: "custom-europe", name: "MSCI Europe", added: t };
    const f = fundAt("europe-eur", "IE", {}, custom.id, "custom-fund-europe");
    const bc = withCustomEntries(bundle, [f], [custom]);
    const index = refOfCustom(custom);
    const w = must(fundWayAt({ bundle: bc, index, plan, fundId: f.id }), "the fund on its index");
    expect(w.currencyMismatch).toBe(false);
    expect(priced(w).length).toBeGreaterThan(0);
    const rec = must(bc.funds.at(-1), "the record");
    const currency = fundLabels(rec, indexSeenBy(index, rec, bc), "abroad").find((l) => l.family === "currency");
    expect(currency?.id).toBe("currency");
    expect(currency?.text).toContain(copy.currencies.EUR);
    // abroad not sure where, the currency is not known, and the label names none
    const unsure = fundAt("abroad", "IE", {}, custom.id, "custom-fund-unsure");
    const bu = withCustomEntries(bundle, [unsure], [custom]);
    const ru = must(bu.funds.at(-1), "the record");
    expect(fundLabels(ru, indexSeenBy(index, ru, bu), "abroad").find((l) => l.family === "currency")?.id).toBe("currency-foreign");
  });
});

describe("what the person says of an index they added feeds F-107, and the label says what is not counted", () => {
  const irish = (indexId: string) => fundAt("europe-usd", "IE", { tracking: "physical" }, indexId, `custom-fund-on-${indexId}`);
  const run = (index: CustomIndex) => {
    const f = irish(index.id);
    const b = withCustomEntries(bundle, [f], [index]);
    const ref = refOfCustom(index);
    const rec = must(b.funds.at(-1), "the record");
    const w = must(fundWayAt({ bundle: b, index: ref, plan, fundId: f.id }), "the fund");
    const [house, at] = must(priced(w)[0], "a priced house");
    const inputs = at.value.computed_from?.inputs as Record<string, SiteValue>;
    return { label: dividendTaxLabel(rec, ref), labels: fundLabels(rec, ref, "abroad"), inputs, valueN: at.valueN, house };
  };
  const words = copy.pair.fundInputs;
  const yieldTyped = entered(1.5, "pct_per_year", t, copy.customEntries.fields.indexYield);

  it("US companies with the yield typed: F-107 is counted, w = ρ × y_US with the yield as entered", () => {
    const r = run({ id: "custom-us", name: "US", added: t, region: "us", dividendYield: yieldTyped });
    expect(r.label).toBe("tax-fund-dividend");
    const tax = must(r.inputs[words.usWithholding], "F-107's figure");
    expect(tax.computed_from?.formula).toBe("F-107");
    const typedYield = (must(tax.computed_from, "F-107's working").inputs as Record<string, SiteValue>)[words.usYield];
    expect(typedYield).toMatchObject({ value: 1.5, state: "entered" });
    const rho = must(ruleFigure(must(bundle.rules.find((x) => x.id === "TXF-16"), "TXF-16"), "irish_fund_us_dividend_treaty_rate", t), "TXF-16's rate");
    expect(tax.value).toBeCloseTo(((rho.value as number) / 100) * 0.015 * 100, 3);
  });

  it("US companies with no yield: nothing counted, and the label says the yield is needed", () => {
    const r = run({ id: "custom-us-bare", name: "US", added: t, region: "us" });
    expect(r.label).toBe("tax-fund-dividend-need-yield");
    expect(r.inputs[words.usWithholding]).toBeUndefined();
  });

  it("Europe and Israel: no US share, no US tax, and the label says the tax withheld abroad is not counted, naming no US tax", () => {
    for (const region of ["europe", "israel"] as const) {
      const r = run({ id: `custom-${region}`, name: region, added: t, region, dividendYield: yieldTyped });
      expect(r.label).toBe("tax-fund-dividend-not-us");
      expect(r.inputs[words.usWithholding]).toBeUndefined();
      const l = must(r.labels.find((x) => x.id === "tax-fund-dividend-not-us"), "the label");
      expect(l.explain).not.toContain("אמריקני");
    }
  });

  it("the whole world, another place or not said: the US share is not known, so nothing is counted", () => {
    for (const region of ["world", "other", undefined] as const) {
      const r = run({ id: `custom-${region ?? "none"}`, name: "x", added: t, ...(region ? { region } : {}), dividendYield: yieldTyped });
      expect(r.label).toBe("tax-fund-dividend-us-share");
      expect(r.inputs[words.usWithholding]).toBeUndefined();
    }
  });

  it("a fund that does not hold the shares carries none of these labels", () => {
    const f = fundAt("europe-usd", "IE", { tracking: "swap" }, "custom-us", "custom-fund-swap");
    const index: CustomIndex = { id: "custom-us", name: "US", added: t, region: "us", dividendYield: yieldTyped };
    expect(dividendTaxLabel(must(withCustomEntries(bundle, [f], [index]).funds.at(-1), "the record"), refOfCustom(index))).toBeNull();
  });
});

describe("saved entries from before the panel asked these still load", () => {
  const base = fundAt("us-usd", "IE");
  const { tradesIn: _t, ...old } = JSON.parse(JSON.stringify(base)) as CustomFund;

  it("a fund bought abroad on an exchange reads as bought in dollars, as it was priced; one in Israel in shekels; one on no exchange in none", () => {
    expect(validCustomFunds([old])[0]?.tradesIn).toBe("USD");
    expect(validCustomFunds([{ ...old, exchange: "europe" }])[0]?.tradesIn).toBe("USD");
    expect(validCustomFunds([{ ...old, exchange: "europe", tradesIn: "EUR" }])[0]?.tradesIn).toBe("EUR");
    // a currency the exchange is not bought in on the panel reads as the dollar
    expect(validCustomFunds([{ ...old, exchange: "us", tradesIn: "EUR" }])[0]?.tradesIn).toBe("USD");
    const { exchange: _e, ...unsure } = old;
    expect(validCustomFunds([unsure])[0]?.tradesIn).toBeNull();
    expect(validCustomFunds([{ ...unsure, kind: "il-etf" }])[0]?.tradesIn).toBe("ILS");
  });

  it("an index answered Israeli before has its companies in Israel; a region that is not an answer, or a yield that is not one, reads as not said", () => {
    const [israeli, junk, kept] = validCustomIndices([
      { id: "custom-a", name: "א", israeli: true, added: t },
      { id: "custom-b", name: "ב", region: "גרמניה", dividendYield: { value: 3 }, added: t },
      { id: "custom-c", name: "ג", region: "europe", dividendYield: entered(2.5, "pct_per_year", t), added: t },
    ]);
    expect(israeli?.region).toBe("israel");
    expect(junk).toEqual({ id: "custom-b", name: "ב", added: t });
    expect(kept?.region).toBe("europe");
    expect(kept?.dividendYield?.value).toBe(2.5);
  });
});
