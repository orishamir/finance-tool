import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { readFormulaIds, readRuleBaseIds, validateData } from "../src/index.ts";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const ruleBase = readRuleBaseIds(`${root}.claude/skills/il-finance/references`);
const formulas = readFormulaIds(`${root}docs/method.md`);

const vo = {
  value: 25,
  unit: "pct",
  source: { url: "https://example.org", title: "s.125C", publisher: "Knesset", strength: "primary" },
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
  il_finance_file: "tax-securities-israeli.md",
  checked: "2026-10-22",
};

describe("reference IDs", () => {
  it("reads rules, open questions and formulas", () => {
    expect(ruleBase.rules.has("TXS-09")).toBe(true);
    expect(ruleBase.openQuestions.has("TXK-OQ2")).toBe(true);
    expect(formulas.has("F-40")).toBe(true);
  });
});

describe("validateData", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });

  it("passes the real data/ folder", () => {
    expect(validateData({ dataDir: `${root}data`, ruleBase, formulas })).toEqual([]);
  });

  it("passes a valid rule file", () => {
    expect(run({ "rules/txs-09.json": rule })).toEqual([]);
  });

  it("rejects a rule ID that is not in il-finance", () => {
    const bad = { ...rule, figures: { x: { ...vo, rule_ids: ["TXS-999"] } } };
    expect(run({ "rules/txs-09.json": bad })[0]?.message).toMatch(/TXS-999/);
  });

  it("rejects a formula that is not in method.md", () => {
    const problems = run({ "rules/txs-09.json": { ...rule, extra: { formula: "F-99" } } });
    expect(problems.some((p) => /F-99/.test(p.message))).toBe(true);
  });

  it("rejects a collection with no schema yet", () => {
    expect(run({ "misc/x.json": {} })[0]?.message).toMatch(/no schema/);
  });

  it("rejects a bad change-log line", () => {
    expect(run({ "changelog.jsonl": '{"date":"2026-10-22"}\n' })[0]?.message).toMatch(/line 1/);
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
  tax_status: { il_fund_tax_track: null, tase_foreign_fund_90pct_test: null },
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

  it("rejects an unknown exposure kind and an unknown dimension id", () => {
    expect(run({ "instruments/exposures/a.json": { ...exposure, kind: "stocks" } })[0]?.message).toMatch(/kind/);
    expect(run({ "dimensions/x.json": { ...dimension, id: "nope" } })[0]?.message).toMatch(/id/);
  });

  it("routes terms/deposits to the deposit schema, not the term schema", () => {
    const problems = run({ "terms/deposits/x.json": term });
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]?.message).toMatch(/bank|rate_type|type_447/);
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

  it("checks rule_ids of terms and dimensions with the generic walk", () => {
    expect(run({ "terms/a.json": { ...term, rule_ids: ["NOPE-1"] } })[0]?.message).toMatch(/NOPE-1/);
    expect(run({ "dimensions/tax-at-exit.json": { ...dimension, rule_ids: ["NOPE-2"] } })[0]?.message).toMatch(/NOPE-2/);
  });
});

describe("P-08 exposure holding wrapper", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });
  const p08 = (wrapper: string, id = "index-sp500") => ({
    id: "exposure-holding-wrapper",
    method_id: "P-08",
    rationale: "r",
    signed_off_by: "founder",
    signed_off_on: "2026-10-24",
    shown_as: "site parameter",
    holding: { [id]: { wrapper_id: { ...vo, value: wrapper, unit: "text", update_rule: "founder" } } },
  });
  const files = (extra: Record<string, unknown>) => ({ "instruments/exposures/index-sp500.json": { ...exposure, wrapper_ids: ["brokerage-account"] }, ...extra });
  it("accepts a holding wrapper the exposure record lists", () => {
    expect(run(files({ "parameters/p08.json": p08("brokerage-account") }))).toEqual([]);
  });
  it("refuses one the record leaves out, and an exposure with no record", () => {
    expect(run(files({ "parameters/p08.json": p08("makam") }))[0]?.message).toMatch(/not one of the exposure record's wrapper_ids/);
    expect(run(files({ "parameters/p08.json": p08("brokerage-account", "nothing") }))[0]?.message).toMatch(/no exposure record/);
  });
});

describe("P-05 instruments map", () => {
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });
  const p05 = (instruments: unknown) => ({
    id: "illustrative-scenario",
    method_id: "P-05",
    rationale: "r",
    signed_off_by: "founder",
    signed_off_on: "2026-10-23",
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
  const p05 = (instruments: unknown) => ({ id: "illustrative-scenario", method_id: "P-05", rationale: "r", signed_off_by: "founder", signed_off_on: "2026-10-23", shown_as: "site parameter", instruments });
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
});

describe("series (data-schema 3.8, terms gate)", () => {
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
    terms_of_use: { status: "confirmed", fallback: "none needed", terms_url: "https://example.org/licence", attribution: "CBS" },
    rule_ids: [],
    observations: [obs("2026-08-01", 105.8), obs("2026-09-01", 105.3)],
    ...over,
  });

  it("passes a confirmed series with sorted observations", () => {
    expect(run({ "series/cbs-cpi.json": series() })).toEqual([]);
  });

  it("terms gate: a series that is unconfirmed or not permitted is an error, and the schema still accepts the status", () => {
    for (const status of ["unconfirmed", "not-permitted"]) {
      const problems = run({ "series/cbs-cpi.json": series({ terms_of_use: { status, fallback: "link out and show no number" } }) });
      expect(problems).toHaveLength(1);
      expect(problems[0]?.message).toMatch(/terms gate: not shipped/);
    }
    expect(run({ "series/cbs-cpi.json": series({ terms_of_use: { status: "maybe", fallback: "x" } }) })[0]?.message).toMatch(/terms_of_use\.status/);
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

describe("fund lists (data-schema 3.14, terms gate)", () => {
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
    terms_of_use: { status: "confirmed", fallback: "link out and show counts only" },
    raw: { archive_key: "fund-lists/maya-mutual-funds@2026-10-22.csv", sha256: "a".repeat(64) },
    funds: [row("5100001"), row("5100002")],
    ...over,
  });
  const file = "fund-lists/maya-mutual-funds@2026-10-22.json";
  const run = (files: Record<string, unknown>) => validateData({ dataDir: dataDir(files), ruleBase, formulas });

  it("passes a confirmed list", () => {
    expect(run({ [file]: list() })).toEqual([]);
  });

  it("terms gate: unconfirmed or not-permitted is an error", () => {
    for (const status of ["unconfirmed", "not-permitted"]) {
      const problems = run({ [file]: list({ terms_of_use: { status, fallback: "link out" } }) });
      expect(problems).toHaveLength(1);
      expect(problems[0]?.message).toMatch(/terms gate: not shipped/);
    }
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
