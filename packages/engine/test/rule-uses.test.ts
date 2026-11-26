// How a run used each rule it read (architecture 3.4, `RuleUse`): the book's views by part (`on`), the reads only looked at (`peek`), the
// rules taken once they changed the number (`took`), and on runs of every ledger, which part each rule went into and whether it changed it.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { RuleRecord } from "@finance-tool/schema";
import { BlockedError, FigureNotUpdatedError, mergedRules, MissingRuleError, ruleBook, runBond, runDeposit, runPension, runProvident, type RunPart, type RunResult, type UsedRule } from "../src/index.ts";
import { context, loadRules } from "./golden/harness.ts";
import { reliefPaths, runs, s23, s23Hishtalmut } from "./rule-uses-runs.ts";

const rules = loadRules();
const ctx = context(rules);
const made = Object.fromEntries(Object.entries(runs(ctx)).map(([name, run]) => [name, run()]));
const run = (name: string): RunResult => {
  const r = made[name];
  if (!r) throw new Error(`no run named ${name}`);
  return r;
};

/** The parts a rule changed the number in, each with its fee line ("fees:custody"); "root" for a read on the root book. */
const changedIn = (r: { rules: readonly UsedRule[] }, id: string): string[] =>
  (r.rules.find((u) => u.id === id)?.uses ?? []).filter((x) => x.changed).map((x) => (x.part ?? "root") + (x.line ? `:${x.line}` : ""));
const read = (r: RunResult, id: string) => r.rules.some((u) => u.id === id);
/** The uses a book holds of one rule. */
const usesOf = (book: ReturnType<typeof ruleBook>, id: string) => {
  const u = book.used().find((x) => x.id === id);
  if (!u) throw new Error(`the book read no ${id}`);
  return u.uses;
};
const detailOf = (r: RunResult, key: string): number => {
  const v = r.detail[key];
  if (v === undefined) throw new Error(`the run has no detail ${key}`);
  return v;
};

function withFigure(rule: RuleRecord, name: string, extra: Record<string, unknown>): RuleRecord {
  const figures = rule.figures as Record<string, Record<string, unknown>>;
  return { ...rule, figures: { ...rule.figures, [name]: { ...figures[name], ...extra } } } as RuleRecord;
}

describe("the book's views, peek and took", () => {
  it("records a read on a view as a changed use on its part, with the figures read through it", () => {
    const book = ruleBook(ctx);
    book.on("taxAtExit").rate("TXS-09", "rate");
    book.on("fees", "custody").cite("BRK-17");
    book.rate("TXI-03", "rate");
    const used = book.used();
    expect(used.find((u) => u.id === "TXS-09")?.uses).toEqual([{ part: "taxAtExit", changed: true, figures: ["rate"] }]);
    expect(used.find((u) => u.id === "BRK-17")?.uses).toEqual([{ part: "fees", line: "custody", changed: true, figures: [] }]);
    expect(used.find((u) => u.id === "TXI-03")?.uses).toEqual([{ part: null, changed: true, figures: ["rate"] }]);
  });

  it("keeps the part and the line through inYear, and through a view of a view's year", () => {
    const book = ruleBook(ctx, { inflation: 0.02 });
    book.on("fees", "balance").inYear(2).peek.rate("PF-02", "balance_cap");
    book.on("taxDuring").inYear(3).amount("TXG-09", "threshold");
    const used = book.used();
    expect(used.find((u) => u.id === "PF-02")?.uses).toEqual([{ part: "fees", line: "balance", changed: false, figures: ["balance_cap"] }]);
    expect(used.find((u) => u.id === "TXG-09")?.uses).toEqual([{ part: "taxDuring", changed: true, figures: ["threshold"] }]);
  });

  it("peek records a use that changed nothing and gives no label, and the rule stays in the trail", () => {
    // CS-30's source is the institution's own, which labels a number the rule changes
    const book = ruleBook(ctx);
    book.on("fees", "balance").peek.rate("CS-30", "fee_after_21");
    expect(book.used().map((u) => u.id)).toEqual(["CS-30"]);
    expect(usesOf(book, "CS-30")).toEqual([{ part: "fees", line: "balance", changed: false, figures: ["fee_after_21"] }]);
    expect(book.labels()).toEqual([]);
    book.on("fees", "balance").took("CS-30");
    expect(book.labels()).toEqual([{ code: "institution-source", ruleId: "CS-30" }]);
  });

  it("peek runs the checks a read runs: an open, stale or missing rule stops the run", () => {
    const open = rules.map((r) => (r.id === "TXS-09" ? { ...r, strength: "open" as const } : r));
    expect(() => ruleBook(context(open)).on("taxAtExit").peek.rate("TXS-09", "rate")).toThrow(BlockedError);
    const stale = rules.map((r) => (r.id === "TXS-09" ? withFigure(r, "rate", { effective_to: "2026-01-01" }) : r));
    expect(() => ruleBook(context(stale)).peek.rate("TXS-09", "rate")).toThrow(FigureNotUpdatedError);
    expect(() => ruleBook(context(rules.filter((r) => r.id !== "TXS-09"))).peek.cite("TXS-09")).toThrow(MissingRuleError);
    expect(() => ruleBook(ctx).peek.amount("TXS-09", "no_such_figure")).toThrow(MissingRuleError);
  });

  it("took marks the use changed on its own part, adding the use with the figures the peeks read", () => {
    const book = ruleBook(ctx);
    book.peek.amount("TXG-04", "age");
    book.on("taxAtExit").took("TXG-04");
    expect(usesOf(book, "TXG-04")).toEqual([
      { part: null, changed: false, figures: ["age"] },
      { part: "taxAtExit", changed: true, figures: ["age"] },
    ]);
  });

  it("took over a peek made through inYear on the same view changes that use", () => {
    const book = ruleBook(ctx, { inflation: 0.02 });
    const exit = book.on("taxAtExit");
    exit.inYear(4).peek.brackets("TXG-04", "brackets");
    exit.took("TXG-04");
    expect(usesOf(book, "TXG-04")).toEqual([{ part: "taxAtExit", changed: true, figures: ["brackets"] }]);
  });

  it("took throws where the run holds no read of the rule", () => {
    const book = ruleBook(ctx);
    expect(() => book.on("taxDuring").took("TXI-03")).toThrow(/no read of TXI-03/);
    book.on("taxDuring").peek.rate("TXI-03", "rate");
    expect(() => book.on("taxDuring").took("TXI-03")).not.toThrow();
  });

  it("merges uses across readings by part and line, a use changed where any reading changed it", () => {
    const rule = (uses: UsedRule["uses"]): UsedRule => ({ id: "X", strength: "primary", dimensions: [], figures: [], uses });
    const merged = mergedRules([
      { rules: [rule([{ part: "taxAtExit", changed: false, figures: ["a"] }, { part: "fees", line: "custody", changed: false, figures: [] }])] },
      { rules: [rule([{ part: "taxAtExit", changed: true, figures: ["b"] }, { part: "fees", line: "account", changed: false, figures: [] }])] },
    ]);
    expect(merged.map((u) => u.uses)).toEqual([[
      { part: "taxAtExit", changed: true, figures: ["a", "b"] },
      { part: "fees", line: "custody", changed: false, figures: [] },
      { part: "fees", line: "account", changed: false, figures: [] },
    ]]);
  });
});

describe("the trail", () => {
  // Each run's rule ids as the engine read them before reads were tagged by part (rule-trail.json): tagging adds no read and removes none, so
  // a bundle built from a run's rules still holds every rule a rerun reads. A change that truly adds or drops a read updates the file with why.
  const trail = JSON.parse(readFileSync(new URL("./rule-trail.json", import.meta.url), "utf8")) as Record<string, string[]>;

  it("holds the same rule ids on every run", () => {
    expect(Object.keys(trail).sort()).toEqual(Object.keys(made).sort());
    for (const [name, ids] of Object.entries(trail)) expect(run(name).rules.map((u) => u.id).sort(), name).toEqual(ids);
  });

  // Rules a run reads on its root book, with no part: such a read reaches only the figures of the whole result. The list only shrinks: a
  // new read is made on the part its number goes into, and a rule tagged since is taken off the list.
  const untagged = JSON.parse(readFileSync(new URL("./untagged-rules.json", import.meta.url), "utf8")) as string[];
  const rootRead = [...new Set(Object.values(made).flatMap((r) => r.rules.filter((u) => u.uses.some((x) => x.part === null)).map((u) => u.id)))].sort();

  it("reads no rule on the root book beyond the untagged list", () => {
    expect(rootRead.filter((id) => !untagged.includes(id))).toEqual([]);
  });

  it("lists no rule the runs no longer read on the root book", () => {
    expect(untagged.filter((id) => !rootRead.includes(id))).toEqual([]);
  });

  it("files no tax rule only under fees, and no bank, brokerage, fund or provident rule only under a tax", () => {
    const taxParts: (RunPart | null)[] = ["taxDuring", "taxAtExit", "fundTax"];
    for (const [name, r] of Object.entries(made)) {
      for (const u of r.rules) {
        const parts = u.uses.filter((x) => x.changed).map((x) => x.part);
        if (parts.length === 0) continue;
        if (/^TX/.test(u.id)) expect(parts.every((p) => p === "fees"), `${name}: ${u.id}`).toBe(false);
        if (/^(BRK|BANK|MF|PF)-/.test(u.id)) expect(parts.every((p) => taxParts.includes(p)), `${name}: ${u.id}`).toBe(false);
      }
    }
  });
});

describe("the parts each run's rules went into", () => {
  it("takes the surtax's rules only where a surtax is charged", () => {
    const below = run("S14 Israeli ETF");
    expect(below.taxAtExit).toBeGreaterThan(0);
    expect(changedIn(below, "TXG-09")).toEqual([]);
    expect(changedIn(below, "TXG-10")).toEqual([]);
    expect(read(below, "TXG-09") && read(below, "TXG-10")).toBe(true);
    // S36: other income above the threshold, a gain below the capital surtax's own
    const above = run("S36 surtax year");
    expect(changedIn(above, "TXG-09")).toEqual(["taxAtExit"]);
    expect(changedIn(above, "TXG-10")).toEqual([]);
  });

  it("takes TXG-10 for an early withdrawal only from the surtax on the gains, not from the one on gains and employer deposits", () => {
    // F-47 sums the general surtax on the gains with the employer's deposits and the capital surtax on the gains alone (provident.ts). Other
    // capital income set just under the threshold less the gains and half the deposits puts the first above it and the second below it. The
    // exit falls in the run date's tax year, whose threshold is the figure as read (F-119 moves it in later years).
    const input = { ...s23, goal: { ...s23.goal, months: 12 }, hishtalmut: { ...s23Hishtalmut, money: "employer" as const, earlyWithdrawal: true } };
    const first = runProvident(input, ctx);
    const gains = detailOf(first, "earlyGains");
    const deposits = detailOf(first, "earlyEmployerDeposits");
    expect(deposits).toBeGreaterThan(0);
    const threshold = ruleBook(ctx).amount("TXG-10", "threshold");
    const r = runProvident({ ...input, profile: { otherCapitalIncome: threshold - gains - deposits / 2 } }, ctx);
    expect(changedIn(r, "TXG-10")).toEqual([]);
    expect(read(r, "TXG-10")).toBe(true);
    // with the deposits' half more of other capital income, the gains alone pass the threshold, and TXG-10 is taken
    expect(changedIn(runProvident({ ...input, profile: { otherCapitalIncome: threshold - gains + deposits / 2 } }, ctx), "TXG-10")).toEqual(["taxAtExit"]);
  });

  it("takes no age-60 rule where the profile holds no age", () => {
    for (const name of ["S14 Israeli ETF", "S03 linked deposit", "S09 linked bond", "S20 kupat gemel lehashkaa"]) {
      const r = run(name);
      for (const id of ["TXG-04", "TXG-07", "TXS-23"]) expect(changedIn(r, id), `${name}: ${id}`).toEqual([]);
    }
    // S34: at 60 the brackets lower the exit's tax
    const sixty = run("S34 exit at 60");
    for (const id of ["TXG-04", "TXG-07", "TXS-23"]) expect(changedIn(sixty, id), id).toEqual(["taxAtExit"]);
  });

  it("takes TXG-04 on the exit of a keren hishtalmut withdrawn early at 65", () => {
    expect(changedIn(run("keren hishtalmut, early withdrawal at 65"), "TXG-04")).toEqual(["taxAtExit"]);
    expect(changedIn(run("S24 keren hishtalmut, early withdrawal"), "TXG-04")).toEqual([]);
  });

  it("files the lock's exemption on the exit as well as on the term", () => {
    expect(changedIn(run("S23 keren hishtalmut"), "TXH-09")).toEqual(["term", "taxAtExit"]);
    // an early withdrawal is taxed: the exemption does not reach it
    expect(changedIn(run("S24 keren hishtalmut, early withdrawal"), "TXH-09")).toEqual(["term"]);
    const ira = run("S33 IRA hishtalmut");
    expect(changedIn(ira, "TXK-17")).toEqual(["taxAtExit"]);
    expect(changedIn(ira, "TXH-09")).toEqual(["term", "taxAtExit"]);
  });

  it("takes the short lock and the retirement age on the term only where the short lock comes first", () => {
    const short = run("keren hishtalmut, the short lock at 67");
    expect(changedIn(short, "TXH-10")).toEqual(["term"]);
    expect(changedIn(short, "PEN-26")).toEqual(["term"]);
    const six = run("keren hishtalmut, early withdrawal at 65");
    expect(changedIn(six, "TXH-10")).toEqual([]);
    expect(changedIn(six, "PEN-26")).toEqual([]);
  });

  it("files a linked deposit's tax rules on the tax during the run, TXI-20 there and not on relief", () => {
    const linked = run("S03 linked deposit");
    for (const id of ["TXI-02", "TXI-05"]) expect(changedIn(linked, id), id).toEqual(["taxDuring"]);
    // a rise in the CPI: that a fall would not lower the tax changes nothing
    expect(read(linked, "TXI-25")).toBe(true);
    expect(changedIn(linked, "TXI-25")).toEqual([]);
    const relieved = run("S03 linked deposit, TXI-20");
    expect(changedIn(relieved, "TXI-20")).toEqual(["taxDuring"]);
    // the deduction takes the whole tax, so the rate changed nothing
    expect(relieved.taxDuring).toBe(0);
    expect(changedIn(relieved, "TXI-02")).toEqual([]);
    expect(changedIn(run("S01 unlinked deposit"), "TXI-20")).toEqual([]);
  });

  it("takes TXI-25 on a linked deposit's and a linked bond's tax only where the CPI fell", () => {
    const falling = { inflation: -0.01 };
    const deposit = runDeposit({ goal: { amountNow: 100_000, monthly: 0, months: 36 }, market: falling, deposit: { rate: 0.012, termMonths: 12, linkage: "cpi" }, profile: {} }, ctx);
    expect(deposit.taxDuring).toBeGreaterThan(0);
    expect(changedIn(deposit, "TXI-25")).toEqual(["taxDuring"]);
    const bond = { goal: { amountNow: 100_000, monthly: 0, months: 36 }, bond: { coupon: 0.019, linkage: "cpi" as const, couponEveryMonths: 12 }, tariff: {}, profile: {} };
    const fell = runBond({ ...bond, market: falling }, ctx);
    expect(fell.taxDuring).toBeGreaterThan(0);
    expect(changedIn(fell, "TXI-25")).toEqual(["taxDuring"]);
    const rose = run("S09 linked bond");
    expect(read(rose, "TXI-25")).toBe(true);
    expect(changedIn(rose, "TXI-25")).toEqual([]);
  });

  it("takes no rate on a current account that pays nothing", () => {
    expect(changedIn(run("current account at 0%"), "TXI-03")).toEqual([]);
    expect(changedIn(run("S05 current account"), "TXI-03")).toEqual(["taxDuring"]);
  });

  it("files a makam's discount on the tax during the run and its custody rule on the custody line", () => {
    const r = run("S06 makam rolled");
    expect(changedIn(r, "TXI-11")).toEqual(["taxDuring"]);
    expect(changedIn(r, "BRK-17")).toEqual(["fees:custody"]);
    expect(changedIn(run("makam at a non-bank member"), "BRK-52")).toEqual(["fees:custody"]);
  });

  it("files a bank's free custody of a money-market fund under BRK-17 alone", () => {
    const bank = run("money-market fund at a bank member");
    expect(changedIn(bank, "BRK-17")).toEqual(["fees:custody"]);
    for (const id of ["MF-26", "BANK-18"]) {
      expect(read(bank, id), id).toBe(true);
      expect(changedIn(bank, id), id).toEqual([]);
    }
    expect(changedIn(run("money-market fund at a non-bank member"), "BRK-17")).toEqual([]);
  });

  it("takes the foreign tax credit and its cap only where they changed the tax", () => {
    const irish = run("S19 Irish ETF");
    for (const id of ["TXF-17", "TXF-18"]) {
      expect(read(irish, id), id).toBe(true);
      expect(changedIn(irish, id), id).toEqual([]);
    }
    // the treaty's 25% equals the Israeli 25%: the credit takes all of it and its cap holds nothing back; the 30% without a form passes it
    const form = run("S17 US ETF with a W-8BEN");
    expect(changedIn(form, "TXF-17")).toEqual(["taxDuring"]);
    expect(changedIn(form, "TXF-18")).toEqual([]);
    expect(changedIn(form, "TXF-13")).toEqual([]);
    const noForm = run("S18 US ETF without a W-8BEN");
    expect(changedIn(noForm, "TXF-18")).toEqual(["taxDuring"]);
    expect(changedIn(noForm, "TXF-13")).toEqual(["taxDuring"]);
  });

  it("files a fund's drag, spread and own tax on their lines and part", () => {
    expect(changedIn(run("S14 Israeli ETF"), "ETF-06")).toEqual(["fees:spread"]);
    const taxable = run("S13 taxable money-market fund");
    expect(changedIn(taxable, "TXS-12")).toEqual(["fundTax"]);
    expect(changedIn(taxable, "TXS-44")).toEqual(["fundTax"]);
    expect(changedIn(taxable, "TXS-11")).toEqual(["taxAtExit"]);
  });

  it("flags BANK-35 and TXF-27 and never takes them", () => {
    const account = run("S14 Israeli ETF with a current account");
    expect(account.flags.map((f) => f.code)).toContain("BANK-35");
    expect(read(account, "BANK-35")).toBe(true);
    expect(changedIn(account, "BANK-35")).toEqual([]);
    const estate = run("S17 US ETF with a W-8BEN");
    expect(estate.flags.map((f) => f.code)).toContain("TXF-27");
    expect(changedIn(estate, "TXF-27")).toEqual([]);
  });

  it("takes a fee cap and a deposit ceiling only where they cut", () => {
    const under = run("S20 kupat gemel lehashkaa");
    for (const id of ["PF-02", "KGL-02", "KGL-03", "KGL-04"]) expect(changedIn(under, id), id).toEqual([]);
    expect(changedIn(run("kupat gemel lehashkaa at 60, fees above the caps"), "PF-02")).toEqual(["fees:balance", "fees:deposit"]);
    const past = run("S21 kupat gemel lehashkaa past its ceiling");
    for (const id of ["KGL-02", "KGL-03", "KGL-04"]) expect(changedIn(past, id), id).toEqual(["deposit"]);
  });
});

describe("the relief paths (F-30 to F-32)", () => {
  // The rules that change each path's relief, from the rule base: the credit is TXP-01's rate on an amount TXP-02 caps; a beneficiary member
  // (TXP-03) takes TXP-06's two-tier deduction and TXP-04's credit cap; one who is not takes TXP-05's deduction, whose limb (1), on income that
  // is not from work, adds TXP-06's second-tier extras (TXP-31); the brackets (TXG-02) value every deduction and the year's tax a credit is
  // capped at, which changes an F-31 credit only where it cuts it.
  const expected: Record<keyof typeof reliefPaths, string[]> = {
    "F-31": ["TXP-01", "TXP-02"],
    "F-31, cut to the year's tax": ["TXG-02", "TXP-01", "TXP-02"],
    "F-32, beneficiary member": ["TXG-02", "TXP-01", "TXP-02", "TXP-03", "TXP-04", "TXP-06"],
    "F-32, self-employed beneficiary member": ["TXG-02", "TXP-01", "TXP-02", "TXP-03", "TXP-04", "TXP-06"],
    "F-32, self-employed": ["TXG-02", "TXP-01", "TXP-02", "TXP-05", "TXP-06"],
    "F-32, employee without employer money": ["TXG-02", "TXP-01", "TXP-02", "TXP-05"],
  };

  for (const [path, input] of Object.entries(reliefPaths) as [keyof typeof reliefPaths, (typeof reliefPaths)[keyof typeof reliefPaths]][]) {
    it(path, () => {
      const r = runPension(input, ctx);
      const formula = path.slice(0, 4);
      expect(r.years.every((y) => y.formula === formula && y.beneficiary === path.includes("beneficiary member")), "every year on the path").toBe(true);
      expect(r.rules.filter((u) => changedIn(r, u.id).includes("relief")).map((u) => u.id).sort()).toEqual(expected[path]);
    });
  }
});
