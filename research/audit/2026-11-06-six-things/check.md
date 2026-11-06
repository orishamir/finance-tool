# Independent check: the six-things table in coverage.md

Checked 2026-11-06, branch `rules-six-things`, commit 9cdf7f9b, against the rule base on `main` at
177f169d (the branch's base and `origin/main` at the time of the check; `rules-tax-moves` not landed).
The checker did none of the work.

**Verdict: fail.** Two cells hide an answer or a result-changing question the rule base and the
table itself record, and one cell and the ranking describe a question that today's tier-1 tax pass
already settled. All are small edits; the structure, the counts and the sourcing of every L cell hold.

## How it was checked

- A script parsed every `### ID` rule block of `.claude/skills/il-finance/references/*.md` (1,051
  blocks, the same regex as `packages/pipeline/src/references.ts`), the open questions of each file
  under its README prefix, and `data/open-questions.json` for status (550: 287 open, 119 narrowed,
  144 closed). It parsed the table's 30 rows into 180 cells (grade, `!`, rules with "X-n to X-m"
  ranges expanded, open questions).
- Each rule's sources were classed by host: copy = nevo.co.il, wikisource.org, olaw.org.il,
  prisha.co.il, capitax.co.il, funder.co.il; official = the Knesset, gov.il hosts (btl, free-justice,
  data, taxes, mof, cma), boi.org.il, isa.gov.il, tase.co.il, sec.gov, irs.gov and similar; everything
  else = companies or press.
- Random sample: Python `random.seed(20261106); random.sample(range(180), 30)` over the cells in table
  order. Cells read by hand: the 30 drawn, all 86 L cells without `!`, all 25 C and O cells, and the 14
  cells of the ten "most worth answering next": 130 cells. Every one of the 180 also got the automatic
  checks below.
- `npm run validate`: passes (`data/ is valid`, warnings only, none new from this change).

## What holds

- Every rule and open question named in the table exists; no cell cites a closed question.
- The totals add up: 139 L (53 with `!`), 14 C (6), 11 O (1), 16 not applicable, 180 cells, 60 with
  `!`; the per-question line and every row's count match the cells; 18 kinds are all L, and the four
  "closest" kinds each have one `!`.
- No L cell rests only on a copy or on companies: every L cell has at least one key rule with an
  official source, and every copy-only rule inside an L cell (BANK-35, TXS-15, ETF-13, MGD-10,
  MGD-11, REG-09, PEN-14) is named as a copy in the cell.
- All C cells rest on copies or company documents as stated (FXD-07, FXD-11, FXD-12, FXD-15, TXF-04,
  TXF-06, TXF-07, ETF-27, ETF-30, ETF-63, RG-10, RG-11, RG-16, INS-07).

## Wrong grades (4)

| Cell | Table | Should be | Why |
|---|---|---|---|
| Provident fund for annuity · getting the money out | O! none | L! PEN-34; open PEN OQ19 | PEN-34 (the Provident Funds Law on fs.knesset.gov.il and CMA circular 2021-2-1 on gov.il, ss.14.1-14.3) says how the money comes out: as an annuity only by moving it to a pension fund or an insurer, a lump sum only under the listed conditions. The table cites PEN-34 in the same row's "what it is". Who pays the annuity and on what factors stays open (PEN OQ19), so `!` stays. |
| Child savings · tax | O | O! | TXK OQ1 (the exit rate, 25% real or 15% nominal) changes a reader's result; the table's own ranking (#3) says so. |
| Israeli index fund or ETF · tax | L | L! | ETF OQ23, cited in the cell, is "needed to compare a physical Israeli fund with a swap fund on a U.S. index": US withholding inside the fund changes which fund is better. TXF OQ8 (Israeli fund holding foreign assets against a foreign fund) is the same comparison and is not cited. |
| Gold through a fund · cost | C | L (or L!) | The Israeli gold funds are Israeli tracking funds: ETF-05, ETF-14 and MF-16 (regulations on free-justice.openapi.gov.il, ISA) set their fee structure and caps, as they do in the Israeli index fund row (L!), and the same row's "getting the money out" is already L from ETF-04 and MF-09. RG-14 and RG-16 are figures, not the general rule; RG OQ9 (a 1.00% variable fee against the 0.1%-0.3% cap) and RG OQ10 (hedging cost) decide the `!`. |

With these four, the counts become L 141 (55 with `!`), C 13 (6), O 10 (1), – 16; with `!` 62.

## Wrong statement, not a grade

- **Provident fund for investing · tax, and ranking #2.** The cell says "TXK OQ3 (the withholding
  rate: reg. 3 says 20%, managers withhold 25%)" and the ranking gives it as a reason the cell changes
  a result. Since today's tier-1 tax pass (on `main`), TXK-26 settles the rate withheld at 25% from
  the Tax Authority's own withholder file (gov.il, 14.1.2026), TXK OQ3 keeps only the legal basis
  open, and both say "the final tax does not depend on it". The `!` stays for TXK OQ10 (a loss at
  exit); the cell's note and ranking #2's reason should drop the withholding rate, and #2 should be
  re-ranked on TXK OQ10 alone.

## Points that are judgement, not errors

- **btl.gov.il consolidated laws.** The grade note counts "National Insurance's site" as official,
  while the rule records label these `btl.gov.il/Laws1/` files "state body's consolidated copy, not
  the binding gazette wording" (TX2-13, RG-02 and others; TXK-26 calls one "not the Reshumot
  publication"). For 42 rules such a file is the only official-host source. REIT · getting the money out (RG-02) and gold · tax (TX2-13, TX2-14) rest only on
  such files, and 14 more L cells rest on them in part. Defensible under "gov.il", but the note should
  say so in words, so a reader of the table knows those L cells rest on a government copy.
- **Cost cells of listed holdings.** Single shares · cost is L from the trading-cost rules (BRK-15,
  BRK-16, BRK-24, BRK-33); REIT · cost is C from the press on each REIT's management fee. Under the
  table's own principle (a company's own figure does not lower a cell whose general rule is L), the
  REIT cost cell could be L with RG-10 and RG-11 as company figures. Either way, the two should be
  graded the same way.
- **Savings policy · what it is (C!).** INS-01 also cites the State Comptroller (official) and the fee
  regulations in the gazette; the core description is still Clal's terms, so C is defensible.
- **Rows that will move when `rules-tax-moves` lands:** securities account · moving it (TXS OQ17) and
  bank deposit and savings plan · tax (TXI OQ14), ranks #4 and #6.

## The copy counts

"33 rules rest only on a copy or on a copy and companies' documents, and 119 more cite a copy beside
an official text" is not reproducible as written, because the method is not stated. Counting every
URL in each rule block (reference-style links resolved) with the six copy hosts above gives **32 and
121**; counting only `- Source:` lines gives 30 and 113; adding the press hosts as copies gives 38
and 127. Copy-only by the first method: BANK-35, CORP-20, ETF-09, ETF-13, ETF-16, IRA-06, IRA-19,
KH-06, MF-19, MF-42, MF-61, MGD-10, MGD-11, MGD-13, MGD-16, MGD-17, MGD-18, PEN-14, PEN-32, PEN-40,
PF-27, REG-09, REG-12, RG-11, RG-14, RG-16, RG-19, RG-23, TXF-04, TXF-06, TXF-07, TXS-15. The
sentence should name its method (which hosts count as copies, which lines are read) so the next
re-grade can reproduce it.

## Older sections the new one supersedes or contradicts (ground rule 10)

1. **Header, line 4.** "775 rules and about 510 open questions … 937 rules … 498 numbered open
   questions, of which 115 are closed, 127 narrowed and 256 open": today 1,047 rules (SKILL.md) and
   550 questions (144 closed, 119 narrowed, 287 open). Replace with a pointer to SKILL.md and
   `data/open-questions.json`, or with today's figures.
2. **§0 item 1, "Most legislation was read through mirrors."** Superseded by the new section's count
   (about 32 rules of 1,051 rest only on a copy). Its advice to re-read "the official text (Reshumot …,
   or the full Nevo text)" contradicts the founder's rule of 2026-11-06 (Nevo is a copy, only a way to
   find the official text). Remove, or keep one line pointing to the new section's copy count.
3. **§2, current account row:** "What Bank of Israel supervision actually protects if a bank fails
   (BANK OQ8; REG OQ10, OQ13)": the new table answers it (L, REG-04, REG-06, BANK-23); REG OQ10 is
   about securities at a bank, not deposits.
4. **§2, current account row:** "breaking a deposit early (TXI OQ14, narrowed 2026-10-26 …)": the
   question is open in the rule base and in the new table; and "deflation on CPI-linked deposits (TXI
   OQ6)" is closed (2026-10-31) and not struck.
5. **§2, money-market row:** "whether any taxable money-market fund exists is unknown (TXS OQ1; see
   F1)": TXS OQ1 closed 2026-10-22 (TXS-24, two taxable funds); the new table grades the cell L.
6. **§2, makam row:** "Tax: makam at 20% (2025 guide) or 15% (s.125C(c)) conflict (TXI OQ3)": the new
   table has 15% by law (TXI-11) and TXI OQ3 only for the split on a sale before redemption. The §9
   "Makam tax rate" row says the same as the new table and can be struck as resolved, keeping the
   sale split.
7. **§2, brokerage row:** "protection rests on brokers' own statements and the TASE rules": the new
   table grades it L! from the Trust Law, the clearing-house rules and the bank directives (REG-34,
   REG-35, BRK-07, BRK-10, BRK-58), with the open parts named.
8. **§2, pension row:** "Insurance cost tables and annuity conversion factors (PEN OQ7)": today's
   pension-factors branch added PEN-48 to PEN-51, which the new table cites; PEN OQ7 is not in the new
   table at all.
9. **§2, kupat gemel lehashkaa row:** "the current withholding regulation (TXK OQ3)": the rate is
   settled at 25% (TXK-26); only the legal basis is open.
10. **§3, first bullet:** "Tax rules per tier-1 wrapper are now mostly primary. The exceptions are in
    the §2 table above": the new table's tax column is now the place for this.

## Must fix before it lands

1. Provident fund for annuity · getting the money out: O! to L! (PEN-34), and the row's count.
2. Child savings · tax: O to O!.
3. Provident fund for investing · tax and ranking #2: drop the stale withholding-rate reason (TXK-26
   settles it; the final tax does not depend on it); re-rank #2 on TXK OQ10.
4. Re-count the totals, the per-question line and the row counts after these.

## Should fix

1. Israeli index fund or ETF · tax: L to L! (ETF OQ23), and cite TXF OQ8.
2. Gold through a fund · cost: C to L from ETF-05, ETF-14, MF-16, with RG-14 and RG-16 as figures.
3. Grade REIT · cost and single shares · cost by the same principle.
4. Say in the grade note that btl.gov.il consolidated texts count as official, and that the rule
   records call them a state body's copy.
5. State the method behind "33 … and 119 more" (or use 32 and 121 with this file's method).
6. Remove or correct the ten superseded statements listed above in the same change.
