"""Appends the second round (review findings, rebase onto main) to report.md."""
import pathlib
p = pathlib.Path('/home/ori/dev/finance-tool/.claude/worktrees/wt-oqsite/research/specs/2026-10-26-closed-questions/report.md')
s = p.read_text()
s += '''

## Second round (2026-10-26): rebase onto main and the two reviews

Builder: Claude Opus 5.5. Working scripts are in `tools/r2/`; the shots carry the prefix `r2-`.

### Rebase onto main (57f9469 and after)
- `docs/method.md`, F-44: main's withholding wording (TXK-26, TXK-28) with the branch's 60+ note.
- `data/rules`: main's text kept for CAT-15, CS-15, CS-16, ETF-33, GOV-14, PEN-18, TXF-21 and TXS-11, which already agree with the references. Three records merged toward the references:
  - BANK-17: main's text, plus the basic-track cap and its end on 1.7.2027; `likely_to_change` set to yes (recheck 2027-07-01), as the block says.
  - TXI-17: a bank-deposit or savings-plan interest is not offset by a securities loss (TXI OQ7).
  - CAT-23: main's title; "no average-life cap is stated" instead of "no cap"; the general and age tracks in the list's words; the names the rule does not describe.
- Code: `publishersHe` (main) and `openQuestions` (branch) both travel through the root loader and PageShell.
- The extraction report took main's version and was regenerated.
- After `extract:sources` and `gen:open-questions` the file has 494 questions (254 open, 130 narrowed, 110 closed); SW OQ17 is new and open.

### Main's nine closures, where the site named them
- **MF OQ4** (reg. 15, MF-11):
  - Both money-market guides now say when redemption money arrives, with a new MF-11 figure (10% of net assets, `foreign_securities_line`).
  - The ladder's "payout days" gap is gone (copy key, `guide-signature.server.ts`, the visual).
  - `liquidity-lockup` is unblocked in both records. Only the checklist reads that mark; the ranking reads only `minimum` and `eligibility`.
- **TXS OQ15** (TXS-02): the money-market and CPI-linked bond pages state the answer. TXS-12's Hebrew no longer says "not found" (requests.md item 6).
- **TXI OQ2** (TXI-04):
  - The bank-deposit page states the prime case.
  - The deposit ledger cites TXI-04 instead of labelling it a reading. S04's numbers are unchanged; only its label assertion changed.
- **BRK OQ11**: the notes in four tariff snapshots and four guide records; method F-14.
- **TXG OQ13, TXF OQ5**: method G-07 and G-24. G-07 also records that the ledgers do not floor the inflationary amount at zero (see "Left" below).
- The closed codes are out of every `open_questions` list the validator named.

### The independent reviewer
1. **GOV OQ4:**
   - The unlinked-bond page says today's fixed-rate series are GOV-13's type, with a yearly coupon.
   - What stays open is the old "שחר" text, which is also the question's new `title_he`.
   - The P-08 reason no longer says the coupon frequency is missing. It is now "לא נבדקה: האתר עוד לא מחשב…", followed by the yearly coupon with a GOV-13 chip.
   - P-08's notes and rationale, method P-08, parameters-rationale and the glossary rows were updated with dates.
   - The page's "does not fall below zero" for floating series was false for today's type (no floor, GOV-14) and is gone.
2. **Guard:**
   - It no longer pairs quotes. It matches `<IdRef … id="…">` and `id={"…"}` directly, and scans every non-test source of `site/app` for bare codes outside comments.
   - `CLOSED_ALLOWED` is removed: the not-covered page names no code in its source.
   - A test shows that it catches an IdRef after a gershayim, `id={…}`, a bare code in JSX text and a key.
3. **Missed closures:**
   - Pension ledger: the flag `TXP-OQ5` is now `TXP-11`, with a Hebrew flag line.
   - Hebrew of TXH-10 and KH-12.
   - Notes of TXP-11 `severance_ceiling` and TXH-10 `lock_years`. TXS-12's note was already fixed on main.
   - Found the same way: PEN-26, TXH-08, TXP-10 and KH-12 figure notes; GOV-13's note; TXA-30's Hebrew ("not binding", as main's block says).
4. **BANK-35:** the card cap applies from 1.10.2026, and the order cancels the tracks from 1.7.2027. Both dates are figures' `effective_from` shown through `Num`, using the new helper `effectiveFromValue` in `lib/value.ts`.
5. **GOV-14 figure:** after the rebase, `coupon_every_months` cites the 2006 regulations (ק"ת 6457), so the sentence is right as it stands.
6. **Wording:**
   - ira-provident reads "ב־35% לפחות, על כל הסכום שמשולם".
   - The record's label is aligned.
   - CAT-23 is aligned (see the rebase).

### The finance reviewer
1. **TXF-28's sources:**
   - Cause: the extractor made one source per link and cut the locator at the first quote, so a link citing several passages kept only the first.
   - Fix: `extract-sources.ts` now makes one source per page-located passage (`; p.N …`), with its own locator, page and quote. A test is added.
   - Effect: TXF-28's card shows pp.8, 9 and 11. The same fix adds about 90 passage entries to 65 other records (only additions; no existing entry changed).
2. **securities.ts:** TXF-28 is cited for `domicile === "ireland"` by name. Any other domicile on a distributing foreign fund throws, since F-20 knows only US and Ireland and the callers already stop such a fund.
3. **F-48:**
   - `blockedWrapperExit` returns `reason: "F-48"` and `gap: null`; the pension outcome's reason is "F-48", and no G-06 flag is raised.
   - `r2-pension.test.ts`, method F-48, G-06 and the run table were updated.
4. **holding-tax.ts:** the comment no longer mentions G-11 as open.
5. **Kupat gemel lehashkaa, age-or-use:**
   - The schema allows only `covered` or `blocked:<open question>`.
   - So the record follows the pension F-48 precedent: a `tax_at_exit` label "known, not computed", the run's `TXK-06` flag and the page's callout.
   - The checklist row still reads "נלקח בחשבון" (see "Left").

### Checks
- `npx vitest run site packages/engine packages/pipeline packages/schema`: 74 files, 1015 passed, 1 todo.
- No expected number changed in any engine test; only label, flag and reason assertions changed.
- `npm run typecheck`: clean.
- `npm run validate`: "data/ is valid". The "source checked later than the rule's checked" warning rose from 489 to 512 because of the new passage entries.
- On screen, at 1280 and 390 px (`shots/r2-*`), every shot looked at:
  - unlinked bond (what, series, the GOV OQ4 sheet);
  - CPI-linked bond;
  - current account, with the BANK-35 sentence and its date sheet; a 2x close-up confirmed the right-to-left order of the two dates;
  - ira-provident and the TXP-18 card;
  - the bank-deposit prime line;
  - both money-market guides;
  - TXF-28's card with its three passages.

### Left for the lead
1. **Engine, falling index:** the ledgers index each lot by `J_T / J_lot` with no floor. With a falling CPI or currency, the real gain comes out above the nominal gain, which TXS-02 and TXF-03 now say never happens. Fixing it changes numbers only in falling-index runs; method G-07 notes it.
2. **"Known, not computed" checklist mark:** a separate mark would need a schema value and a checklist state. Until then, the kupat gemel lehashkaa age row and the pension F-48 rows read "נלקח בחשבון".
3. **P-08:** the unlinked bond can now be evaluated (yearly coupon, GOV-13). Doing so is a product change, so the row stays "not evaluated".
4. **requests.md item 6:** the TXS-12 markdown line.
5. **Independent reviewer:** the branch is well over 30 files.
'''
p.write_text(s); print('ok')
