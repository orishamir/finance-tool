"""r2 (2026-10-26): engine flags and reasons after the reviewers. No number changes: only flag codes, reasons and comments."""
import pathlib
W = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite')
def edit(rel, pairs):
    p = W / rel; s = p.read_text()
    for old, new in pairs:
        assert s.count(old) == 1, (rel, s.count(old), old[:90]); s = s.replace(old, new)
    p.write_text(s); print('edited', rel)

# 1. TXP OQ5 closed: circular 4/2019 applies the severance ceiling monthly, as the test already does; the flag names the rule
edit('packages/engine/src/ledgers/pension.ts', [
    ("  // TXP-10: employer component above the exempt limit; TXP-11: the severance ceiling (its base is open, TXP-OQ5).",
     "  // TXP-10: employer component above the exempt limit. TXP-11: the severance ceiling, applied monthly as 1/12 of the yearly\n"
     "  // amount (Income Tax circular 4/2019 s.2.1.1; TXP OQ5 closed 2026-10-26); a severance deposit above it is work income at\n"
     "  // deposit, which this run does not tax yet, so it is flagged under the rule."),
    ('book.amount("TXP-11", "severance_ceiling") / 12) tally.flag("TXP-OQ5");', 'book.amount("TXP-11", "severance_ceiling") / 12) tally.flag("TXP-11");'),
    # 3. F-48: not built, with no gap behind it
    ("// is blocked (F-48, F-49; G-03, G-06).", "// is blocked (F-49, G-03; F-48 is not built yet)."),
    ("  /** The person opts into early withdrawal (F-48). It stays blocked (G-06). */",
     "  /** The person opts into early withdrawal (F-48). Its rule is known (TXP-18), but the formula is not built yet, so it stays blocked. */"),
    ("  const exit = blockedWrapperExit(input.earlyWithdrawal ? \"F-48\" : \"F-49\", out.balance);\n  formulas.push(exit.formula);\n  tally.flag(exit.gap);",
     "  const exit = blockedWrapperExit(input.earlyWithdrawal ? \"F-48\" : \"F-49\", out.balance);\n  formulas.push(exit.formula);\n  if (exit.gap) tally.flag(exit.gap);"),
    ('  let outcome: Outcome = { code: "listed-not-ranked", reason: exit.gap };', '  let outcome: Outcome = { code: "listed-not-ranked", reason: exit.reason };'),
    ('    if (lawful > T) outcome = { code: "listed-not-ranked", reason: exit.gap, untilMonth: lawful };', '    if (lawful > T) outcome = { code: "listed-not-ranked", reason: exit.reason, untilMonth: lawful };'),
    ('  const exit = blockedWrapperExit("F-49", out.balance);\n  tally.flag(exit.gap);', '  const exit = blockedWrapperExit("F-49", out.balance);\n  if (exit.gap) tally.flag(exit.gap);'),
])
edit('packages/engine/src/formulas/blocked-exit.ts', [
    ("  /** G-03 (annuity value needs conversion factors) or G-06 (early withdrawal: F-48 is not built yet; its base was open until 2026-10-26). */\n  gap: \"G-03\" | \"G-06\";",
     "  /**\n   * Why there is no value after tax: G-03 (an annuity's value needs conversion factors that are not collected), or for F-48\n"
     "   * its own id: its rule is known (TXP-18; G-06 and TXP OQ3 closed 2026-10-26), but the formula is not built yet.\n   */\n"
     "  reason: \"G-03\" | \"F-48\";\n  /** The method gap behind it, flagged on the run: G-03 for an annuity; none for F-48. */\n  gap: \"G-03\" | null;"),
    ('  "F-45": { gap: "G-03", ruleIds:', '  "F-45": { reason: "G-03", gap: "G-03", ruleIds:'),
    ('  "F-48": { gap: "G-06", ruleIds:', '  "F-48": { reason: "F-48", gap: null, ruleIds:'),
    ('  "F-49": { gap: "G-03", ruleIds:', '  "F-49": { reason: "G-03", gap: "G-03", ruleIds:'),
    ("35% and the marginal rate on the whole amount paid (TXP-18; TXP OQ3 closed 2026-10-26, G-06 closed). The formula is\n * not built yet, so it stays blocked even when the person opts in.",
     "35% and the marginal rate on the whole amount paid (TXP-18; TXP OQ3 closed 2026-10-26, G-06 closed). The formula is\n * not built yet, so it stays blocked even when the person opts in, with \"F-48\" as its reason and no gap."),
    ("  return { formula, blocked: true, gap: e.gap, grossBalance, ruleIds: e.ruleIds, openQuestions: e.openQuestions };",
     "  return { formula, blocked: true, reason: e.reason, gap: e.gap, grossBalance, ruleIds: e.ruleIds, openQuestions: e.openQuestions };"),
])
edit('packages/engine/src/inputs.ts', [
    ('"ira-provident": "exit F-48 and F-49 are blocked (G-03, G-06)",', '"ira-provident": "exit F-49 is blocked (G-03) and F-48 is not built yet",'),
])
# 2. TXF-28 cited for an Irish fund by name; a distributing foreign fund without a known domicile is outside F-20
edit('packages/engine/src/ledgers/securities.ts', [
    ("      } else {\n        // An Irish ETF's distribution reaches an Israeli resident without Irish tax: units in a recognised clearing\n        // system, or a non-resident declaration (TXF-28; G-05 closed 2026-10-26), so the foreign withholding stays 0.\n        book.cite(\"TXF-28\");\n      }",
     "      } else if (fund.domicile === \"ireland\") {\n        // An Irish ETF's distribution reaches an Israeli resident without Irish tax: units in a recognised clearing\n        // system, or a non-resident declaration (TXF-28; G-05 closed 2026-10-26), so the foreign withholding stays 0.\n        book.cite(\"TXF-28\");\n      } else {\n"
     "        // F-20 knows the foreign withholding of a US and an Irish fund only; the callers stop a distributing fund of any other\n"
     "        // domicile before the run (instruments.server.ts, fund-variants.ts), so reaching here is a caller's error.\n"
     "        throw new Error(\"F-20: a distributing foreign fund needs its domicile (us or ireland) for the foreign withholding\");\n      }"),
])

# TXI OQ2 closed: TXI-04 states the prime case (s.125ג(א), s.88 and the Tax Authority's guide), so it is no longer a reading
edit('packages/engine/src/ledgers/deposit.ts', [
    ("/** A-16: unlinked, CPI-linked, or prime-linked (taxed as unlinked by the rule base's reading, TXI-04). */",
     "/** A-16: unlinked, CPI-linked, or prime-linked (taxed as unlinked, TXI-04; TXI OQ2 closed 2026-10-26). */"),
    ('    rate = book.rate("TXI-03", "rate");\n    if (deposit.linkage === "prime") book.label("reading", "TXI-04");',
     '    rate = book.rate("TXI-03", "rate");\n    // a prime-linked deposit is unlinked: the statutory index is the CPI or an exchange rate (TXI-04; TXI OQ2 closed 2026-10-26, no longer a reading)\n    if (deposit.linkage === "prime") book.cite("TXI-04");'),
])
edit('packages/engine/test/golden/golden.test.ts', [
    ('it("S04 prime-linked monthly deposit, 15% bucket by reading", () => {', 'it("S04 prime-linked monthly deposit, 15% bucket (TXI-04)", () => {'),
])
