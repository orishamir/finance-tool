# Brief: follow-ups from the scope settling and the open-question research (2026-10-26)

## Why
On 2026-10-26 the rule base was settled (`research/knowledge/2026-10-25-scope/settled.md`), and two researchers closed or narrowed 20 open questions (`research/knowledge/2026-10-26-oq-hunt/`). The site still has to catch up. The items come from:
- `research/knowledge/2026-10-25-scope/requests.md`, sections 1, 6, 7 and 10;
- the finance reviewer of the closed-questions branch;
- that branch's report, `research/specs/2026-10-26-closed-questions/report.md`, "Left for you".

Read those first, then `CLAUDE.md` (Standing rules, Number states) and the formulas you touch in `docs/method.md`.

## What to do

### A. Engine and method (each change: method first, then code, then golden cases checked independently)
1. **A falling index or currency never raises the taxable gain.** Today the ledgers index each lot's cost by `J_T / J_lot` with no floor. When the CPI or the currency falls, the real gain comes out larger than the nominal gain.
   - TXS-02 and TXF-03, read with circular 10/2025 (appendix, examples 3 and 4) and the Moses ruling: the taxable gain never exceeds the nominal gain. On a loss, the part caused by the fall is not allowed.
   - Fix it in every ledger that indexes cost (securities, provident, wherever `J_T / J_lot` appears). Write the rule in the formulas' method text (F-44 and the securities and foreign formulas), and close or narrow method gap G-07.
   - Golden cases for a falling index: compute the expected values with a separate script, not with the engine (see `tests/golden/` and how earlier cases were checked). Numbers change only in falling-index runs; any other changed number is a bug.
2. **The relief from 60 on kupat gemel lehashkaa withdrawals (TXK-06, F-44).**
   - The method says the reduced brackets apply, and the brokerage account already gets them through `exitTax`. Apply the same at exit for the kupat gemel lehashkaa (`packages/engine/src/ledgers/provident.ts` around lines 302-304).
   - Keep the flag only if part of the relief still can't be computed, and say which part.
   - Update the checklist row and the guide callout so they no longer say "not computed".
3. **Credit points against special-rate income (TXG-05, method G-23).** Credit points come off the whole computed tax, special-rate income included.
   - If the engine has the inputs to apply this (a person's other income and credit points), apply it.
   - If not, raise a flag with a Hebrew line, so the result never silently assumes no credit, and write in G-23 what input would be needed. Don't invent inputs.
4. **The child-savings fee after 21** (`requests.md` section 1; CS-18 and CS-30; formula F-54):
   - The site's figure is the legal cap (CS-18: up to 1.05% of the balance and 4% of deposits), labelled "עד" wherever it is shown.
   - The companies' 0.23% appears only as a named example: Harel and Altshuler Shaham (CS-30).
   - A rate the person enters replaces the cap.
   - Update F-54 in the method, the engine, the child-savings guide and its ledger. This changes numbers in child-savings runs after 21. Check the golden cases independently, as in A1.
5. **Money-market custody at a non-bank broker** (`requests.md` section 10, F-63, BRK-52):
   - "Money-market funds held free" holds at banks only.
   - At a non-bank broker, the tariff's custody line applies, with a provenance note that regulators report custody there is customarily waived (practice, not a term).
   - Update F-63 and the engine or index-page code that applies the free rule.

### B. Data and labels
6. **`requests.md` section 6:**
   - The Interactive fee snapshots and `data/terms/sipc.json` cite BRK-35, now Ireland's compensation scheme. Point each to the right record: BRK-35, or BRK-51 if it means IB Ireland's own statements; create that record if needed.
   - `gov-14.json`'s old-type figures: label them on the site as the old "גילון חדש" type's only, or drop them where today's series are meant.
   - `data/dimensions/fee-exit.json`: CS-16 becomes CS-28.
   - Check any page prose that says the Supreme Court ruled out the offset in TXI-25: it left that open.
7. **`requests.md` section 7:** fix the source labels it lists, through `data/sources/documents.json` rows, `publishers.json` and the host rules in `packages/pipeline/scripts/extract-sources.ts`:
   - TASE's own documents get kind `institution_doc`;
   - the index "about" pages no longer rank first;
   - the Proper Disclosure Rules get kind `regulation`;
   - the 2016 bill and the Supreme Court ruling get rows;
   - the CMA standard bylaws get rows;
   - funder.co.il's copy of the regulators' report is labelled as a third-party copy;
   - the btl.gov.il publisher.

   Run `npm run extract:sources -w @finance-tool/pipeline` and `npm run validate` after.
8. **TXS-12 condition (e)** still says the falling-index case was not found. Fix it in the references markdown and the record; A1 settles it.

### Not in this brief
- F-48, early pension withdrawal: its rule's official text must be re-read first. Wikisource only so far.
- Tying the money-market and makam rate to the Bank of Israel rate: the BoI page is blocked to scripts and needs a person.
- GOV OQ7, the minimum order that would rank makam and bonds: the founder's call.
- Evaluating the unlinked government bond (P-08).
- The 18 new rule records for company pages: the rules-scope builder does those.

## Rules
- **Never fill in a financial or tax fact from memory.** Every change cites the rule's text in the references.
- **Every number** goes through `Num`, a rule figure or a method formula.
- **Use the kit** for any UI. Hebrew copy goes in `copy.ts`, in the style of `docs/copy.md` section 10.
- **Order of work:** the rules-scope layout builder is working in `wt-scope`, on the rule schema, the validator, rule cards, the rules page and company pages. Stay out of those. Rebase onto main before your final commit.
- **Check on screen:** build (`npm run build -w site`), serve on port 4238, and photograph at 1280 and 390 px each page whose numbers or words you changed:
  - the child-savings guide;
  - the kupat gemel lehashkaa guide with an age of 60 or more;
  - a money-market page;
  - the index page at a non-bank broker;
  - a falling-index case if a page can show one.

  Look at every shot.
- **Report:** write `report.md` beside this brief, with the shots in `shots/`, and list every number that changed and why.
- **Commands:**
  - Run `npx vitest run site packages/engine packages/pipeline packages/schema`, `npm run typecheck` and `npm run validate`.
  - Don't run `npm run check`, and never `pkill`.
  - Keep shell commands simple: scripts in files. Screenshots and large files stay in your worktree, never /tmp.
- **Commit** on your branch, ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. The lead reviews, a finance reviewer checks the engine, and then it merges.
