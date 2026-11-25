import { describe, expect, expectTypeOf, it } from "vitest";
import type { FundRecord } from "@finance-tool/schema";
import { taxIndexStatementOf } from "@finance-tool/engine";
import { loadFunds } from "./instruments.server";
import { knownIndices } from "./invest";
import { allLabels, fundLabels, label, statementExamples } from "./labels";
import { labelDoc, labelRules } from "./label-rests";
import { buildIndicesBundle } from "./providers.server";

describe("label icons (2026-11-05 sweep)", () => {
  // labels that say the same thing of a different case share an icon; any other two never do
  const same = [
    ["currency", "currency-many"],
    ["hedged", "hedged-many"],
    ["tax-currency-open", "tax-currency-unknown"],
    ["tax-index-currency", "tax-index-cpi"],
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

describe("the currency's tax on an Israeli fund on a foreign index (TXS-14, F-04)", () => {
  const rec = loadFunds().find((f) => f.id === "5129275");
  const status = rec?.tax_status.foreign_investment_fund;
  const index = knownIndices(buildIndicesBundle()).find((i) => i.id === rec?.exposure_id);
  if (!rec || !status || !index) throw new Error("the S&P 500 fund 5129275, its status and its index are in the data");
  const withStatus = (hedged: boolean, value: string | false | null) => ({ ...rec, hedged, tax_status: { ...rec.tax_status, foreign_investment_fund: { ...status, value, notes: "as the test sets it" } } });
  const ids = (hedged: boolean, value: string | false | null) => fundLabels(withStatus(hedged, value), index, "il-etf").map((l) => l.id);
  it("says the currency is taxed only where the fund is known not to be a foreign-investment fund", () => {
    expect(ids(false, false)).toContain("tax-currency");
    expect(ids(false, false)).not.toContain("tax-currency-open");
    expect(ids(false, false)).not.toContain("tax-currency-unknown");
    expect(ids(true, false)).not.toContain("tax-currency");
  });
  it("where the fund's documents name it one, says only the regulations are open; where its status is not known, says that too", () => {
    for (const hedged of [false, true]) {
      expect(ids(hedged, "USD")).toEqual(expect.arrayContaining(["tax-currency-open"]));
      expect(ids(hedged, null)).toEqual(expect.arrayContaining(["tax-currency-unknown"]));
      for (const value of ["USD", null] as const) expect(ids(hedged, value)).not.toContain("tax-currency");
      expect(ids(hedged, "USD")).not.toContain("tax-currency-unknown");
      expect(ids(hedged, null)).not.toContain("tax-currency-open");
    }
    // the words: a fund named one is said to be one; a fund whose status is not known is said not to be known
    expect(label("tax-currency-open").explain).toContain("לפי מסמכי הקרן היא קרן נאמנות להשקעות חוץ");
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
  it("says nothing of a distributing fund's statement: it stops on its distribution's open part whatever its annex states (G-35)", () => {
    expect(tax({ ...rec, distribution_policy: "distributing", tax_ruling: { ...ruling, index: main } }, "tase-foreign")).toEqual([]);
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
