// The figure-rules table (src/figure-rules.ts): which ids a deposit's, a tariff's, a fund's, a product's and an average's values may
// name, in which state, and the standing allow for the card that holds a value's source; then the deposit records' own checks
// (src/checks/deposits.ts). Over the repository's own data the checks run in validate.test.ts, leftovers and all.
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as deposits from "../src/checks/deposits.ts";
import * as figureRulesCheck from "../src/checks/figure-rules.ts";
import * as valueChecks from "../src/checks/values.ts";
import { testData } from "../src/checks/lib/kit.ts";
import { annexAType, cardsWithSources, FIGURE_RULES, figureRuleProblems, judgeId, pathOf, rowFor, trimIds, type Cards } from "../src/figure-rules.ts";

const src = (url: string) => ({ url, title: "t", publisher: "p", strength: "institution" });
const vo = (value: unknown, rule_ids: string[], url = "https://bank.example/rates") => ({ value, unit: "pct_per_year", source: src(url), rule_ids });
const noCards = cardsWithSources(new Map());

/** A deposit record as the table reads it, with the fields its rows look at. */
function deposit(over: Record<string, unknown> = {}) {
  return {
    id: "bank-pikadon-leshana",
    bank: "leumi",
    wrapper_id: "bank-deposit",
    rate_type: "fixed",
    linkage: "none",
    term_months: vo(12, []),
    rate_offered: vo(2, ["BANK-13"]),
    tax_bucket: vo("unlinked_15", ["TXI-03"], "https://www.gov.il/ordinance.pdf"),
    amount_range: { min: vo(1000, ["BANK-27"]), max: null },
    break: { allowed: false, penalty: "not_allowed", mechanism_text: "", rule_ids: ["BANK-06"] },
    ...over,
  };
}

describe("figure-rules table", () => {
  it("writes a pointer as the table's path", () => {
    expect(pathOf("/balance_conditions/0/value")).toBe("balance_conditions[].value");
    expect(pathOf("/interest_calc/effective_annual")).toBe("interest_calc.effective_annual");
    expect(pathOf("/amount_range/max")).toBe("amount_range.max");
  });

  it("covers a value under a row's path, and picks the longest row", () => {
    expect(rowFor("terms/deposits", "/amount_range/min")?.path).toBe("amount_range");
    expect(rowFor("terms/deposits", "/balance_conditions/2/value")?.path).toBe("balance_conditions[].value");
    expect(rowFor("terms/deposits", "/interest_calc/effective_decimals")?.path).toBe("interest_calc.effective_decimals");
    expect(rowFor("terms/deposits", "/names")).toBeNull();
  });

  it("gives every deposit row's id a reason", () => {
    for (const row of FIGURE_RULES) for (const a of row.allow) expect(a.why.length, `${row.path} ${a.id}`).toBeGreaterThan(10);
  });

  it("admits a fixed deposit's rate with BANK-13 alone, and a variable one's with BANK-25 too", () => {
    expect(figureRuleProblems("terms/deposits", deposit(), noCards)).toEqual([]);
    expect(figureRuleProblems("terms/deposits", deposit({ rate_offered: vo(2, ["BANK-13", "BANK-25"]) }), noCards)).toEqual([{ pointer: "/rate_offered", id: "BANK-25", verdict: "disallowed" }]);
    expect(figureRuleProblems("terms/deposits", deposit({ rate_type: "variable", anchor: "prime", rate_offered: vo(2, ["BANK-13", "BANK-25"]), spread: vo(-2, ["BANK-25", "BANK-34"]) }), noCards)).toEqual([]);
  });

  it("keeps the prime's card on a spread over the prime only", () => {
    expect(figureRuleProblems("terms/deposits", deposit({ rate_type: "variable", anchor: "ריבית עוגן", rate_offered: vo(2, ["BANK-13", "BANK-25"]), spread: vo(-0.3, ["BANK-25", "BANK-34"]) }), noCards)).toEqual([{ pointer: "/spread", id: "BANK-34", verdict: "disallowed" }]);
  });

  it("drops the prime's card and the savings plans' break rule from the rate", () => {
    expect(figureRuleProblems("terms/deposits", deposit({ rate_type: "variable", rate_offered: vo(2, ["BANK-13", "BANK-25", "BANK-34", "BANK-28"]) }), noCards)).toEqual([
      { pointer: "/rate_offered", id: "BANK-34", verdict: "disallowed" },
      { pointer: "/rate_offered", id: "BANK-28", verdict: "disallowed" },
    ]);
  });

  it("reads a bank's type column as one of Annex A's eight types, however it prints it", () => {
    expect(annexAType("פיקדון לשנה")).toBe("פיקדון לשנה");
    expect(annexAType("פקדון ל-3 חודשים")).toBe("פיקדון ל-3 חודשים");
    expect(annexAType("פיקדון ל 6 חודשים")).toBe("פיקדון ל-6 חודשים");
    expect(annexAType("פיקדון לשנתיים (730 יום)")).toBe("פיקדון לשנתיים");
    expect(annexAType("פיקדון לחודש")).toBe("פיקדון חודשי");
    expect(annexAType("12 חודשים")).toBe("פיקדון לשנה");
    expect(annexAType("1 יום")).toBe("פיקדון יומי");
    for (const other of ["פיקדון ל-13 שנים", "פיקדון ל-15 שנים", "הו״ק ל-3 שנים", "חיסכון חודשי (לתקופה של שנה)", "חסכון אודם לשנה", "פקצ״מ לשנה", null]) expect(annexAType(other), String(other)).toBeNull();
  });

  it("names Annex A's card on the term of its eight standard types alone, in months and in days", () => {
    const term = (type_447: string) => deposit({ type_447, term_months: vo(12, ["BANK-14"]), term_days: vo(365, ["BANK-14", "BANK-50"]) });
    expect(figureRuleProblems("terms/deposits", term("פיקדון לשנה (365 יום)"), noCards)).toEqual([]);
    expect(figureRuleProblems("terms/deposits", term("חיסכון ל-10 שנים"), noCards)).toEqual([
      { pointer: "/term_months", id: "BANK-14", verdict: "disallowed" },
      { pointer: "/term_days", id: "BANK-14", verdict: "disallowed" },
    ]);
  });

  it("keeps the savings plans' card on a savings plan's amounts, whose limits its agreement must state, and on no deposit's", () => {
    const amounts = (wrapper_id: string) => deposit({ wrapper_id, amount_range: { min: vo(100, ["BANK-27", "BANK-28"]), max: vo(5000, ["BANK-27", "BANK-28"]) } });
    expect(figureRuleProblems("terms/deposits", amounts("savings-plan"), noCards)).toEqual([]);
    expect(figureRuleProblems("terms/deposits", amounts("bank-deposit"), noCards)).toEqual([
      { pointer: "/amount_range/min", id: "BANK-28", verdict: "disallowed" },
      { pointer: "/amount_range/max", id: "BANK-28", verdict: "disallowed" },
    ]);
  });

  it("names the tax bucket's rules by the bucket: unlinked, linked, prime-linked, a current account", () => {
    const tax = (value: unknown, ids: string[]) => vo(value, ids, "https://www.gov.il/ordinance.pdf");
    expect(figureRuleProblems("terms/deposits", deposit({ tax_bucket: tax("unlinked_15", ["TXI-03", "TXI-04", "TXI-08"]) }), noCards).map((p) => p.id)).toEqual(["TXI-04", "TXI-08"]);
    expect(figureRuleProblems("terms/deposits", deposit({ rate_type: "variable", tax_bucket: tax("unlinked_15", ["TXI-03", "TXI-04"]) }), noCards)).toEqual([]);
    expect(figureRuleProblems("terms/deposits", deposit({ linkage: "cpi", tax_bucket: tax("linked_25", ["TXI-02", "TXI-04", "TXI-05", "TXI-19"]) }), noCards).map((p) => p.id)).toEqual(["TXI-19"]);
    expect(figureRuleProblems("terms/deposits", deposit({ wrapper_id: "current-account", tax_bucket: tax("unlinked_15", ["TXI-03", "TXI-08", "BANK-09"]) }), noCards).map((p) => p.id)).toEqual(["BANK-09"]);
  });

  it("names no rule on a best-of deposit's open tax bucket: the card on its alternatives is the record's topic, not its tax", () => {
    const winWin = deposit({ variant: ["best_of"], tax_bucket: vo(null, ["BPN-09"], "https://www.gov.il/ordinance.pdf") });
    expect(figureRuleProblems("terms/deposits", winWin, noCards)).toEqual([{ pointer: "/tax_bucket", id: "BPN-09", verdict: "disallowed" }]);
  });

  it("keeps an id no row knows and lists it as unknown", () => {
    expect(figureRuleProblems("terms/deposits", deposit({ rate_offered: vo(2, ["BANK-13", "BANK-99"]) }), noCards)).toEqual([{ pointer: "/rate_offered", id: "BANK-99", verdict: "unknown" }]);
  });

  it("allows an id no row covers when its card holds the value's source, and lets a row that lists the id decide", () => {
    const cards = cardsWithSources(new Map([
      ["BANK-99", ["https://bank.example/rates#page=2"]],
      ["TXI-19", ["https://www.gov.il/ordinance.pdf"]],
    ]));
    const record = deposit({ linkage: "cpi", tax_bucket: vo("linked_25", ["TXI-02", "TXI-05", "TXI-19"], "https://www.gov.il/ordinance.pdf") });
    // no row covers a value at /exit_points, so the standing allow holds there
    expect(judgeId("terms/deposits", record, "/exit_points", vo(true, ["BANK-99"]), "BANK-99", cards)).toBe("allowed");
    expect(judgeId("terms/deposits", record, "/exit_points", vo(true, ["BANK-98"]), "BANK-98", cards)).toBe("unknown");
    expect(figureRuleProblems("terms/deposits", record, cards)).toEqual([{ pointer: "/tax_bucket", id: "TXI-19", verdict: "disallowed" }]);
  });

  it("reads a source address by its decoded text, and by the machine address a collector read it from", () => {
    const cards = cardsWithSources(new Map([
      ["BANK-99", ["https://bank.example/%D7%AA%D7%A2%D7%A8%D7%99%D7%A4%D7%95%D7%9F.pdf#page=3"]],
      ["BANK-98", ["https://bank.example/rates.pdf"]],
    ]));
    const at = (source: Record<string, unknown>) => ({ ...vo(1, []), source: { ...src("x"), ...source } });
    // the card writes the address percent-encoded and the value in Hebrew letters, and the other way round
    expect(judgeId("terms/deposits", deposit(), "/exit_points", at({ url: "https://bank.example/תעריפון.pdf#page=7" }), "BANK-99", cards)).toBe("allowed");
    expect(judgeId("terms/deposits", deposit(), "/exit_points", at({ url: "https://bank.example/rates%2Epdf" }), "BANK-98", cards)).toBe("allowed");
    // the page a reader opens differs from the card's, but the file the collector read is the card's source
    expect(judgeId("terms/deposits", deposit(), "/exit_points", at({ url: "https://bank.example/page", fetched_from: "https://bank.example/rates.pdf" }), "BANK-98", cards)).toBe("allowed");
    expect(judgeId("terms/deposits", deposit(), "/exit_points", at({ url: "https://bank.example/page", fetched_from: "https://bank.example/other.pdf" }), "BANK-98", cards)).toBe("unknown");
    // an address that is not valid percent-encoding is compared as written
    expect(judgeId("terms/deposits", deposit(), "/exit_points", at({ url: "https://bank.example/100%.pdf" }), "BANK-98", cards)).toBe("unknown");
  });

  it("closes every deposit row to the standing allow: an id it does not list is unknown though its card cites the value's source", () => {
    expect(FIGURE_RULES.filter((r) => r.collection === "terms/deposits").every((r) => r.closed)).toBe(true);
    const cards = cardsWithSources(new Map([
      ["BANK-99", ["https://bank.example/rates#page=2"]],
      ["TXI-14", ["https://www.gov.il/ordinance.pdf"]],
    ]));
    const record = deposit({ rate_offered: vo(2, ["BANK-13", "BANK-99"]), tax_bucket: vo("unlinked_15", ["TXI-03", "TXI-14"], "https://www.gov.il/ordinance.pdf") });
    expect(figureRuleProblems("terms/deposits", record, cards)).toEqual([
      { pointer: "/rate_offered", id: "BANK-99", verdict: "unknown" },
      { pointer: "/tax_bucket", id: "TXI-14", verdict: "unknown" },
    ]);
  });

  it("keeps a bank's own break card on that bank's records only", () => {
    const brk = (bank: string) => deposit({ bank, break: { allowed: true, penalty: "with_penalty", mechanism_text: "", rule_ids: ["BANK-06", "BANK-33"] } });
    expect(figureRuleProblems("terms/deposits", brk("discount"), noCards)).toEqual([]);
    expect(figureRuleProblems("terms/deposits", brk("leumi"), noCards)).toEqual([{ pointer: "/break", id: "BANK-33", verdict: "disallowed" }]);
  });

  it("keeps a bank's own break card only on the products the card is about", () => {
    const brk = (bank: string, wrapper_id: string, id: string) => deposit({ bank, wrapper_id, break: { allowed: true, penalty: "with_penalty", mechanism_text: "", rule_ids: ["BANK-06", id] } });
    const ids = (r: ReturnType<typeof deposit>) => figureRuleProblems("terms/deposits", r, noCards).map((p) => p.id);
    // BANK-33: Discount's and Mercantile's deposits and plans, never a current account at Mercantile
    expect(ids(brk("discount", "bank-deposit", "BANK-33"))).toEqual([]);
    expect(ids(brk("mercantile", "savings-plan", "BANK-33"))).toEqual([]);
    expect(ids(brk("mercantile", "bank-deposit", "BANK-33"))).toEqual([]);
    expect(ids(brk("mercantile", "current-account", "BANK-33"))).toEqual(["BANK-33"]);
    // BANK-56: Bank of Jerusalem's deposits and plans, never its current account; BPN-10: Hapoalim's savings plans only
    expect(ids(brk("jerusalem", "savings-plan", "BANK-56"))).toEqual([]);
    expect(ids(brk("jerusalem", "bank-deposit", "BANK-56"))).toEqual([]);
    expect(ids(brk("jerusalem", "current-account", "BANK-56"))).toEqual(["BANK-56"]);
    expect(ids(brk("hapoalim", "savings-plan", "BPN-10"))).toEqual([]);
    expect(ids(brk("hapoalim", "bank-deposit", "BPN-10"))).toEqual(["BPN-10"]);
  });

  it("keeps the prime's card on a spread only at the ten banks it read", () => {
    const spread = (bank: string) => deposit({ bank, rate_type: "variable", anchor: "prime", rate_offered: vo(2, ["BANK-13", "BANK-25"]), spread: vo(-2, ["BANK-25", "BANK-34"]) });
    expect(figureRuleProblems("terms/deposits", spread("one-zero"), noCards)).toEqual([]);
    expect(figureRuleProblems("terms/deposits", spread("esh"), noCards)).toEqual([{ pointer: "/spread", id: "BANK-34", verdict: "disallowed" }]);
  });
});


// ---------------------------------------------------------------- tariffs, funds, products, averages

/** A tariff with one line: a bank's unless `provider` says otherwise. */
function tariff(line: Record<string, unknown>, over: Record<string, unknown> = {}) {
  return { id: "leumi", provider: { class: "bank" }, lines: [{ id: "l", base: "trade", applies_to: ["tase_shares_bonds", "etf_units", "mutual_fund_units"], channel: "branch", ...line }], ...over };
}
const ids = (collection: Parameters<typeof figureRuleProblems>[0], record: unknown, cards: Cards = noCards) => figureRuleProblems(collection, record, cards).map((p) => `${p.pointer} ${p.id} ${p.verdict}`);
const kept = (collection: Parameters<typeof trimIds>[0], record: Record<string, unknown>, pointer: string, cards: Cards = noCards) => {
  const value = pointer.split("/").slice(1).reduce<unknown>((n, k) => (n as Record<string, unknown>)[k], record) as Record<string, unknown>;
  return trimIds(collection, record, pointer, value, value.rule_ids as string[], cards).kept;
};

describe("figure-rules table: tariffs", () => {
  it("gives a bank's branch line for Tel Aviv the fund units' card alone (worked case 14)", () => {
    const leumi = tariff({ rate: vo(0.65, ["BRK-16", "BRK-19", "MF-27"]), min: vo(30, ["BRK-16"]) });
    expect(kept("fees", leumi, "/lines/0/rate")).toEqual(["MF-27"]);
    expect(kept("fees", leumi, "/lines/0/min")).toEqual([]);
  });

  it("keeps BRK-16 on the rate of a bank's direct Tel Aviv line only", () => {
    const direct = tariff({ channel: "direct", rate: vo(0.4, ["BRK-16", "BRK-19", "MF-27"]), max: vo(7000, ["BRK-16"]) });
    expect(kept("fees", direct, "/lines/0/rate")).toEqual(["BRK-16", "MF-27"]);
    expect(kept("fees", direct, "/lines/0/max")).toEqual([]);
    const foreign = tariff({ channel: "direct", applies_to: ["foreign_securities"], rate: vo(0.4, ["BRK-16"]) });
    expect(kept("fees", foreign, "/lines/0/rate")).toEqual([]);
  });

  it("keeps BRK-17 on a custody line, and drops a non-bank member's reporting rules", () => {
    expect(kept("fees", tariff({ base: "custody", rate: vo(0.1, ["BRK-16", "BRK-17"]) }), "/lines/0/rate")).toEqual(["BRK-17"]);
    const broker = tariff({ rate: vo(0.1, ["BRK-24", "BRK-15"]) }, { id: "altshuler-trade", provider: { class: "broker" } });
    expect(ids("fees", broker)).toEqual(["/lines/0/rate BRK-24 disallowed", "/lines/0/rate BRK-15 disallowed"]);
  });

  it("keeps a company card on its line by the standing allow, so the sheet keeps the card's title and place (One Zero)", () => {
    const tariffPdf = "https://www.onezerobank.com/tariff.pdf";
    const event = tariff({ base: "corporate_event", applies_to: ["foreign_securities"], rate: vo(50, ["BRK-16", "BRK-74"], `${tariffPdf}#page=9`) }, { id: "one-zero" });
    expect(ids("fees", event, cardsWithSources(new Map([["BRK-74", [tariffPdf]]])))).toEqual(["/lines/0/rate BRK-16 disallowed"]);
    expect(ids("fees", event)).toEqual(["/lines/0/rate BRK-16 disallowed", "/lines/0/rate BRK-74 unknown"]);
  });

  it("keeps the provident cap's cards only on a fee at the cap", () => {
    const capped: Cards = { sources: new Map(), institutions: new Map(), figures: new Map([["PF-02", { balance_cap: { value: 1.05 }, deposit_cap: { value: 4 } }]]) };
    const list = (rate: number) => tariff({ base: "balance", applies_to: ["kupat-gemel-lehashkaa"], rate: vo(rate, ["PF-02", "PF-03"]) }, { id: "clal", provider: { class: "provident-manager" } });
    expect(kept("fees", list(1.05), "/lines/0/rate", capped)).toEqual(["PF-02", "PF-03"]);
    expect(kept("fees", list(0.7), "/lines/0/rate", capped)).toEqual([]);
  });
});

describe("figure-rules table: funds and averages", () => {
  const fund = (over: Record<string, unknown>) => ({ id: "f", domicile: "IL", manager: "מיטב", fees: {}, ...over });

  it("takes the report's cost layers and the voluntary undertaking off an Israeli fund's fees", () => {
    const f = fund({ fees: { fixed_management: vo(0.1, ["ETF-13", "MF-16", "MF-17"]), trustee: vo(0.01, ["ETF-13", "MF-20"]), variable_management: vo(0, ["ETF-13", "ETF-14"]) } });
    expect(ids("funds", f)).toEqual(["/fees/fixed_management ETF-13 disallowed", "/fees/fixed_management MF-17 disallowed", "/fees/trustee ETF-13 disallowed", "/fees/variable_management ETF-13 disallowed"]);
  });

  it("keeps the load rule on a fund's load", () => {
    expect(ids("funds", fund({ fees: { load: vo(0, ["MF-21"]) } }))).toEqual([]);
  });

  it("keeps BlackRock's card on an iShares fund's expense ratio only, and no tax rule on it", () => {
    const er = ["ETF-27", "ETF-28", "TXF-16", "TXF-29"];
    expect(ids("funds", fund({ domicile: "IE", manager: "BlackRock (fund: iShares VII plc)", fees: { fixed_management: vo(0.07, er) } }))).toEqual([
      "/fees/fixed_management ETF-28 disallowed",
      "/fees/fixed_management TXF-16 disallowed",
      "/fees/fixed_management TXF-29 disallowed",
    ]);
    expect(ids("funds", fund({ domicile: "IE", manager: "Invesco Investment Management Limited", fees: { fixed_management: vo(0.05, ["ETF-27"]) } }))).toEqual(["/fees/fixed_management ETF-27 disallowed"]);
  });

  it("gives a distribution yield no rule, and leaves a benchmark to its own check", () => {
    const f = fund({ distribution: { yield: vo(1.2, ["ETF-28", "TXF-08"]) }, tracking_record: { benchmark: vo("x", ["ETF-42"]) } });
    expect(ids("funds", f)).toEqual(["/distribution/yield ETF-28 disallowed", "/distribution/yield TXF-08 disallowed"]);
  });

  it("keeps the exchange's calculator on an average, not the exchange's duty to publish", () => {
    expect(ids("averages", { id: "tase-leumi", averages: { rows: [{ rate: vo(0.2, ["BRK-15", "BRK-33"]) }] } })).toEqual(["/averages/rows/0/rate BRK-15 disallowed"]);
  });
});

describe("figure-rules table: products", () => {
  const product = (id: string, over: Record<string, unknown>) => ({ id, eligibility: { rule_ids: ["KH-01"], text: "t" }, ...over });

  it("keeps the institution's card first on the payout days, never reordering what it keeps", () => {
    const kgl = product("kupat-gemel-lehashkaa", { lawful_exit: { kind: "any_time", payout_business_days: vo(4, ["KH-16", "KGL-08"]) } });
    expect(kept("instruments", kgl, "/lawful_exit/payout_business_days")).toEqual(["KH-16"]);
    const pension = product("pension-comprehensive", { lawful_exit: { kind: "at_age", payout_business_days: vo(4, ["PF-47", "KH-16"]) } });
    expect(kept("instruments", pension, "/lawful_exit/payout_business_days")).toEqual(["PF-47", "KH-16"]);
  });

  it("keeps BRK-17 over BANK-18 on custody, and BRK-52 beside it and on a null custody cap", () => {
    const makam = product("makam", { fee_caps: { custody: vo(0, ["BRK-17", "BANK-18", "BRK-16", "BRK-52"]) } });
    expect(kept("instruments", makam, "/fee_caps/custody")).toEqual(["BRK-17", "BRK-52"]);
    const account = product("brokerage-account", { fee_caps: { custody: vo(null, ["BRK-16", "BRK-17", "BRK-24", "MF-26", "BRK-52"]) } });
    expect(kept("instruments", account, "/fee_caps/custody")).toEqual(["BRK-16", "BRK-17", "BRK-24", "MF-26", "BRK-52"]);
  });

  it("keeps BRK-52 beside MF-26, MF-71 and BRK-72 on a money-market fund's trade cap", () => {
    const fund = product("money-market-fund-daily", { fee_caps: { trade: vo(null, ["MF-26", "MF-71", "BRK-72", "BRK-52"]) } });
    expect(kept("instruments", fund, "/fee_caps/trade")).toEqual(["MF-26", "MF-71", "BRK-72", "BRK-52"]);
  });

  it("keeps PEN-22 beside PF-02 on a provident fund for annuity's caps, as PF-03 stands beside it on the investment provident fund's", () => {
    const annuity = product("provident-for-annuity", { fee_caps: { balance: vo(1.05, ["PF-02", "PEN-22"]), deposit: vo(4, ["PF-02", "PEN-22"]) } });
    expect(kept("instruments", annuity, "/fee_caps/balance")).toEqual(["PF-02", "PEN-22"]);
    expect(kept("instruments", annuity, "/fee_caps/deposit")).toEqual(["PF-02", "PEN-22"]);
    const gemel = product("kupat-gemel-lehashkaa", { fee_caps: { balance: vo(1.05, ["PF-02", "PF-03"]) } });
    expect(kept("instruments", gemel, "/fee_caps/balance")).toEqual(["PF-02", "PF-03"]);
  });

  it("keeps KGL-02 beside KGL-03 on the investment provident fund's yearly ceiling", () => {
    const gemel = product("kupat-gemel-lehashkaa", { ceiling: { amount: vo(83641, ["KGL-03", "KGL-02"]) } });
    expect(kept("instruments", gemel, "/ceiling/amount")).toEqual(["KGL-03", "KGL-02"]);
  });

  it("keeps PF-06 and KH-22 together on a study fund's balance cap, where KH-22 holds the study fund's own terms", () => {
    const keren = product("keren-hishtalmut", { fee_caps: { balance: vo(2, ["KH-22", "PF-06"]) } });
    expect(kept("instruments", keren, "/fee_caps/balance")).toEqual(["KH-22", "PF-06"]);
    const ira = product("ira-provident", { fee_caps: { balance: vo(2, ["PF-06", "IRA-17", "IRA-16", "KH-22"]) } });
    expect(kept("instruments", ira, "/fee_caps/balance")).toEqual(["PF-06", "IRA-16"]);
  });

  it("keeps on a null cap only the rules that say there is none", () => {
    const account = product("brokerage-account", { fee_caps: { trade: vo(null, ["BRK-15", "BRK-16", "BRK-19", "BRK-21", "BRK-24", "BRK-33"]) } });
    expect(kept("instruments", account, "/fee_caps/trade")).toEqual(["BRK-16", "BRK-24"]);
  });

  it("judges no text a product cites rules in, only its values", () => {
    expect(ids("instruments", product("keren-hishtalmut", { protection: { rule_ids: ["NOPE-1"], text: "t" } }))).toEqual([]);
  });
});

describe("figure-rules check", () => {
  /** A data folder of deposit records under terms/deposits/, each file named by its record id (and a date, for a dated snapshot). */
  function folder(files: Record<string, unknown>): string {
    const dir = mkdtempSync(join(tmpdir(), "data-"));
    mkdirSync(join(dir, "terms", "deposits"), { recursive: true });
    for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, "terms", "deposits", `${name}.json`), JSON.stringify(content));
    return dir;
  }

  it("fails a disallowed id and an unknown one on the latest snapshot, and leaves an older snapshot alone", () => {
    expect(figureRulesCheck.name).toBe("figure-rules");
    const dir = folder({
      "bank-pikadon-leshana@2026-10-01": deposit({ rate_offered: vo(2, ["BANK-13", "BANK-34"]) }),
      "bank-pikadon-leshana@2026-11-01": deposit({ rate_offered: vo(2, ["BANK-13", "BANK-28", "BANK-99"]) }),
    });
    expect(figureRulesCheck.check(testData(dir)).map((p) => p.message)).toEqual([
      expect.stringMatching(/^terms\/deposits\/bank-pikadon-leshana#\/rate_offered names BANK-28, which the figure-rules table does not admit/),
      expect.stringMatching(/^terms\/deposits\/bank-pikadon-leshana#\/rate_offered names BANK-99, which no row of the figure-rules table knows/),
    ]);
  });

  it("passes a record whose ids the table admits", () => {
    expect(figureRulesCheck.check(testData(folder({ "bank-pikadon-leshana": deposit() })))).toEqual([]);
  });
});

// ---------------------------------------------------------------- the deposit records' checks

function runDeposits(records: Record<string, unknown>): string[] {
  const dir = mkdtempSync(join(tmpdir(), "data-"));
  mkdirSync(join(dir, "terms", "deposits"), { recursive: true });
  for (const [id, r] of Object.entries(records)) writeFileSync(join(dir, "terms", "deposits", `${id}.json`), JSON.stringify(r));
  return deposits.check(testData(dir)).map((p) => p.message);
}

const plainDeposit = { wrapper_id: "bank-deposit", term_months: { value: 12 }, exit_points: { exists: false }, auto_renew: { value: false }, break: { penalty: "not_allowed" } };
const account = { wrapper_id: "current-account", term_months: { value: null }, exit_points: { exists: false }, auto_renew: { value: false }, break: { penalty: "none" } };

describe("deposits checks", () => {
  it("fails a doubt that names no rate and says no field, and passes it with doubt_on or about the rate", () => {
    expect(deposits.name).toBe("deposits");
    expect(runDeposits({ a: { ...plainDeposit, doubt_he: "הטבלה מסמנת שיש תחנות יציאה אבל לא כותבת מתי." } })).toEqual([expect.stringMatching(/^terms\/deposits\/a#\/doubt_he \(doubt-field\)/)]);
    expect(runDeposits({ a: { ...plainDeposit, doubt_he: "הטבלה מסמנת שיש תחנות יציאה אבל לא כותבת מתי.", doubt_on: "exits" } })).toEqual([]);
    expect(runDeposits({ a: { ...plainDeposit, doubt_he: "הבנק מפרסם רק את הריבית לתקופה הראשונה." }, b: { ...plainDeposit, doubt_he: "הפרסום עדיין מציג 2%." } })).toEqual([]);
  });

  it("fails a remark of the site's own in conditions_he, and passes the bank's conditions", () => {
    expect(runDeposits({ a: { ...plainDeposit, conditions_he: "בטבלה מופיעה הטבה, ולא כתוב אם היא כלולה בשיעור." } })).toEqual([expect.stringMatching(/^terms\/deposits\/a#\/conditions_he \(site-remark\)/)]);
    expect(runDeposits({ a: { ...plainDeposit, conditions_he: "פותחים רק בסניף." } })).toEqual([]);
  });

  it("fails a current account that holds a deposit's field, and passes one that holds none", () => {
    expect(runDeposits({ a: account })).toEqual([]);
    expect(runDeposits({ a: { ...account, term_months: { value: 12 }, exit_points: { exists: true }, break: { penalty: "with_penalty" } } })).toEqual([
      expect.stringMatching(/^terms\/deposits\/a# \(current-account\): a current account holds a term, exit points, a break "with_penalty"/),
    ]);
    expect(runDeposits({ a: { ...plainDeposit, exit_points: { exists: true } } })).toEqual([]);
  });
});

// ---------------------------------------------------------------- the value checks the table's collections share (src/checks/values.ts)

describe("value checks on a tariff's values", () => {
  const card = "חברה מנהלת של קופת גמל רשאית לגבות מהיתרה הצבורה של כל עמית עד תקרת דמי הניהול השנתיים מהיתרה, ומהתשלומים שמועברים בעדו עד תקרת דמי הניהול מההפקדה.";
  it("tells a note that repeats a card from one that adds to it", () => {
    expect(valueChecks.copiesText("חברה מנהלת של קופת גמל רשאית לגבות מהיתרה הצבורה של כל עמית עד התקרה.", card)).toBe(true);
    expect(valueChecks.copiesText("המחיר בתוקף עד סוף השנה, ואחריו חוזר למחיר המלא שבתקנון.", card)).toBe(false);
    expect(valueChecks.copiesText("חברה מנהלת של קופת גמל", card)).toBe(false);
  });

  function run(value: Record<string, unknown>): string[] {
    const dir = mkdtempSync(join(tmpdir(), "data-"));
    mkdirSync(join(dir, "fees"), { recursive: true });
    mkdirSync(join(dir, "rules"), { recursive: true });
    writeFileSync(join(dir, "rules", "pf-02.json"), JSON.stringify({ id: "PF-02", title_he: "תקרת דמי הניהול לקופות גמל", text_he: card }));
    writeFileSync(join(dir, "fees", "planted@2026-11-01.json"), JSON.stringify({ id: "planted", lines: [{ id: "l", rate: { ...vo(1.05, ["PF-02"], "https://house.example/tariff.pdf"), update_rule: "provider-set", state: "sourced", ...value } }] }));
    return valueChecks.check(testData(dir)).map((p) => p.message.replace(/: .*/, ""));
  }

  it("fails a shown note that repeats the card the sheet chips, and a second quote beside the source's", () => {
    expect(run({ notes_he: "המחיר בתוקף עד סוף השנה." })).toEqual([]);
    expect(run({ notes_he: "חברה מנהלת של קופת גמל רשאית לגבות מהיתרה הצבורה של כל עמית עד התקרה." })).toEqual(["fees/planted#/lines/0/rate (copies-card)"]);
    expect(run({ notes: "חברה מנהלת של קופת גמל רשאית לגבות מהיתרה הצבורה של כל עמית עד התקרה.", rule_ids: [] })).toEqual([]);
    const quoted = { quote: "1.05% מהיתרה", source: { ...src("https://house.example/tariff.pdf"), quote: "דמי ניהול 1.05%" } };
    expect(run(quoted)).toEqual(["fees/planted#/lines/0/rate (quote-differs)"]);
    expect(run({ ...quoted, quote: "דמי ניהול 1.05%" })).toEqual([]);
  });
});
