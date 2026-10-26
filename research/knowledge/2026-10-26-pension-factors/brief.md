# Brief: pension conversion factors and insurance costs, per fund (2026-10-26)

## Why
A salaried person's largest holding is usually a comprehensive pension fund (קרן פנסיה מקיפה). Today the site can't:
- turn a pension balance into a monthly pension: the method's pension exit F-49 is blocked by gap G-03;
- compare insurance costs between funds.

What's missing is each fund's tables: conversion factors (מקדמי המרה) and insurance premium factors. They sit in the bylaw annexes, which no one has read (open questions PEN OQ7 and PEN OQ19; `pension-and-gemel-lekitzba.md` open questions 7 and 19).

Research only. The site is not changed by this work.

Read first:
- `.claude/skills/il-finance/references/pension-and-gemel-lekitzba.md`: the rules on the standard bylaw, insurance, retirement age and the default funds, and its open questions;
- `docs/method.md`: F-30 to F-32, F-49 and gap G-03;
- `CLAUDE.md`: Standing rules;
- `docs/data-schema.md`: whether a shape exists for pension terms. If none fits, propose one in your report; don't change the schema.

## What to find, for the most popular comprehensive pension funds
Popular first: the funds with the largest assets or membership, by a regulator's count, the CMA's or gemelnet/pensyanet's. Name the source of the ranking. Include the default funds the CMA selected (PEN rules name them). About 8 to 10 funds.

For each fund:
1. **Conversion factors for an old-age pension.**
   - The table that turns a balance into a monthly pension, by sex, age at retirement and birth year (or cohort), for the default pension track (for example 60 guaranteed months, "240 תשלומים מובטחים" if that is the default) and the survivor share.
   - Name the table, the bylaw annex, its date and the cohort it applies to.
   - Where the bylaws give a formula or a reference table (for example the CMA's mortality tables and the interest rate), say so and cite it.
2. **Insurance premium factors.** The disability and survivors cost by age and sex for the default insurance track (מסלול ביטוח ברירת מחדל), as the annex prints them, and how the monthly premium is computed from them.
3. **The general rules the funds share.** What the CMA standard bylaw (תקנון אחיד) and the CMA's circulars fix for every fund:
   - how conversion factors are set;
   - the guaranteed factor for members who joined before a date;
   - the mortality tables and their updates;
   - the actuarial balancing (איזון אקטוארי).

   These are general rules. A fund's own table is that fund's term (D30, D31).
4. **PEN OQ19:** who pays a pension from a kupat gemel lekitzba (provident fund for annuity), and on what factors.

## Sources and how to read them
- **Order of sources:** the CMA's circulars and standard bylaw (gov.il), then each fund's own bylaws and annexes (the managing company's site), then the CMA's or a fund's published tables. Third-party copies (prisha.co.il and the like) only to locate an official copy; label them if used.
- **Downloads:** PDFs and XLSX by curl. Never through a browser download, and never from memory.
- **Blocked pages:** anything that blocks scripts (gov.il HTML pages and others) goes in your report under "Pages for the lead to read", with its URL and what you want from it. The lead reads them in a normal browser. Don't use FlareSolverr or any bot-check workaround.
- **Every figure** carries its source URL, the document's own date, a locator (annex, table, page, row) and the date you read it.

## Output
- `report.md` in this folder:
  - the general rules (with quotes and locators);
  - a table of the funds with what was found for each;
  - what the site could compute from it;
  - what is still missing;
  - pages for the lead.
- `staged/`: one JSON file per fund with the factor tables as numbers, keyed so a script could read them. Each value is sourced and dated.
- Proposed rule-base text (record by record) in the report. Don't edit the references, `data/`, `site/`, `packages/` or `docs/`.

## Rules
- **Never fill a financial rule or figure from memory.** If it isn't in a source you read, say it's missing.
- **Work in the main checkout** at /home/ori/dev/finance-tool, only inside this folder. Downloads go to `work/` (gitignored). Scripts go to `tools/`; keep shell commands simple.
- **Git:** don't commit. Never use `git stash`, `git checkout -- <file>` or `git reset`; others work in this checkout.
- **When done:** reply with a plain summary (at most 200 words): what was found, for which funds, what's still missing, and the pages for the lead.
