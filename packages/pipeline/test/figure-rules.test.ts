// The figure-rules table (src/figure-rules.ts): which ids a deposit's values may name, in which state, and the standing allow for the
// card that holds a value's source; then the deposit records' own checks (src/checks/deposits.ts). Over the repository's own data the
// checks run in validate.test.ts, leftovers and all.
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as deposits from "../src/checks/deposits.ts";
import * as figureRulesCheck from "../src/checks/figure-rules.ts";
import { testData } from "../src/checks/lib/kit.ts";
import { FIGURE_RULES, figureRuleProblems, judgeId, pathOf, rowFor, type CardSources } from "../src/figure-rules.ts";

const src = (url: string) => ({ url, title: "t", publisher: "p", strength: "institution" });
const vo = (value: unknown, rule_ids: string[], url = "https://bank.example/rates") => ({ value, unit: "pct_per_year", source: src(url), rule_ids });
const noCards: CardSources = new Map();

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

  it("drops the prime's card and the savings plans' break rule from the rate, and every rule from the term", () => {
    expect(figureRuleProblems("terms/deposits", deposit({ rate_type: "variable", rate_offered: vo(2, ["BANK-13", "BANK-25", "BANK-34", "BANK-28"]), term_months: vo(12, ["BANK-14"]) }), noCards)).toEqual([
      { pointer: "/term_months", id: "BANK-14", verdict: "disallowed" },
      { pointer: "/rate_offered", id: "BANK-34", verdict: "disallowed" },
      { pointer: "/rate_offered", id: "BANK-28", verdict: "disallowed" },
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
    expect(figureRuleProblems("terms/deposits", deposit({ linkage: "cpi", tax_bucket: tax("linked_25", ["TXI-02", "TXI-04", "TXI-05", "TXI-19"]) }), noCards).map((p) => p.id)).toEqual(["TXI-04", "TXI-19"]);
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
    const cards: CardSources = new Map([
      ["BANK-99", ["https://bank.example/rates#page=2"]],
      ["TXI-19", ["https://www.gov.il/ordinance.pdf"]],
    ]);
    const record = deposit({ linkage: "cpi", tax_bucket: vo("linked_25", ["TXI-02", "TXI-05", "TXI-19"], "https://www.gov.il/ordinance.pdf") });
    // no row covers a value at /exit_points, so the standing allow holds there
    expect(judgeId("terms/deposits", record, "/exit_points", vo(true, ["BANK-99"]), "BANK-99", cards)).toBe("allowed");
    expect(judgeId("terms/deposits", record, "/exit_points", vo(true, ["BANK-98"]), "BANK-98", cards)).toBe("unknown");
    expect(figureRuleProblems("terms/deposits", record, cards)).toEqual([{ pointer: "/tax_bucket", id: "TXI-19", verdict: "disallowed" }]);
  });

  it("closes every deposit row to the standing allow: an id it does not list is unknown though its card cites the value's source", () => {
    expect(FIGURE_RULES.filter((r) => r.collection === "terms/deposits").every((r) => r.closed)).toBe(true);
    const cards: CardSources = new Map([
      ["BANK-99", ["https://bank.example/rates#page=2"]],
      ["TXI-14", ["https://www.gov.il/ordinance.pdf"]],
    ]);
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
    // BANK-33: Discount's deposits and plans, Mercantile's standing-order plans only
    expect(ids(brk("discount", "bank-deposit", "BANK-33"))).toEqual([]);
    expect(ids(brk("mercantile", "savings-plan", "BANK-33"))).toEqual([]);
    expect(ids(brk("mercantile", "bank-deposit", "BANK-33"))).toEqual(["BANK-33"]);
    // BANK-56 and BPN-10: the bank's savings plans only
    expect(ids(brk("jerusalem", "savings-plan", "BANK-56"))).toEqual([]);
    expect(ids(brk("jerusalem", "bank-deposit", "BANK-56"))).toEqual(["BANK-56"]);
    expect(ids(brk("hapoalim", "savings-plan", "BPN-10"))).toEqual([]);
    expect(ids(brk("hapoalim", "bank-deposit", "BPN-10"))).toEqual(["BPN-10"]);
  });

  it("keeps the prime's card on a spread only at the ten banks it read", () => {
    const spread = (bank: string) => deposit({ bank, rate_type: "variable", anchor: "prime", rate_offered: vo(2, ["BANK-13", "BANK-25"]), spread: vo(-2, ["BANK-25", "BANK-34"]) });
    expect(figureRuleProblems("terms/deposits", spread("one-zero"), noCards)).toEqual([]);
    expect(figureRuleProblems("terms/deposits", spread("esh"), noCards)).toEqual([{ pointer: "/spread", id: "BANK-34", verdict: "disallowed" }]);
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
