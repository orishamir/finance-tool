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
  scope: "general",
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

describe("open questions (data-schema 3.15, 2026-10-26)", () => {
  const items = ruleBase.questions!;
  const fromMarkdown = items.map((q) => ({ id: q.id, status: q.closedOn ? "closed" : "open", ...(q.closedOn ? { closed_on: q.closedOn } : {}) }));
  const run = (files: Record<string, unknown>) => {
    const lines: string[] = [];
    const problems = validateData({ dataDir: dataDir(files), ruleBase, formulas, warn: (l) => lines.push(l) });
    return { problems, lines };
  };

  it("reads every numbered item under the file's prefix, with the closures the audit struck", () => {
    // the audit's 493, SW OQ17, opened by the scope settling on 2026-10-26, and CAT OQ24 to OQ26 (empty deposit fees, 2026-10-27)
    expect(items.length).toBe(510);
    expect(items.find((q) => q.id === "TXP OQ3")).toMatchObject({ file: "tax-pension-gemel-lekitzba.md", closedOn: "2026-10-26" });
    // a closure of the open-question hunt (main, 2026-10-26), struck with its bold title inside the strike
    expect(items.find((q) => q.id === "BRK OQ11")).toMatchObject({ file: "brokerage-account.md", closedOn: "2026-10-26" });
    expect(items.find((q) => q.id === "SW OQ17")?.closedOn).toBeNull();
    expect(items.find((q) => q.id === "PEN OQ7")?.closedOn).toBeNull();
  });

  it("passes a file that matches the markdown, and is strict", () => {
    expect(run({ "open-questions.json": fromMarkdown }).problems).toEqual([]);
    const bad = run({ "open-questions.json": [{ id: "TXP OQ3", status: "closed" }, { id: "PEN OQ7", status: "open", note: "x" }] }).problems;
    expect(bad.map((p) => p.message).join("\n")).toMatch(/closed_on is set exactly when status is closed/);
    expect(bad.map((p) => p.message).join("\n")).toMatch(/note/);
  });

  it("warns when the file is behind the markdown", () => {
    const behind = fromMarkdown.filter((q) => q.id !== "BANK OQ1").map((q) => (q.id === "TXP OQ3" ? { id: q.id, status: "open" } : q));
    const { problems, lines } = run({ "open-questions.json": [...behind, { id: "ZZZ OQ1", status: "open" }] });
    expect(problems).toEqual([]);
    const line = lines.find((l) => l.includes("behind the rule base"))!;
    expect(line).toMatch(/BANK OQ1 missing/);
    expect(line).toMatch(/TXP OQ3 closed 2026-10-26 in the markdown/);
  });

  it("fails a guide record that lists or blocks on a closed question", () => {
    const wrapper = { id: "x", open_questions: ["TXP-OQ3", "PEN-OQ7"], tax_at_exit: { blocked_by: ["TXP-OQ3"] }, dimensions: { "real-vs-nominal": "blocked:PEN-OQ8" } };
    const { problems } = run({ "open-questions.json": fromMarkdown, "instruments/exposures/x.json": wrapper });
    const messages = problems.filter((p) => p.message.includes("data/open-questions.json")).map((p) => p.message);
    expect(messages).toEqual(
      expect.arrayContaining([expect.stringMatching(/^open_questions: TXP-OQ3 is closed/), expect.stringMatching(/^blocked_by: TXP-OQ3 is closed/), expect.stringMatching(/^dimensions.real-vs-nominal: PEN-OQ8 is closed/)]),
    );
    expect(messages.some((m) => m.includes("PEN-OQ7"))).toBe(false);
  });
});

// D30 (research/specs/2026-10-25-rules-scope/spec.md §3): who a rule applies to, and where it may appear
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
    expect(run({ "rules/txs-09.json": bad }).map((p) => p.message).join("\n")).toMatch(/first source is a company's document/);
    expect(run({ "rules/txs-09.json": { ...rule, sources: [src("law", "primary")] } }).filter((p) => /scope/.test(p.message))).toEqual([]);
    expect(run({ "rules/txs-09.json": { ...rule, sources: [src("other", "primary")] } }).filter((p) => /scope/.test(p.message))).toEqual([]);
    expect(run({ "rules/txs-09.json": { ...rule, sources: [src("article", "secondary")] } }).map((p) => p.message).join("\n")).toMatch(/not a general source/);
  });

  it("fails a company's term in the questions page, the guide blocks, a wrapper's rule_ids and company_terms, and a company-sourced value", () => {
    const pinned = { rows: [{ ids: ["CS-30"], question_he: "?" }], guide_blocks: { "child-savings-provident": ["CS-30"] } };
    const files = { "rules/cs-30.json": cs30, "sources/institutions.json": [harel], "parameters/pinned-rules.json": pinned };
    const messages = run(files).map((p) => p.message).join("\n");
    expect(messages).toMatch(/questions page holds general rules only; CS-30/);
    expect(messages).toMatch(/"שווה לדעת" of child-savings-provident holds general rules only/);
    // a wrapper (partial on purpose: the schema reports the rest, the scope walk still reads it)
    const wrapper = { fee_caps: { balance: { value: 0.23, unit: "pct_per_year", source: { url: "https://example.org", title: "Harel bylaw", publisher: "Harel", strength: "institution" }, rule_ids: ["CS-30"] } }, company_terms: { "fee-management-balance": ["TXS-09"], "fee-deposit": ["CS-30"] } };
    const w = run({ "rules/cs-30.json": cs30, "rules/txs-09.json": rule, "sources/institutions.json": [harel], "instruments/wrappers/child-savings-provident.json": wrapper }).map((p) => p.message).join("\n");
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
    const files = { "rules/txs-09.json": general, "rules/cs-30.json": { ...cs30, sources: [harelDoc] }, "sources/institutions.json": [harel] };
    expect(run(files).map((p) => p.message).join("\n")).toMatch(/a general rule derives from general rules only; CS-30 is institution/);
    const asExample = { ...rule, sources: [src("law", "primary")], examples: ["CS-30"] };
    expect(run({ ...files, "rules/txs-09.json": asExample }).map((p) => p.message).join("\n")).not.toMatch(/derives from|examples:/);
    const generalExample = { ...cs30, id: "CS-18", scope: "general", scope_institutions: undefined, sources: [src("law", "primary")], examples: ["TXS-09"] };
    expect(run({ "rules/txs-09.json": { ...rule, sources: [src("law", "primary")] }, "rules/cs-18.json": generalExample }).map((p) => p.message).join("\n")).toMatch(/examples: TXS-09 is general/);
  });

  it("allows a not-rule only in the files its entry names, and fails an entry whose file no longer cites it", () => {
    const ira28 = { ...cs30, id: "IRA-28", il_finance_file: "ira-self-directed.md", dimensions: ["protection"], sources: [press] };
    const wrapper = (id: string) => ({ protection: { rule_ids: [id] } });
    const ok = run({ "rules/ira-28.json": ira28, "sources/institutions.json": [harel], "instruments/wrappers/ira-provident.json": wrapper("IRA-28"), "instruments/wrappers/ira-hishtalmut.json": wrapper("IRA-28") }).map((p) => p.message).join("\n");
    expect(ok).not.toMatch(/IRA-28 is institution/);
    expect(ok).not.toMatch(/no longer stands/);
    const elsewhere = run({ "rules/ira-28.json": ira28, "sources/institutions.json": [harel], "instruments/wrappers/brokerage-account.json": wrapper("IRA-28") }).map((p) => p.message).join("\n");
    expect(elsewhere).toMatch(/cites general rules only; IRA-28 is institution: harel \(D30\); it is a not-rule allowed only in its own files/);
    const stale = run({ "rules/ira-28.json": ira28, "sources/institutions.json": [harel], "instruments/wrappers/ira-provident.json": wrapper("IRA-28"), "instruments/wrappers/ira-hishtalmut.json": wrapper("TXS-09"), "rules/txs-09.json": rule }).map((p) => p.message).join("\n");
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
    expect(term).toMatch(/IRA-28 is a not-rule \(press report \(events at Slice and Globalnet\), institution: harel\) cited in data\/terms\/x.json, which its entry in notRules/);
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
