// A fund the person types (D44): where they buy it and where it is registered make its kind, exchange and currency (F-65); a fund bought in
// euros runs in euros (F-84, F-109); and what they say of an index they added, its region and dividend yield, feeds F-107 and says what is
// not counted. The expected answers are the panel's table as the method states it, the ECB's own rate (data/series/ecb-fx.json), TXF-16's
// rate from the rule base and F-107's formula; none is copied from what the code printed.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type { FundRecord } from "@finance-tool/schema";
import { countriesAt, customFundGaps, draftWithPlace, fundDraftOf, fundErrors, fundFromDraft, fundTerms, recordOfFund, validCustomFunds, withCustomEntries, type BuyAt, type CustomFund, type CountryAnswer, type FundDraft, type FundTracking } from "./custom-entries";
import type { CustomIndex } from "./invest";
import { buildInvest, fundWayAt, indexById, indexSeenBy, kindOf, pairCosts, refOfCustom, typedGapList, type FundWay, type IndexRef, type WayPrice } from "./invest";
import { dividendTaxLabel as dividendTaxLabelOn, fundLabels as fundLabelsOn, label, labelDefs } from "./labels";
import { invest as copy, numbers } from "../copy";
import { panelStateOf } from "../components/invest/custom-entries";
import { allFunds, labelsOf, steadyOf, whyNoFundAt } from "../components/invest/pair";
import { PairLists } from "../components/invest/lists";
import { LabelSheetHost } from "../components/kit";
import { ProvenanceProvider } from "../components/provenance";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router";
import { buildIndicesBundle } from "./providers.server";
import type { WorkbenchInputs } from "./providers";
import { validCustomIndices } from "./state";
import { entered, ruleFigure, type SiteValue } from "./value";

const bundle = buildIndicesBundle();
/** The labels as the page reads them for a typed fund, whose years no list compares (`typedGapList`). */
const dividendTaxLabel = (rec: FundRecord, index: IndexRef) => dividendTaxLabelOn(rec, index, typedGapList(rec, index));
const fundLabels = (rec: FundRecord, index: IndexRef, option: Parameters<typeof fundLabelsOn>[2]) => fundLabelsOn(rec, index, option, typedGapList(rec, index));
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
const fundAt = (buyAt: BuyAt, country: CountryAnswer, more: Partial<Parameters<typeof fundFromDraft>[0]> = {}, indexId = SP, id = `custom-fund-${buyAt}-${(country ?? "none").toLowerCase()}`): CustomFund =>
  fundFromDraft({ ...fundDraftOf(null, { buyAt, country }), buyAt, name: id, fixed: 0.07, variable: 0, trustee: 0, payout: "accumulating", hedged: false, ...more }, id, indexId, t, "USD");

const priced = (w: FundWay) => Object.entries(w.byHouse).flatMap(([h, at]) => ("valueN" in at ? [[h, at as WayPrice] as const] : []));

describe("where the person buys a fund and where it is registered make its kind, exchange and currency (F-65)", () => {
  it("each answer gives the kind, the exchange and the currency the method names", () => {
    const cases: [BuyAt, CountryAnswer, string, string | undefined, string | null][] = [
      ["manager", "IL", "il-tracking", undefined, "ILS"],
      ["tase", "IL", "il-etf", undefined, "ILS"],
      ["tase", "IE", "tase-foreign", undefined, "ILS"],
      ["tase", "unsure", "tase-unknown", undefined, "ILS"],
      ["us-usd", "US", "abroad", "us", "USD"],
      ["europe-eur", "IE", "abroad", "europe", "EUR"],
      ["europe-usd", "IE", "abroad", "europe", "USD"],
      ["abroad", "unsure", "abroad", undefined, null],
    ];
    for (const [buyAt, country, kind, exchange, tradesIn] of cases) {
      const f = fundAt(buyAt, country);
      expect([buyAt, country, f.kind, f.exchange, f.tradesIn]).toEqual([buyAt, country, kind, exchange, tradesIn]);
    }
  });

  it("a fund bought abroad is in the currency it is bought in; one in Tel Aviv, or abroad not sure where, stands in by its index's", () => {
    expect(recordOfFund(fundAt("europe-eur", "IE"), "USD").currency).toBe("EUR");
    expect(recordOfFund(fundAt("us-usd", "US"), "EUR").currency).toBe("USD");
    expect(recordOfFund(fundAt("abroad", "unsure"), "EUR").currency).toBe("EUR");
    expect(recordOfFund(fundAt("tase", "IE"), "EUR").currency).toBe("EUR");
    expect(recordOfFund(fundAt("manager", "IL"), "USD").currency).toBe("NIS");
  });

  it("Israel is closed abroad, and the only country from the manager; a closed country gives way as the answer changes", () => {
    for (const at of ["us-usd", "europe-eur", "europe-usd", "abroad"] as const) expect(countriesAt(at)).not.toContain("IL");
    expect(countriesAt("manager")).toEqual(["IL"]);
    expect(countriesAt("tase")).toEqual(expect.arrayContaining(["IL", "IE", "US", "other", "unsure"]));
    // abroad another country and not sure make the same fund: one answer, and "another country" gives way to it
    for (const at of ["us-usd", "europe-eur", "europe-usd", "abroad"] as const) expect(countriesAt(at)).not.toContain("other");
    const inTase = { ...fundDraftOf(null, { buyAt: "tase", country: "IL" }), name: "x" };
    expect(draftWithPlace(inTase, { buyAt: "europe-eur", country: "IL" }, "USD").country).toBe("unsure");
    expect(draftWithPlace(inTase, { buyAt: "manager", country: "unsure" }, "USD").country).toBe("IL");
    expect(draftWithPlace({ ...inTase, country: "IE" }, { buyAt: "us-usd", country: "IE" }, "USD").country).toBe("IE");
    expect(draftWithPlace({ ...inTase, country: "other" }, { buyAt: "us-usd", country: "other" }, "USD").country).toBe("unsure");
  });

  it("a fund not yet told where it is bought is not saved", () => {
    expect(fundErrors({ ...fundDraftOf(null), name: "א", hedged: false }, [], null)).toEqual(["place-none"]);
  });

  it("in Tel Aviv with \"not sure\" it is listed with its reason, never priced: whether it is Israeli is not known", () => {
    const f = fundAt("tase", "unsure");
    const b = withCustomEntries(bundle, [f]);
    const w = must(fundWayAt({ bundle: b, index: must(indexById(b, SP), "S&P 500"), plan, fundId: f.id }), "the fund on the S&P 500");
    expect(w.reason).toEqual({ code: "tase-country-unknown" });
    expect(priced(w)).toEqual([]);
    expect(copy.lists.funds.whyCode["tase-country-unknown"]).toBeTruthy();
  });

  it("in Tel Aviv with \"not sure\" its row names no foreign kind: it says whether it is Israeli is not known, asks one fee named as neither kind's, and its reason heads no foreign group", () => {
    const f = fundAt("tase", "unsure", { fixed: null }, SP, "custom-fund-tase-not-sure");
    const israeli = fundAt("tase", "IL", {}, SP, "custom-fund-tase-il");
    const b = withCustomEntries(bundle, [f, israeli]);
    const view = buildInvest({ bundle: b, index: must(indexById(b, SP), "S&P 500"), plan });
    const way = must(allFunds(view).find((x) => x.rec.id === f.id), "its row");
    const labels = labelsOf(view, way, b);
    expect(labels.map((l) => l.id)).toContain("held-tase-unknown");
    expect(labels.map((l) => l.id)).not.toContain("held-tase-foreign");
    for (const l of labels) expect(`${l.id} ${l.text} ${l.explain}`).not.toContain("קרן חוץ בת״א");
    expect(copy.labels["held-tase-unknown"].explain).toContain("לא ידוע אם זו קרן ישראלית");
    expect(fundTerms(f).empty).toEqual([copy.customEntries.fields.fee]);
    // where a house's reasons over two kinds differ, each is headed by its kind: this one's is not called a foreign fund
    const house = must(bundle.snapshots[0]?.id, "a house");
    const atHouse = (w: FundWay, reason: FundWay["reason"] & object): FundWay => ({ ...w, byHouse: { [house]: { providerId: house, reason } } });
    const other = must(allFunds(view).find((x) => x.rec.id === israeli.id), "the Israeli fund's row");
    const told = whyNoFundAt(b, house, [atHouse(way, { code: "tase-country-unknown" }), atHouse(other, { code: "fee-unknown" })]);
    expect(told.why).toContain(copy.stairs.kinds["tase-unknown"]);
    expect(told.why).not.toContain(copy.stairs.kinds["tase-foreign"]);
  });

  it("every reason a typed fund has no price is listed, not only the first", () => {
    const f = fundAt("tase", "unsure", { fixed: null, payout: null, hedged: true });
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
    // what the person said is the currency they buy in, not the index's (ETF-28): the label says so, never that the index is in it
    expect(currency?.id).toBe("currency-bought");
    expect(currency?.text).toContain(copy.currencies.EUR);
    expect(currency?.explain).not.toContain("כי המדד מחושב בו");
    expect(currency?.explain).toContain("זו קריאה של האתר");
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

  it("US companies with the yield typed: F-107 is counted at two ends, the run on the cautious one, w = ρ × y_US at TXF-53's domestic rate with the yield as entered", () => {
    const r = run({ id: "custom-us", name: "US", added: t, region: "us", dividendYield: yieldTyped });
    expect(r.label).toBe("tax-fund-dividend-range");
    const tax = must(r.inputs[words.insideTax], "F-107's figure");
    expect(tax.computed_from?.formula).toBe("F-107");
    const typedYield = (must(tax.computed_from, "F-107's working").inputs as Record<string, SiteValue>)[words.indexYield];
    expect(typedYield).toMatchObject({ value: 1.5, state: "entered" });
    const rho = must(ruleFigure(must(bundle.rules.find((x) => x.id === "TXF-53"), "TXF-53"), "us", t), "TXF-53's rate");
    expect(tax.value).toBeCloseTo(((rho.value as number) / 100) * 0.015 * 100, 3);
  });

  it("US companies with no yield: nothing counted, and the label says the yield is needed", () => {
    const r = run({ id: "custom-us-bare", name: "US", added: t, region: "us" });
    expect(r.label).toBe("tax-fund-dividend-need-yield");
    expect(r.inputs[words.insideTax]).toBeUndefined();
  });

  it("Europe or the whole world with the yield typed: F-107 is counted as two ends (F-107(b)), the run on the cautious one, and the label says so", () => {
    for (const region of ["europe", "world"] as const) {
      const r = run({ id: `custom-${region}`, name: region, added: t, region, dividendYield: yieldTyped });
      expect(r.label).toBe("tax-fund-dividend-range");
      const tax = must(r.inputs[words.insideTax], "F-107's figure");
      expect(tax.computed_from?.formula).toBe("F-107");
      expect(tax.labels?.some((l) => "code" in l && l.code === "cautious" && l.ends !== undefined)).toBe(true);
    }
  });

  it("Israel: no rule gives Israel's rate on a dividend to a foreign fund (G-44), so nothing is counted, and the label says so without naming US tax", () => {
    const r = run({ id: "custom-israel", name: "israel", added: t, region: "israel", dividendYield: yieldTyped });
    expect(r.label).toBe("tax-fund-dividend-israel");
    expect(r.inputs[words.insideTax]).toBeUndefined();
    const l = must(r.labels.find((x) => x.id === "tax-fund-dividend-israel"), "the label");
    expect(l.explain).not.toContain("אמריקני");
  });

  it("another place or not said: the countries are not known, so nothing is counted", () => {
    for (const region of ["other", undefined] as const) {
      const r = run({ id: `custom-${region ?? "none"}`, name: "x", added: t, ...(region ? { region } : {}), dividendYield: yieldTyped });
      expect(r.label).toBe("tax-fund-dividend-place");
      expect(r.inputs[words.insideTax]).toBeUndefined();
    }
  });

  it("a fund that does not hold the shares, on an index the person added, runs at two ends: 0 and the region's highest domestic rate times the yield (F-107)", () => {
    const f = fundAt("europe-usd", "IE", { tracking: "swap" }, "custom-us", "custom-fund-swap");
    const index: CustomIndex = { id: "custom-us", name: "US", added: t, region: "us", dividendYield: yieldTyped };
    expect(dividendTaxLabel(must(withCustomEntries(bundle, [f], [index]).funds.at(-1), "the record"), refOfCustom(index))).toBe("tax-fund-dividend-range");
  });
  it("a swap or futures fund on an added index in a region with a rule but no yield typed asks for the yield, as a fund that holds the shares does", () => {
    for (const tracking of ["swap", "futures"] as const) {
      const f = fundAt("europe-usd", "IE", { tracking }, "custom-us-bare", `custom-fund-${tracking}-bare`);
      const index: CustomIndex = { id: "custom-us-bare", name: "US", added: t, region: "us" };
      expect(dividendTaxLabel(must(withCustomEntries(bundle, [f], [index]).funds.at(-1), "the record"), refOfCustom(index)), tracking).toBe("tax-fund-dividend-need-yield");
    }
  });
});

describe("a saved entry that is not the shape the panel saves never breaks the page", () => {
  const base = fundAt("us-usd", "IE");
  const json = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;

  it("a fund whose place is not one of the panel's answers is left out, and the others load", () => {
    const { tradesIn: _t, ...noCurrency } = json;
    const back = validCustomFunds([noCurrency, { ...json, id: "custom-fund-eur-on-us", tradesIn: "EUR" }, { ...json, id: "custom-fund-no-payout", payout: undefined }, { ...json, id: "custom-fund-kept" }]);
    expect(back.map((f) => f.id)).toEqual(["custom-fund-kept"]);
  });

  it("a fund saved as following its index in a mix of ways, which the panel does not ask, is left out", () => {
    expect(validCustomFunds([{ ...json, id: "custom-fund-mixed", tracking: "mixed" }, { ...json, id: "custom-fund-kept", tracking: "swap" }]).map((f) => f.id)).toEqual(["custom-fund-kept"]);
  });

  it("a region that is not an answer, or a yield that is not one, reads as not said, and the index is kept", () => {
    const [junk, kept] = validCustomIndices([
      { id: "custom-b", name: "ב", region: "גרמניה", dividendYield: { value: 3 }, added: t },
      { id: "custom-c", name: "ג", region: "europe", dividendYield: entered(2.5, "pct_per_year", t), added: t },
    ]);
    expect(junk).toEqual({ id: "custom-b", name: "ב", added: t });
    expect(kept?.region).toBe("europe");
    expect(kept?.dividendYield?.value).toBe(2.5);
  });
});

describe("wherever a typed fund may bear dividend tax inside it that the run does not count, its label and checklist say so (D56, F-107, TXF-53 to TXF-57)", () => {
  const ref = (id: string) => must(indexById(bundle, id), id);
  const labelOn = (f: CustomFund, index = ref(SP)) => dividendTaxLabel(must(withCustomEntries(bundle, [f]).funds.at(-1), "the record"), index);
  const tracked = (buyAt: BuyAt, country: CountryAnswer, tracking: FundTracking | null, indexId = SP) => fundAt(buyAt, country, { tracking }, indexId, `custom-fund-${buyAt}-${country}-${tracking ?? "unsaid"}`.toLowerCase());

  it("an Irish fund whose way of following the S&P 500 is not said, or that follows it on a swap, runs at two ends and is ranked no better than one that holds the shares (F-107)", () => {
    const unsaid = tracked("europe-usd", "IE", null);
    const swap = tracked("europe-usd", "IE", "swap");
    expect(labelOn(unsaid)).toBe("tax-fund-dividend-range");
    expect(labelOn(swap)).toBe("tax-fund-dividend-range");
    const b = withCustomEntries(bundle, [unsaid, swap]);
    const sp = ref(SP);
    const values = (f: CustomFund) => priced(must(fundWayAt({ bundle: b, index: sp, plan, fundId: f.id }), f.id)).map(([h, at]) => [h, at.valueN]);
    expect(values(unsaid).length).toBeGreaterThan(0);
    expect(values(unsaid)).toEqual(values(swap));
  });

  it("a fund bought abroad whose country is not said, holding the shares or maybe: not counted", () => {
    for (const tracking of ["physical", null] as const) expect(labelOn(tracked("abroad", "unsure", tracking))).toBe("tax-fund-dividend-domicile");
    // what a futures fund's price deducts is the index's, whatever its country: 0 to the highest domestic rate on the S&P 500 (F-107)
    expect(labelOn(tracked("abroad", "unsure", "futures"))).toBe("tax-fund-dividend-range");
  });

  it("a US fund that pays out its income bears none on US companies, and may on any other's (TXF-56)", () => {
    const paying = (indexId = SP, tracking: FundTracking | null = "physical") => fundAt("us-usd", "US", { tracking, payout: "distributing" }, indexId, `custom-fund-us-paying-${indexId}`);
    expect(labelOn(paying())).toBeNull();
    expect(labelOn(paying("index-msci-world"), ref("index-msci-world"))).toBe("tax-fund-dividend-us-fund");
    for (const region of ["europe", "world", "other", undefined] as const) {
      const added: CustomIndex = { id: `custom-${region ?? "none"}`, name: "x", added: t, ...(region ? { region } : {}) };
      const f = paying(added.id, null);
      expect(dividendTaxLabel(must(withCustomEntries(bundle, [f], [added]).funds.at(-1), "the record"), refOfCustom(added))).toBe("tax-fund-dividend-us-fund");
    }
    const us: CustomIndex = { id: "custom-us-only", name: "x", added: t, region: "us" };
    expect(dividendTaxLabel(must(withCustomEntries(bundle, [paying(us.id)], [us]).funds.at(-1), "the record"), refOfCustom(us))).toBeNull();
  });

  it("a US fund that keeps its income, or whose payout is not said, bears US tax inside on what it keeps (TXF-50): not counted", () => {
    expect(labelOn(tracked("us-usd", "US", "physical"))).toBe("tax-fund-dividend-us-keeps");
    expect(labelOn(fundAt("us-usd", "US", { tracking: "swap", payout: null }, SP, "custom-fund-us-unsaid"))).toBe("tax-fund-dividend-us-keeps");
  });

  it("an Irish fund holding the shares of MSCI World: F-107 counts the US part, and the label says the rest is not (TXF-54)", () => {
    const world = ref("index-msci-world");
    const f = tracked("europe-usd", "IE", "physical", world.id);
    expect(labelOn(f, world)).toBe("tax-fund-dividend-part");
    const b = withCustomEntries(bundle, [f]);
    const [, at] = must(priced(must(fundWayAt({ bundle: b, index: world, plan, fundId: f.id }), f.id))[0], "a priced house");
    const inputs = must(at.value.computed_from, "the figure's working").inputs as Record<string, SiteValue>;
    expect(inputs[copy.pair.fundInputs.insideTax]?.computed_from?.formula).toBe("F-107");
    // its "?" says the two ends are on the index's US shares, the part counted, and asks nothing of an index the person added
    const doubt = must(inputs[copy.pair.fundInputs.insideTax]?.doubt, "the tax's doubt");
    expect(doubt.startsWith("המס על הדיבידנדים של המניות האמריקניות בתוך הקרן")).toBe(true);
    expect(doubt).not.toContain("במדד שהוספתם");
  });
  it("the \"?\" of a typed fund's two ends asks which countries an added index's companies are in only on an added index, and calls a synthetic fund's bounds the site's reading", () => {
    const d = numbers.insideTaxDoubt;
    expect(d.claim("0.1%", "0.3%", "region")).toContain("במדד שהוספתם");
    expect(d.claim("0.1%", "0.3%", "whole")).not.toContain("במדד שהוספתם");
    expect(d.claim("0.1%", "0.3%", "part")).toContain("המניות האמריקניות");
    for (const why of ["futures", "synthetic"] as const) expect(d[why]("0%", "0.3%", "whole")).toContain("קריאה של האתר");
    expect(d.synthetic("0%", "0.3%", "whole")).toContain("מבין המדינות שהאתר קרא");
  });

  it("an Israeli fund on the S&P 500 runs at two ends whether it holds the shares, follows on a swap or does not say (F-107); on an index of Israeli companies, which may hold foreign shares (ETF-44), it is not counted (TXF-57)", () => {
    expect(labelOn(tracked("tase", "IL", null))).toBe("tax-fund-dividend-range");
    expect(labelOn(tracked("manager", "IL", "physical"))).toBe("tax-fund-dividend-range");
    expect(labelOn(tracked("tase", "IL", "swap"))).toBe("tax-fund-dividend-range");
    expect(labelOn(tracked("manager", "IL", "physical", "index-ta35"), ref("index-ta35"))).toBe("tax-fund-dividend-il-fund");
  });

  it("each label not counted is an open tax label that says so in words and states no rate", () => {
    for (const id of ["tax-fund-dividend-swap", "tax-fund-dividend-us-keeps", "tax-fund-dividend-tracking", "tax-fund-dividend-us-fund", "tax-fund-dividend-il-fund", "tax-fund-dividend-domicile"] as const) {
      expect(labelDefs[id].tone).toBe("open");
      expect(copy.labels[id].text).toBe(copy.labels["tax-fund-dividend-left-out"].text);
      expect(copy.labels[id].explain).not.toMatch(/\d+(\.\d+)?%/);
    }
  });

  it("on an index the person said is in shekels, with no region said, no label says its companies are outside Israel or the United States", () => {
    const added: CustomIndex = { id: "custom-shekel", name: "במדד בשקלים", added: t };
    for (const [buyAt, country, id] of [["manager", "IL", "tax-fund-dividend-il-fund"], ["us-usd", "US", "tax-fund-dividend-us-fund"]] as const) {
      const f = fundAt(buyAt, country, { tracking: "physical", payout: "distributing", shekelIndex: true }, added.id, `custom-fund-shekel-${buyAt}`);
      const b = withCustomEntries(bundle, [f], [added]);
      const rec = must(b.funds.at(-1), "the record");
      expect(dividendTaxLabel(rec, indexSeenBy(refOfCustom(added), rec, b))).toBe(id);
      expect(copy.labels[id].explain.startsWith("אם הקרן מחזיקה")).toBe(true);
      expect(copy.customEntries.needs.dividendTax[id]).toContain("אם הקרן מחזיקה");
    }
  });

  it("on an index of Israeli companies the label of what is not counted says nothing of tax withheld abroad", () => {
    const israel: CustomIndex = { id: "custom-israel", name: "ת״א", added: t, region: "israel" };
    const f = tracked("europe-usd", "IE", "physical", israel.id);
    const rec = must(withCustomEntries(bundle, [f], [israel]).funds.at(-1), "the record");
    const l = must(fundLabels(rec, refOfCustom(israel), "abroad").find((x) => x.id === "tax-fund-dividend-israel"), "the label");
    expect(l.explain).not.toContain("בחו״ל");
    expect(copy.customEntries.needs.dividendTax["tax-fund-dividend-israel"]).not.toContain("בחו״ל");
  });
});

describe("the panel's checklist: an answer not given is never done (D56)", () => {
  const facts = { region: null, yieldPct: null };
  const draftOf = (buyAt: BuyAt, country: CountryAnswer, more: Partial<FundDraft> = {}): FundDraft => ({ ...fundDraftOf(null, { buyAt, country }), name: "קרן", fixed: 0.07, payout: "accumulating", hedged: false, ...more });
  const stateOf = (d: FundDraft, index = must(indexById(bundle, SP), "S&P 500")) => panelStateOf(d, index, facts, t);
  const itemOf = (d: FundDraft, id: string) => stateOf(d).needs.find((x) => x.id === id);

  it("a fund bought abroad with its country not said, that may hold the shares, is priced without the dividend tax inside it", () => {
    const s = stateOf(draftOf("us-usd", "unsure", { tracking: "physical" }));
    expect(s.status).toBe("left-out");
    expect(s.needs.find((x) => x.id === "dividendTax")?.state).toBe("left-out");
    expect(s.needs.find((x) => x.id === "country")).toMatchObject({ state: "stand-in", note: copy.customEntries.needs.standIn.countryTax });
  });

  it("an Irish fund whose way of following the S&P 500 is not said is priced at the cautious end, and so is one on a swap (F-107)", () => {
    const w = copy.customEntries.needs.dividendTax;
    expect(itemOf(draftOf("europe-usd", "IE"), "dividendTax")).toMatchObject({ state: "done", note: w["tax-fund-dividend-range"] });
    expect(itemOf(draftOf("europe-usd", "IE", { tracking: "swap" }), "dividendTax")).toMatchObject({ state: "done", note: w["tax-fund-dividend-range"] });
  });

  it("a US fund that keeps its income, and an Irish one holding MSCI World's shares, are priced without what is not counted", () => {
    const w = copy.customEntries.needs.dividendTax;
    expect(itemOf(draftOf("us-usd", "US", { tracking: "physical" }), "dividendTax")).toMatchObject({ state: "left-out", note: w["tax-fund-dividend-us-keeps"] });
    const world = must(indexById(bundle, "index-msci-world"), "MSCI World");
    expect(stateOf(draftOf("europe-usd", "IE", { tracking: "physical" }), world).needs.find((x) => x.id === "dividendTax")).toMatchObject({ state: "left-out", note: w["tax-fund-dividend-part"] });
  });

  it("before the hedge is answered, the preview says nothing of the currency, the one it is bought in among it", () => {
    const added: CustomIndex = { id: "custom-nikkei", name: "ניקיי", added: t };
    const draft = { ...draftOf("europe-eur", "IE"), hedged: null };
    const ids = panelStateOf(draft, refOfCustom(added), facts, t).labels.map((l) => l.id);
    expect(ids).not.toContain("currency-bought");
    expect(panelStateOf({ ...draft, hedged: false }, refOfCustom(added), facts, t).labels.map((l) => l.id)).toContain("currency-bought");
  });

  it("the gap to the index and the spread, which the panel does not ask, are named as not entered and not counted, and the status names them", () => {
    const w = copy.customEntries.needs;
    const onExchange = stateOf(draftOf("us-usd", "US", { tracking: "swap", payout: "distributing", yield: 1.2, perYear: 4 }));
    expect(onExchange.needs.find((x) => x.id === "gap")).toMatchObject({ state: "left-out", note: w.notEntered });
    expect(onExchange.needs.find((x) => x.id === "spread")).toMatchObject({ state: "left-out", note: w.notEntered });
    expect(onExchange.status).toBe("left-out");
    expect(onExchange.without).toEqual(expect.arrayContaining([w.without.gap, w.without.spread]));
    // bought from its manager, a fund trades on no exchange (A-08): no spread, but the gap still
    const fromManager = stateOf(draftOf("manager", "IL", { tracking: "physical" }));
    expect(fromManager.needs.find((x) => x.id === "spread")).toBeUndefined();
    expect(fromManager.needs.find((x) => x.id === "gap")?.state).toBe("left-out");
    // a hedged fund's gap is missing: no price without it (F-92 (c))
    expect(stateOf(draftOf("us-usd", "US", { hedged: true })).needs.find((x) => x.id === "gap")).toMatchObject({ state: "missing", note: w.gap });
  });

  it("an Irish fund holding MSCI World's shares is priced without part of the dividend tax, and the status says only part", () => {
    const s = stateOf(draftOf("europe-usd", "IE", { tracking: "physical" }), must(indexById(bundle, "index-msci-world"), "MSCI World"));
    expect(s.without).toContain(copy.customEntries.needs.without.dividendTaxPart);
    expect(s.without).not.toContain(copy.customEntries.needs.without.dividendTax);
  });

  it("abroad, not sure where: the place says what stands in for the currency and the exchange", () => {
    expect(itemOf(draftOf("abroad", "IE", { tracking: "swap" }), "place")).toMatchObject({ state: "stand-in", note: copy.customEntries.needs.standIn.place(true) });
    expect(itemOf(draftOf("abroad", "US", { tracking: "swap" }), "place")).toMatchObject({ state: "stand-in", note: copy.customEntries.needs.standIn.place(false) });
    expect(itemOf(draftOf("us-usd", "IE", { tracking: "swap" }), "place")?.state).toBe("done");
  });

  it("a country not said is missing in Tel Aviv, and left out where it changes nothing", () => {
    expect(itemOf(draftOf("tase", "unsure"), "country")?.state).toBe("missing");
    expect(itemOf(draftOf("tase", "other", { tracking: "swap" }), "country")?.state).toBe("done");
    expect(itemOf(draftOf("us-usd", "unsure", { tracking: "swap" }), "country")).toBeUndefined();
    expect(itemOf(draftOf("abroad", "unsure", { tracking: "swap" }), "country")).toMatchObject({ state: "stand-in", note: copy.customEntries.needs.standIn.countryExchange });
  });
});

describe("a fund in euros on an index in dollars says so, and no figure calls its currency the dollar (F-65, F-94)", () => {
  const eur = fundAt("europe-eur", "IE", { tracking: "swap" }, SP, "custom-fund-eur-swap");
  const usd = fundAt("europe-usd", "IE", { tracking: "swap" }, SP, "custom-fund-usd-swap");
  const b = withCustomEntries(bundle, [eur, usd]);
  const view = buildInvest({ bundle: b, index: must(indexById(b, SP), "S&P 500"), plan });
  const way = (id: string) => must(allFunds(view).find((f) => f.rec.id === id), id);

  it("the label says the currency is the one the fund is bought in, as the site's reading", () => {
    const { explain } = label("currency-mismatch", "EUR");
    expect(explain).toContain("הקרן נקנית באירו");
    expect(explain).toContain("זו קריאה של האתר");
  });

  it("its row carries the label that its currency is not its index's; the dollar twin's does not", () => {
    const ids = (id: string) => labelsOf(view, way(id), b).map((l) => l.id);
    expect(ids(eur.id)).toContain("currency-mismatch");
    expect(ids(usd.id)).not.toContain("currency-mismatch");
    const l = must(labelsOf(view, way(eur.id), b).find((x) => x.id === "currency-mismatch"), "the label");
    expect(l.explain).toContain(copy.currencies.EUR);
  });

  it("the figure's steady currency is the euro for it and the dollar for its twin", () => {
    expect(steadyOf(view, b, eur.id)).toBe(copy.pair.steadyIn(must(copy.currencies.EUR, "the euro's word")));
    expect(steadyOf(view, b, usd.id)).toBe(copy.pair.steadyIn(must(copy.currencies.USD, "the dollar's word")));
  });

  it("the dollar's range against a hedged pick runs over the dollar twin and leaves the euro fund out", () => {
    const hedged = allFunds(view).filter((f) => kindOf(f.rec) === "hedged");
    const house = Object.keys(way(eur.id).byHouse).find((h) => "valueN" in (way(eur.id).byHouse[h] ?? {}) && "valueN" in (way(usd.id).byHouse[h] ?? {}) && hedged.some((f) => "valueN" in (f.byHouse[h] ?? {})));
    const pickFund = hedged.find((f) => house && "valueN" in (f.byHouse[house] ?? {}));
    if (!house || !pickFund) throw new Error("a house that prices both twins and a hedged fund");
    const data = { rules: {}, terms: {}, dimensions: {}, today: t };
    const lists = createElement(LabelSheetHost, null, createElement(PairLists, { view, bundle: b, plan, livePlan: plan, today: t, pick: { house, fund: pickFund.rec.id }, chosen: false, onPick: () => undefined, moved: null }));
    // oxlint-disable-next-line react/no-children-prop -- ProvenanceProvider's props type requires `children`, which createElement's third argument does not meet in a .ts file
    const out = renderToString(createElement(MemoryRouter, null, createElement(ProvenanceProvider, { data, children: lists })));
    const row = (id: string) => {
      const at = out.indexOf(`data-pick-key="${id}"`);
      expect(at).toBeGreaterThan(-1);
      const next = out.slice(at + 1).search(/data-pick-key="/);
      return out.slice(at, next < 0 ? undefined : at + 1 + next).replace(/<[^>]*>/g, " ");
    };
    const range = new RegExp(`\\s${copy.kinds.between}\\s`);
    expect(row(usd.id)).toMatch(range);
    expect(row(eur.id)).not.toMatch(range);
  });
});
