import { describe, expect, expectTypeOf, it } from "vitest";
import type { FundRecord } from "@finance-tool/schema";
import { taxIndexStatementOf } from "@finance-tool/engine";
import { loadFunds } from "./instruments.server";
import { knownIndices } from "./invest";
import { allLabels, dividendTaxLabel, fundLabels, label, labelDefs, statementExamples } from "./labels";
import { invest as copy } from "../copy";
import { labelDoc, labelRules } from "./label-rests";
import { buildIndicesBundle } from "./providers.server";

describe("label icons (2026-11-05 sweep)", () => {
  // labels that say the same thing of a different case share an icon; any other two never do
  const same = [
    ["currency", "currency-many", "currency-bought"],
    ["hedged", "hedged-many"],
    ["tax-index-currency", "tax-index-cpi"],
    ["tax-fund-dividend", "tax-fund-dividend-left-out", "tax-fund-dividend-part", "tax-fund-dividend-swap", "tax-fund-dividend-us-keeps", "tax-fund-dividend-need-yield", "tax-fund-dividend-not-us", "tax-fund-dividend-us-share", "tax-fund-dividend-tracking", "tax-fund-dividend-us-fund", "tax-fund-dividend-il-fund", "tax-fund-dividend-domicile"],
  ];
  const kin = (a: string, b: string) => same.some((g) => g.includes(a) && g.includes(b));

  it("labels about different things never share an icon", () => {
    const all = allLabels(statementExamples(loadFunds()));
    for (const a of all) for (const b of all) if (a.id < b.id && !kin(a.id, b.id)) expect(`${a.id} ${a.icon}`).not.toBe(`${a.id} ${b.icon}`);
  });

  it("a currency label draws that currency's sign, and the general sign for one without its own", () => {
    expect(label("currency", "USD").icon).toBe("dollar");
    expect(label("currency", "EUR").icon).toBe("euro");
    expect(label("currency", "INR").icon).toBe("currency");
    expect(label("currency-foreign").icon).toBe("currency");
  });
});

describe("the tax inside an Irish fund that holds its index's shares (TXF-16, F-107)", () => {
  const rec = loadFunds().find((f) => f.id === "ie00b5bmr087");
  const index = knownIndices(buildIndicesBundle()).find((i) => i.id === rec?.exposure_id);
  const exposure = index?.exposure;
  const replication = rec?.replication;
  if (!rec || !index || !exposure?.us_dividends || !replication) throw new Error("the Irish S&P 500 fund ie00b5bmr087, how it follows its index, and the index's dividend yield are in the data");
  const ids = (r: FundRecord, i: typeof index) => fundLabels(r, i, "abroad").map((l) => l.id);

  it("says the tax where the figure holds it, and that it is left out where the index's record has no dividend yield to work it from", () => {
    expect(ids(rec, index)).toContain("tax-fund-dividend");
    expect(ids(rec, index)).not.toContain("tax-fund-dividend-left-out");
    const { us_dividends: _none, ...bare } = exposure;
    const noYield = { ...index, exposure: bare };
    expect(ids(rec, noYield)).toContain("tax-fund-dividend-left-out");
    expect(ids(rec, noYield)).not.toContain("tax-fund-dividend");
    // a fund on a swap holds none of the shares, but what its swap pays is set by its terms (TXS-41, TXF-58): not counted, never "none"
    const swap = { ...rec, replication: { ...replication, method: "swap" as const } };
    expect(ids(swap, noYield).filter((id) => id.startsWith("tax-fund-dividend"))).toEqual(["tax-fund-dividend-swap"]);
    expect(ids(swap, index).filter((id) => id.startsWith("tax-fund-dividend"))).toEqual(["tax-fund-dividend-swap"]);
  });

  it("every fund on the records carries the label its own run agrees with", () => {
    const bundle = buildIndicesBundle();
    for (const i of knownIndices(bundle)) {
      for (const f of bundle.funds.filter((x) => x.exposure_id === i.id && x.domicile === "IE" && x.replication?.method === "physical")) {
        const own = typeof f.fees.fund_level_withholding_drag?.value === "number" || typeof f.fees.tracking_difference_12m?.value === "number";
        // F-107 counts the US part of the index (its US share, MSCI's country weight where the record gives one); the rest is not counted
        const expected = own ? "tax-fund-dividend" : !i.exposure?.us_dividends ? "tax-fund-dividend-left-out" : i.exposure.us_dividends.weight ? "tax-fund-dividend-part" : "tax-fund-dividend";
        expect(`${f.id} ${ids(f, i).filter((id) => id.startsWith("tax-fund-dividend")).join()}`).toBe(`${f.id} ${expected}`);
      }
    }
  });
});

describe("wherever a collected fund may bear dividend tax inside it that the run does not count, its row says so (D56, F-107, A-11)", () => {
  const bundle = buildIndicesBundle();
  const indices = knownIndices(bundle);
  const taxOf = (f: FundRecord) => {
    const i = indices.find((x) => x.id === f.exposure_id);
    if (!i) throw new Error(`the index of ${f.id}`);
    return dividendTaxLabel(f, i);
  };
  const funds = (pick: (f: FundRecord) => boolean) => {
    const out = bundle.funds.filter(pick);
    if (out.length === 0) throw new Error("no fund on the records is of this case");
    return out;
  };
  const weighed = (f: FundRecord) => !!bundle.exposures.find((e) => e.id === f.exposure_id)?.us_dividends?.weight;

  it("an Irish fund holding the shares of an index with companies outside the United States (MSCI World, MSCI ACWI): the US part counted, the rest not (TXF-54)", () => {
    for (const f of funds((x) => x.domicile === "IE" && x.replication?.method === "physical" && weighed(x))) expect(`${f.id} ${taxOf(f)}`).toBe(`${f.id} tax-fund-dividend-part`);
    expect(labelDefs["tax-fund-dividend-part"].rules).toEqual(expect.arrayContaining(["TXF-16", "TXF-53", "TXF-54"]));
  });

  it("a fund on a swap or futures, Israeli or Irish, with no figure of its own: not counted, citing what a swap pays (TXS-41, TXF-58), stating no rate", () => {
    for (const f of funds((x) => x.replication?.method === "swap" || x.replication?.method === "futures")) expect(`${f.id} ${taxOf(f)}`).toBe(`${f.id} tax-fund-dividend-swap`);
    expect(labelDefs["tax-fund-dividend-swap"].rules).toEqual(["TXS-41", "TXF-58"]);
    expect(copy.labels["tax-fund-dividend-swap"].explain).not.toMatch(/\d+(\.\d+)?%/);
  });

  it("a US fund that pays out its income bears none on an index of US companies, and may on one with companies elsewhere (TXF-56)", () => {
    for (const f of funds((x) => x.domicile === "US" && x.distribution_policy === "distributing" && x.exposure_id === "index-sp500")) expect(`${f.id} ${taxOf(f)}`).toBe(`${f.id} null`);
    for (const f of funds((x) => x.domicile === "US" && x.distribution_policy === "distributing" && weighed(x))) expect(`${f.id} ${taxOf(f)}`).toBe(`${f.id} tax-fund-dividend-us-fund`);
  });

  it("a US fund that keeps its income pays US tax on what it keeps inside it (TXF-50): not counted, whatever its index", () => {
    for (const f of funds((x) => x.domicile === "US")) expect(taxOf({ ...f, distribution_policy: "accumulating" })).toBe("tax-fund-dividend-us-keeps");
    expect(labelDefs["tax-fund-dividend-us-keeps"].rules).toContain("TXF-50");
  });

  it("an Israeli fund holding shares on an index of Israeli companies may hold foreign ones too (ETF-44): not counted (TXF-57)", () => {
    for (const f of funds((x) => x.domicile === "IL" && x.exposure_id === "index-ta35")) expect(`${f.id} ${taxOf(f)}`).toBe(`${f.id} tax-fund-dividend-il-fund`);
    for (const f of funds((x) => x.domicile === "IL" && x.replication?.method !== "swap" && x.exposure_id === "index-sp500")) expect(`${f.id} ${taxOf(f)}`).toBe(`${f.id} tax-fund-dividend-il-fund`);
  });

  it("a figure of the fund's own, or a published 12-month gap, may hold the tax: counted", () => {
    const [f] = funds((x) => x.domicile === "IE" && x.replication?.method === "physical" && weighed(x));
    if (!f) throw new Error("an Irish fund on MSCI World or ACWI");
    const gap = { ...f, fees: { ...f.fees, tracking_difference_12m: { ...f.fees.fixed_management!, value: 0.1 } } };
    expect(taxOf(gap)).toBe("tax-fund-dividend");
  });

  it("each sentence that a tax is withheld where the countries are not known says it may be, never that it is", () => {
    for (const id of ["tax-fund-dividend-part", "tax-fund-dividend-not-us", "tax-fund-dividend-us-share", "tax-fund-dividend-tracking", "tax-fund-dividend-us-fund", "tax-fund-dividend-il-fund", "tax-fund-dividend-domicile"] as const) {
      expect(copy.labels[id].explain).toContain("עשוי להיות מנוכה");
      expect(copy.labels[id].explain.replaceAll("עשוי להיות מנוכה", "")).not.toContain("מנוכה");
    }
  });
});

describe("the currency's tax on an Israeli fund on a foreign index (TXS-14, F-04)", () => {
  const rec = loadFunds().find((f) => f.id === "5129275");
  const status = rec?.tax_status.foreign_investment_fund;
  const index = knownIndices(buildIndicesBundle()).find((i) => i.id === rec?.exposure_id);
  if (!rec || !status || !index) throw new Error("the S&P 500 fund 5129275, its status and its index are in the data");
  const withStatus = (hedged: boolean, value: string | false | null) => ({ ...rec, hedged, tax_status: { ...rec.tax_status, foreign_investment_fund: { ...status, value, notes: "as the test sets it" } } });
  const ids = (hedged: boolean, value: string | false | null) => fundLabels(withStatus(hedged, value), index, "il-etf").map((l) => l.id);
  it("says the currency is taxed only where the fund is known not to be a foreign-investment fund", () => {
    expect(ids(false, false)).toContain("tax-currency");
    expect(ids(false, false)).not.toContain("tax-currency-unknown");
    expect(ids(true, false)).not.toContain("tax-currency");
  });
  it("where the fund's documents name it one, says nothing of the currency's tax, the site's reading being said in its figures' sheets (D119); where its status is not known, says so", () => {
    for (const hedged of [false, true]) {
      expect(ids(hedged, "USD").filter((id) => id.startsWith("tax-currency"))).toEqual([]);
      expect(ids(hedged, null)).toEqual(expect.arrayContaining(["tax-currency-unknown"]));
      expect(ids(hedged, null)).not.toContain("tax-currency");
    }
    expect(label("tax-currency-unknown").explain).toContain("האתר לא יודע אם הקרן הזו היא קרן נאמנות להשקעות חוץ");
  });
});

describe("the tax index a Tel Aviv foreign fund's own annex states (F-04, D84)", () => {
  const rec = loadFunds().find((f) => f.id === "1159250");
  const index = knownIndices(buildIndicesBundle()).find((i) => i.id === rec?.exposure_id);
  if (!rec?.tax_ruling || !index) throw new Error("the S&P 500's Tel Aviv line 1159250, its ruling and its index are in the data");
  const ruling = rec.tax_ruling;
  const { index: _stated, ...unstated } = ruling;
  const main = { basis: "main-currency" as const, currency: "USD", page: 17, quote: "בסיס המדד", currency_quote: "דולר ארה״ב", checked: "2026-11-25" };
  const cpi = { basis: "cpi" as const, page: 16, quote: "מדד המחירים לצרכן", checked: "2026-11-25" };
  const tax = (r: typeof rec, option: "tase-foreign" | "abroad") => fundLabels(r, index, option).filter((l) => l.id === "tax-index-currency" || l.id === "tax-index-cpi");
  it("says the fund's own statement, with its annex opened at the page, on the Tel Aviv line only", () => {
    const onDollar = tax({ ...rec, tax_ruling: { ...ruling, index: main } }, "tase-foreign");
    expect(onDollar.map((l) => l.id)).toEqual(["tax-index-currency"]);
    expect(onDollar[0]?.text).toBe("רווח מול שער הדולר");
    expect(onDollar.map((l) => labelDoc(l)?.href)).toEqual([`${ruling.source.url}#page=17`]);
    expect(onDollar[0]?.explain).toContain("זו הצהרה של הקרן, ואין נוסח רשמי של רשות המסים שמאשר אותה");
    const onCpi = tax({ ...rec, tax_ruling: { ...ruling, index: cpi } }, "tase-foreign");
    expect(onCpi.map((l) => l.id)).toEqual(["tax-index-cpi"]);
    expect(onCpi.map((l) => labelDoc(l)?.href)).toEqual([`${ruling.source.url}#page=16`]);
    expect(onCpi[0]?.explain).toContain("מדד המחירים לצרכן");
    // the statement is the fund's, never a rule: the chip opens no rule card, only the annex
    for (const l of [...onDollar, ...onCpi]) expect(labelRules(l)).toEqual([]);
    expect(onDollar[0]?.rests).toEqual({ statement: taxIndexStatementOf({ tax_ruling: { ...ruling, index: main } }) });
    // a statement label is made only from a statement, never from its id, so none is without its document
    expectTypeOf<"tax-index-currency" | "tax-index-cpi">().not.toExtend<Parameters<typeof label>[0]>();
    // the same units bought abroad keep TXF-03; an annex that states no index says nothing
    expect(tax({ ...rec, tax_ruling: { ...ruling, index: main } }, "abroad")).toEqual([]);
    expect(tax({ ...rec, tax_ruling: unstated }, "tase-foreign")).toEqual([]);
  });
  it("says a distributing fund's statement as an accumulating one's: its runs read the index its annex states whether or not it pays out (F-04, D84, D85)", () => {
    expect(tax({ ...rec, distribution_policy: "distributing", tax_ruling: { ...ruling, index: main } }, "tase-foreign").map((l) => l.id)).toEqual(["tax-index-currency"]);
    expect(tax({ ...rec, distribution_policy: "distributing", tax_ruling: { ...ruling, index: main } }, "abroad")).toEqual([]);
  });
});

describe("statementExamples", () => {
  // made-up rulings over fixed inputs: what the gallery shows its statement labels by
  const ruling = (url: string, index?: Record<string, unknown>) => ({
    tax_ruling: { ruling_date: "2019-07-01", source: { url, title: url, publisher: "test", strength: "institution" }, pages: { ruling: 1, sale: 1, distribution: 1 }, quote: "q", checked: "2026-11-25", ...(index ? { index } : {}) },
  }) as unknown as Pick<FundRecord, "tax_ruling">;
  const usd = ruling("https://a.invalid/usd.pdf", { basis: "main-currency", currency: "USD", page: 3, quote: "q", currency_quote: "q", checked: "2026-11-25" });
  const eur = ruling("https://a.invalid/eur.pdf", { basis: "main-currency", currency: "EUR", page: 4, quote: "q", currency_quote: "q", checked: "2026-11-25" });
  const cpi = ruling("https://a.invalid/cpi.pdf", { basis: "cpi", page: 5, quote: "q", checked: "2026-11-25" });
  const none = ruling("https://a.invalid/none.pdf");

  it("keeps one statement for each label, the first record's, and skips a ruling that states no index", () => {
    const got = statementExamples([none, usd, eur, cpi]);
    expect(got.map((s) => s.source.url)).toEqual(["https://a.invalid/usd.pdf", "https://a.invalid/cpi.pdf"]);
    expect(statementExamples([none])).toEqual([]);
  });
});
