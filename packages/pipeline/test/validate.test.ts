import { mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readFormulaIds, readQuestionPrefixes, readRuleBaseIds, validateData } from "../src/index.ts";
import { checkCitedPages, checkDealOnlyUnit, checkEffectiveRateUnit, checkFirstExitPoint, checkTypedFundUnit } from "../src/validate.ts";
import * as values from "../src/checks/values.ts";
import { isMachineUrl, valuesFile } from "../src/checks/values.ts";
import { testData } from "../src/checks/lib/kit.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const ruleBase = readRuleBaseIds(`${root}.claude/skills/il-finance/references`);
const formulas = readFormulaIds(`${root}docs/method.md`);

const vo = {
  value: 25,
  unit: "pct",
  source: { url: "https://main.knesset.gov.il/x", title: "s.125C", publisher: "Knesset", strength: "primary" },
  checked: "2026-10-22",
  effective_from: null,
  effective_to: null,
  tax_year: 2026,
  update_rule: "fixed in law",
  rule_ids: ["TXS-09"],
  state: "sourced",
};

function dataDir(files: Record<string, unknown>): string {
  const dir = mkdtempSync(join(tmpdir(), "data-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(join(dir, path, ".."), { recursive: true });
    writeFileSync(join(dir, path), typeof content === "string" ? content : JSON.stringify(content));
  }
  return dir;
}

const rule = {
  id: "TXS-09",
  title: "Exempt fund: tax on real gain",
  strength: "primary",
  dimensions: ["tax-at-exit"],
  likely_to_change: "no",
  figures: { rate_on_real_gain: vo },
  figure_names_he: { rate_on_real_gain: "שיעור המס על הרווח הריאלי" },
  il_finance_file: "tax-securities-israeli.md",
  checked: "2026-10-22",
  scope: "general",
};

describe("reference IDs", () => {
  it("reads rules, open questions and formulas", () => {
    expect(ruleBase.rules.has("TXS-09")).toBe(true);
    expect(ruleBase.openQuestions.has("TXK-OQ3")).toBe(true);
    expect(formulas.has("F-40")).toBe(true);
  });
});

describe("validateData", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });

  it("passes the real data/ folder", () => {
    expect(validateData({ dataDir: `${root}data`, ruleBase, formulas })).toEqual([]);
  });

  it("passes a valid rule file", () => {
    expect(run({ "rules/txs-fixture.json": rule })).toEqual([]);
  });

  it("rejects a rule ID that is not in il-finance", () => {
    const bad = { ...rule, figures: { x: { ...vo, rule_ids: ["TXS-999"] } } };
    expect(run({ "rules/txs-fixture.json": bad })[0]?.message).toMatch(/TXS-999/);
  });

  it("rejects a formula that is not in method.md", () => {
    const problems = run({ "rules/txs-fixture.json": { ...rule, extra: { formula: "F-998" } } });
    expect(problems.some((p) => /F-998/.test(p.message))).toBe(true);
  });

  it("rejects a collection with no schema yet", () => {
    expect(run({ "misc/x.json": {} })[0]?.message).toMatch(/no schema/);
  });

  it("rejects a record that names a product defined by religious law, anywhere in it", () => {
    const problems = run({ "rules/txs-fixture.json": { ...rule, text_he: "יש גם מסלול הלכה ומסלול שריעה" } });
    expect(problems.some((p) => /religious law/.test(p.message))).toBe(true);
    expect(run({ "rules/txs-fixture.json": { ...rule, text_he: "העלאה רק בתחילת השנה, אחרי הודעה במהלכה" } })).toEqual([]);
  });
});

const src = { url: "https://example.org", title: "t", publisher: "p", strength: "institution" };
const exposure = {
  id: "index-sp500",
  names: { he: ["S&P 500"], en: ["S&P 500"] },
  kind: "equity_index",
  currency: "USD",
  cash_like: false,
  return_source: { mode: "entered", series: null },
  variants: ["fund:ie00b5bmr087"],
  checked: "2026-10-23",
};
const fund = {
  id: "ie00b5bmr087",
  names: { en: ["iShares Core S&P 500"], he: [], tase: [] },
  identifiers: { isin: "IE00B5BMR087", tase_number: null, cusip: null, ticker: { LSE: "CSPX" } },
  manager: "BlackRock",
  domicile: "IE",
  legal_form: "UCITS",
  exposure_id: "index-sp500",
  currency: "USD",
  trading_currency_on_tase: null,
  distribution_policy: "accumulating",
  tax_status: { il_fund_tax_track: null },
  fees: { fixed_management: { ...vo, value: 0.07, unit: "pct_per_year" }, trustee: null },
  dimensions: { "foreign-withholding-domicile": "covered" },
  prospectus: { url: "https://example.org/p.pdf", date: null },
  snapshot: "2026-10-23",
};
const catalog = {
  id: "meitav-kaspi-shikli",
  institution: "meitav",
  where_seen: "flyer",
  seen_on: "2026-10-22",
  seen_by: "CAT-11",
  names: { he: ["כספי (שיקלי)"] },
  maps_to: { wrapper_id: "kupat-gemel-lehashkaa", cma_fund_id: 7857, track_ids: [7861] },
  near_duplicates: [],
  status: "catalogued",
};
const cmaFile = (period: string, ids: number[]) => ({
  dataset: "gemelnet",
  report_period: period,
  source: { url: "https://data.gov.il", title: "t", publisher: "p", strength: "primary" },
  checked: "2026-10-23",
  raw: { archive_key: "k", sha256: "0".repeat(64) },
  funds: ids.map((fund_id) => ({
    fund_id,
    names: { cma: ["x"] },
    managing_corporation: { name: "m", legal_id: "1" },
    controlling_corporation: "c",
    fund_classification: "f",
    target_population: "t",
    specialization: "s",
    sub_specialization: "ss",
    inception_date: null,
    raw_fields: {},
    fees: { avg_annual_management_fee: { ...vo, unit: "pct_per_year" }, avg_deposit_fee: { ...vo, unit: "pct_of_deposit" } },
  })),
});
const term = {
  id: "kupat-gemel",
  he: "קופת גמל",
  en: null,
  meaning: "הסבר",
  where: ["statement"],
  wrapper_ids: ["kupat-gemel-lehashkaa"],
  variants: [],
  rule_ids: ["TXS-09"],
  source: { ...src, checked: "2026-10-23" },
};
const dimension = { id: "tax-at-exit", he: "מס ביציאה", one_line: "הסבר", source: { ...src, checked: "2026-10-23" }, rule_ids: ["TXS-09"] };

describe("new collections", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });

  it("passes valid exposure, fund, catalogue, term and dimension files", () => {
    expect(
      run({
        "instruments/exposures/index-sp500.json": exposure,
        "funds/ie00b5bmr087@2026-10-23.json": fund,
        "catalog/meitav-kaspi-shikli.json": catalog,
        "cma/gemelnet@2026-09.json": cmaFile("2026-09", [7857, 7861]),
        "terms/kupat-gemel.json": term,
        "dimensions/tax-at-exit.json": dimension,
      }),
    ).toEqual([]);
  });

  it("fails a fund load above zero, because the page does not price one; a zero and a load left out pass", () => {
    const withLoad = (value: number | null) => ({
      ...fund,
      fees: { ...fund.fees, load: { ...vo, value, unit: "pct_of_trade", rule_ids: ["MF-21"], ...(value === null ? { notes: "not read" } : {}) } },
    });
    expect(run({ "funds/a@2026-10-31.json": withLoad(0) })).toEqual([]);
    expect(run({ "funds/a@2026-10-31.json": withLoad(null) })).toEqual([]);
    expect(run({ "funds/a@2026-10-31.json": fund })).toEqual([]);
    const problems = run({ "funds/a@2026-10-31.json": withLoad(0.5) });
    expect(problems).toHaveLength(1);
    expect(problems[0]!.message).toMatch(/load on purchase of 0\.5%.*does not yet price it/);
  });

  it("rejects an unknown exposure kind and an unknown dimension id", () => {
    expect(run({ "instruments/exposures/a.json": { ...exposure, kind: "stocks" } })[0]?.message).toMatch(/kind/);
    expect(run({ "dimensions/x.json": { ...dimension, id: "nope" } })[0]?.message).toMatch(/id/);
  });

  it("routes terms/deposits to the deposit schema, not the term schema", () => {
    const problems = run({ "terms/deposits/x.json": term });
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]?.message).toMatch(/bank|rate_type|type_447/);
  });

  it("rejects a deposit whose break column contradicts itself, and a tax bucket outside its values", () => {
    const deposit = JSON.parse(readFileSync(`${root}data/terms/deposits/hapoalim-pikadon-leshana-kavua.json`, "utf8"));
    expect(run({ "terms/deposits/x.json": deposit })).toEqual([]);
    const contradicts = run({ "terms/deposits/x.json": { ...deposit, break: { ...deposit.break, allowed: true, penalty: "not_allowed" } } });
    expect(contradicts[0]?.message).toMatch(/break\.allowed is false exactly when break\.penalty is "not_allowed"/);
    expect(run({ "terms/deposits/x.json": { ...deposit, break: { ...deposit.break, allowed: false, penalty: "none" } } })).not.toEqual([]);
    expect(run({ "terms/deposits/x.json": { ...deposit, tax_bucket: { ...deposit.tax_bucket, value: "linked_15" } } })).not.toEqual([]);
    // a null bucket comes only with an open source (code review, 2026-11-07)
    const nullAtPrimary = run({ "terms/deposits/x.json": { ...deposit, tax_bucket: { ...deposit.tax_bucket, value: null } } });
    expect(nullAtPrimary[0]?.message).toMatch(/tax_bucket\.value is null only when its source strength is "open"/);
    expect(run({ "terms/deposits/x.json": { ...deposit, tax_bucket: { ...deposit.tax_bucket, value: null, source: { ...deposit.tax_bucket.source, strength: "open" } } } })).toEqual([]);
  });

  it("rejects a catalogue track that is not in the latest CMA period", () => {
    const files = {
      "catalog/a.json": catalog,
      "cma/gemelnet@2026-08.json": cmaFile("2026-08", [7857, 7861]),
      "cma/gemelnet@2026-09.json": cmaFile("2026-09", [7857]),
    };
    const problems = run(files);
    expect(problems).toHaveLength(1);
    expect(problems[0]?.message).toMatch(/7861/);
  });

  it("rejects an exposure variant fund:<id> with no file under data/funds/", () => {
    const files = { "instruments/exposures/a.json": { ...exposure, variants: ["fund:ie00b5bmr087", "fund:missing"] }, "funds/ie00b5bmr087.json": fund };
    const problems = run(files);
    expect(problems).toHaveLength(1);
    expect(problems[0]?.message).toMatch(/fund:missing/);
  });

  it("fails two term records of one Hebrew name on the same page, and passes them on different products (§4 item 16)", () => {
    const other = { ...term, id: "kupat-gemel-b", meaning: "הסבר אחר" };
    const problems = run({ "terms/kupat-gemel.json": term, "terms/kupat-gemel-b.json": other });
    expect(problems).toHaveLength(1);
    expect(problems[0]!.message).toMatch(/two records on the same pages \(kupat-gemel-lehashkaa\): kupat-gemel-b and kupat-gemel;/);
    expect(run({ "terms/kupat-gemel.json": term, "terms/kupat-gemel-b.json": { ...other, wrapper_ids: ["keren-hishtalmut"] } })).toEqual([]);
    expect(run({ "terms/a.json": { ...term, id: "a", exposure_ids: ["index-sp500"], wrapper_ids: [] }, "terms/b.json": { ...other, id: "b", exposure_ids: ["index-sp500"], wrapper_ids: [] } })).toHaveLength(1);
  });

  it("checks rule_ids of terms and dimensions with the generic walk", () => {
    expect(run({ "terms/a.json": { ...term, rule_ids: ["NOPE-1"] } })[0]?.message).toMatch(/NOPE-1/);
    expect(run({ "dimensions/tax-at-exit.json": { ...dimension, rule_ids: ["NOPE-2"] } })[0]?.message).toMatch(/NOPE-2/);
  });
});

describe("foreign-investment funds (data-schema §4 item 21)", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });
  const fif = (value: string | false | null) => ({ ...vo, value, unit: "text", tax_year: null, update_rule: "provider-set", rule_ids: ["TXS-14"], ...(value === null ? { notes: "Neither the report nor the prospectus names the status." } : {}) });
  const israeli = (status?: string | false | null) => ({
    ...fund,
    id: "5129275",
    domicile: "IL",
    currency: "NIS",
    tax_status: { il_fund_tax_track: "exempt", ...(status === undefined ? {} : { foreign_investment_fund: fif(status) }) },
  });
  const files = (extra: Record<string, unknown>) => ({
    "instruments/exposures/index-sp500.json": { ...exposure, variants: ["fund:5129275", "fund:ie00b5bmr087"] },
    "funds/ie00b5bmr087@2026-10-23.json": fund,
    "funds/5129275@2026-10-25.json": israeli("USD"),
    ...extra,
  });
  const messages = (extra: Record<string, unknown>) => run(files(extra)).map((p) => p.message);
  it("accepts an Israeli fund's latest record that says either answer, and an older one without it", () => {
    expect(run(files({}))).toEqual([]);
    expect(run(files({ "funds/5129275@2026-10-24.json": israeli(), "funds/5129275@2026-10-25.json": israeli(false) }))).toEqual([]);
  });
  it("accepts a status not known (null) that says why, and refuses one that does not", () => {
    expect(run(files({ "funds/5129275@2026-10-25.json": israeli(null) }))).toEqual([]);
    const silent = israeli(null);
    delete (silent.tax_status.foreign_investment_fund as { notes?: string }).notes;
    expect(messages({ "funds/5129275@2026-10-25.json": silent }).some((m) => /notes must say why/.test(m))).toBe(true);
  });
  it("refuses an Israeli fund's latest record without it, a foreign record with it, a principal currency not the exposure's, and a value that is no code", () => {
    expect(messages({ "funds/5129275@2026-10-25.json": israeli() })).toEqual([expect.stringMatching(/latest record of an Israeli fund says whether/)]);
    const foreign = { ...fund, tax_status: { ...fund.tax_status, foreign_investment_fund: fif("USD") } };
    expect(messages({ "funds/ie00b5bmr087@2026-10-23.json": foreign })).toEqual([expect.stringMatching(/only an Israeli fund can be one/)]);
    expect(messages({ "funds/5129275@2026-10-25.json": israeli("EUR") })).toEqual([expect.stringMatching(/principal currency EUR is not the exposure's currency USD/)]);
    expect(messages({ "funds/5129275@2026-10-25.json": israeli("dollar") }).some((m) => /ISO 4217 code/.test(m))).toBe(true);
  });
});

describe("a foreign fund's legal structure (data-schema §3.5 legal_structure, §4 item 22, F-20)", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });
  const structure = (form: string) => ({
    form,
    source: { url: "https://mayafiles.tase.co.il/rpdf/1763001-1764000/P1763539-00.pdf", title: "iShares VII plc prospectus, 2 June 2026", publisher: "BlackRock (iShares VII plc)", strength: "institution" },
    page: 1,
    quote: "An umbrella investment company with variable capital",
    checked: "2026-10-31",
  });
  const files = (rec: unknown) => ({ "instruments/exposures/index-sp500.json": { ...exposure, variants: ["fund:ie00b5bmr087"] }, "funds/ie00b5bmr087@2026-10-23.json": rec });
  const messages = (rec: unknown) => run(files(rec)).map((p) => p.message);
  it("accepts each form of its set on a foreign fund", () => {
    for (const form of ["company", "icav", "statutory-trust", "unit-trust", "common-contractual-fund"]) expect(messages({ ...fund, legal_structure: structure(form) }), form).toEqual([]);
  });
  it("refuses a form outside the set, a form with no page, and one on an Israeli fund", () => {
    expect(messages({ ...fund, legal_structure: structure("corporation") })).toEqual([expect.stringMatching(/legal_structure/)]);
    const { page: _page, ...unpaged } = structure("company");
    expect(messages({ ...fund, legal_structure: unpaged })).toEqual([expect.stringMatching(/legal_structure/)]);
    const israeli = { ...fund, domicile: "IL", currency: "NIS", legal_structure: structure("company"), tax_status: { il_fund_tax_track: "exempt", foreign_investment_fund: { ...vo, value: false, unit: "text", tax_year: null, update_rule: "provider-set", rule_ids: ["TXS-14"] } } };
    expect(messages(israeli)).toEqual([expect.stringMatching(/legal_structure: a foreign fund's form/)]);
  });
});

describe("a fund's stated tax index (data-schema §3.5 tax_ruling.index, F-04)", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });
  const source = { url: "https://mayafiles.tase.co.il/rpdf/1244001-1245000/P1244042-01.pdf", title: "נספח לתשקיף קרן חוץ נסחרת", publisher: "BlackRock (iShares VII plc)", strength: "institution" };
  const ruled = (index: unknown) => ({
    ...fund,
    tax_ruling: { ruling_date: "2019-07-01", source, pages: { ruling: 15, sale: 16, distribution: 17 }, quote: "התקבלה בידי הקרן החלטת המיסוי", checked: "2026-11-04", index },
  });
  const main = (currency: string) => ({ basis: "main-currency", currency, page: 17, quote: "בסיס המדד לחישוב סכום אינפלציוני", currency_quote: "בקרן זו הינו דולר ארה\"ב", checked: "2026-11-25" });
  const files = (rec: unknown) => ({ "instruments/exposures/index-sp500.json": { ...exposure, variants: ["fund:ie00b5bmr087"] }, "funds/ie00b5bmr087@2026-10-23.json": rec });
  const messages = (rec: unknown) => run(files(rec)).map((p) => p.message);
  it("accepts the exposure's currency as the main currency, and the CPI", () => {
    expect(messages(ruled(main("USD")))).toEqual([]);
    expect(messages(ruled({ basis: "cpi", page: 16, quote: "בסיס ההצמדה לחישוב סכום אינפלציוני יהא מדד המחירים לצרכן", checked: "2026-11-25" }))).toEqual([]);
  });
  it("refuses a main currency that is not the exposure's, a main currency with no currency or no words naming it, a CPI that names one, and an index with no date it was read", () => {
    expect(messages(ruled(main("EUR")))).toEqual([
      expect.stringMatching(/tax_ruling\.index\.currency: the main currency EUR is not the record's own currency USD/),
      expect.stringMatching(/tax_ruling\.index\.currency: the main currency EUR is not the exposure's currency USD/),
    ]);
    const { currency: _c, ...noCurrency } = main("USD");
    expect(messages(ruled(noCurrency)).length).toBeGreaterThan(0);
    const { currency_quote: _q, ...noWords } = main("USD");
    expect(messages(ruled(noWords)).length).toBeGreaterThan(0);
    expect(messages(ruled({ basis: "cpi", currency: "USD", page: 16, quote: "מדד המחירים לצרכן", checked: "2026-11-25" })).length).toBeGreaterThan(0);
    const { checked: _d, ...undated } = main("USD");
    expect(messages(ruled(undated)).length).toBeGreaterThan(0);
  });
  it("refuses a main currency that is the exposure's but not the record's own, and one whose exposure has no file", () => {
    expect(messages({ ...ruled(main("USD")), currency: "EUR" })).toEqual([expect.stringMatching(/the main currency USD is not the record's own currency EUR/)]);
    const orphan = { ...ruled(main("USD")), exposure_id: "index-none" };
    expect(run({ "instruments/exposures/index-sp500.json": { ...exposure, variants: ["fund:ie00b5bmr087"] }, "funds/ie00b5bmr087@2026-10-23.json": orphan }).map((p) => p.message)).toEqual(
      expect.arrayContaining([expect.stringMatching(/exposure index-none has no file with a currency/)]),
    );
  });
  it("holds a Tel Aviv line with no stated index to its exposure's currency, one reading of its tax index (TXF OQ10); a shekel line and a fund bought abroad are not held", () => {
    const line = { ...fund, trading_currency_on_tase: "NIS" };
    expect(messages(line)).toEqual([]);
    expect(messages({ ...line, currency: "EUR" })).toEqual([expect.stringMatching(/the record's currency EUR, one reading of its tax index \(TXF OQ10\), is not the exposure's currency USD/)]);
    expect(messages({ ...line, currency: "NIS" })).toEqual([]);
    expect(messages({ ...fund, currency: "EUR" })).toEqual([]);
  });
});

describe("P-05 instruments map", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });
  const p05 = (instruments: unknown) => ({
    id: "illustrative-scenario",
    method_id: "P-05",
    rationale: "r",
    shown_as: "site parameter",
    instruments,
  });
  const feesFile = (lines: unknown[]) => ({
    id: "meitav",
    provider: { name_he: "מיטב", class: "provident-manager", regulator: "CMA", tase_member: false, protection_rule_ids: [] },
    tariff: { url: "https://example.org", title: "t", published: null, format: "html" },
    snapshot: "2026-10-23",
    missing: false,
    missing_reason: null,
    lines,
    averages: [],
    minimums: { account_opening: null },
    notice_rule_ids: [],
  });

  it("passes a map whose ids all exist, and a record with no map", () => {
    const files = {
      "parameters/p05.json": p05({ "ira-hishtalmut": { fund: "ie00b5bmr087", tariff: "meitav", ira_fees: "meitav" } }),
      "funds/ie00b5bmr087@2026-10-22.json": fund,
      "fees/meitav@2026-10-23.json": feesFile([{ level: "list" }]),
    };
    expect(run(files).filter((p) => p.file.startsWith("parameters"))).toEqual([]);
    expect(run({ "parameters/p05.json": { ...p05({}), instruments: undefined } })).toEqual([]);
  });

  it("names each id that does not exist, and a key that is not a wrapper", () => {
    const files = {
      "parameters/p05.json": p05({
        "bank-deposit": { deposit_terms: "no-such-deposit" },
        "brokerage-account": { fund: "no-such-fund", tariff: "no-such-provider" },
        "government-bond": { tariff: "meitav", series_rule: "GOV-99" },
        "not-a-wrapper": {},
      }),
      "fees/meitav@2026-10-23.json": feesFile([{ level: "regulator_average" }]),
    };
    const text = run(files).map((p) => p.message).join("\n");
    for (const needle of ["no-such-deposit", "no-such-fund", "no-such-provider", "GOV-99", "not-a-wrapper"]) expect(text).toContain(needle);
    expect(text).toMatch(/tariff: "meitav" has no fees snapshot with a list line/);
  });
});

describe("P-05 instruments track", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });
  const p05 = (instruments: unknown) => ({ id: "illustrative-scenario", method_id: "P-05", rationale: "r", shown_as: "site parameter", instruments });
  const cma = (period: string, ids: number[]) => ({ dataset: "gemelnet", report_period: period, funds: ids.map((fund_id) => ({ fund_id })) });
  const messages = (files: Record<string, unknown>) => run(files).filter((p) => p.file.startsWith("parameters")).map((p) => p.message).join("\n");

  it("accepts a track that is in the latest CMA period", () => {
    const files = { "parameters/p05.json": p05({ "keren-hishtalmut": { track: 880 } }), "cma/gemelnet@2026-08.json": cma("2026-08", []), "cma/gemelnet@2026-09.json": cma("2026-09", [880]) };
    expect(messages(files)).toBe("");
  });

  it("reports a track that is only in an older period, or in none", () => {
    const files = { "parameters/p05.json": p05({ "keren-hishtalmut": { track: 880 } }), "cma/gemelnet@2026-08.json": cma("2026-08", [880]), "cma/gemelnet@2026-09.json": cma("2026-09", [7978]) };
    expect(messages(files)).toMatch(/keren-hishtalmut\.track: 880 is not a fund_id in the latest/);
    expect(messages({ "parameters/p05.json": p05({ "keren-hishtalmut": { track: 880 } }) })).toMatch(/track: 880/);
  });

  it("prints a track that is not a number as it is written in the file", () => {
    const files = { "parameters/p05.json": p05({ "keren-hishtalmut": { track: { id: 880 } } }), "cma/gemelnet@2026-09.json": cma("2026-09", [880]) };
    expect(messages(files)).toContain('keren-hishtalmut.track: {"id":880} is not a fund_id');
  });
});

describe("series (data-schema 3.8)", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });
  const obs = (date: string, value: number, key?: string) => ({
    ...vo,
    value,
    unit: "index_points",
    update_rule: "market",
    rule_ids: undefined,
    date,
    ...(key ? { key } : {}),
  });
  const series = (over: Record<string, unknown> = {}) => ({
    id: "cbs-cpi",
    names: { he: ["מדד המחירים לצרכן - כללי"] },
    publisher: "Central Bureau of Statistics",
    flow: "CBS price-index API",
    series_code: "120010",
    unit: "index_points",
    cadence: "monthly",
    stale_after_days: 45,
    terms_of_use: { terms_url: "https://example.org/licence", read_on: "2026-10-23", attribution: "CBS" },
    rule_ids: [],
    observations: [obs("2026-08-01", 105.8), obs("2026-09-01", 105.3)],
    ...over,
  });

  it("passes a series with sorted observations", () => {
    expect(run({ "series/cbs-cpi.json": series() })).toEqual([]);
  });

  it("terms_of_use holds the licence page, the day it was read and the attribution line, and nothing else", () => {
    const terms = { terms_url: "https://example.org/licence", read_on: "2026-10-23", attribution: "CBS" };
    for (const field of ["status", "fallback"]) {
      const problems = run({ "series/cbs-cpi.json": series({ terms_of_use: { ...terms, [field]: "x" } }) });
      expect(problems[0]?.message).toMatch(new RegExp(field));
    }
    const { attribution: _, ...noAttribution } = terms;
    expect(run({ "series/cbs-cpi.json": series({ terms_of_use: noAttribution }) })[0]?.message).toMatch(/attribution/);
  });

  it("rejects observations out of date order and duplicates, per date and key", () => {
    const unsorted = run({ "series/cbs-cpi.json": series({ observations: [obs("2026-09-01", 105.3), obs("2026-08-01", 105.8)] }) });
    expect(unsorted.map((p) => p.message).join()).toMatch(/not sorted by date/);
    const dupe = run({ "series/cbs-cpi.json": series({ observations: [obs("2026-09-01", 105.3), obs("2026-09-01", 105.3)] }) });
    expect(dupe.map((p) => p.message).join()).toMatch(/duplicate/);
    const keyed = (k: string) => obs("2026-09-01", 3, k);
    expect(run({ "series/cbs-cpi.json": series({ unit: "pct_per_year", observations: [keyed("a"), keyed("b")].map((o) => ({ ...o, unit: "pct_per_year" })) }) })).toEqual([]);
    const sameKey = run({ "series/cbs-cpi.json": series({ unit: "pct_per_year", observations: [keyed("a"), keyed("a")].map((o) => ({ ...o, unit: "pct_per_year" })) }) });
    expect(sameKey.map((p) => p.message).join()).toMatch(/duplicate.*key a/);
  });

  it("rejects a rule id that is not in il-finance, and an unknown field (strict)", () => {
    expect(run({ "series/cbs-cpi.json": series({ rule_ids: ["CS-9999"] }) })[0]?.message).toMatch(/CS-9999/);
    expect(run({ "series/cbs-cpi.json": series({ extra: 1 }) })[0]?.message).toMatch(/extra/);
    expect(run({ "series/cbs-cpi.json": series({ rule_ids: ["CS-10"] }) })).toEqual([]);
  });
});

describe("fund lists (data-schema 3.14)", () => {
  const row = (n: string) => ({
    fund_number: n,
    isin: null,
    names: { he: ["קרן לדוגמה"] },
    manager: "מנהל",
    classification: ["מניות", "חו\"ל", "כללי"],
    exposure_code: null,
    tax_status: null,
    data_date: "2026-10-22",
  });
  const list = (over: Record<string, unknown> = {}) => ({
    list: "maya-mutual-funds",
    snapshot: "2026-10-22",
    source: { url: "https://maya.tase.co.il/he/funds/mutual-funds", title: "Maya mutual funds", publisher: "TASE", strength: "primary" },
    checked: "2026-10-22",
    terms_of_use: { terms_url: "https://example.org/terms", read_on: "2026-10-22", attribution: "TASE" },
    raw: { archive_key: "fund-lists/maya-mutual-funds@2026-10-22.csv", sha256: "a".repeat(64) },
    funds: [row("5100001"), row("5100002")],
    ...over,
  });
  const file = "fund-lists/maya-mutual-funds@2026-10-22.json";
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });

  it("passes a list", () => {
    expect(run({ [file]: list() })).toEqual([]);
  });

  it("is strict, and checks file name and duplicate fund numbers", () => {
    expect(run({ [file]: list({ extra: 1 }) })[0]?.message).toMatch(/extra/);
    expect(run({ "fund-lists/maya-mutual-funds@2026-09-22.json": list() })[0]?.message).toMatch(/file name must be/);
    expect(run({ [file]: list({ funds: [row("1"), row("1")] }) })[0]?.message).toMatch(/appears twice/);
  });

  it("exposure variants resolve against data/funds/ only, not the lists", () => {
    const problems = run({ [file]: list(), "instruments/exposures/a.json": { ...exposure, variants: ["fund:5100001"] }, "funds/ie00b5bmr087.json": fund });
    expect(problems.map((p) => p.message).join()).toMatch(/variants: fund:5100001 has no record under data\/funds\//);
  });
});

describe("open questions (data-schema 3.15, 2026-10-26; an answered one is deleted, 2026-11-08)", () => {
  const items = ruleBase.questions!;
  const fromMarkdown = items.map((q) => ({ id: q.id, status: "open" }));
  const run = (files: Record<string, unknown>, citing?: string[]) => {
    const lines: string[] = [];
    const extra = citing ? { citing: { files: citing, prefixOf: readQuestionPrefixes(`${root}.claude/skills/il-finance/references`) } } : {};
    const problems = validateData({ dataDir: dataDir(files), ruleBase, formulas, warn: (l) => lines.push(l), ...extra });
    return { problems, lines };
  };

  it("reads every numbered item under the file's prefix, none struck, and keeps the numbers of the deleted ones unused", () => {
    // 583 items on the morning of 2026-11-08, less the 163 answered ones deleted that day (founder: an answered question is deleted
    // once its answer is in a rule, and its number is never used again); one more on 2026-11-12, how an individual would apply for
    // an exemption from withholding on securities (TXS OQ25), and another, what a withdrawal at a deposit's exit point pays (BANK OQ20);
    // on 2026-11-14 five more and three answered ones deleted: whether a kupat gemel lehashkaa's deposit fee is part of the untaxed
    // principal (TXK OQ14), whether an employee's early study-fund withdrawal can reclaim the linkage part of its gains (TXH OQ18),
    // how often a deposit calculates interest (BANK OQ21), new and small banks (BANK OQ22) and the fee each child-savings manager bid
    // in the 2016 tender (CS OQ18); BANK OQ7, KGL OQ12 and BRK OQ2 deleted, bills that lapsed with the 25th Knesset; later that day
    // three more from the combinations sweep, the Commissioner's approved fee variables (PF OQ19), what reg. 7 lets an IRA fund be
    // charged (IRA OQ17) and the non-bank fund trade lines on money-market units (MF OQ23), and PEN OQ28 deleted, the 2013
    // insurance-cover regulations now read in the gazette (PEN-15); later still, from the tax-questions pass, three more and one answered:
    // whether an unused s.45A credit is lost, refunded or carried (TXP OQ20), whether the 2003 regulations on a foreign-investment
    // fund's index still operate (TXS OQ26) and what keeps the 2028 indexation from being exact (TXG OQ16); TXG OQ8 deleted, the
    // bill's explanatory notes say the 2028 indexation adds only the 2027 CPI rise (TXG-06), and which Israeli funds One Zero has
    // distribution agreements for (BRK OQ24); 2026-11-14 two more, which fund the fee regulations' "ישיר ביטחון" is and whether the
    // guaranteed-yield exclusion takes a named fund whole (CAT OQ36), and what a fall of the CPI does to the s.120ב amounts after
    // the freeze (TXG OQ17), and what a fall of the CPI does to the gemel lehashkaa deposit ceiling (KGL OQ15); later that day one more,
    // which currency's 2.5 minimum Interactive Israel charges on a USD-traded listing on the LSE (BRK OQ25); 2026-11-15 eleven more,
    // the new file on how bonds behave (BND OQ1 to OQ11); later that day seven of those answered by the proofs in method.md section 14
    // and deleted (BND OQ1, 3, 4, 7, 8, 9, 11) and two more asking for research (BND OQ12, 13); later that day one more, amendments
    // of the 1964 provident-fund rules from ק"ת 10716 (2023) to the end of 2024, a gap in the reading of reg. 34(ב)(1) (TXK OQ15);
    // later that day four more, what a provident fund for annuity pays on death without insurance and its standard bylaw's base text
    // (PEN OQ32), how often a general pension fund credits its demographic surplus (PEN OQ33), an insurer's minimum age for an
    // annuity from provident money (INS OQ18), and a deposit ceiling on a brokerage account (BRK OQ26); 2026-11-18 from the bond-tax
    // pass one more, whether s.9(13)'s linkage exemption and the exchange-rate index reach a taxable bond fund (TXS OQ27), and from the
    // bond-domain pass four more and one answered: the TASE bond-index methodology files (ETF OQ38), when a Tel-Gov index drops a bond
    // near its redemption (ETF OQ39), whether Israeli bond ETFs pay out (ETF OQ40) and a bond's removal within the month on default
    // (CORP OQ21); CORP OQ8 deleted, the Tel-Bond and Tel-Gov rules now read on TASE's own pages and board decisions (ETF-84 to ETF-88);
    // 2026-11-22 one more, whether a securities order at the same bank, or the movement it makes, is an action on a current account (BANK OQ23);
    // 2026-11-23 one more, how interest below zero is taxed (TXI OQ20);
    // 2026-11-26 three more, which step table an ETF's orders follow (ETF OQ41), whether a US fund trades only in the US or an Irish one
    // only in Europe (ETF OQ42), and Invesco Markets plc's own prospectus (ETF OQ43); later that day one more, whether a provident fund
    // for annuity balances actuarially (PEN OQ34), a "not found" moved out of PEN-66 in the popup sweep
    // 455 with the IRS guidance being considered on a US fund that avoids paying out (TXF OQ28)
    expect(items.length).toBe(455);
    expect(items.filter((q) => q.struck)).toEqual([]);
    expect(items.find((q) => q.id === "PEN OQ7")).toMatchObject({ file: "pension-and-gemel-lekitzba.md", struck: false });
    expect(items.some((q) => q.id === "TXP OQ3")).toBe(false);
    expect(items.some((q) => q.id === "TXP OQ6")).toBe(true);
  });

  it("fails a struck item left in the markdown, and says to delete it", () => {
    const withStruck = { ...ruleBase, questions: [...items, { id: "TXP OQ99", file: "tax-pension-gemel-lekitzba.md", struck: true }] };
    const problems = validateData({ dataDir: dataDir({}), ruleBase: withStruck, formulas, warn: () => {} });
    expect(problems.map((p) => p.message)).toEqual(expect.arrayContaining([expect.stringMatching(/^TXP OQ99 is struck: .*; delete it$/)]));
  });

  it("passes a file that matches the markdown, and is strict", () => {
    expect(run({ "open-questions.json": fromMarkdown }).problems).toEqual([]);
    const bad = run({ "open-questions.json": [{ id: "PEN OQ7", status: "closed", closed_on: "2026-10-26" }, { id: "TXI OQ19", status: "open", note: "x" }] }).problems;
    const text = bad.map((p) => p.message).join("\n");
    expect(text).toMatch(/0\.status/);
    expect(text).toMatch(/closed_on/);
    expect(text).toMatch(/note/);
  });

  it("fails an answered_by id the rule base does not hold", () => {
    const withAnswers = fromMarkdown.map((q) => (q.id === "PEN OQ7" ? { ...q, status: "narrowed", answered_by: ["PEN-15", "PEN-999"] } : q));
    expect(run({ "open-questions.json": withAnswers }).problems.map((p) => p.message)).toEqual(["PEN OQ7 answered_by: PEN-999 is not a rule in il-finance (data-schema §4 item 2)"]);
  });

  it("warns when the file is behind the markdown", () => {
    const behind = fromMarkdown.filter((q) => q.id !== "BANK OQ1");
    const { problems, lines } = run({ "open-questions.json": [...behind, { id: "ZZZ OQ1", status: "open" }] });
    expect(problems).toEqual([]);
    const line = lines.find((l) => l.includes("behind the rule base"))!;
    expect(line).toMatch(/BANK OQ1 missing/);
    expect(line).toMatch(/ZZZ OQ1 not in the markdown/);
  });

  it("fails a question the rule base does not have, in a guide record's lists and marks and in any text of data/", () => {
    const record = { id: "x", open_questions: ["TXP-OQ3", "PEN-OQ7"], tax_at_exit: { blocked_by: ["TXP-OQ3"] }, dimensions: { "real-vs-nominal": "blocked:PEN-OQ8" }, notes: "the whole amount (TXP-18; TXP OQ3 closed); PEN OQ7 is open" };
    const messages = run({ "open-questions.json": fromMarkdown, "instruments/exposures/x.json": record }).problems.map((p) => p.message);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^open_questions: TXP-OQ3 is not an open question in il-finance/),
        expect.stringMatching(/^blocked_by: TXP-OQ3 is not an open question in il-finance/),
        expect.stringMatching(/^TXP OQ3 is not a question of the rule base/),
        expect.stringMatching(/^PEN OQ8 is not a question of the rule base/),
      ]),
    );
    expect(messages.some((m) => /PEN.OQ7/.test(m))).toBe(false);
  });

  it("fails a code, or a question a rule-base file names in words, that the rule base does not have, in the files it is given", () => {
    const dir = mkdtempSync(join(tmpdir(), "cite-"));
    const doc = join(dir, "method.md");
    writeFileSync(doc, "G-06 closed (TXP-18; TXP OQ3 closed); still open: PEN OQ7, GOV OQ2, OQ99.");
    const md = join(dir, "tax-pension-gemel-lekitzba.md");
    writeFileSync(md, "The base is the whole amount (open question 3, closed 2026-10-26). See open question 6 and `pension-and-gemel-lekitzba.md` open question 7; domain question 3 is the landscape report's.");
    const found = run({ "open-questions.json": fromMarkdown }, [doc, md]).problems.map((p) => `${p.file.split(/[\\/]/).pop()}: ${p.message.split(" is ")[0]}`);
    expect(found.sort()).toEqual(["method.md: GOV OQ99", "method.md: TXP OQ3", "tax-pension-gemel-lekitzba.md: TXP OQ3"]);
  });

  it("fails a bare blocked mark and a blocked mark whose question the record does not list (no leftovers, 2026-11-07)", () => {
    const wrapper = { id: "x", open_questions: ["PEN-OQ7"], dimensions: { "loss-offset": "blocked", currency: "blocked:TXP-OQ9", "real-vs-nominal": "blocked:PEN-OQ7" } };
    const messages = run({ "open-questions.json": fromMarkdown, "instruments/wrappers/x.json": wrapper }).problems.map((p) => p.message);
    expect(messages).toEqual(expect.arrayContaining([expect.stringMatching(/^dimensions.loss-offset: a bare "blocked" names no open question/), expect.stringMatching(/^dimensions.currency: TXP-OQ9 blocks it but is not in the record's open_questions/)]));
    expect(messages.some((m) => m.startsWith("dimensions.real-vs-nominal"))).toBe(false);
  });

  it("fails a record whose moving-tax mark is open while its own value says whether a move is taxed (no leftovers since TXP-32, 2026-11-07)", () => {
    const wrapper = { id: "pension-comprehensive", open_questions: ["SW-OQ9"], switch_is_tax_event: { value: false }, dimensions: { "switching-tax-event": "blocked:SW-OQ9" } };
    const { problems } = run({ "open-questions.json": fromMarkdown, "instruments/wrappers/pension-comprehensive.json": wrapper });
    expect(problems.map((p) => p.message)).toEqual(expect.arrayContaining([expect.stringMatching(/^dimensions.switching-tax-event is blocked:SW-OQ9 but switch_is_tax_event is known \(false\); mark it covered/)]));
  });

  it("prints a moving-tax value that is not a plain value as it is written in the file", () => {
    const wrapper = { id: "pension-comprehensive", open_questions: ["SW-OQ9"], switch_is_tax_event: { value: { taxed: false } }, dimensions: { "switching-tax-event": "blocked:SW-OQ9" } };
    const { problems } = run({ "open-questions.json": fromMarkdown, "instruments/wrappers/pension-comprehensive.json": wrapper });
    expect(problems.map((p) => p.message)).toEqual(expect.arrayContaining([expect.stringContaining('switch_is_tax_event is known ({"taxed":false})')]));
  });
});

// D30 (8dd1f013:research/specs/2026-10-25-rules-scope/spec.md §3): who a rule applies to, and where it may appear
describe("scope", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas, warn: () => {} });
  const harel = { id: "harel", name_he: "הראל", kind: "provident-manager", scope_names: [{ name: "Harel" }], cma_legal_id: null, fees_id: null, deposit_bank_id: null, own_hosts: ["harel-group.co.il"] };
  const harelFunds = { id: "harel-funds", name_he: "הראל קרנות נאמנות", kind: "fund-manager", scope_names: [{ name: "Harel", only_records: ["ETF-64"] }], cma_legal_id: null, fees_id: null, deposit_bank_id: null, own_hosts: [], filing_names: ["הראל"] };
  const src = (kind: string, strength: string) => ({ url: "https://example.org/x", title: "x", publisher: "x", kind, strength, checked: "2026-10-22" });
  const cs30 = { ...rule, id: "CS-30", title: "Harel's fee after 21", il_finance_file: "child-savings.md", figures: undefined, dimensions: ["fee-management-balance"], scope: "institution", scope_institutions: [{ id: "harel", name_he: "הראל" }] };

  it("reads the three Scope forms and resolves a shared name by its record", async () => {
    const { scopeFromLine } = await import("../src/scope.ts");
    const reg = [harel, harelFunds] as never;
    expect(scopeFromLine("general", "X-1", reg).fields).toEqual({ scope: "general" });
    expect(scopeFromLine("institution: Harel", "CS-30", reg).fields).toEqual({ scope: "institution", scope_institutions: [{ id: "harel", name_he: "הראל" }] });
    expect(scopeFromLine("institution: Harel", "ETF-64", reg).fields?.scope_institutions).toEqual([{ id: "harel-funds", name_he: "הראל קרנות נאמנות" }]);
    expect(scopeFromLine("unsettled: a CMA circular; seen at: Harel", "PEN-37", reg).fields).toEqual({ scope: "unsettled", scope_settle: "a CMA circular", scope_institutions: [{ id: "harel", name_he: "הראל" }] });
    expect(scopeFromLine("unsettled; seen at: Harel", "TXK-28", reg).problems[0]).toMatch(/not what would settle it/);
    expect(scopeFromLine("institution: Nobody", "X-1", reg).problems[0]).toMatch(/Nobody/);
    expect(scopeFromLine("company: Harel", "X-1", reg).problems[0]).toMatch(/none of the three forms/);
  });

  it("fails a general rule whose first source is a company's document, and passes an official one", () => {
    const bad = { ...rule, sources: [src("institution_doc", "institution")] };
    expect(run({ "rules/txs-fixture.json": bad }).map((p) => p.message).join("\n")).toMatch(/first source is a company's document/);
    expect(run({ "rules/txs-fixture.json": { ...rule, sources: [src("law", "primary")] } }).filter((p) => /scope/.test(p.message))).toEqual([]);
    expect(run({ "rules/txs-fixture.json": { ...rule, sources: [src("other", "primary")] } }).filter((p) => /scope/.test(p.message))).toEqual([]);
    expect(run({ "rules/txs-fixture.json": { ...rule, sources: [src("article", "secondary")] } }).map((p) => p.message).join("\n")).toMatch(/not a general source/);
  });

  it("fails a company's term in the questions page, the guide blocks, a wrapper's rule_ids and company_terms, and a company-sourced value", () => {
    const pinned = { rows: [{ ids: ["CS-30"], question_he: "?" }], guide_blocks: { "child-savings-provident": ["CS-30"] } };
    const files = { "rules/cs-30.json": cs30, "sources/institutions.json": [harel], "parameters/pinned-rules.json": pinned };
    const messages = run(files).map((p) => p.message).join("\n");
    expect(messages).toMatch(/questions page holds general rules only; CS-30/);
    expect(messages).toMatch(/"שווה לדעת" of child-savings-provident holds general rules only/);
    // a wrapper (partial on purpose: the schema reports the rest, the scope walk still reads it)
    const wrapper = { fee_caps: { balance: { value: 0.23, unit: "pct_per_year", source: { url: "https://example.org", title: "Harel bylaw", publisher: "Harel", strength: "institution" }, rule_ids: ["CS-30"] } }, company_terms: { "fee-management-balance": ["TXS-09"], "fee-deposit": ["CS-30"] } };
    const w = run({ "rules/cs-30.json": cs30, "rules/txs-fixture.json": rule, "sources/institutions.json": [harel], "instruments/wrappers/child-savings-provident.json": wrapper }).map((p) => p.message).join("\n");
    expect(w).toMatch(/a wrapper is a product context and cites general rules only; CS-30/);
    expect(w).toMatch(/holds a value whose source is a company's document \("Harel bylaw"\)/);
    expect(w).toMatch(/company_terms.fee-management-balance: TXS-09 is general/);
    expect(w).toMatch(/company_terms.fee-deposit: CS-30 does not carry the dimension fee-deposit/);
  });

  it("fails an institution rule naming a company the registry does not have, or under another name", () => {
    const stranger = { ...cs30, scope_institutions: [{ id: "nobody", name_he: "אף אחד" }] };
    expect(run({ "rules/cs-30.json": stranger, "sources/institutions.json": [harel] }).map((p) => p.message).join("\n")).toMatch(/nobody is not in data\/sources\/institutions.json/);
    const renamed = { ...cs30, scope_institutions: [{ id: "harel", name_he: "הראל ביטוח" }] };
    expect(run({ "rules/cs-30.json": renamed, "sources/institutions.json": [harel] }).map((p) => p.message).join("\n")).toMatch(/is "הראל" in the registry/);
  });

  // review, 2026-10-26
  const harelDoc = { url: "https://media.harel-group.co.il/bylaw.pdf", title: "Harel bylaw", publisher: "Harel", kind: "institution_doc", strength: "institution", checked: "2026-10-22" };
  const press = { url: "https://www.bizportal.co.il/a", title: "Harel in the press", publisher: "Bizportal", kind: "article", strength: "secondary", checked: "2026-10-22" };

  it("fails a company's term that cites none of its company's own documents, and passes one that does", () => {
    const fromPress = { ...cs30, sources: [press] };
    expect(run({ "rules/cs-30.json": fromPress, "sources/institutions.json": [harel] }).map((p) => p.message).join("\n")).toMatch(/cites no own document of a company it names/);
    const fromBylaw = { ...cs30, sources: [harelDoc] };
    expect(run({ "rules/cs-30.json": fromBylaw, "sources/institutions.json": [harel] }).map((p) => p.message).join("\n")).not.toMatch(/cites no own document/);
  });

  it("fails a general rule that derives from a company's term, and an example that is general", () => {
    const general = { ...rule, sources: [src("law", "primary")], derived_from: ["CS-30"] };
    const files = { "rules/txs-fixture.json": general, "rules/cs-30.json": { ...cs30, sources: [harelDoc] }, "sources/institutions.json": [harel] };
    expect(run(files).map((p) => p.message).join("\n")).toMatch(/a general rule derives from general rules only; CS-30 is institution/);
    const asExample = { ...rule, sources: [src("law", "primary")], examples: ["CS-30"] };
    expect(run({ ...files, "rules/txs-fixture.json": asExample }).map((p) => p.message).join("\n")).not.toMatch(/derives from|examples:/);
    const generalExample = { ...cs30, id: "CS-18", scope: "general", scope_institutions: undefined, sources: [src("law", "primary")], examples: ["TXS-09"] };
    expect(run({ "rules/txs-fixture.json": { ...rule, sources: [src("law", "primary")] }, "rules/cs-18.json": generalExample }).map((p) => p.message).join("\n")).toMatch(/examples: TXS-09 is general/);
  });

  it("allows a not-rule only in the files its entry names, and fails an entry whose file no longer cites it", () => {
    const ira28 = { ...cs30, id: "IRA-28", il_finance_file: "ira-self-directed.md", dimensions: ["protection"], sources: [press] };
    const wrapper = (id: string) => ({ protection: { rule_ids: [id] } });
    const ok = run({ "rules/ira-28.json": ira28, "sources/institutions.json": [harel], "instruments/wrappers/ira-provident.json": wrapper("IRA-28"), "instruments/wrappers/ira-hishtalmut.json": wrapper("IRA-28") }).map((p) => p.message).join("\n");
    expect(ok).not.toMatch(/IRA-28 is institution/);
    expect(ok).not.toMatch(/no longer stands/);
    const elsewhere = run({ "rules/ira-28.json": ira28, "sources/institutions.json": [harel], "instruments/wrappers/brokerage-account.json": wrapper("IRA-28") }).map((p) => p.message).join("\n");
    expect(elsewhere).toMatch(/cites general rules only; IRA-28 is institution: harel \(D30\); it is a not-rule allowed only in its own files/);
    const stale = run({ "rules/ira-28.json": ira28, "sources/institutions.json": [harel], "instruments/wrappers/ira-provident.json": wrapper("IRA-28"), "instruments/wrappers/ira-hishtalmut.json": wrapper("TXS-09"), "rules/txs-fixture.json": rule }).map((p) => p.message).join("\n");
    expect(stale).toMatch(/notRules: IRA-28 no longer stands in data\/instruments\/wrappers\/ira-hishtalmut.json/);
  });

  // review round 3, 2026-10-26: every data file is read, and a named file that is gone fails
  it("fails a not-rule cited in a data file its entry does not name, and an entry naming a file that does not exist", () => {
    const ira28 = { ...cs30, id: "IRA-28", il_finance_file: "ira-self-directed.md", dimensions: ["protection"], sources: [press] };
    const cite = { rule_ids: ["IRA-28"] };
    const named = { "instruments/wrappers/ira-provident.json": { protection: cite }, "instruments/wrappers/ira-hishtalmut.json": { protection: cite }, "dimensions/protection.json": cite, "dimensions/regulator.json": cite };
    const all = run({ "rules/ira-28.json": ira28, "sources/institutions.json": [harel], ...named }).map((p) => p.message).join("\n");
    expect(all).not.toMatch(/notRules|does not name/);
    const term = run({ "rules/ira-28.json": ira28, "sources/institutions.json": [harel], ...named, "terms/x.json": cite }).map((p) => p.message).join("\n");
    expect(term).toMatch(/IRA-28 is a not-rule \(a regulator's announcement of an event at one company \(Slice\), institution: harel\) cited in data\/terms\/x.json, which its entry in notRules/);
    const { "dimensions/regulator.json": _gone, ...withoutOne } = named;
    const gone = run({ "rules/ira-28.json": ira28, "sources/institutions.json": [harel], ...withoutOne }).map((p) => p.message).join("\n");
    expect(gone).toMatch(/notRules: IRA-28 names data\/dimensions\/regulator.json, which does not exist/);
  });

  it("fails a company_terms entry naming a company whose document the record does not cite", () => {
    const leumi = { id: "leumi", name_he: "בנק לאומי", kind: "bank", scope_names: [{ name: "Bank Leumi" }], cma_legal_id: null, fees_id: null, deposit_bank_id: null, own_hosts: ["leumi.co.il"] };
    const both = { ...cs30, dimensions: ["minimum"], scope_institutions: [{ id: "harel", name_he: "הראל" }, { id: "leumi", name_he: "בנק לאומי" }], sources: [harelDoc] };
    const wrapper = (companies: string[]) => ({ company_terms: { minimum: [{ rule: "CS-30", companies }] } });
    const files = { "rules/cs-30.json": both, "sources/institutions.json": [harel, leumi] };
    expect(run({ ...files, "instruments/wrappers/child-savings-provident.json": wrapper(["harel"]) }).map((p) => p.message).join("\n")).not.toMatch(/is not listed at/);
    expect(run({ ...files, "instruments/wrappers/child-savings-provident.json": wrapper(["leumi"]) }).map((p) => p.message).join("\n")).toMatch(/company_terms.minimum: CS-30 is not listed at leumi/);
    // a record that names several companies, cited by its bare id, would name them all: the entry must say which
    const bare = run({ ...files, "instruments/wrappers/child-savings-provident.json": { company_terms: { minimum: ["CS-30"] } } }).map((p) => p.message).join("\n");
    expect(bare).toMatch(/company_terms.minimum: CS-30 names 2 companies; write \{ "rule": "CS-30", "companies": \[\.\.\.\] \}/);
    const single = run({ "rules/cs-30.json": { ...cs30, dimensions: ["minimum"], sources: [harelDoc] }, "sources/institutions.json": [harel], "instruments/wrappers/child-savings-provident.json": { company_terms: { minimum: ["CS-30"] } } }).map((p) => p.message).join("\n");
    expect(single).not.toMatch(/names \d companies/);
  });

  it("lets an index page cite only the provider records named for it", () => {
    const sp = { id: "sp-dji", name_he: "S&P Dow Jones Indices", kind: "index-provider", scope_names: [{ name: "S&P Dow Jones Indices" }], cma_legal_id: null, fees_id: null, deposit_bank_id: null, own_hosts: ["spglobal.com"] };
    const spDoc = { url: "https://www.spglobal.com/x.pdf", title: "S&P methodology", publisher: "S&P", kind: "other", strength: "institution", checked: "2026-10-22" };
    const etf = (id: string) => ({ ...cs30, id, il_finance_file: "etfs-and-index-funds.md", dimensions: [], scope_institutions: [{ id: "sp-dji", name_he: "S&P Dow Jones Indices" }], sources: [spDoc] });
    const exposure = (ids: string[]) => ({ id: "index-sp500", rules: { rule_ids: ids } });
    const files = { "rules/etf-37.json": etf("ETF-37"), "rules/etf-46.json": etf("ETF-46"), "sources/institutions.json": [sp] };
    expect(run({ ...files, "instruments/exposures/index-sp500.json": exposure(["ETF-37"]) }).map((p) => p.message).join("\n")).not.toMatch(/an exposure page cites/);
    expect(run({ ...files, "instruments/exposures/index-sp500.json": exposure(["ETF-46"]) }).map((p) => p.message).join("\n")).toMatch(/an exposure page cites general rules only, and the records of its index provider that ownContextExposures names; ETF-46/);
  });

  it("fails two registry rows that both claim a name as their default", () => {
    const twin = { ...harelFunds, scope_names: [{ name: "Harel" }] };
    expect(run({ "sources/institutions.json": [harel, twin] }).map((p) => p.message).join("\n")).toMatch(/the name "Harel" is the default of harel and harel-funds/);
  });
});

describe("a link opens the page it cites (2026-11-12)", () => {
  const pdf = "https://www.gov.il/BlobFolder/x/he/doc.pdf";
  it("fails an address whose #page= is not the cited page", () => {
    expect(checkCitedPages({ sources: [{ url: `${pdf}#page=6`, page: 5 }] })).toEqual([expect.stringContaining("sources[0]: the link opens page 6 but the page cited is 5")]);
    expect(checkCitedPages({ sources: [{ url: `${pdf}#page=5`, page: 5 }, { url: pdf, page: 9 }, { url: pdf }] })).toEqual([]);
  });
  it("fails a page past the file's last page, whether it comes from the address or from `page`", () => {
    const filePages = new Map([[pdf, 12]]);
    expect(checkCitedPages({ figures: [{ source: { url: pdf, page: 246 } }] }, filePages)).toEqual([expect.stringContaining("figures[0].source: the link opens page 246, past the file's last page (12)")]);
    expect(checkCitedPages({ sources: [{ url: `${pdf}#page=13`, page: 13 }] }, filePages)).toHaveLength(1);
    expect(checkCitedPages({ sources: [{ url: `${pdf}#page=12`, page: 12 }] }, filePages)).toEqual([]);
    // a file the library does not hold is not judged on its length
    expect(checkCitedPages({ sources: [{ url: "https://example.org/other.pdf", page: 900 }] }, filePages)).toEqual([]);
  });
  it("judges a fee record's left-out page against the entry's own document, else the tariff's", () => {
    const part11 = "https://www.bank.example/part-11.pdf";
    const filePages = new Map([[pdf, 5], [part11, 60]]);
    const rec = (entry: object) => ({ tariff: { url: pdf, title: "חלק 4" }, left_out: [{ what: "x", why: "y", ...entry }] });
    expect(checkCitedPages(rec({ page: 43 }), filePages)).toEqual([expect.stringContaining("left_out[0]: the link opens page 43, past the file's last page (5)")]);
    expect(checkCitedPages(rec({ page: 43, source: { url: part11, title: "חלק 11" } }), filePages)).toEqual([]);
    expect(checkCitedPages(rec({ page: 61, source: { url: part11, title: "חלק 11" } }), filePages)).toEqual([expect.stringContaining("left_out[0]: the link opens page 61, past the file's last page (60)")]);
    expect(checkCitedPages(rec({ page: 5 }), filePages)).toEqual([]);
  });
});

describe("a deposit's first exit point (2026-11-12)", () => {
  const rec = (exit_points: unknown, notes: string) => ({ exit_points, rate_offered: { notes } });
  const noFirst = { exists: true, every_months: 12, first_after_months: null };
  it("a record with no first exit point may not quote the bank dating one", () => {
    expect(checkFirstExitPoint(rec(noFirst, "'תחנות יציאה בתום 5 שנים, ולאחר מכן כל שנה'"))).toEqual([expect.stringContaining("dates an exit point")]);
    expect(checkFirstExitPoint(rec(noFirst, "'תחנת יציאה ראשונה לאחר 36 חודשים'"))).toHaveLength(1);
    expect(checkFirstExitPoint(rec(noFirst, "'מתום שנתיים תחנות כל שנה'"))).toHaveLength(1);
    // the words as the records hold them: the bank's, quoted inside the collector's English
    expect(checkFirstExitPoint(rec(noFirst, "break 'אין אפשרות לשבירת הפיקדון', exit points 'קיימת' 'לאחר 120 חודשים וכל 12 חודשים בהמשך', remark '-'"))).toHaveLength(1);
    expect(checkFirstExitPoint(rec(noFirst, "exit points 'בתום שנה וחצי'"))).toHaveLength(1);
    expect(checkFirstExitPoint(rec(noFirst, "exit points 'קיימת' 'מ 25 חודש ובכל יום בהמשך לפי תנאי העסקה'"))).toHaveLength(1);
    expect(checkFirstExitPoint(rec(noFirst, "Exit points on the product page: 'תחנות מתום חצי שנה וכל חצי שנה לאחר מכן'"))).toHaveLength(1);
  });
  it("passes a record that carries its first, one whose bank prints only how often they come, and one without exit points", () => {
    expect(checkFirstExitPoint(rec({ exists: true, every_months: 12, first_after_months: 60 }, "'תחנות יציאה בתום 5 שנים, ולאחר מכן כל שנה'"))).toEqual([]);
    expect(checkFirstExitPoint(rec({ exists: true, every_months: 6, first_after_months: null }, "ExitPointsFreq 'חצי שנתית'; amount 'החל מ-50 ₪'. בתום תקופת החיסכון הפיקדון מתחדש"))).toEqual([]);
    expect(checkFirstExitPoint(rec({ exists: true, every_months: 1, first_after_months: null }, "amount 'החל מ-1000 ₪', exit points 'קיימת' 'כל חודש', remark 'בעת משיכה לפני סוף תקופת החיסכון יתקבלו 100% מהריבית הצבורה'"))).toEqual([]);
    expect(checkFirstExitPoint(rec({ exists: true, every_months: 12, first_after_months: null }, "product page 'תחנות יציאה מדי שנה'"))).toEqual([]);
    expect(checkFirstExitPoint(rec({ exists: false, every_months: null }, "'אין תחנות יציאה; בתום 5 שנים הפיקדון נפרע'"))).toEqual([]);
  });

  it("catches every collected record that carries a first, were its first taken away, and none that has none", () => {
    const dir = fileURLToPath(new URL("../../../data/terms/deposits/", import.meta.url));
    let withFirst = 0;
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      const r = JSON.parse(readFileSync(dir + f, "utf8")) as { exit_points: { exists: boolean; every_months: number | null; first_after_months?: number | null } };
      if (!r.exit_points.exists) continue;
      expect(checkFirstExitPoint(r), f).toEqual([]);
      if (typeof r.exit_points.first_after_months !== "number") continue;
      withFirst++;
      expect(checkFirstExitPoint({ ...r, exit_points: { ...r.exit_points, first_after_months: null } }), f).toHaveLength(1);
    }
    expect(withFirst).toBeGreaterThan(40);
  });
});

describe("the unit of a rate quoted as effective (data-schema §2)", () => {
  const v = (unit: string) => ({ value: 3.2, unit });
  it("stands only in P-05's cash_rate: a deposit record's rate_offered is a directive 447 rate, nominal (BANK-50)", () => {
    expect(checkEffectiveRateUnit("parameters", { method_id: "P-05", inputs: { cash_rate: v("pct_per_year_effective"), "A-01": v("pct_per_year") } })).toEqual([]);
    expect(checkEffectiveRateUnit("terms/deposits", { rate_offered: v("pct_per_year_effective") })).toEqual([expect.stringContaining("rate_offered: unit pct_per_year_effective is read only in parameters inputs.cash_rate")]);
    // a bank's printed effective rate is effective by its field, and nothing reads the unit there
    expect(checkEffectiveRateUnit("terms/deposits", { rate_offered: v("pct_per_year"), interest_calc: { effective_annual: v("pct_per_year_effective") } })).toEqual([
      expect.stringContaining("interest_calc.effective_annual: unit pct_per_year_effective is read only in"),
    ]);
    expect(checkEffectiveRateUnit("parameters", { inputs: { "A-01": v("pct_per_year_effective") } })).toHaveLength(1);
    expect(checkEffectiveRateUnit("series", { points: [v("pct_per_year_effective")] })).toEqual([expect.stringContaining("points[0]")]);
  });
});

describe("a price per dollar in agorot, a deal's unit (data-schema §2)", () => {
  it("is refused in a record, which prices a dollar converted in shekels", () => {
    const line = (unit: string) => ({ lines: [{ id: "x-fx", rate: { value: unit === "agorot_per_usd" ? 1.5 : 0.015, unit } }] });
    expect(checkDealOnlyUnit(line("nis_per_usd"))).toEqual([]);
    expect(checkDealOnlyUnit(line("agorot_per_usd"))).toEqual([expect.stringContaining("lines[0].rate: unit agorot_per_usd is a deal's")]);
  });
});

describe("an amount in agorot, a typed fund's unit price (data-schema §2)", () => {
  it("is refused in every field of a record, the share price left to its own check", () => {
    const amount = (unit: string) => ({ value: unit === "agorot" ? 990 : 9.9, unit });
    expect(checkTypedFundUnit({ lines: [{ id: "x-trade", min: amount("nis") }] })).toEqual([]);
    expect(checkTypedFundUnit({ lines: [{ id: "x-trade", min: amount("agorot") }] })).toEqual([expect.stringContaining("lines[0].min: unit agorot is a typed fund's unit price")]);
    expect(checkTypedFundUnit({ fees: { trustee: amount("agorot") } })).toEqual([expect.stringContaining("fees.trustee: unit agorot")]);
    expect(checkTypedFundUnit({ share_price: amount("agorot") })).toEqual([]);
    expect(checkTypedFundUnit(amount("agorot"))).toEqual([expect.stringContaining("(record): unit agorot")]);
  });
});

describe("the value checks of the collected collections (src/checks/values.ts)", () => {
  const sourced = (over: Record<string, unknown>) => ({ ...vo, rule_ids: [], update_rule: "market", ...over });
  const page = { url: "https://data.gov.il/he/datasets/cma/gemelnet", title: "t", publisher: "CMA", publisher_he: "רשות שוק ההון, ביטוח וחיסכון", strength: "primary", fetched_from: "https://data.gov.il/dataset/x/resource/y/download/file.csv" };
  const series = (observations: unknown[]) => ({ id: "planted", observations });
  const found = (observations: unknown[]) => values.check(testData(dataDir({ "series/planted.json": series(observations) }))).map((p) => p.message.replace(/: .*/, ""));

  it("passes a value that names its publisher, opens a page, says why it is empty and has a Hebrew note", () => {
    expect(found([sourced({ source: page }), sourced({ source: page, value: null, notes: "הסיבה לא ידועה.", empty_because: "unknown" }), sourced({ source: page, notes: "a working note", notes_he: "שורה לקורא." })])).toEqual([]);
  });

  it("finds an empty value with no reason, a portal source with no publisher, a machine address as the link, and an English note with no notes_he", () => {
    const { publisher_he: _, ...noName } = page;
    expect(found([sourced({ source: page, value: null, notes: "הסיבה לא ידועה." }), sourced({ source: noName }), sourced({ source: { ...page, url: page.fetched_from } }), sourced({ source: page, notes: "inferred, not stated" })])).toEqual([
      "series/planted#/observations/0 (empty-because)",
      "series/planted#/observations/1 (publisher)",
      "series/planted#/observations/2 (machine-url)",
      "series/planted#/observations/3 (notes-he)",
    ]);
    // a CMA period file's tracks are records of their own
    const cma = { dataset: "gemelnet", report_period: "2026-09", funds: [{ fund_id: 7, fees: { avg_deposit_fee: sourced({ source: page, value: null, notes: "הסיבה לא ידועה." }) } }] };
    expect(values.check(testData(dataDir({ "cma/gemelnet@2026-09.json": cma }))).map((p) => p.message.replace(/: .*/, ""))).toEqual(["cma/gemelnet/7#/fees/avg_deposit_fee (empty-because)"]);
  });

  it("asks a publisher of a portal whatever its host is written as, and not of a publisher's own data host", () => {
    const bare = (url: string, fetched_from: string) => ({ url, title: "t", publisher: "x", strength: "primary", fetched_from });
    expect(found([sourced({ source: bare("https://WWW.gov.il/he/pages/x", "https://example.org/a.csv") }), sourced({ source: bare("https://data.ecb.europa.eu/data/datasets/EXR", "https://data-api.ecb.europa.eu/service/data/EXR/M.ILS.EUR.SP00.E?format=csvdata") })])).toEqual(["series/planted#/observations/0 (publisher)"]);
  });

  it("tells a machine address from a page", () => {
    for (const url of [
      "https://api.cbs.gov.il/index/data/price?id=120010&format=json",
      "https://data-api.ecb.europa.eu/service/data/EXR/M.ILS.EUR.SP00.E?format=csvdata",
      "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml",
      "https://data.gov.il/dataset/a/resource/b/download/file.csv",
      "https://data.gov.il/api/3/action/datastore_search?resource_id=x",
      "https://www.bankhapoalim.co.il/sites/default/files/tariff.xls",
      "https://knesset.gov.il/Odata/ParliamentInfo.svc/KNS_Law",
    ])
      expect([url, isMachineUrl(url)]).toEqual([url, true]);
    for (const url of ["https://data.gov.il/he/datasets/mof/savingsplaninterest", "https://data.ecb.europa.eu/data/datasets/EXR/EXR.M.ILS.EUR.SP00.E", "https://www.gov.il/he/pages/x", "not a url"])
      expect([url, isMachineUrl(url)]).toEqual([url, false]);
  });

  it("lists each check's leftovers in a file of its own per collection", () => {
    for (const check of ["empty-because", "publisher", "machine-url", "notes-he"]) for (const collection of values.VALUE_COLLECTIONS) expect(valuesFile(check, collection)).toBe(`values/${check}/${collection}.json`);
    expect(readdirSync(fileURLToPath(new URL("../src/leftovers/values/", import.meta.url))).sort()).toEqual(["empty-because", "machine-url", "notes-he", "publisher"]);
  });
});
